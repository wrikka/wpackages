import type { SavedPrompt } from '#shared/types/chat'
import { ref, computed } from 'vue'
import { useTemplatesStore } from '~/stores/templates'
import { usePromptsStore } from '~/stores/prompts'
import { useUser } from '~/composables/user/useUser'

type MenuType = 'mention' | 'command' | 'template' | 'prompt'
type MenuItem = { id: string, insert: string, label: string }

export function useChatMenu() {
  const isMenuOpen = ref(false)
  const menuType = ref<MenuType>('mention')
  const menuQuery = ref('')
  const organizationMembers = ref<{ id: string, username: string }[]>([])

  const templatesStore = useTemplatesStore()
  const promptsStore = usePromptsStore()
  const user = useUser()

  type KnownCustomModeId =
    | 'custom:data-analyst'
    | 'custom:business-plan'
    | 'custom:storyboard'
    | 'custom:cheat-sheet'
    | 'custom:meeting-notes'
    | 'custom:resume'
    | 'custom:presentation'
    | 'custom:vocabulary-builder'
    | 'custom:quiz-plus'

  const isKnownCustomModeId = (value: string): value is KnownCustomModeId => {
    return (
      value === 'custom:data-analyst' ||
      value === 'custom:business-plan' ||
      value === 'custom:storyboard' ||
      value === 'custom:cheat-sheet' ||
      value === 'custom:meeting-notes' ||
      value === 'custom:resume' ||
      value === 'custom:presentation' ||
      value === 'custom:vocabulary-builder' ||
      value === 'custom:quiz-plus'
    )
  }

  const filteredMenuItems = computed((): MenuItem[] => {
    const q = menuQuery.value.toLowerCase()

    if (menuType.value === 'mention') {
      const items: MenuItem[] = []

      // Organization members
      if (organizationMembers.value.length > 0) {
        items.push(
          ...organizationMembers.value
            .filter(m => m.username.toLowerCase().includes(q))
            .map(m => ({
              id: `@${m.id}`,
              insert: `@${m.username}`,
              label: `@${m.username} (member)`
            }))
        )
      }

      // Self
      if (user.value?.username?.toLowerCase().includes(q) || q === 'me') {
        items.push({
          id: '@me',
          insert: '@me',
          label: `@${user.value?.username || 'me'} (you)`
        })
      }

      return items
    }

    if (menuType.value === 'command') {
      const commands = [
        { id: '/help', insert: '/help', label: 'Show available commands' },
        { id: '/clear', insert: '/clear', label: 'Clear conversation' },
        { id: '/export', insert: '/export', label: 'Export conversation' },
        { id: '/settings', insert: '/settings', label: 'Open settings' },
      ]

      const customCommands = [
        { id: '/data-analyst', insert: '/data-analyst', label: 'Data Analyst Mode' },
        { id: '/business-plan', insert: '/business-plan', label: 'Business Plan Mode' },
        { id: '/storyboard', insert: '/storyboard', label: 'Storyboard Mode' },
        { id: '/cheat-sheet', insert: '/cheat-sheet', label: 'Cheat Sheet Mode' },
        { id: '/meeting-notes', insert: '/meeting-notes', label: 'Meeting Notes Mode' },
        { id: '/resume', insert: '/resume', label: 'Resume Mode' },
        { id: '/presentation', insert: '/presentation', label: 'Presentation Mode' },
      ]

      return [...commands, ...customCommands].filter(cmd =>
        cmd.label.toLowerCase().includes(q) || cmd.id.toLowerCase().includes(q)
      )
    }

    if (menuType.value === 'template') {
      return templatesStore.templates
        .filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
        )
        .map(t => ({
          id: t.id,
          insert: t.template,
          label: t.name
        }))
    }

    if (menuType.value === 'prompt') {
      return promptsStore.prompts
        .filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        )
        .map(p => ({
          id: p.id,
          insert: p.prompt,
          label: p.title
        }))
    }

    return []
  })

  const openMenu = (type: MenuType, query: string = '') => {
    menuType.value = type
    menuQuery.value = query
    isMenuOpen.value = true
  }

  const closeMenu = () => {
    isMenuOpen.value = false
    menuQuery.value = ''
  }

  const selectMenuItem = (item: MenuItem) => {
    // This will be handled by the parent component
    return item
  }

  return {
    isMenuOpen,
    menuType,
    menuQuery,
    organizationMembers,
    filteredMenuItems,
    isKnownCustomModeId,
    openMenu,
    closeMenu,
    selectMenuItem,
  }
}
