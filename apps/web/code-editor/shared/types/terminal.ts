export interface TerminalConfig {
  cursorBlink: boolean
  fontSize: number
  fontFamily: string
  theme: {
    background: string
    foreground: string
    cursor: string
  }
}

export interface TerminalData {
  type: 'data' | 'resize' | 'command'
  payload: any
}

export interface SocketMessage {
  event: string
  data: any
}
