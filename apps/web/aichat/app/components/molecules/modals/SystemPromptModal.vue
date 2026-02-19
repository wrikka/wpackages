<script setup lang="ts">


const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'save'])
const sessionsStore = useSessionsStore()
const prompt = ref(sessionsStore.currentSession?.systemPrompt || '')
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
function save() {
  emit('save', prompt.value)
  isOpen.value = false
}
watch(() => sessionsStore.currentSession, (newSession) => {
  prompt.value = newSession?.systemPrompt || ''
})

</script>

<template>

  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h2 class="text-lg font-bold">Edit System Prompt</h2>
      
</template>