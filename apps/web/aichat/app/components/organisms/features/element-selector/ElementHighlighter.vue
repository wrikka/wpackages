<script setup lang="ts">

import { computed } from 'vue';
import type { ScreenElement } from '~/shared/types/agent';

const props = defineProps<{ element: ScreenElement }>();
const emit = defineEmits(['select']);
const style = computed(() => ({
  position: 'absolute',
  left: `${props.element.bounds.x}px`,
  top: `${props.element.bounds.y}px`,
  width: `${props.element.bounds.width}px`,
  height: `${props.element.bounds.height}px`,
  border: '2px solid rgba(59, 130, 246, 0.8)',
  backgroundColor: 'rgba(59, 130, 246, 0.2)',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
}));
const handleClick = () => {
  emit('select');
};

</script>

<template>

  <div :style="style" @click.stop.prevent="handleClick"></div>

</template>