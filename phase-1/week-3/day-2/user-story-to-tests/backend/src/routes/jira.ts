import express from 'express'
import fetch from 'node-fetch'
import { JiraAuthSchema, JiraStoryRequestSchema } from '../schemas'

export const jiraRouter = express.Router()

type AdfNode = {
  type?: string
  text?: string
  content?: AdfNode[]
}

const extractTextFromAdf = (node?: AdfNode): string => {
  if (!node) {
    return ''
  }

  let result = ''

  if (node.text) {
    result += node.text
  }

  if (node.content && Array.isArray(node.content)) {
    const childText = node.content.map(extractTextFromAdf).filter(Boolean).join(' ')
    if (childText) {
      result += `${result ? ' ' : ''}${childText}`
    }
  }

  return result.trim()
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

jiraRouter.post('/connect', (req: express.Request, res: express.Response) => {
  const validationResult = JiraAuthSchema.safeParse(req.body)

  if (!validationResult.success) {
    res.json({
      ok: false,
      message: `Validation error: ${validationResult.error.message}`
    })
    return
  }

  req.session.jiraAuth = validationResult.data
  res.json({ ok: true })
})

jiraRouter.post('/disconnect', (req: express.Request, res: express.Response) => {
  if (req.session.jiraAuth) {
    delete req.session.jiraAuth
  }

  res.json({ ok: true })
})

jiraRouter.post('/test', async (req: express.Request, res: express.Response) => {
  let jiraAuth = req.session.jiraAuth

  if (!jiraAuth) {
    const validationResult = JiraAuthSchema.safeParse(req.body)
    if (validationResult.success) {
      jiraAuth = validationResult.data
      req.session.jiraAuth = jiraAuth
    }
  }

  if (!jiraAuth) {
    res.json({
      ok: false,
      message: 'JIRA credentials not found. Please connect to JIRA.'
    })
    return
  }

  const baseUrl = normalizeBaseUrl(jiraAuth.baseUrl)
  const endpoint = `${baseUrl}/rest/api/3/myself`
  const authHeader = Buffer.from(`${jiraAuth.email}:${jiraAuth.apiKey}`).toString('base64')

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('JIRA auth test failed:', response.status, errorText)
      res.json({
        ok: false,
        message: 'Unable to authenticate with JIRA. Please check your credentials.'
      })
      return
    }

    res.json({ ok: true })
  } catch (error) {
    console.error('JIRA auth test error:', error)
    res.json({
      ok: false,
      message: 'Unable to reach JIRA. Please verify the base URL and try again.'
    })
  }
})

jiraRouter.post('/story', async (req: express.Request, res: express.Response) => {
  const jiraAuth = req.session.jiraAuth

  if (!jiraAuth) {
    res.json({
      ok: false,
      message: 'JIRA credentials not found. Please connect to JIRA.'
    })
    return
  }

  const validationResult = JiraStoryRequestSchema.safeParse(req.body)
  if (!validationResult.success) {
    res.json({
      ok: false,
      message: `Validation error: ${validationResult.error.message}`
    })
    return
  }

  const baseUrl = normalizeBaseUrl(jiraAuth.baseUrl)
  const authHeader = Buffer.from(`${jiraAuth.email}:${jiraAuth.apiKey}`).toString('base64')

  try {
    const fieldResponse = await fetch(`${baseUrl}/rest/api/3/field`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    })

    if (!fieldResponse.ok) {
      res.json({
        ok: false,
        message: 'Unable to fetch JIRA fields. Please try again.'
      })
      return
    }

    const fields = await fieldResponse.json() as Array<{ id: string; name: string }>
    const acceptanceField = fields.find((field) => field.name === 'Acceptance criteria')

    if (!acceptanceField) {
      res.json({
        ok: false,
        message: 'Acceptance criteria field not found in JIRA.'
      })
      return
    }

    const issueResponse = await fetch(
      `${baseUrl}/rest/api/3/issue/${validationResult.data.jiraId}?fields=summary,description,${acceptanceField.id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!issueResponse.ok) {
      const errorText = await issueResponse.text().catch(() => 'Unknown error')
      console.error('JIRA issue fetch failed:', issueResponse.status, errorText)
      res.json({
        ok: false,
        message: 'Unable to fetch JIRA story. Please verify the JIRA ID and try again.'
      })
      return
    }

    const issueData = await issueResponse.json() as any
    const descriptionText = extractTextFromAdf(issueData?.fields?.description)
    const acceptanceAdf = issueData?.fields?.[acceptanceField.id]
    const acceptanceText = extractTextFromAdf(acceptanceAdf)

    res.json({
      ok: true,
      data: {
        storyTitle: issueData?.fields?.summary || '',
        description: descriptionText,
        acceptanceCriteria: acceptanceText
      }
    })
  } catch (error) {
    console.error('JIRA story fetch error:', error)
    res.json({
      ok: false,
      message: 'Unable to reach JIRA. Please verify the base URL and try again.'
    })
  }
})
