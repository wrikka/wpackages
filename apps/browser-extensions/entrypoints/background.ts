export default defineBackground(() => {
  console.log('Wai Browser Agent background script started')

  const getApiBase = () => {
    const base = import.meta.env.VITE_AICHAT_API_BASE
    if (typeof base === 'string' && base.trim().length > 0) {
      return base.replace(/\/$/, '')
    }
    return 'http://localhost:3000'
  }

  const getExtensionToken = () => {
    const token = import.meta.env.VITE_AICHAT_EXTENSION_TOKEN
    return typeof token === 'string' ? token : ''
  }

  const getConversationId = async () => {
    const data = await browser.storage.local.get('aichatConversationId')
    const value = data.aichatConversationId
    return typeof value === 'string' ? value : ''
  }

  const setConversationId = async (conversationId: string) => {
    await browser.storage.local.set({ aichatConversationId: conversationId })
  }

  // Extension installation
  browser.runtime.onInstalled.addListener((details: any) => {
    console.log('Extension installed:', details.reason)

    if (details.reason === 'install') {
      // Initialize default settings
      browser.storage.local.set({
        settings: {
          enabled: true,
          autoStart: false,
          theme: 'dark'
        }
      })
    }
  })

  // Handle messages from content scripts and popup
  browser.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    console.log('Background received message:', message)

    switch (message.type) {
      case 'GET_TAB_INFO':
        browser.tabs.query({ active: true, currentWindow: true })
          .then((tabs: any) => {
            sendResponse({ tab: tabs[0] })
          })
        return true // Keep message channel open for async response

      case 'EXECUTE_SCRIPT':
        if (sender.tab?.id) {
          browser.scripting.executeScript({
            target: { tabId: sender.tab.id },
            files: [message.script]
          }).then(() => {
            sendResponse({ success: true })
          }).catch((error: any) => {
            sendResponse({ success: false, error: error.message })
          })
        } else {
          sendResponse({ success: false, error: 'No tab ID available' })
        }
        return true

      case 'OPEN_SIDE_PANEL':
        if (sender.tab?.id) {
          browser.sidePanel.open({ tabId: sender.tab.id })
            .then(() => sendResponse({ success: true }))
            .catch((error: any) => sendResponse({ success: false, error: error.message }))
        } else {
          sendResponse({ success: false, error: 'No tab ID available' })
        }
        return true

      case 'SEND_CHAT_MESSAGE':
        (async () => {
          try {
            const apiBase = getApiBase()
            const conversationId = await getConversationId()
            const token = getExtensionToken()

            const res = await fetch(`${apiBase}/api/extension/chat`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                ...(token.trim().length > 0 ? { 'x-extension-token': token } : {}),
              },
              body: JSON.stringify({
                message: message.message,
                conversationId: conversationId.trim().length > 0 ? conversationId : undefined,
              }),
            })

            if (!res.ok) {
              const text = await res.text().catch(() => '')
              throw new Error(text || `Request failed: ${res.status}`)
            }

            const data = await res.json() as any
            if (data?.conversationId && typeof data.conversationId === 'string') {
              await setConversationId(data.conversationId)
            }

            sendResponse({
              success: true,
              response: data?.message?.content ?? 'No response.',
              conversationId: data?.conversationId,
            })
          } catch (error: any) {
            sendResponse({ success: false, error: error?.message || 'Failed to send chat message' })
          }
        })()
        return true

      case 'TRANSLATE_TEXT':
        (async () => {
          try {
            const apiBase = getApiBase()
            const conversationId = await getConversationId()
            const token = getExtensionToken()

            const prompt = `Translate the following text to ${message.targetLanguage} and return only the translated text.\n\n${message.text}`

            const res = await fetch(`${apiBase}/api/extension/chat`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                ...(token.trim().length > 0 ? { 'x-extension-token': token } : {}),
              },
              body: JSON.stringify({
                message: prompt,
                conversationId: conversationId.trim().length > 0 ? conversationId : undefined,
              }),
            })

            if (!res.ok) {
              const text = await res.text().catch(() => '')
              throw new Error(text || `Request failed: ${res.status}`)
            }

            const data = await res.json() as any
            if (data?.conversationId && typeof data.conversationId === 'string') {
              await setConversationId(data.conversationId)
            }

            sendResponse({
              success: true,
              translatedText: data?.message?.content ?? '',
              conversationId: data?.conversationId,
            })
          } catch (error: any) {
            sendResponse({ success: false, error: error?.message || 'Failed to translate text' })
          }
        })()
        return true

      default:
        console.warn('Unknown message type:', message.type)
    }
  })

  // Context menu creation
  browser.contextMenus.create({
    id: 'wai-agent-action',
    title: 'Wai Agent Action',
    contexts: ['selection', 'page']
  })

  // Context menu click handler
  browser.contextMenus.onClicked.addListener((info: any, tab: any) => {
    if (info.menuItemId === 'wai-agent-action' && tab?.id) {
      browser.sidePanel.open({ tabId: tab.id })
    }
  })

  // Tab update listener
  browser.tabs.onUpdated.addListener((tabId: any, changeInfo: any, tab: any) => {
    if (changeInfo.status === 'complete' && tab.url) {
      console.log('Tab updated:', tab.url)
      // Send tab info to side panel if it's open
      browser.runtime.sendMessage({
        type: 'TAB_UPDATED',
        tab: { id: tabId, url: tab.url, title: tab.title }
      }).catch(() => {
        // Side panel might not be open, ignore error
      })
    }
  })
})
