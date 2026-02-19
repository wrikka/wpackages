import { ref } from 'vue'
import type { RecordedAction } from '@/types'

export function useTaskAutomation() {
  const isRecording = ref(false)
  const recordedActions = ref<RecordedAction[]>([])

  const hasRecordedActions = ref(false)

  const startRecording = () => {
    isRecording.value = true
    recordedActions.value = []
    hasRecordedActions.value = false

    // Send message to content script to start recording
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        browser.tabs.sendMessage(tab.id, {
          type: 'START_RECORDING'
        })
      }
    })
  }

  const stopRecording = () => {
    isRecording.value = false
    hasRecordedActions.value = recordedActions.value.length > 0

    // Send message to content script to stop recording
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        browser.tabs.sendMessage(tab.id, {
          type: 'STOP_RECORDING'
        })
      }
    })
  }

  const replayActions = async () => {
    if (recordedActions.value.length === 0) return

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        for (const action of recordedActions.value) {
          await browser.tabs.sendMessage(tab.id, {
            type: 'REPLAY_ACTION',
            action
          })
          
          // Add delay between actions
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    } catch (error) {
      console.error('Failed to replay actions:', error)
    }
  }

  // Listen for recorded actions from content script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACTION_RECORDED' && isRecording.value) {
      recordedActions.value.push(message.action)
      sendResponse({ success: true })
    }
  })

  return {
    isRecording,
    recordedActions,
    hasRecordedActions,
    startRecording,
    stopRecording,
    replayActions
  }
}
