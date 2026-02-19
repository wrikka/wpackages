<script setup lang="ts">

import { useSchedulerStore } from '~/stores/schedulerStore';
import type { Trigger } from '~/shared/types/triggers';

const props = defineProps<{ trigger: Trigger }>();
const store = useSchedulerStore();
const isEnabled = computed({
  get: () => props.trigger.enabled,
  set: (value) => store.updateTrigger(props.trigger.id, { enabled: value }),
});
// Reusable Toggle component
const Toggle = defineComponent({
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onToggle = () => emit('update:modelValue', !props.modelValue);
    return () => h('div', { class: ['w-14 h-8 flex items-center rounded-full p-1 cursor-pointer', props.modelValue ? 'bg-blue-600' : 'bg-gray-600'], onClick: onToggle }, h('div', { class: ['w-6 h-6 bg-white rounded-full shadow-md transform transition-transform', props.modelValue ? 'translate-x-6' : ''] }));
  }
});

</script>

<template>

  <div class="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
    <div>
      <p class="font-bold text-lg">{{ trigger.name }}</p>
      <p class="text-sm text-gray-400">Runs workflow: <span class="font-semibold text-blue-400">{{ trigger.workflowName }}</span></p>
      <p class="text-xs text-gray-500 mt-1">Trigger: {{ trigger.description }}</p>
    </div>
    <div class="flex items-center space-x-4">
      <Toggle v-model="isEnabled" />
      <button class="p-2 hover:bg-gray-700 rounded-md text-gray-400">Edit</button>
      <button @click="store.deleteTrigger(trigger.id)" class="p-2 hover:bg-red-900 rounded-md text-red-500">Delete</button>
    </div>
  </div>

</template>