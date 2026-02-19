import { createClient } from '@liveblocks/client'
import { LiveblocksProvider } from '@liveblocks/yjs'
import * as Y from 'yjs'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from '~/composables/user/useUser'

export function useLiveblocksCollaboration(message: Ref<string>) {
  const ydoc = new Y.Doc()
  const ytext = ydoc.getText('codemirror')
  let liveblocksProvider: LiveblocksProvider<any, any> | null = null

  const client = createClient({
    authEndpoint: '/api/liveblocks/auth',
  })

  const route = useRoute()

  onMounted(() => {
    const roomName = `chat-${route.params.id}`
    const room = client.enter(roomName, { initialPresence: {} })
    liveblocksProvider = new LiveblocksProvider(room, ydoc)

    ytext.observe(() => {
      const newValue = ytext.toString()
      if (newValue !== message.value) {
        message.value = newValue
      }
    })

    // Initialize with current message
    if (message.value) {
      ytext.insert(0, message.value)
    }
  })

  watch(message, (newValue) => {
    if (newValue !== ytext.toString()) {
      ytext.delete(0, ytext.length)
      ytext.insert(0, newValue)
    }
  })

  const getExtensions = (baseExtensions: any[]) => {
    if (liveblocksProvider?.awareness) {
      // Add user awareness if needed
      const user = useUser()
      liveblocksProvider.awareness.setLocalStateField('user', {
        name: user.value?.name || 'Anonymous',
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })
    }
    return baseExtensions
  }

  return {
    ydoc,
    ytext,
    liveblocksProvider,
    getExtensions,
  }
}
