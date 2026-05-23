import 'express-session'
import { JiraAuth } from '../schemas'

declare module 'express-session' {
  interface SessionData {
    jiraAuth?: JiraAuth
  }
}
