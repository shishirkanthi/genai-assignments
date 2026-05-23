import { GenerateRequest, GenerateResponse, JiraAuth, JiraResponse, JiraStoryResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function connectJira(auth: JiraAuth): Promise<JiraResponse> {
  const response = await fetch(`${API_BASE_URL}/jira/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(auth),
  })

  const data: JiraResponse = await response.json().catch(() => ({ ok: false, message: 'Unknown error' }))
  return data
}

export async function testJiraConnection(auth?: JiraAuth): Promise<JiraResponse> {
  const response = await fetch(`${API_BASE_URL}/jira/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: auth ? JSON.stringify(auth) : undefined,
  })

  const data: JiraResponse = await response.json().catch(() => ({ ok: false, message: 'Unknown error' }))
  return data
}

export async function disconnectJira(): Promise<JiraResponse> {
  const response = await fetch(`${API_BASE_URL}/jira/disconnect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  const data: JiraResponse = await response.json().catch(() => ({ ok: false, message: 'Unknown error' }))
  return data
}

export async function fetchJiraStory(jiraId: string): Promise<JiraStoryResponse> {
  const response = await fetch(`${API_BASE_URL}/jira/story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ jiraId }),
  })

  const data: JiraStoryResponse = await response.json().catch(() => ({ ok: false, message: 'Unknown error' }))
  return data
}