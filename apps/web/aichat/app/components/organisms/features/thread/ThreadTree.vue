<script setup lang="ts">

import type { ThreadBranch } from '~/shared/types/thread'

const props = defineProps<{
  branches: ThreadBranch[]
  activeBranchId: string
  rootMessageId: string
}>()
const emit = defineEmits<{
  select: [branchId: string]
  fork: [messageId: string]
}>()
const treeContainer = ref<HTMLElement>()
function getBranchLevel(branch: ThreadBranch, level = 0): number {
  if (!branch.parentId || branch.parentId === props.rootMessageId) return level
  const parent = props.branches.find(b => b.id === branch.parentId)
  return parent ? getBranchLevel(parent, level + 1) : level
}
function getBranchChildren(parentId: string): ThreadBranch[] {
  return props.branches.filter(b => b.parentId === parentId)
}

</script>

<template>

  <div ref="treeContainer" class="thread-tree">
    <div class="flex flex-col gap-1">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="branch-node group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{
          'ring-1 ring-primary-500 bg-primary-50 dark:bg-primary-900/20': branch.id === activeBranchId,
        }"
        :style="{ marginLeft: `${getBranchLevel(branch) * 20}px` }"
        @click="emit('select', branch.id)"
      >
        <div
          class="w-2 h-2 rounded-full flex-shrink-0"
          :class="branch.role === 'user' ? 'bg-blue-500' : 'bg-green-500'"
        />
        <div class="flex-1 min-w-0">
          <p class="text-xs truncate">{{ branch.content.slice(0, 60) }}{{ branch.content.length > 60 ? '...' : '' }}</p>
        </div>
        <button
          v-if="branch.role === 'user'"
          class="btn-icon text-xs opacity-0 group-hover:opacity-100"
          @click.stop="emit('fork', branch.messageId)"
          title="Create branch"
        >
          <span class="i-carbon-branch"></span>
        </button>
      </div>
    </div>
  </div>

</template>