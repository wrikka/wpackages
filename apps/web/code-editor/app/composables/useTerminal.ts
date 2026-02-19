import { ref, onMounted, onUnmounted } from 'vue'
import type { TerminalConfig, TerminalData, SocketMessage } from '@shared/types'

export const useTerminal = (config?: Partial<TerminalConfig>) => {
  const terminalRef = ref<HTMLElement | null>(null)
  const terminal = ref<any>(null)
  const socket = ref<any>(null)
  const connected = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const terminalConfig: TerminalConfig = {
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Consolas, Monaco, monospace',
    theme: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      cursor: '#ffffff',
    },
    ...config
  }

  const connect = () => {
    if (!socket.value) {
      socket.value = io()

      socket.value.on('connect', () => {
        connected.value = true
        error.value = null
      })

      socket.value.on('disconnect', () => {
        connected.value = false
      })

      socket.value.on('terminal:data', (data: string) => {
        if (terminal.value) {
          terminal.value.write(data)
        }
      })

      socket.value.on('terminal:error', (err: string) => {
        error.value = err
      })
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  const sendCommand = (command: string) => {
    if (socket.value && connected.value) {
      socket.value.emit('terminal:write', command)
    }
  }

  const resize = () => {
    if (terminal.value && terminalRef.value) {
      // Trigger terminal resize
      terminal.value.fit()
    }
  }

  const clear = () => {
    if (terminal.value) {
      terminal.value.clear()
    }
  }

  onMounted(() => {
    // Initialize terminal when component mounts
    connect()
  })

  onUnmounted(() => {
    // Cleanup when component unmounts
    disconnect()
  })

  return {
    terminalRef,
    terminal,
    socket,
    connected,
    loading,
    error,
    terminalConfig,
    connect,
    disconnect,
    sendCommand,
    resize,
    clear
  }
}
