import type { CommandPaletteAction } from '~/types/command-palette'

export const COMMAND_PALETTE_ACTIONS: CommandPaletteAction[] = [
  // Navigation
  { id: 'nav-chat', title: 'Go to Chat', description: 'Open chat interface', icon: 'i-heroicons-chat-bubble-left-right', category: 'Navigation', shortcut: 'Ctrl+1', keywords: ['chat', 'conversation', 'talk'] },
  { id: 'nav-code', title: 'Go to Code', description: 'Open code analysis', icon: 'i-heroicons-code-bracket', category: 'Navigation', shortcut: 'Ctrl+2', keywords: ['code', 'programming', 'dev'] },
  { id: 'nav-research', title: 'Go to Research', description: 'Open research tools', icon: 'i-heroicons-academic-cap', category: 'Navigation', shortcut: 'Ctrl+3', keywords: ['research', 'study', 'learn'] },
  { id: 'nav-settings', title: 'Go to Settings', description: 'Open application settings', icon: 'i-heroicons-cog-6-tooth', category: 'Navigation', shortcut: 'Ctrl+,', keywords: ['settings', 'config', 'preferences'] },
  
  // Chat Actions
  { id: 'chat-new', title: 'New Chat', description: 'Start a new conversation', icon: 'i-heroicons-plus', category: 'Chat', shortcut: 'Ctrl+N', keywords: ['new', 'chat', 'conversation', 'start'] },
  { id: 'chat-clear', title: 'Clear Chat', description: 'Clear current conversation', icon: 'i-heroicons-trash', category: 'Chat', shortcut: 'Ctrl+Shift+C', keywords: ['clear', 'reset', 'delete'] },
  { id: 'chat-export', title: 'Export Chat', description: 'Export conversation history', icon: 'i-heroicons-arrow-down-tray', category: 'Chat', shortcut: 'Ctrl+E', keywords: ['export', 'save', 'download'] },
  { id: 'chat-share', title: 'Share Chat', description: 'Share conversation link', icon: 'i-heroicons-share', category: 'Chat', shortcut: 'Ctrl+S', keywords: ['share', 'link', 'collaborate'] },
  
  // Content Actions
  { id: 'content-summarize', title: 'Summarize', description: 'Summarize selected text or document', icon: 'i-heroicons-document-text', category: 'Content', shortcut: 'Ctrl+Shift+S', keywords: ['summarize', 'summary', 'condense'] },
  { id: 'content-translate', title: 'Translate', description: 'Translate text to another language', icon: 'i-heroicons-language', category: 'Content', shortcut: 'Ctrl+Shift+T', keywords: ['translate', 'language', 'convert'] },
  { id: 'content-explain', title: 'Explain', description: 'Get explanation for complex concepts', icon: 'i-heroicons-light-bulb', category: 'Content', shortcut: 'Ctrl+Shift+E', keywords: ['explain', 'understand', 'clarify'] },
  { id: 'content-analyze', title: 'Analyze', description: 'Analyze text for insights', icon: 'i-heroicons-chart-bar', category: 'Content', shortcut: 'Ctrl+Shift+A', keywords: ['analyze', 'insights', 'data'] },
  
  // AI Actions
  { id: 'ai-model', title: 'Change AI Model', description: 'Switch to different AI model', icon: 'i-heroicons-sparkles', category: 'AI', shortcut: 'Ctrl+M', keywords: ['model', 'ai', 'switch', 'gpt'] },
  { id: 'ai-mode', title: 'Change Chat Mode', description: 'Switch chat mode (casual, professional, etc.)', icon: 'i-heroicons-cog-6-tooth', category: 'AI', shortcut: 'Ctrl+Shift+M', keywords: ['mode', 'style', 'persona'] },
  { id: 'ai-temperature', title: 'Adjust Temperature', description: 'Change AI response creativity', icon: 'i-heroicons-adjustments-horizontal', category: 'AI', shortcut: 'Ctrl+Shift+T', keywords: ['temperature', 'creativity', 'randomness'] },
  
  // File Actions
  { id: 'file-upload', title: 'Upload File', description: 'Upload document or image', icon: 'i-heroicons-arrow-up-tray', category: 'Files', shortcut: 'Ctrl+U', keywords: ['upload', 'file', 'document', 'image'] },
  { id: 'file-download', title: 'Download File', description: 'Download generated content', icon: 'i-heroicons-arrow-down-tray', category: 'Files', shortcut: 'Ctrl+D', keywords: ['download', 'save', 'export'] },
  
  // Window Actions
  { id: 'window-minimize', title: 'Minimize Window', description: 'Minimize application window', icon: 'i-heroicons-minus', category: 'Window', shortcut: 'Ctrl+Shift+M', keywords: ['minimize', 'hide', 'window'] },
  { id: 'window-fullscreen', title: 'Toggle Fullscreen', description: 'Enter or exit fullscreen mode', icon: 'i-heroicons-arrows-maximize', category: 'Window', shortcut: 'F11', keywords: ['fullscreen', 'maximize', 'focus'] },
  
  // Help Actions
  { id: 'help-shortcuts', title: 'Show Keyboard Shortcuts', description: 'Display all available shortcuts', icon: 'i-heroicons-keyboard', category: 'Help', shortcut: 'Ctrl+?', keywords: ['shortcuts', 'keys', 'help', 'tutorial'] },
  { id: 'help-docs', title: 'Open Documentation', description: 'Open help documentation', icon: 'i-heroicons-book-open', category: 'Help', shortcut: 'F1', keywords: ['docs', 'documentation', 'help', 'manual'] },
  { id: 'help-feedback', title: 'Send Feedback', description: 'Send feedback to developers', icon: 'i-heroicons-chat-bubble-left-right', category: 'Help', shortcut: 'Ctrl+F', keywords: ['feedback', 'report', 'bug', 'suggestion'] }
]

export const COMMAND_PALETTE_CATEGORIES = {
  'Navigation': { icon: 'i-heroicons-compass', color: 'blue' },
  'Chat': { icon: 'i-heroicons-chat-bubble-left-right', color: 'green' },
  'Content': { icon: 'i-heroicons-document-text', color: 'purple' },
  'AI': { icon: 'i-heroicons-sparkles', color: 'yellow' },
  'Files': { icon: 'i-heroicons-folder', color: 'orange' },
  'Window': { icon: 'i-heroicons-window', color: 'gray' },
  'Help': { icon: 'i-heroicons-question-mark-circle', color: 'pink' }
} as const
