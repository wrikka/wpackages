<script setup lang="ts">

import { watch } from 'vue'
import { useReadingTime } from '@/composables/useReadingTime'
import { Clock, BookOpen, Gauge, Calculator } from 'lucide-vue-next'

const { readingTime, calculateFromPage, formatTime } = useReadingTime()

const difficultyColors = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
}

const difficultyLabels = {
  easy: 'Easy Read',
  medium: 'Medium',
  hard: 'Advanced',
}

// Auto-calculate on mount
calculateFromPage()

</script>

<template>

  <div class="p-4 space-y-4">
    <div class="flex items-center gap-2">
      <Clock class="h-5 w-5 text-primary" />
      <h3 class="font-semibold">Reading Time</h3>
      <button
        class="ml-auto p-1.5 rounded-md hover:bg-muted transition-colors"
        @click="calculateFromPage"
      >
        <Calculator class="h-4 w-4 text-muted-foreground" />
      </button>
    </div>

    <!-- Main Stats -->
    <div class="grid grid-cols-2 gap-3">
      <div class="p-4 rounded-xl bg-primary/10 text-center">
        <div class="text-3xl font-bold text-primary">{{ readingTime.minutes }}</div>
        <div class="text-sm text-muted-foreground">min read</div>
      </div>
      <div class="p-4 rounded-xl bg-muted text-center">
        <div class="text-3xl font-bold">{{ readingTime.words.toLocaleString() }}</div>
        <div class="text-sm text-muted-foreground">words</div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="space-y-2">
      <div class="flex items-center justify-between p-2 rounded-lg bg-muted">
        <div class="flex items-center gap-2">
          <BookOpen class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm">Characters</span>
        </div>
        <span class="font-medium">{{ readingTime.characters.toLocaleString() }}</span>
      </div>

      <div class="flex items-center justify-between p-2 rounded-lg bg-muted">
        <div class="flex items-center gap-2">
          <Gauge class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm">Reading Speed</span>
        </div>
        <span class="font-medium">{{ formatTime(readingTime.estimatedSeconds) }}</span>
      </div>
    </div>

    <!-- Difficulty Badge -->
    <div
      class="flex items-center gap-2 p-3 rounded-lg"
      :class="difficultyColors[readingTime.difficulty]"
    >
      <span class="text-sm font-medium">{{ difficultyLabels[readingTime.difficulty] }}</span>
      <span class="text-xs opacity-75">
        {{ readingTime.difficulty === 'easy' ? '~200 WPM' : readingTime.difficulty === 'medium' ? '~180 WPM' : '~150 WPM' }}
      </span>
    </div>

    <p class="text-xs text-muted-foreground">
      Based on average reading speed. Actual time may vary depending on content complexity.
    </p>
  </div>

</template>