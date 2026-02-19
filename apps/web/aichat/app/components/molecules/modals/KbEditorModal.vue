<script setup lang="ts">

import type { KnowledgeBase } from '#shared/types/chat';
import { useKnowledgeBasesStore } from '~/stores/knowledgeBases';

const props = defineProps<{ 
  modelValue: boolean;
  kb?: KnowledgeBase | null;
}>();
const emit = defineEmits(['update:modelValue', 'saved']);
const kbStore = useKnowledgeBasesStore();
const name = ref('');
const description = ref('');
watch(() => props.kb, (kb) => {
  if (kb) {
    name.value = kb.name;
    description.value = kb.description || '';
  } else {
    name.value = '';
    description.value = '';
  }
});
const onSave = async () => {
  const data = {
    name: name.value,
    description: description.value,
  };
  if (props.kb) {
    await kbStore.updateKb(props.kb.id, data);
  } else {
    await kbStore.createKb(data);
  }
  emit('saved');
  emit('update:modelValue', false);
};

</script>

<template>

  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">{{ kb ? 'Edit' : 'New' }} Knowledge Base</h3>
      
</template>