<script setup lang="ts">

import { computed } from 'vue';
import { useVoiceCommandStore } from '~/stores/voiceCommandStore';
import { IconMicrophone, IconPlayerStop, IconLoader } from '@tabler/icons-vue';

const store = useVoiceCommandStore();
const buttonClass = computed(() => {
  switch (store.status) {
    case 'listening': return 'text-red-500';
    case 'processing': return 'text-blue-500 animate-pulse';
    default: return 'text-gray-400';
  }
});
const handleClick = () => {
  if (store.status === 'idle') {
    store.startListening();
  } else {
    store.stopListening();
  }
};

</script>

<template>

  <button @click="handleClick" class="p-2 hover:bg-gray-700 rounded-full">
    <Icon name="lucide:loader-2" v-if="store.status === 'processing'" class="h-5 w-5 animate-spin" :class="buttonClass" />
    <Icon name="lucide:player-stop" v-else-if="store.status === 'listening'" class="h-5 w-5" :class="buttonClass" />
    <Icon name="lucide:mic" v-else class="h-5 w-5" :class="buttonClass" />
  </button>

</template>