<script setup lang="ts">

import { ref } from 'vue'
import { useCitationGenerator } from '@/composables/useCitationGenerator'
import { Quote, Copy, Check, BookOpen, History } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'

const { styleOptions, currentCitation, citeCurrentPage, copyToClipboard, clearHistory, citationHistory } = useCitationGenerator()

const selectedStyle = ref<'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver'>('apa')
const copied = ref(false)
const activeTab = ref<'current' | 'history'>('current')

const handleCite = async () => {
  await citeCurrentPage(selectedStyle.value)
}

const handleCopy = async (text: string) => {
  const success = await copyToClipboard(text)
  if (success) {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

</script>

<template>

  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b">
      <div class="flex items-center gap-2 mb-3">
        <Quote class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Citation Generator</h3>
      </div>

      <!-- Style Selector -->
      <select
        v-model="selectedStyle"
        class="input w-full mb-2"
      >
        <option
          v-for="style in styleOptions"
          :key="style.value"
          :value="style.value"
        >
          {{ style.label }}
        </option>
      </select>

      <Button
        variant="default"
        class="w-full btn-primary"
        @click="handleCite"
      >
        <BookOpen class="h-4 w-4 mr-2" />
        Cite Current Page
      </Button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b">
      <button
        :class="[
          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'current'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        @click="activeTab = 'current'"
      >
        Current
      </button>
      <button
        :class="[
          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'history'
            ? 'text-primary border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        @click="activeTab = 'history'"
      >
        History ({{ citationHistory.length }})
      </button>
    </div>

    <!-- Current Citation -->
    <div v-if="activeTab === 'current'" class="flex-1 overflow-y-auto p-4">
      <div v-if="currentCitation" class="space-y-4">
        <!-- In-text Citation -->
        <div>
          <label class="text-xs font-medium text-muted-foreground uppercase">In-text Citation</label>
          <div class="mt-1 flex items-start gap-2">
            <code class="flex-1 p-3 rounded-lg bg-muted text-sm font-mono">
              {{ currentCitation.inText }}
            </code>
            <button
              class="p-2 rounded-md hover:bg-muted transition-colors"
              @click="handleCopy(currentCitation.inText)"
            >
              <Copy v-if="!copied" class="h-4 w-4" />
              <Check v-else class="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>

        <!-- Full Citation -->
        <div>
          <label class="text-xs font-medium text-muted-foreground uppercase">Full Citation</label>
          <div class="mt-1 flex items-start gap-2">
            <code class="flex-1 p-3 rounded-lg bg-muted text-sm font-mono">
              {{ currentCitation.full }}
            </code>
            <button
              class="p-2 rounded-md hover:bg-muted transition-colors"
              @click="handleCopy(currentCitation.full)"
            >
              <Copy v-if="!copied" class="h-4 w-4" />
              <Check v-else class="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>

        <!-- Bibliography -->
        <div>
          <label class="text-xs font-medium text-muted-foreground uppercase">Bibliography</label>
          <div class="mt-1 flex items-start gap-2">
            <code class="flex-1 p-3 rounded-lg bg-muted text-sm font-mono">
              {{ currentCitation.bibliography }}
            </code>
            <button
              class="p-2 rounded-md hover:bg-muted transition-colors"
              @click="handleCopy(currentCitation.bibliography)"
            >
              <Copy v-if="!copied" class="h-4 w-4" />
              <Check v-else class="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-muted-foreground">
        <BookOpen class="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Click "Cite Current Page" to generate a citation</p>
      </div>
    </div>

    <!-- History -->
    <div v-else class="flex-1 overflow-y-auto p-4">
      <div
        v-for="(citation, idx) in citationHistory.slice(0, 10)"
        :key="idx"
        class="p-3 rounded-lg bg-muted mb-2"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary uppercase">
            {{ citation.style }}
          </span>
        </div>
        <code class="text-sm font-mono block truncate">{{ citation.full }}</code>
      </div>

      <Button
        v-if="citationHistory.length > 0"
        variant="outline"
        class="w-full mt-2 btn-outline"
        @click="clearHistory"
      >
        <History class="h-4 w-4 mr-2" />
        Clear History
      </Button>
    </div>
  </div>

</template>