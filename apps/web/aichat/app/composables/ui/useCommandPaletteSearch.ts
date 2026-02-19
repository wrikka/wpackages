import type { CommandPaletteAction } from '~/types/command-palette'

export function useCommandPaletteSearch() {
  const filterActions = (actions: CommandPaletteAction[], query: string): CommandPaletteAction[] => {
    if (!query.trim()) {
      return actions
    }
    
    const lowerQuery = query.toLowerCase()
    return actions.filter(action => {
      const titleMatch = action.title.toLowerCase().includes(lowerQuery)
      const descriptionMatch = action.description.toLowerCase().includes(lowerQuery)
      const keywordMatch = action.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      const categoryMatch = action.category.toLowerCase().includes(lowerQuery)
      
      return titleMatch || descriptionMatch || keywordMatch || categoryMatch
    })
  }
  
  const groupActions = (actions: CommandPaletteAction[]): Record<string, CommandPaletteAction[]> => {
    const groups: Record<string, CommandPaletteAction[]> = {}
    
    actions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = []
      }
      groups[action.category].push(action)
    })
    
    return groups
  }
  
  return {
    filterActions,
    groupActions
  }
}
