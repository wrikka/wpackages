// Plugin system types

export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  enabled: boolean
  config?: Record<string, any>
  permissions?: string[]
  entry: string
  dependencies?: string[]
  extensionPoints?: string[]
}

export interface Integration {
  id: string
  name: string
  type: string
  config: Record<string, any>
  enabled: boolean
  lastSync?: Date
  status: 'connected' | 'disconnected' | 'error'
  error?: string
}

export interface PluginHook {
  name: string
  handler: (...args: any[]) => any
  priority?: number
  once?: boolean
}

export interface PluginManifest {
  id?: string
  name?: string
  version?: string
  description?: string
  entry: string
  permissions?: string[]
  extensionPoints?: string[]
  dependencies?: string[]
  config?: Record<string, any>
}

export interface PluginContext {
  plugin: Plugin
  api: PluginAPI
  config: Record<string, any>
  storage: PluginStorage
}

export interface PluginAPI {
  registerCommand: (command: PluginCommand) => void
  registerHook: (hook: PluginHook) => void
  getConfig: () => Record<string, any>
  setConfig: (config: Record<string, any>) => void
}

export interface PluginCommand {
  id: string
  title: string
  description?: string
  handler: () => void | Promise<void>
  icon?: string
  category?: string
}

export interface PluginStorage {
  get: (key: string) => any
  set: (key: string, value: any) => void
  delete: (key: string) => void
  clear: () => void
}
