import { defineNuxtModule, addVitePlugin } from '@nuxt/kit'
import wdev from 'wdev'
import type { ModuleDefinition } from '@nuxt/schema'

export default defineNuxtModule({
  meta: {
    name: 'wdev-nuxt',
    configKey: 'wdev'
  },
  setup (options, nuxt) {
    // @ts-expect-error: `wdev` is a CJS module for now
    addVitePlugin(wdev(options))
  }
}) as ModuleDefinition
