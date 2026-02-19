<script setup lang="ts">

import { ref, watch } from 'vue'
import { useDictionary } from '@/composables/useDictionary'
import { Search, Volume2, Clock, Trash2, BookOpen } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'

const { isLoading, lastResult, recentLookups, lookup, lookupSelectedText, clearCache } = useDictionary()

const searchWord = ref('')
const showRecent = ref(false)

const handleSearch = async () => {
  if (!searchWord.value.trim()) return
  await lookup(searchWord.value)
  showRecent.value = false
}

const handleLookupSelected = async () => {
  await lookupSelectedText()
}

const playAudio = (url?: string) => {
  if (url) {
    const audio = new Audio(url)
    audio.play()
  }
}

watch(searchWord, (newVal) => {
  if (!newVal) showRecent.value = true
})

</script>

<template>

  <div class="flex flex-col h-full">
    <!-- Search -->
    <div class="p-4 border-b space-y-2">
      <div class="flex items-center gap-2">
        <BookOpen class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Dictionary</h3>
      </div>

      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          v-model="searchWord"
          type="text"
          placeholder="Type a word or select text..."
          class="input pl-9 pr-20 w-full"
          @keyup.enter="handleSearch"
        />
        <Button
          variant="outline"
          size="sm"
          class="absolute right-1 top-1/2 -translate-y-1/2"
          :disabled="isLoading"
          @click="handleSearch"
        >
          {{ isLoading ? '...' : 'Search' }}
        </Button>
      </div>

      <Button
        variant="outline"
        class="w-full btn-outline text-xs"
        @click="handleLookupSelected"
      >
        🔤 Lookup Selected Text
      </Button>
    </div>

    <!-- Result -->
    <div v-if="lastResult && !showRecent" class="flex-1 overflow-y-auto p-4">
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-bold">{{ lastResult.word }}</h2>
          <button
            v-if="lastResult.audio"
            class="p-1.5 rounded-full hover:bg-muted transition-colors"
            @click="playAudio(lastResult.audio)"
          >
            <Volume2 class="h-4 w-4" />
          </button>
        </div>
        <p v-if="lastResult.phonetic" class="text-muted-foreground font-mono">{{ lastResult.phonetic }}</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="(def, idx) in lastResult.definitions.slice(0, 5)"
          :key="idx"
          class="p-3 rounded-lg bg-muted"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium text-primary uppercase">{{ def.partOfSpeech }}</span>
          </div>
          <p class="text-sm mb-1">{{ def.definition }}</p>
          <p v-if="def.example" class="text-xs text-muted-foreground italic">"{{ def.example }}"</p>

          <div v-if="def.synonyms.length > 0" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="syn in def.synonyms.slice(0, 5)"
              :key="syn"
              class="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
            >
              {{ syn }}
            </span>
          </div>
        </div>
      </div>

      <p class="text-xs text-muted-foreground mt-4">
        Source: {{ lastResult.source }}
      </p>
    </div>

    <!-- Recent Lookups -->
    <div v-else class="flex-1 overflow-y-auto p-4">
      <div class="flex items-center gap-2 mb-3">
        <Clock class="h-4 w-4 text-muted-foreground" />
        <h4 class="text-sm font-medium">Recent Lookups</h4>
        <button
          v-if="recentLookups.length > 0"
          class="ml-auto text-xs text-destructive hover:underline"
          @click="clearCache"
        >
          Clear
        </button>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="word in recentLookups"
          :key="word"
          class="px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-muted/80 transition-colors"
          @click="searchWord = word; handleSearch()"
        >
          {{ word }}
        </button>
      </div>

      <p v-if="recentLookups.length === 0" class="text-sm text-muted-foreground text-center py-4">
        No recent lookups
      </p>
    </div>
  </div>

</template>