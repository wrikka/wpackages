import type { CommandPaletteAction } from '~/types/command-palette'

export function useCommandPaletteRecent() {
  const MAX_RECENT_ACTIONS = 10
  const STORAGE_KEY = 'command-palette-recent'
  
  const getRecentActions = (): CommandPaletteAction[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to parse recent actions from localStorage')
      return []
    }
  }
  
  const addToRecent = (action: CommandPaletteAction): CommandPaletteAction[] => {
    const recent = getRecentActions()
    
    // Remove existing action if present
    const existingIndex = recent.findIndex(a => a.id === action.id)
    if (existingIndex > -1) {
      recent.splice(existingIndex, 1)
    }
    
    // Add to beginning
    recent.unshift(action)
    
    // Keep only the most recent actions
    return recent.slice(0, MAX_RECENT_ACTIONS)
  }
  
  const saveRecentActions = (actions: CommandPaletteAction[]): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
    } catch (error) {
      console.warn('Failed to save recent actions to localStorage')
    }
  }
  
  const clearRecentActions = (): void => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(STORAGE_KEY)
  }
  
  return {
    getRecentActions,
    addToRecent,
    saveRecentActions,
    clearRecentActions
  }
}
