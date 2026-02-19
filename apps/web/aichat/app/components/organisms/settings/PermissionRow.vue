<script setup lang="ts">

import { usePermissionsStore } from '~/stores/permissionsStore';
import type { Permission } from '~/shared/types/permissions';

const props = defineProps<{ permission: Permission }>();
const store = usePermissionsStore();
const isEnabled = computed({
  get: () => props.permission.enabled,
  set: (value) => {
    store.updatePermission(props.permission.id, value);
  },
});
// Basic toggle component
const Toggle = defineComponent({
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onToggle = () => emit('update:modelValue', !props.modelValue);
    return () => h('div', {
      class: ['w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors',
        props.modelValue ? 'bg-blue-600' : 'bg-gray-600'
      ],
      onClick: onToggle,
    }, h('div', {
      class: ['w-6 h-6 bg-white rounded-full shadow-md transform transition-transform',
        props.modelValue ? 'translate-x-6' : ''
      ]
    }));
  }
});

</script>

<template>

  <div class="flex justify-between items-center p-3 bg-gray-700 rounded-md">
    <div>
      <h3 class="font-semibold">{{ permission.name }}</h3>
      <p class="text-sm text-gray-400">{{ permission.description }}</p>
    </div>
    <Toggle v-model="isEnabled" />
  </div>

</template>