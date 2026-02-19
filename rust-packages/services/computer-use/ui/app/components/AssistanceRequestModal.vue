<script setup>

import { defineProps, toRefs } from 'vue'

const props = defineProps({
  modelValue: Boolean
})
const { modelValue: isOpen } = toRefs(props)

const provideHelp = () => {
  console.log('Providing help to the agent...')
  isOpen.value = false
}

</script>

<template>

  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Assistance Required</h2>
      
</template>