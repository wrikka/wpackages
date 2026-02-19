<script setup lang="ts">


interface Branch {
  id: string
  branchConversationId: string
  branchName: string
  createdAt: Date | string
}
defineProps<{
  branches: Branch[]
}>()
const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
  }).format(new Date(date))
}

</script>

<template>

  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h4 class="text-sm font-medium mb-2">Existing Branches</h4>
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <NuxtLink
        v-for="branch in branches"
        :key="branch.id"
        :to="`/chat/${branch.branchConversationId}`"
        class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-center gap-2">
          <Icon name="lucide:git-branch" class="w-4 h-4 text-blue-500" />
          <div>
            <p class="text-sm font-medium">{{ branch.branchName }}</p>
            <p class="text-xs text-gray-500">
              Created {{ formatDate(branch.createdAt) }}
            </p>
          </div>
        </div>
        <Icon name="lucide:arrow-right" class="w-4 h-4 text-gray-400" />
      </NuxtLink>
    </div>
  </div>

</template>