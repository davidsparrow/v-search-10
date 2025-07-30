// ENTERPRISE REPLACEMENT: Replace with enterprise logging service
// Current: Supabase + Console logging
// Future: Splunk, ELK Stack, Datadog, New Relic, etc.

import { supabase } from './supabase'

export interface ErrorLog {
  error_type: 'ui_error' | 'api_error' | 'validation_error' | 'system_error'
  error_message: string
  stack_trace?: string
  component_name?: string
  user_agent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  user_id?: string
  additional_data?: Record<string, any>
}

// ENTERPRISE REPLACEMENT: Replace with enterprise logging service
export const logError = async (error: Error | string, options: Partial<ErrorLog> = {}) => {
  const errorLog: ErrorLog = {
    error_type: options.error_type || 'system_error',
    error_message: typeof error === 'string' ? error : error.message,
    stack_trace: typeof error === 'string' ? undefined : error.stack,
    component_name: options.component_name,
    user_agent: navigator.userAgent,
    severity: options.severity || 'medium',
    user_id: options.user_id,
    additional_data: options.additional_data
  }

  // ENTERPRISE REPLACEMENT: Replace console logging with enterprise log aggregation
  // Current: Console logging for development
  // Future: Enterprise log aggregation (Datadog, New Relic, etc.)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog)
  }

  // ENTERPRISE REPLACEMENT: Replace Supabase with enterprise logging service
  // Current: Supabase error logging
  // Future: Enterprise logging service
  try {
    // TODO: Replace with enterprise logging service
    // await supabase.from('error_logs').insert({
    //   ...errorLog,
    //   timestamp: new Date().toISOString(),
    //   resolved: false
    // })
  } catch (logError) {
    console.error('Failed to log error to Supabase:', logError)
  }
}

// ENTERPRISE REPLACEMENT: Replace with enterprise error monitoring
// Current: Basic error tracking
// Future: Real-time error monitoring and alerting
export const setupGlobalErrorHandling = () => {
  // Global JavaScript error handler
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      error_type: 'system_error',
      severity: 'high',
      additional_data: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  })

  // Promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, {
      error_type: 'api_error',
      severity: 'high',
      additional_data: {
        promise: event.promise
      }
    })
  })
}

// ENTERPRISE REPLACEMENT: Replace with enterprise error analytics
// Current: Basic error categorization
// Future: Advanced error analytics and reporting
export const categorizeError = (error: Error): ErrorLog['error_type'] => {
  const message = error.message.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'api_error'
  }
  
  if (message.includes('validation') || message.includes('form')) {
    return 'validation_error'
  }
  
  if (message.includes('component') || message.includes('render')) {
    return 'ui_error'
  }
  
  return 'system_error'
}

// ENTERPRISE REPLACEMENT: Replace with enterprise severity calculation
// Current: Basic severity assignment
// Future: AI-powered severity analysis
export const calculateSeverity = (error: Error, context?: any): ErrorLog['severity'] => {
  const message = error.message.toLowerCase()
  
  if (message.includes('critical') || message.includes('fatal')) {
    return 'critical'
  }
  
  if (message.includes('error') || message.includes('failed')) {
    return 'high'
  }
  
  if (message.includes('warning') || message.includes('invalid')) {
    return 'medium'
  }
  
  return 'low'
}