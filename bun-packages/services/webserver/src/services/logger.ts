/**
 * Logger service - Functional approach
 */

import { writeFile, appendFile, mkdir } from 'fs/promises'
import { dirname } from 'path'
import type { LoggerConfig, LogEntry } from '../types'

// Logger state
type LoggerState = {
  config: Required<LoggerConfig>
  logBuffer: LogEntry[]
  flushInterval?: NodeJS.Timeout
}

// Configuration merger
const mergeConfig = (config: LoggerConfig): Required<LoggerConfig> => ({
  level: config.level || 'info',
  format: config.format || 'json',
  file: config.file,
  maxFiles: config.maxFiles || 10,
  maxSize: config.maxSize || '10MB',
  datePattern: config.datePattern || 'YYYY-MM-DD',
  console: config.console !== false,
  colorize: config.colorize !== false
})

// Initial state
export const createLoggerState = (config: LoggerConfig): LoggerState => ({
  config: mergeConfig(config),
  logBuffer: []
})

// Pure functions for logging
export const createLogEntry = (
  level: string,
  message: string,
  metadata?: Record<string, any>
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  metadata: metadata || {},
  tags: metadata?.tags || []
})

export const shouldLog = (currentLevel: string, targetLevel: string): boolean => {
  const levels = ['debug', 'info', 'warn', 'error', 'fatal']
  const currentIndex = levels.indexOf(currentLevel)
  const targetIndex = levels.indexOf(targetLevel)
  
  return targetIndex >= currentIndex
}

export const formatEntry = (entry: LogEntry, format: 'json' | 'text' | 'structured'): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(entry)
    case 'structured':
      return formatStructured(entry)
    case 'text':
    default:
      return formatText(entry)
  }
}

const formatText = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString()
  const level = entry.level.toUpperCase().padEnd(5)
  const requestId = entry.requestId ? ` [${entry.requestId}]` : ''
  const method = entry.method ? ` ${entry.method}` : ''
  const url = entry.url ? ` ${entry.url}` : ''
  const status = entry.status ? ` ${entry.status}` : ''
  const duration = entry.duration ? ` ${duration}ms` : ''
  
  let message = `[${timestamp}] ${level}${requestId}${method}${url}${status}${duration} ${entry.message}`
  
  if (entry.error) {
    message += `\nError: ${entry.error}`
  }
  
  if (entry.stack) {
    message += `\nStack: ${entry.stack}`
  }
  
  return message
}

const formatStructured = (entry: LogEntry): string => {
  const parts = [
    `time=${entry.timestamp}`,
    `level=${entry.level}`,
    `msg="${entry.message}"`
  ]
  
  if (entry.requestId) parts.push(`requestId=${entry.requestId}`)
  if (entry.method) parts.push(`method=${entry.method}`)
  if (entry.url) parts.push(`url=${entry.url}`)
  if (entry.status) parts.push(`status=${entry.status}`)
  if (entry.duration) parts.push(`duration=${entry.duration}`)
  if (entry.error) parts.push(`error="${entry.error}"`)
  
  return parts.join(' ')
}

export const getColor = (level: string): string => {
  const colors: Record<string, string> = {
    debug: '36', // Cyan
    info: '32',  // Green
    warn: '33',  // Yellow
    error: '31', // Red
    fatal: '35'  // Magenta
  }
  
  return colors[level] || '0'
}

export const getLogFilePath = (config: Required<LoggerConfig>): string => {
  if (!config.file) {
    throw new Error('Log file path not configured')
  }
  
  const date = new Date().toISOString().split('T')[0]
  return config.file.replace('{date}', date)
}

// Logger operations
export const log = (
  state: LoggerState,
  level: string,
  message: string,
  metadata?: Record<string, any>
): LoggerState => {
  if (!shouldLog(state.config.level, level)) {
    return state
  }

  const entry = createLogEntry(level, message, metadata)
  
  const newState = {
    ...state,
    logBuffer: [...state.logBuffer, entry]
  }

  // Console logging
  if (state.config.console) {
    const formatted = formatEntry(entry, state.config.format)
    if (state.config.colorize) {
      const color = getColor(level)
      console.log(`\x1b[${color}m${formatted}\x1b[0m`)
    } else {
      console.log(formatted)
    }
  }

  return newState
}

export const flush = async (state: LoggerState): Promise<LoggerState> => {
  if (state.logBuffer.length === 0 || !state.config.file) {
    return { ...state, logBuffer: [] }
  }

  try {
    const filePath = getLogFilePath(state.config)
    await mkdir(dirname(filePath), { recursive: true })
    
    for (const entry of state.logBuffer) {
      const formatted = formatEntry(entry, state.config.format)
      await appendFile(filePath, formatted + '\n')
    }
    
    return { ...state, logBuffer: [] }
  } catch (error) {
    console.error('Failed to flush logs:', error)
    return state
  }
}

export const clear = async (state: LoggerState): Promise<LoggerState> => {
  const clearedState = { ...state, logBuffer: [] }
  
  if (state.config.file) {
    try {
      const filePath = getLogFilePath(state.config)
      await writeFile(filePath, '')
    } catch (error) {
      console.error('Failed to clear log file:', error)
    }
  }
  
  return clearedState
}

export const getStats = (state: LoggerState) => ({
  level: state.config.level,
  format: state.config.format,
  file: state.config.file,
  bufferSize: state.logBuffer.length,
  console: state.config.console,
  colorize: state.config.colorize
})

// Logger factory
export const createLogger = (config: LoggerConfig): LoggerState => createLoggerState(config)

// Convenience methods
export const debug = (state: LoggerState, message: string, metadata?: Record<string, any>) =>
  log(state, 'debug', message, metadata)

export const info = (state: LoggerState, message: string, metadata?: Record<string, any>) =>
  log(state, 'info', message, metadata)

export const warn = (state: LoggerState, message: string, metadata?: Record<string, any>) =>
  log(state, 'warn', message, metadata)

export const error = (state: LoggerState, message: string, metadata?: Record<string, any>) =>
  log(state, 'error', message, metadata)

export const fatal = (state: LoggerState, message: string, metadata?: Record<string, any>) =>
  log(state, 'fatal', message, metadata)
