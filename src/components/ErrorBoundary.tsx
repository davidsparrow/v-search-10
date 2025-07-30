import React, { Component, ErrorInfo, ReactNode } from 'react'
import { message } from 'antd'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ENTERPRISE REPLACEMENT: Replace with enterprise error logging service
    // Current: Basic console logging
    // Future: Splunk, ELK Stack, Datadog, New Relic, etc.
    console.error('ErrorBoundary caught error:', error, errorInfo)

    // ENTERPRISE REPLACEMENT: Replace Supabase with enterprise logging
    // Current: Supabase error logging
    // Future: Enterprise log aggregation service
    this.logErrorToSupabase(error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  // ENTERPRISE REPLACEMENT: Replace with enterprise logging service
  private async logErrorToSupabase(error: Error, errorInfo: ErrorInfo) {
    try {
      // TODO: Replace with enterprise logging service
      // const { supabase } = await import('../lib/supabase')
      // await supabase.from('error_logs').insert({
      //   error_type: 'ui_error',
      //   error_message: error.message,
      //   stack_trace: error.stack,
      //   component_name: errorInfo.componentStack,
      //   user_agent: navigator.userAgent,
      //   severity: 'high',
      //   timestamp: new Date().toISOString()
      // })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  render() {
    if (this.state.hasError) {
      // ENTERPRISE REPLACEMENT: Replace with branded error UI
      // Current: Basic error message
      // Future: Branded error pages, localized messages
      return this.props.fallback || (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#ff4d4f'
        }}>
          <h3>Something went wrong</h3>
          <p>We've logged this error and will fix it soon.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}