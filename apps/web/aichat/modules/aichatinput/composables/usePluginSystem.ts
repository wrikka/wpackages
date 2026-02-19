import { computed, ref, shallowRef } from 'vue'
import { usePluginsStore } from '~/stores/plugins'

export function usePluginSystem() {
  const pluginsStore = usePluginsStore()

  const beforeSendHostByPluginId = shallowRef(new Map<string, any>())

  const chatInputToolbarPlugins = computed(() => {
    return pluginsStore.plugins.filter((p) => {
      const permissions = Array.isArray(p.manifest?.permissions) ? p.manifest.permissions : []
      return p.enabled && permissions.includes('ui:chatInput.toolbar')
    })
  })

  const beforeSendPlugins = computed(() => {
    return pluginsStore.plugins.filter((p) => {
      const extensionPoints = Array.isArray(p.manifest?.extensionPoints) ? p.manifest.extensionPoints : []
      const permissions = Array.isArray(p.manifest?.permissions) ? p.manifest.permissions : []
      return p.enabled && extensionPoints.includes('chat:beforeSend') && permissions.includes('chat:write_draft')
    })
  })

  const setBeforeSendHostRef = (pluginId: string, el: any) => {
    const map = new Map(beforeSendHostByPluginId.value)
    if (el) {
      map.set(pluginId, el)
    } else {
      map.delete(pluginId)
    }
    beforeSendHostByPluginId.value = map
  }

  const getAllowedPluginMethods = (plugin: any): Array<'setDraft' | 'toast'> => {
    const permissions = Array.isArray(plugin?.manifest?.permissions) ? plugin.manifest.permissions : []
    const allowed: Array<'setDraft' | 'toast'> = []

    // Allow toast if plugin has any UI permission in v1
    if (permissions.some(p => p.startsWith('ui:'))) {
      allowed.push('toast')
    }

    // Allow setDraft if plugin has write_draft permission
    if (permissions.includes('chat:write_draft')) {
      allowed.push('setDraft')
    }

    return allowed
  }

  return {
    chatInputToolbarPlugins,
    beforeSendPlugins,
    beforeSendHostByPluginId,
    setBeforeSendHostRef,
    getAllowedPluginMethods,
  }
}
