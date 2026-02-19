import type { ChatMode } from '#shared/types/common'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useModels } from '~/composables/chat/useModels'
import { useModesStore } from '~/stores/modes'

export function useChatMode(initialMode?: string, initialModel?: string) {
  const { availableModels, defaultModel } = useModels()
  const modesStore = useModesStore()
  const { enabledModes, modes } = storeToRefs(modesStore)

  const selectedModel = ref<string>(initialModel ?? defaultModel)
  const selectedModeId = ref<string>(initialMode ?? 'auto')

  const isChatMode = (value: string): value is ChatMode => {
    return (
      value === 'auto' ||
      value === 'chat' ||
      value === 'agent' ||
      value === 'code' ||
      value === 'summarize' ||
      value === 'translate' ||
      value === 'explain' ||
      value === 'compare' ||
      value === 'copywriting' ||
      value === 'present' ||
      value === 'organize' ||
      value === 'learn' ||
      value === 'quiz' ||
      value === 'tutor' ||
      value === 'writer' ||
      value === 'review' ||
      value === 'analyze' ||
      value === 'image' ||
      value === 'prompt'
    )
  }

  const selectedModeConfig = computed(() => {
    return modes.value.find(m => m.id === selectedModeId.value) || null
  })

  const effectiveMode = computed<ChatMode>(() => {
    const id = selectedModeId.value
    if (isChatMode(id)) {
      return id
    }
    const base = selectedModeConfig.value?.baseMode
    return base || 'chat'
  })

  const effectiveSystemPrompt = computed(() => {
    if (selectedModeId.value.startsWith('custom:')) {
      return selectedModeConfig.value?.defaultPrompt ?? null
    }
    return null
  })

  const modeUx = computed(() => {
    const id = selectedModeId.value
    if (id === 'custom:data-analyst') {
      return {
        placeholder: 'Paste a table/CSV snippet or describe the dataset + what decision you want (e.g., churn, sales drop, top segments)…',
        hint: 'Data analysis mode: Upload CSV/table or describe dataset + analysis goal',
        icon: 'i-heroicons-chart-bar'
      }
    }
    if (id === 'custom:business-plan') {
      return {
        placeholder: 'Describe your business idea, target market, and key questions…',
        hint: 'Business planning mode: Generate comprehensive business plans and strategies',
        icon: 'i-heroicons-document-text'
      }
    }
    if (id === 'custom:storyboard') {
      return {
        placeholder: 'Describe your video concept, platform, and key message…',
        hint: 'Storyboard mode: Create visual storyboards for video content',
        icon: 'i-heroicons-film'
      }
    }
    if (id === 'custom:cheat-sheet') {
      return {
        placeholder: 'Topic, learning level, and what you want to focus on…',
        hint: 'Cheat sheet mode: Create concise reference guides and summaries',
        icon: 'i-heroicons-rectangle-stack'
      }
    }
    if (id === 'custom:meeting-notes') {
      return {
        placeholder: 'Paste meeting transcript or describe key discussion points…',
        hint: 'Meeting notes mode: Extract action items, decisions, and summaries',
        icon: 'i-heroicons-users'
      }
    }
    if (id === 'custom:resume') {
      return {
        placeholder: 'Target role, experience level, and job description (optional)…',
        hint: 'Resume mode: Optimize resumes and write cover letters',
        icon: 'i-heroicons-briefcase'
      }
    }
    if (id === 'custom:presentation') {
      return {
        placeholder: 'Topic, audience, and key objectives for your presentation…',
        hint: 'Presentation mode: Create structured presentations with talking points',
        icon: 'i-heroicons-presentation-chart-bar'
      }
    }

    const m = effectiveMode.value
    if (m === 'quiz') {
      return {
        placeholder: 'Paste content or describe a topic, then ask for a quiz (e.g., 10 MCQs, medium difficulty)…',
        hint: 'Quiz mode: Generate questions and assessments from content',
        icon: 'i-heroicons-academic-cap'
      }
    }
    if (m === 'agent') {
      return {
        placeholder: 'Describe what you want the agent to do, or select a specific agent…',
        hint: 'Agent mode: Use specialized AI agents for specific tasks',
        icon: 'i-heroicons-cpu-chip'
      }
    }
    if (m === 'code') {
      return {
        placeholder: 'Describe what you want to build, debug, or ask about code…',
        hint: 'Code mode: Write, review, debug, and explain code',
        icon: 'i-heroicons-code-bracket'
      }
    }
    if (m === 'image') {
      return {
        placeholder: 'Describe the image you want to generate (e.g., "a serene mountain landscape at sunset")…',
        hint: 'Image generation mode: Create images from descriptions',
        icon: 'i-heroicons-photo'
      }
    }
    if (m === 'summarize') {
      return {
        placeholder: 'Paste text to summarize or describe what you want summarized…',
        hint: 'Summarize mode: Extract key points and create concise summaries',
        icon: 'i-heroicons-document-duplicate'
      }
    }
    if (m === 'translate') {
      return {
        placeholder: 'Text to translate and target language (e.g., "Translate to Spanish: Hello")…',
        hint: 'Translate mode: Translate text between languages',
        icon: 'i-heroicons-language'
      }
    }
    if (m === 'explain') {
      return {
        placeholder: 'Paste complex text or ask to explain a concept…',
        hint: 'Explain mode: Break down complex topics into simple explanations',
        icon: 'i-heroicons-light-bulb'
      }
    }
    if (m === 'compare') {
      return {
        placeholder: 'Describe what you want to compare (e.g., "React vs Vue for e-commerce")…',
        hint: 'Compare mode: Analyze differences between options',
        icon: 'i-heroicons-arrows-right-left'
      }
    }
    if (m === 'copywriting') {
      return {
        placeholder: 'Describe what you want to write and the audience…',
        hint: 'Copywriting mode: Create marketing content and persuasive text',
        icon: 'i-heroicons-pencil'
      }
    }
    if (m === 'present') {
      return {
        placeholder: 'Topic and audience for your presentation…',
        hint: 'Present mode: Create presentation outlines and content',
        icon: 'i-heroicons-presentation-chart-bar'
      }
    }
    if (m === 'organize') {
      return {
        placeholder: 'Describe what needs organizing (ideas, tasks, content…)…',
        hint: 'Organize mode: Structure and categorize information',
        icon: 'i-heroicons-squares-2x2'
      }
    }
    if (m === 'learn') {
      return {
        placeholder: 'What you want to learn about and your current level…',
        hint: 'Learn mode: Get explanations and learning resources',
        icon: 'i-heroicons-academic-cap'
      }
    }
    if (m === 'tutor') {
      return {
        placeholder: 'Subject you want help with and specific questions…',
        hint: 'Tutor mode: Personalized learning and guidance',
        icon: 'i-heroicons-rectangle-stack'
      }
    }
    if (m === 'writer') {
      return {
        placeholder: 'What you want to write and the style/tone…',
        hint: 'Writer mode: Create various types of written content',
        icon: 'i-heroicons-pencil-square'
      }
    }
    if (m === 'review') {
      return {
        placeholder: 'Content to review and criteria for feedback…',
        hint: 'Review mode: Analyze and provide constructive feedback',
        icon: 'i-heroicons-magnifying-glass'
      }
    }
    if (m === 'analyze') {
      return {
        placeholder: 'Data, text, or situation to analyze…',
        hint: 'Analyze mode: Deep analysis and insights',
        icon: 'i-heroicons-chart-bar'
      }
    }
    if (m === 'prompt') {
      return {
        placeholder: 'Describe what kind of prompt you want to create or improve…',
        hint: 'Prompt mode: Create and optimize prompts for better AI responses',
        icon: 'i-heroicons-chat-bubble-left-right'
      }
    }

    return {
      placeholder: 'Type your message…',
      hint: 'Chat mode: General conversation and assistance',
      icon: 'i-heroicons-chat-bubble-left-right'
    }
  })

  return {
    selectedModel,
    selectedModeId,
    effectiveMode,
    effectiveSystemPrompt,
    modeUx,
    selectedModeConfig,
    isChatMode,
  }
}
