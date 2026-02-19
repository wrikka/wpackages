<script setup lang="ts">

import type { VoiceSettings, VoiceActivity } from '~/shared/types/voice'

const props = defineProps<{
  settings: VoiceSettings
  activity: VoiceActivity
}>()
const emit = defineEmits<{
  startListening: []
  stopListening: []
  toggleAutoPlay: [boolean]
  changeVoice: [voice: string]
}>()
const isExpanded = ref(false)
const volumeBars = computed(() => {
  const bars = []
  for (let i = 0; i < 5; i++) {
    const threshold = (i + 1) * 20
    bars.push(props.activity.volume >= threshold)
  }
  return bars
})

</script>

<template>

  <div class="voice-control relative">
    <button
      class="btn-icon relative"
      :class="{
        'text-red-500 animate-pulse': activity.isListening,
        'text-green-500': activity.isSpeaking,
      }"
      @click="activity.isListening ? emit('stopListening') : emit('startListening')"
    >
      <span :class="activity.isListening ? 'i-carbon-microphone-filled' : 'i-carbon-microphone'"></span>
      
      <div
        v-if="activity.isListening"
        class="absolute -top-1 -right-1 flex gap-0.5"
      >
        <div
          v-for="(active, i) in volumeBars"
          :key="i"
          class="w-0.5 h-2 rounded-full transition-all"
          :class="active ? 'bg-red-500' : 'bg-gray-300'"
        ></div>
      </div>
    </button>
    
    <div
      v-if="isExpanded"
      class="voice-settings absolute right-0 top-full mt-2 w-64 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <h4 class="font-medium mb-3">Voice Settings</h4>
      
      <div class="space-y-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="settings.autoPlayResponses"
            @change="emit('toggleAutoPlay', ($event.target as HTMLInputElement).checked)"
          >
          <span class="text-sm">Auto-play responses</span>
        </label>
        
        <div>
          <label class="text-sm text-gray-500 block mb-1">Output Voice</label>
          <select
            class="input w-full text-sm"
            :value="settings.outputVoice"
            @change="emit('changeVoice', ($event.target as HTMLSelectElement).value)"
          >
            <option value="alloy">Alloy</option>
            <option value="echo">Echo</option>
            <option value="fable">Fable</option>
            <option value="onyx">Onyx</option>
            <option value="nova">Nova</option>
            <option value="shimmer">Shimmer</option>
          </select>
        </div>
        
        <div>
          <label class="text-sm text-gray-500 block mb-1">Speed: {{ settings.outputSpeed }}x</label>
          <input
            v-model.number="settings.outputSpeed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            class="w-full"
          >
        </div>
      </div>
      
      <div v-if="activity.transcript" class="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
        <span class="text-gray-500">Heard:</span> {{ activity.transcript }}
      </div>
    </div>
  </div>

</template>