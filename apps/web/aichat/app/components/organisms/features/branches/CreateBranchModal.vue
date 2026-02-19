<script setup lang="ts">


const props = defineProps<{
  conversationId: string
  messageId?: string
  modelValue: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  branchCreated: [result: any]
}>()
const branchStore = useConversationBranchesStore()
const router = useRouter()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})
const branchName = ref('')
const branches = computed(() => branchStore.branches)
const createBranch = async () => {
  const result = await branchStore.createBranch({
    parentConversationId: props.conversationId,
    branchName: branchName.value,
    branchPointMessageId: props.messageId,
  })
  branchName.value = ''
  isOpen.value = false
  emit('branchCreated', result)
  router.push(`/chat/${result.conversation.id}`)
}
onMounted(() => {
  branchStore.fetchBranches(props.conversationId)
})

</script>

<template>

  <div class="conversation-branch-modal">
    <Modal v-model="isOpen" width="md">
      <Card>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">Create Branch</h3>
            <p class="text-sm text-gray-500">Fork this conversation at the selected message</p>
          </div>
        
</template>