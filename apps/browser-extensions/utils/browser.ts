/**
 * Browser utility functions for the extension
 */

export async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  return tab
}

export async function sendMessageToTab<T = any>(message: any): Promise<T | null> {
  try {
    const tab = await getCurrentTab()
    if (tab?.id) {
      const response = await browser.tabs.sendMessage(tab.id, message)
      return response
    }
    return null
  } catch (error) {
    console.error('Failed to send message to tab:', error)
    return null
  }
}

export async function openSidePanel() {
  try {
    const window = await browser.windows.getCurrent()
    if (window.id) {
      await browser.sidePanel.open({ windowId: window.id })
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to open side panel:', error)
    return false
  }
}

export async function analyzeCurrentPage() {
  return sendMessageToTab({
    type: 'ANALYZE_PAGE'
  })
}

export async function highlightElements(selectors: string[]) {
  return sendMessageToTab({
    type: 'HIGHLIGHT_ELEMENTS',
    selectors
  })
}

export async function clearHighlights() {
  return sendMessageToTab({
    type: 'CLEAR_HIGHLIGHTS'
  })
}

export async function clickElement(selector: string) {
  return sendMessageToTab({
    type: 'CLICK_ELEMENT',
    selector
  })
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
