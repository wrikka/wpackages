import type { QuickAction } from '~/types/quick-actions'

export function useQuickActions() {
  const createCopyAction = (content: string, onCopy: (content: string) => void): QuickAction => ({
    id: 'copy',
    label: 'Copy',
    icon: 'i-heroicons-clipboard-document',
    shortcut: 'Ctrl+C',
    alwaysVisible: true,
    handler: () => onCopy(content)
  })

  const createRegenerateAction = (onRegenerate: () => void): QuickAction => ({
    id: 'regenerate',
    label: 'Regenerate',
    icon: 'i-heroicons-arrow-path',
    shortcut: 'Ctrl+R',
    alwaysVisible: true,
    handler: onRegenerate
  })

  const createFeedbackAction = (type: 'like' | 'dislike', currentFeedback: 'like' | 'dislike' | null, onFeedback: (type: 'like' | 'dislike') => void): QuickAction => ({
    id: type,
    label: type === 'like' ? 'Like' : 'Dislike',
    icon: type === 'like' 
      ? currentFeedback === 'like' ? 'i-heroicons-hand-thumb-up-solid' : 'i-heroicons-hand-thumb-up'
      : currentFeedback === 'dislike' ? 'i-heroicons-hand-thumb-down-solid' : 'i-heroicons-hand-thumb-down',
    shortcut: type === 'like' ? 'Ctrl+L' : 'Ctrl+D',
    alwaysVisible: true,
    handler: () => onFeedback(type)
  })

  const createShareAction = (messageId: string, onShare: (messageId: string) => void): QuickAction => ({
    id: 'share',
    label: 'Share',
    icon: 'i-heroicons-share',
    shortcut: 'Ctrl+S',
    alwaysVisible: true,
    handler: () => onShare(messageId)
  })

  const createEditAction = (messageId: string, onEdit: (messageId: string) => void): QuickAction => ({
    id: 'edit',
    label: 'Edit',
    icon: 'i-heroicons-pencil',
    shortcut: 'Ctrl+E',
    alwaysVisible: true,
    handler: () => onEdit(messageId)
  })

  const createForkAction = (messageId: string, onFork: (messageId: string) => void): QuickAction => ({
    id: 'fork',
    label: 'Fork',
    icon: 'i-heroicons-arrows-pointing-out',
    shortcut: 'Ctrl+F',
    alwaysVisible: true,
    handler: () => onFork(messageId)
  })

  const createPinAction = (isPinned: boolean, onPin: (messageId: string) => void, messageId: string): QuickAction => ({
    id: 'pin',
    label: isPinned ? 'Unpin' : 'Pin',
    icon: isPinned ? 'i-heroicons-pin-solid' : 'i-heroicons-pin',
    shortcut: 'Ctrl+P',
    alwaysVisible: true,
    handler: () => onPin(messageId)
  })

  const createSpeakAction = (content: string, onSpeak: (content: string) => void): QuickAction => ({
    id: 'speak',
    label: 'Speak',
    icon: 'i-heroicons-speaker-wave',
    shortcut: 'Ctrl+T',
    alwaysVisible: true,
    handler: () => onSpeak(content)
  })

  const createTranslateAction = (content: string, onTranslate: (content: string) => void): QuickAction => ({
    id: 'translate',
    label: 'Translate',
    icon: 'i-heroicons-language',
    shortcut: 'Ctrl+Shift+T',
    alwaysVisible: false,
    handler: () => onTranslate(content)
  })

  const createExplainAction = (content: string, onExplain: (content: string) => void): QuickAction => ({
    id: 'explain',
    label: 'Explain',
    icon: 'i-heroicons-light-bulb',
    shortcut: 'Ctrl+Shift+E',
    alwaysVisible: false,
    handler: () => onExplain(content)
  })

  const createApplyToWorkspaceAction = (content: string, onApply: (content: string) => void): QuickAction => ({
    id: 'apply-to-workspace',
    label: 'Apply to Workspace',
    icon: 'i-heroicons-rocket-launch',
    shortcut: 'Ctrl+Shift+A',
    alwaysVisible: false,
    handler: () => onApply(content)
  })

  return {
    createCopyAction,
    createRegenerateAction,
    createFeedbackAction,
    createShareAction,
    createEditAction,
    createForkAction,
    createPinAction,
    createSpeakAction,
    createTranslateAction,
    createExplainAction,
    createApplyToWorkspaceAction
  }
}
