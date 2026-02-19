<script setup lang="ts">

import type { MessageComment } from '#shared/types/chat';
import { useMessageCommentsStore } from '~/stores/messageComments';

const props = defineProps<{ 
  comment: MessageComment;
  messageId: string;
}>();
const commentsStore = useMessageCommentsStore();
const user = useUser();
const isEditing = ref(false);
const editedContent = ref(props.comment.content);
const onSaveChanges = async () => {
  if (editedContent.value.trim() && editedContent.value.trim() !== props.comment.content) {
    await commentsStore.updateComment(props.messageId, props.comment.id, editedContent.value.trim());
  }
  isEditing.value = false;
};
const onDeleteComment = async () => {
  await commentsStore.deleteComment(props.messageId, props.comment.id);
};

</script>

<template>

  <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">
    <div class="text-xs font-bold mb-1">{{ comment.username }}</div>
    <div v-if="!isEditing">
      <p class="text-sm">{{ comment.content }}</p>
      <div v-if="comment.userId === user?.id" class="flex items-center gap-2 mt-1">
        <button class="text-xs text-blue-500 hover:underline" @click="isEditing = true">Edit</button>
        <button class="text-xs text-red-500 hover:underline" @click="onDeleteComment">Delete</button>
      </div>
    </div>
    <div v-else>
      <UTextarea v-model="editedContent" autoresize class="mb-2" />
      <div class="flex gap-2">
        <UButton size="xs" @click="onSaveChanges">Save</UButton>
        <UButton size="xs" color="gray" variant="ghost" @click="isEditing = false">Cancel</UButton>
      </div>
    </div>
  </div>

</template>