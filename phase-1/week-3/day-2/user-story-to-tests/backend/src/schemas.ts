import { z } from 'zod'

export const GenerateRequestSchema = z.object({
  storyTitle: z.string().min(1, 'Story title is required'),
  acceptanceCriteria: z.string().min(1, 'Acceptance criteria is required'),
  description: z.string().optional(),
  additionalInfo: z.string().optional()
})

export const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
  testData: z.string().optional(),
  expectedResult: z.string(),
  category: z.string()
})

export const GenerateResponseSchema = z.object({
  cases: z.array(TestCaseSchema),
  model: z.string().optional(),
  promptTokens: z.number(),
  completionTokens: z.number()
})

export const JiraAuthSchema = z.object({
  baseUrl: z.string().min(1, 'JIRA base URL is required'),
  apiKey: z.string().min(1, 'JIRA API key is required'),
  email: z.string().min(1, 'JIRA email is required')
})

export const JiraStoryRequestSchema = z.object({
  jiraId: z.string().min(1, 'JIRA ID is required')
})

export const JiraStoryResponseSchema = z.object({
  storyTitle: z.string(),
  description: z.string().optional(),
  acceptanceCriteria: z.string().optional()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>
export type JiraAuth = z.infer<typeof JiraAuthSchema>
export type JiraStoryRequest = z.infer<typeof JiraStoryRequestSchema>
export type JiraStoryResponse = z.infer<typeof JiraStoryResponseSchema>