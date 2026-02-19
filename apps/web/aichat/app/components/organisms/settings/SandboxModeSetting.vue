<script setup lang="ts">

import { useSettingsStore } from '~/stores/settingsStore';

const store = useSettingsStore();
const isSandboxEnabled = computed({
  get: () => store.settings.sandboxMode,
  set: (value) => store.updateSetting('sandboxMode', value),
});
// Reusable Toggle component from previous step
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

  <section class="bg-gray-800 p-6 rounded-lg">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold">Sandbox Mode</h2>
        <p class="text-sm text-gray-400 mt-1">Run untrusted workflows in a secure, isolated environment with limited permissions.</p>
      </div>
      <Toggle v-model="isSandboxEnabled" />
    </div>
  </section>

</template>