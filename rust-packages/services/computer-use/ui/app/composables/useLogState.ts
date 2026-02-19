import { useState } from '#app'

interface LogEntry {
  status: string;
  action: string;
  time?: string;
}

export const useLogState = () => {
  const logEntries = useState<LogEntry[]>('logEntries', () => [
    {
      status: '⚪',
      action: 'Session started',
      time: new Date().toLocaleTimeString()
    }
  ])

  const addLogEntry = (entry: LogEntry) => {
    logEntries.value.unshift({ ...entry, time: new Date().toLocaleTimeString() })
  }

  return {
    logEntries,
    addLogEntry
  }
}
