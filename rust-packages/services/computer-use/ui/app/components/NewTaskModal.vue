<script setup>

import { defineProps, toRefs } from 'vue'

const props = defineProps({
  modelValue: Boolean
})
const { modelValue: isOpen } = toRefs(props)

const createTask = () => {
  console.log('Creating and delegating task...')
  isOpen.value = false
}

</script>

<template>

  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Create & Delegate New Task</h2>
      
</template>