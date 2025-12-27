<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  path: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', path: string): void;
}>();

const segments = computed(() => {
  if (!props.path) return [];
  const parts = props.path.split(/[\\/]/).filter(Boolean);
  let currentPath = '';
  return parts.map((part, index) => {
    currentPath = `${currentPath}${currentPath ? '/' : ''}${part}`;
    return {
      name: part,
      path: currentPath,
      isLast: index === parts.length - 1,
    };
  });
});
</script>

<template>
  <nav class="flex items-center gap-2 text-sm font-mono">
    <button @click="emit('navigate', '')" class="hover:underline text-gray-300">
      .
    </button>
    <template v-for="segment in segments" :key="segment.path">
      <span class="text-gray-500">/</span>
      <button
        @click="!segment.isLast && emit('navigate', segment.path)"
        :class="{
          'hover:underline text-gray-300': !segment.isLast,
          'text-white font-semibold cursor-default': segment.isLast,
        }"
        :disabled="segment.isLast"
      >
        {{ segment.name }}
      </button>
    </template>
  </nav>
</template>
