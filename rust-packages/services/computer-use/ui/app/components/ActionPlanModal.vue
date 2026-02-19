<script setup>

import { ref, defineProps, toRefs } from 'vue'

const props = defineProps({
  modelValue: Boolean
})
const { modelValue: isOpen } = toRefs(props)

const columns = [{ key: 'step', label: 'Step' }, { key: 'action', label: 'Action' }, { key: 'details', label: 'Details' }]
const actions = ref([
  { step: 1, action: 'click', details: 'Button with text \"Login\"' },
  { step: 2, action: 'type', details: 'Input with label \"Username\"' },
  { step: 3, action: 'type', details: 'Input with label \"Password\"' },
  { step: 4, action: 'click', details: 'Button with text \"Submit\"' },
])

const approvePlan = () => {
  console.log('Plan approved')
  isOpen.value = false
}

const rejectPlan = () => {
  console.log('Plan rejected')
  isOpen.value = false
}

</script>

<template>

  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Action Plan Approval</h2>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="isOpen = false" />
        </div>
      
</template>