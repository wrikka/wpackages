<script setup lang="ts">

import type { AutoArchiveRule, ArchiveCondition } from '~/shared/types/autoArchive'

const props = defineProps<{
  rules: AutoArchiveRule[]
  preview: { matchedSessions: Array<{ id: string; title: string; reason: string }>; totalCount: number } | null
}>()
const emit = defineEmits<{
  createRule: [rule: Omit<AutoArchiveRule, 'id'>]
  updateRule: [ruleId: string, updates: Partial<AutoArchiveRule>]
  deleteRule: [ruleId: string]
  toggleRule: [ruleId: string, enabled: boolean]
  previewRule: [rule: AutoArchiveRule]
  runRule: [ruleId: string]
}>()
const isCreating = ref(false)
const editingRule = ref<AutoArchiveRule | null>(null)
const newRule = ref<Partial<AutoArchiveRule>>({
  name: '',
  enabled: true,
  conditions: [],
  action: 'archive',
  schedule: 'daily',
})
const conditionTypes = [
  { value: 'age', label: 'Age (days)', operators: ['gt', 'gte', 'lt', 'lte'] },
  { value: 'inactivity', label: 'Inactivity (days)', operators: ['gt', 'gte'] },
  { value: 'messageCount', label: 'Message Count', operators: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] },
  { value: 'tokenCount', label: 'Token Count', operators: ['gt', 'gte', 'lt', 'lte'] },
  { value: 'folder', label: 'Folder', operators: ['eq', 'neq', 'contains'] },
  { value: 'tag', label: 'Tag', operators: ['eq', 'neq', 'contains'] },
]
const actions = [
  { value: 'archive', label: 'Archive', icon: 'i-carbon-archive' },
  { value: 'delete', label: 'Delete', icon: 'i-carbon-trash-can' },
  { value: 'notify', label: 'Notify Only', icon: 'i-carbon-notification' },
]
function addCondition() {
  newRule.value.conditions?.push({
    type: 'age',
    operator: 'gt',
    value: 30,
  })
}
function removeCondition(index: number) {
  newRule.value.conditions?.splice(index, 1)
}
function saveRule() {
  if (!newRule.value.name || !newRule.value.conditions?.length) return
  emit('createRule', newRule.value as Omit<AutoArchiveRule, 'id'>)
  isCreating.value = false
  newRule.value = { name: '', enabled: true, conditions: [], action: 'archive', schedule: 'daily' }
}

</script>

<template>

  <div class="auto-archive-settings p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold">Auto-Archive Rules</h3>
        <p class="text-sm text-gray-500">Automatically manage old conversations</p>
      </div>
      <button class="btn-primary" @click="isCreating = true">
        <span class="i-carbon-add"></span>
        New Rule
      </button>
    </div>
    
    <div v-if="rules.length === 0" class="text-center py-8 text-gray-500">
      <span class="i-carbon-archive text-3xl mb-2 block"></span>
      <p>No archive rules yet</p>
    </div>
    
    <div v-else class="rules-list space-y-3">
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="rule-card p-3 rounded-lg border border-gray-200 dark:border-gray-700"
        :class="{ 'opacity-50': !rule.enabled }"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="rule.enabled"
              @change="emit('toggleRule', rule.id, ($event.target as HTMLInputElement).checked)"
            >
            <span class="font-medium">{{ rule.name }}</span>
          </div>
          <div class="flex items-center gap-1">
            <button class="btn-icon text-xs" @click="emit('previewRule', rule)">
              <span class="i-carbon-view"></span>
            </button>
            <button class="btn-icon text-xs" @click="emit('runRule', rule.id)">
              <span class="i-carbon-play"></span>
            </button>
            <button class="btn-icon text-xs text-red-500" @click="emit('deleteRule', rule.id)">
              <span class="i-carbon-trash-can"></span>
            </button>
          </div>
        </div>
        
        <div class="flex items-center gap-2 text-sm mb-2">
          <span :class="actions.find(a => a.value === rule.action)?.icon"></span>
          <span class="capitalize">{{ rule.action }}</span>
          <span class="text-gray-400">|</span>
          <span class="text-gray-500">{{ rule.schedule }}</span>
          <span class="text-gray-400">|</span>
          <span class="badge text-xs">{{ rule.affectedCount }} affected</span>
        </div>
        
        <div class="conditions flex flex-wrap gap-1">
          <span
            v-for="(condition, i) in rule.conditions"
            :key="i"
            class="badge text-xs"
          >
            {{ conditionTypes.find(c => c.value === condition.type)?.label }}
            {{ condition.operator }}
            {{ condition.value }}
          </span>
        </div>
      </div>
    </div>
    
    <UModal v-model="isCreating" :ui="{ width: 'max-w-lg' }">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Create Archive Rule</h3>
        
</template>