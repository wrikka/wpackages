<script setup lang="ts">

import { useMoodTracker } from '@/composables/useMoodTracker'
import { Smile, TrendingUp, Calendar, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'

const {
  entries,
  moodOptions,
  addEntry,
  deleteEntry,
  getMoodStats,
  getWeeklyTrend,
} = useMoodTracker()

const selectedMood = ref<string | null>(null)
const note = ref('')

const handleAddEntry = async () => {
  if (!selectedMood.value) return
  await addEntry(selectedMood.value as 'happy' | 'neutral' | 'sad' | 'excited' | 'tired' | 'focused', note.value)
  selectedMood.value = null
  note.value = ''
}

const stats = computed(() => getMoodStats())
const weeklyTrend = computed(() => getWeeklyTrend())

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

</script>

<template>

  <div class="flex flex-col h-full">
    <!-- Mood Selector -->
    <div class="p-4 border-b">
      <div class="flex items-center gap-2 mb-3">
        <Smile class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">How are you feeling?</h3>
      </div>

      <div class="grid grid-cols-3 gap-2 mb-3">
        <button
          v-for="mood in moodOptions"
          :key="mood.value"
          :class="[
            'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
            selectedMood === mood.value
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          ]"
          :style="selectedMood === mood.value ? { borderColor: mood.color } : {}"
          @click="selectedMood = mood.value"
        >
          <span class="text-2xl">{{ mood.emoji }}</span>
          <span class="text-xs font-medium">{{ mood.label }}</span>
        </button>
      </div>

      <textarea
        v-model="note"
        placeholder="Add a note (optional)..."
        class="input w-full min-h-[60px] resize-none text-sm"
      />

      <Button
        variant="default"
        class="w-full mt-2 btn-primary"
        :disabled="!selectedMood"
        @click="handleAddEntry"
      >
        Log Mood
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-2 p-3 border-b">
      <div class="p-2 rounded-lg bg-muted">
        <div class="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <TrendingUp class="h-3 w-3" />
          Total Entries
        </div>
        <div class="text-xl font-bold">{{ entries.length }}</div>
      </div>
      <div class="p-2 rounded-lg bg-muted">
        <div class="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <Calendar class="h-3 w-3" />
          This Week
        </div>
        <div class="text-xl font-bold">
          {{ Object.values(weeklyTrend).reduce((a, b) => a + b, 0) }}
        </div>
      </div>
    </div>

    <!-- Recent Entries -->
    <div class="flex-1 overflow-y-auto p-2">
      <div
        v-for="entry in entries.slice(0, 20)"
        :key="entry.id"
        class="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <span class="text-xl">
          {{ moodOptions.find(m => m.value === entry.mood)?.emoji }}
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium capitalize">{{ entry.mood }}</span>
            <span class="text-xs text-muted-foreground">{{ formatDate(entry.timestamp) }}</span>
          </div>
          <p v-if="entry.note" class="text-xs text-muted-foreground mt-0.5">{{ entry.note }}</p>
          <p v-if="entry.title" class="text-xs text-primary truncate">{{ entry.title }}</p>
        </div>
        <button
          class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
          @click="deleteEntry(entry.id)"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>

</template>