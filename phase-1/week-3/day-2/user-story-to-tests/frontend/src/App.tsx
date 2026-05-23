import { useState } from 'react'
import { connectJira, disconnectJira, fetchJiraStory, generateTests, testJiraConnection } from './api'
import { GenerateRequest, GenerateResponse, TestCase } from './types'

function App() {
  const [formData, setFormData] = useState<GenerateRequest>({
    storyTitle: '',
    acceptanceCriteria: '',
    description: '',
    additionalInfo: ''
  })
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set())
  const [isJiraModalOpen, setIsJiraModalOpen] = useState<boolean>(false)
  const [jiraBaseUrl, setJiraBaseUrl] = useState<string>('')
  const [jiraApiKey, setJiraApiKey] = useState<string>('')
  const [jiraEmail, setJiraEmail] = useState<string>('')
  const [jiraTestStatus, setJiraTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [jiraTestMessage, setJiraTestMessage] = useState<string>('')
  const [inputMode, setInputMode] = useState<'manual' | 'jira'>('manual')
  const [jiraId, setJiraId] = useState<string>('')
  const [jiraFetchStatus, setJiraFetchStatus] = useState<'idle' | 'loading'>('idle')
  const [includeFeatureFile, setIncludeFeatureFile] = useState<boolean>(false)
  const [activeResultsTab, setActiveResultsTab] = useState<'cases' | 'feature'>('cases')

  const toggleTestCaseExpansion = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases)
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }
    setExpandedTestCases(newExpanded)
  }

  const handleInputChange = (field: keyof GenerateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.storyTitle.trim() || !formData.acceptanceCriteria.trim()) {
      setError('Story Title and Acceptance Criteria are required')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await generateTests(formData)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests')
    } finally {
      setIsLoading(false)
    }
  }

  const buildFeatureFile = (response: GenerateResponse | null) => {
    if (!response || response.cases.length === 0) {
      return ''
    }

    const featureTitle = formData.storyTitle.trim() || 'Generated Feature'
    const scenarioBlocks = response.cases.map((testCase) => {
      const steps = testCase.steps.map((step, index) => {
        if (index === 0) {
          return `  Given ${step}`
        }
        if (index === testCase.steps.length - 1) {
          return `  Then ${step}`
        }
        return `  When ${step}`
      })

      return [
        `Scenario: ${testCase.id} ${testCase.title}`,
        ...steps,
        `  And expected result: ${testCase.expectedResult}`
      ].join('\n')
    })

    return [
      `Feature: ${featureTitle}`,
      '',
      ...scenarioBlocks.map((block) => `${block}\n`)
    ].join('\n')
  }

  const handleJiraConnect = async () => {
    const response = await connectJira({
      baseUrl: jiraBaseUrl,
      apiKey: jiraApiKey,
      email: jiraEmail
    })

    if (!response.ok) {
      window.alert(response.message || 'Unable to save JIRA credentials.')
      return
    }

    setIsJiraModalOpen(false)
  }

  const handleJiraTest = async () => {
    setJiraTestStatus('testing')
    setJiraTestMessage('Testing connection...')

    const response = await testJiraConnection({
      baseUrl: jiraBaseUrl,
      apiKey: jiraApiKey,
      email: jiraEmail
    })

    if (response.ok) {
      setJiraTestStatus('success')
      setJiraTestMessage('Connection successful')
    } else {
      setJiraTestStatus('error')
      setJiraTestMessage(response.message || 'Unable to connect to JIRA.')
      window.alert(response.message || 'Unable to connect to JIRA.')
    }
  }

  const handleJiraDisconnect = async () => {
    const response = await disconnectJira()

    if (!response.ok) {
      window.alert(response.message || 'Unable to disconnect from JIRA.')
      return
    }

    setJiraTestStatus('idle')
    setJiraTestMessage('')
  }

  const handleJiraFetch = async () => {
    if (!jiraId.trim()) {
      window.alert('Please enter a JIRA ID.')
      return
    }

    setJiraFetchStatus('loading')
    const response = await fetchJiraStory(jiraId.trim())
    setJiraFetchStatus('idle')

    if (!response.ok || !response.data) {
      window.alert(response.message || 'Unable to fetch JIRA story.')
      return
    }

    const hasExistingData = Boolean(
      formData.storyTitle.trim() ||
      formData.description?.trim() ||
      formData.acceptanceCriteria.trim()
    )

    if (hasExistingData) {
      const confirmed = window.confirm('This will replace the current story details. Continue?')
      if (!confirmed) {
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      storyTitle: response.data.storyTitle || '',
      description: response.data.description || '',
      acceptanceCriteria: response.data.acceptanceCriteria || ''
    }))
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 90%;
            padding: 30px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 85%;
            padding: 40px;
          }
        }
        
        @media (min-width: 1440px) {
          .container {
            max-width: 1800px;
            padding: 50px;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 18px;
          flex-wrap: wrap;
        }
        
        .title {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .form-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .mode-toggle {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .mode-btn {
          background: #ffffff;
          color: #2c3e50;
          border: 2px solid #e1e8ed;
          padding: 10px 18px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background-color 0.2s;
        }

        .mode-btn.active {
          border-color: #3498db;
          color: #3498db;
          background: #f8fbff;
        }

        .jira-fetch-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: end;
          margin-bottom: 20px;
        }

        .feature-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0 20px 0;
          font-size: 14px;
          color: #2c3e50;
          font-weight: 600;
        }

        .feature-toggle input {
          width: 18px;
          height: 18px;
          accent-color: #3498db;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .submit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #2980b9;
        }
        
        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .secondary-btn {
          background: #ffffff;
          color: #2c3e50;
          border: 2px solid #e1e8ed;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background-color 0.2s;
        }

        .secondary-btn:hover {
          border-color: #3498db;
          color: #3498db;
          background: #f8fbff;
        }
        
        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
        
        .results-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e8ed;
        }

        .results-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #e1e8ed;
          margin-bottom: 20px;
        }

        .results-tab {
          padding: 10px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          color: #666;
          border-bottom: 2px solid transparent;
        }

        .results-tab.active {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
        }
        
        .results-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .results-meta {
          color: #666;
          font-size: 14px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .results-table th,
        .results-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .results-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .results-table tr:hover {
          background: #f8f9fa;
        }

        .feature-file {
          background: #0b1020;
          color: #e8edf4;
          padding: 20px;
          border-radius: 8px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          white-space: pre-wrap;
          line-height: 1.6;
        }
        
        .category-positive { color: #27ae60; font-weight: 600; }
        .category-negative { color: #e74c3c; font-weight: 600; }
        .category-edge { color: #f39c12; font-weight: 600; }
        .category-authorization { color: #9b59b6; font-weight: 600; }
        .category-non-functional { color: #34495e; font-weight: 600; }
        
        .test-case-id {
          cursor: pointer;
          color: #3498db;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .test-case-id:hover {
          background: #f8f9fa;
        }
        
        .test-case-id.expanded {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .expand-icon {
          font-size: 10px;
          transition: transform 0.2s;
        }
        
        .expand-icon.expanded {
          transform: rotate(90deg);
        }
        
        .expanded-details {
          margin-top: 15px;
          background: #fafbfc;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 20px;
        }
        
        .step-item {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .step-header {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          align-items: start;
        }
        
        .step-id {
          font-weight: 600;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
        }
        
        .step-description {
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .step-test-data {
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .step-expected {
          color: #27ae60;
          font-weight: 500;
          font-size: 14px;
        }
        
        .step-labels {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 10px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          padding: 24px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 1.4rem;
          color: #2c3e50;
          font-weight: 700;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        }

        .jira-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin-top: 10px;
        }

        .jira-status.success {
          color: #27ae60;
        }

        .jira-status.error {
          color: #e74c3c;
        }

        .jira-status.testing {
          color: #f39c12;
        }

        .jira-status-icon {
          font-size: 16px;
        }
      `}</style>
      
      <div className="container">
        <div className="header">
          <h1 className="title">User Story to Tests</h1>
          <p className="subtitle">Generate comprehensive test cases from your user stories</p>
          <div className="header-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setJiraTestStatus('idle')
                setJiraTestMessage('')
                setIsJiraModalOpen(true)
              }}
            >
              Connect to JIRA
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
            >
              Enter Manually
            </button>
            <button
              type="button"
              className={`mode-btn ${inputMode === 'jira' ? 'active' : ''}`}
              onClick={() => setInputMode('jira')}
            >
              Pull from JIRA
            </button>
          </div>

          {inputMode === 'jira' && (
            <div className="jira-fetch-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="jiraId" className="form-label">
                  JIRA ID
                </label>
                <input
                  type="text"
                  id="jiraId"
                  className="form-input"
                  value={jiraId}
                  onChange={(e) => setJiraId(e.target.value)}
                  placeholder="e.g., PROJ-123"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleJiraFetch()
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleJiraFetch}
                disabled={jiraFetchStatus === 'loading'}
              >
                {jiraFetchStatus === 'loading' ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
          )}

          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={includeFeatureFile}
              onChange={(e) => {
                setIncludeFeatureFile(e.target.checked)
                setActiveResultsTab('cases')
              }}
            />
            Also generate Gherkin feature file
          </label>
          <div className="form-group">
            <label htmlFor="storyTitle" className="form-label">
              Story Title *
            </label>
            <input
              type="text"
              id="storyTitle"
              className="form-input"
              value={formData.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder="Enter the user story title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional description (optional)..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="acceptanceCriteria" className="form-label">
              Acceptance Criteria *
            </label>
            <textarea
              id="acceptanceCriteria"
              className="form-textarea"
              value={formData.acceptanceCriteria}
              onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
              placeholder="Enter the acceptance criteria..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Info
            </label>
            <textarea
              id="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information (optional)..."
            />
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            Generating test cases...
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">Generated Test Cases</h2>
              <div className="results-meta">
                {results.cases.length} test case(s) generated
                {results.model && ` • Model: ${results.model}`}
                {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
              </div>
            </div>

            {includeFeatureFile && (
              <div className="results-tabs">
                <button
                  type="button"
                  className={`results-tab ${activeResultsTab === 'cases' ? 'active' : ''}`}
                  onClick={() => setActiveResultsTab('cases')}
                >
                  Generated Test Cases
                </button>
                <button
                  type="button"
                  className={`results-tab ${activeResultsTab === 'feature' ? 'active' : ''}`}
                  onClick={() => setActiveResultsTab('feature')}
                >
                  Feature file
                </button>
              </div>
            )}
            
            {(!includeFeatureFile || activeResultsTab === 'cases') && (
              <div className="table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Test Case ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Expected Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.cases.map((testCase: TestCase) => (
                      <>
                        <tr key={testCase.id}>
                          <td>
                            <div 
                              className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                              onClick={() => toggleTestCaseExpansion(testCase.id)}
                            >
                              <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                                ▶
                              </span>
                              {testCase.id}
                            </div>
                          </td>
                          <td>{testCase.title}</td>
                          <td>
                            <span className={`category-${testCase.category.toLowerCase()}`}>
                              {testCase.category}
                            </span>
                          </td>
                          <td>{testCase.expectedResult}</td>
                        </tr>
                        {expandedTestCases.has(testCase.id) && (
                          <tr key={`${testCase.id}-details`}>
                            <td colSpan={4}>
                              <div className="expanded-details">
                                <h4 style={{marginBottom: '15px', color: '#2c3e50'}}>Test Steps for {testCase.id}</h4>
                                <div className="step-labels">
                                  <div>Step ID</div>
                                  <div>Step Description</div>
                                  <div>Test Data</div>
                                  <div>Expected Result</div>
                                </div>
                                {testCase.steps.map((step, index) => (
                                  <div key={index} className="step-item">
                                    <div className="step-header">
                                      <div className="step-id">S{String(index + 1).padStart(2, '0')}</div>
                                      <div className="step-description">{step}</div>
                                      <div className="step-test-data">{testCase.testData || 'N/A'}</div>
                                      <div className="step-expected">
                                        {index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {includeFeatureFile && activeResultsTab === 'feature' && (
              <div className="feature-file">{buildFeatureFile(results)}</div>
            )}
          </div>
        )}
      </div>

      {isJiraModalOpen && (
        <div className="modal-overlay" onClick={() => setIsJiraModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Connect to JIRA</div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={() => setIsJiraModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="jiraBaseUrl" className="form-label">
                JIRA Base URL
              </label>
              <input
                type="text"
                id="jiraBaseUrl"
                className="form-input"
                value={jiraBaseUrl}
                onChange={(e) => setJiraBaseUrl(e.target.value)}
                placeholder="https://your-domain.atlassian.net"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jiraApiKey" className="form-label">
                JIRA API key
              </label>
              <input
                type="password"
                id="jiraApiKey"
                className="form-input"
                value={jiraApiKey}
                onChange={(e) => setJiraApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jiraEmail" className="form-label">
                JIRA email id
              </label>
              <input
                type="email"
                id="jiraEmail"
                className="form-input"
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleJiraDisconnect}
              >
                Disconnect
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleJiraTest}
                disabled={jiraTestStatus === 'testing'}
              >
                {jiraTestStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsJiraModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleJiraConnect}
              >
                Save
              </button>
            </div>

            {jiraTestStatus !== 'idle' && (
              <div className={`jira-status ${jiraTestStatus}`}>
                <span className="jira-status-icon">
                  {jiraTestStatus === 'success' && '✔'}
                  {jiraTestStatus === 'error' && '✖'}
                  {jiraTestStatus === 'testing' && '⏳'}
                </span>
                <span>{jiraTestMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App