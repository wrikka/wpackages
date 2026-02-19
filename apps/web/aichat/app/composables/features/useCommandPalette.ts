import { ref, computed } from 'vue'

export function useCommandPalette() {
  const isOpen = ref(false)
  const query = ref('')
  const selectedIndex = ref(0)

  const commands = computed(() => [
    { id: 'new-chat', label: 'New Chat', icon: 'i-carbon-add', shortcut: 'Ctrl+N' },
    { id: 'search', label: 'Search', icon: 'i-carbon-search', shortcut: 'Ctrl+K' },
    { id: 'settings', label: 'Settings', icon: 'i-carbon-settings', shortcut: 'Ctrl+S' },
    { id: 'help', label: 'Help', icon: 'i-carbon-help', shortcut: 'Ctrl+?' },
  ])

  const filteredCommands = computed(() => {
    if (!query.value) return commands.value
    
    return commands.value.filter(cmd => 
      cmd.label.toLowerCase().includes(query.value.toLowerCase())
    )
  })

  const open = () => {
    isOpen.value = true
    query.value = ''
    selectedIndex.value = 0
  }

  const close = () => {
    isOpen.value = false
    query.value = ''
  }

  const selectNext = () => {
    selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length
  }

  const selectPrevious = () => {
    selectedIndex.value = selectedIndex.value === 0 
      ? filteredCommands.value.length - 1 
      : selectedIndex.value - 1
  }

  const executeSelected = () => {
    const selected = filteredCommands.value[selectedIndex.value]
    if (selected) {
      // Execute command based on id
      switch (selected.id) {
        case 'new-chat':
          // Handle new chat
          break
        case 'search':
          // Handle search
          break
        case 'settings':
          // Handle settings
          break
        case 'help':
          // Handle help
          break
      }
      close()
    }
  }

  return {
    isOpen,
    query,
    selectedIndex,
    commands,
    filteredCommands,
    open,
    close,
    selectNext,
    selectPrevious,
    executeSelected,
  }
}
