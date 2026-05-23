export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
}

export interface JiraAuth {
  baseUrl: string
  apiKey: string
  email: string
}

export interface JiraResponse {
  ok: boolean
  message?: string
}

export interface JiraStoryData {
  storyTitle: string
  description?: string
  acceptanceCriteria?: string
}

export interface JiraStoryResponse {
  ok: boolean
  message?: string
  data?: JiraStoryData
}