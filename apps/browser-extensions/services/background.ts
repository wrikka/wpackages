/**
 * Background script services
 */

export interface BackgroundMessage {
  type: string
  [key: string]: any
}

export interface BackgroundResponse {
  success?: boolean
  data?: any
  error?: string
}

export class BackgroundService {
  private static instance: BackgroundService

  static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService()
    }
    return BackgroundService.instance
  }

  async sendMessage<T = any>(message: BackgroundMessage): Promise<T | null> {
    try {
      const response = await browser.runtime.sendMessage(message)
      return response
    } catch (error) {
      console.error('Failed to send message to background:', error)
      return null
    }
  }

  async getTabInfo() {
    return this.sendMessage({
      type: 'GET_TAB_INFO'
    })
  }

  async executeScript(script: string) {
    return this.sendMessage({
      type: 'EXECUTE_SCRIPT',
      script
    })
  }

  async openSidePanel() {
    return this.sendMessage({
      type: 'OPEN_SIDE_PANEL'
    })
  }

  async sendChatMessage(message: string) {
    return this.sendMessage({
      type: 'SEND_CHAT_MESSAGE',
      message
    })
  }

  async translateText(text: string, targetLanguage: string) {
    return this.sendMessage({
      type: 'TRANSLATE_TEXT',
      text,
      targetLanguage
    })
  }
}

export const backgroundService = BackgroundService.getInstance()
