<script setup lang="ts">


interface Model {
  id: string
  name: string
  provider: string
  modelId: string
  icon?: string
  isDefault?: boolean
}
interface CustomModel {
  id: string
  name: string
  provider: string
  modelId: string
  baseUrl?: string
  apiKey?: string
}
const selectedModel = ref<Model | null>(null)
const customModels = ref<CustomModel[]>([])
const showAddModel = ref(false)
const defaultModels: Model[] = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', modelId: 'gpt-4', icon: 'i-heroicons-sparkles' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', modelId: 'gpt-4-turbo-preview', icon: 'i-heroicons-bolt' },
  { id: 'gpt-3.5', name: 'GPT-3.5', provider: 'OpenAI', modelId: 'gpt-3.5-turbo', icon: 'i-heroicons-cpu-chip' },
]
const newModel = ref<Partial<CustomModel>>({
  provider: 'openai',
})
const selectModel = (model: Model | CustomModel) => {
  selectedModel.value = model as Model
}
const addModel = async () => {
  const model = await $fetch<CustomModel>('/api/ai/models/custom', {
    method: 'POST',
    body: newModel.value,
  })
  customModels.value.push(model)
  showAddModel.value = false
  newModel.value = { provider: 'openai' }
}
onMounted(async () => {
  customModels.value = await $fetch<CustomModel[]>('/api/ai/models/custom')
})

</script>

<template>

  <div class="model-selector">
    <UPopover>
      <UButton size="sm" color="gray" variant="soft" class="gap-2">
        <UIcon name="i-heroicons-cpu-chip" />
        <span>{{ selectedModel?.name || 'GPT-4' }}</span>
        <UIcon name="i-heroicons-chevron-down" class="text-xs" />
      </UButton>
      
      <template #panel>
        <div class="p-2 w-64 space-y-2">
          <p class="text-xs text-gray-500 px-2">Select Model</p>
          
          <!-- Default Models -->
          <div class="space-y-1">
            <button
              v-for="model in defaultModels"
              :key="model.id"
              class="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="selectModel(model)"
            >
              <UIcon :name="model.icon || 'i-heroicons-cpu-chip'" class="text-primary" />
              <div class="flex-1 text-left">
                <p class="text-sm font-medium">{{ model.name }}</p>
                <p class="text-xs text-gray-500">{{ model.provider }}</p>
              </div>
              <UIcon
                v-if="selectedModel?.id === model.id"
                name="i-heroicons-check"
                class="text-primary text-xs"
              />
            </button>
          </div>
          
          <!-- Custom Models -->
          <div v-if="customModels.length" class="border-t pt-2">
            <p class="text-xs text-gray-500 px-2 mb-1">Custom Models</p>
            <div class="space-y-1">
              <button
                v-for="model in customModels"
                :key="model.id"
                class="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="selectModel(model)"
              >
                <UIcon name="i-heroicons-cog-6-tooth" class="text-gray-400" />
                <div class="flex-1 text-left">
                  <p class="text-sm">{{ model.name }}</p>
                  <p class="text-xs text-gray-500">{{ model.modelId }}</p>
                </div>
                <UIcon
                  v-if="selectedModel?.id === model.id"
                  name="i-heroicons-check"
                  class="text-primary text-xs"
                />
              </button>
            </div>
          </div>
          
          <div class="border-t pt-2">
            <UButton size="xs" color="gray" variant="soft" block @click="showAddModel = true">
              <UIcon name="i-heroicons-plus" class="mr-1" />
              Add Custom Model
            </UButton>
          </div>
        </div>
      
</template>