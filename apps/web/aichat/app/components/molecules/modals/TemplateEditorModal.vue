<script setup lang="ts">

import type { SavedPrompt } from '#shared/types/chat';
import { useTemplatesStore } from '~/stores/templates';

const props = defineProps<{ 
  modelValue: boolean;
  template?: SavedPrompt | null;
}>();
const emit = defineEmits(['update:modelValue', 'saved']);
const templatesStore = useTemplatesStore();
const name = ref('');
const promptText = ref('');
const scope = ref('personal');
watch(() => props.template, (tmpl) => {
  if (tmpl) {
    name.value = tmpl.name;
    promptText.value = tmpl.promptText;
    scope.value = tmpl.scope;
  } else {
    name.value = '';
    promptText.value = '';
    scope.value = 'personal';
  }
});
const onSave = async () => {
  const data = {
    name: name.value,
    promptText: promptText.value,
    scope: scope.value as 'personal' | 'group',
  };
  if (props.template) {
    await templatesStore.updateTemplate(props.template.id, data);
  } else {
    await templatesStore.createTemplate(data);
  }
  emit('saved');
  emit('update:modelValue', false);
};

</script>

<template>

  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">{{ template ? 'Edit' : 'New' }} Template</h3>
      
</template>