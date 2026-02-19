<script setup lang="ts">

import { useMessageCommentsStore } from '~/stores/messageComments';
import MessageComment from './MessageComment.vue';

const props = defineProps<{ 
  messageId: string;
}>();
const commentsStore = useMessageCommentsStore();
const newCommentContent = ref('');
const onAddComment = async () => {
  if (!newCommentContent.value.trim()) return;
  await commentsStore.addComment(props.messageId, newCommentContent.value.trim());
  newCommentContent.value = '';
};
// Fetch comments when the component is mounted
onMounted(() => {
  commentsStore.fetchComments(props.messageId);
});

</script>

<template>

  <div class="mt-2 p-2 border-t border-gray-300/50 space-y-2">
    <h4 class="text-xs font-bold">Comments</h4>
    <div v-if="commentsStore.isLoading" class="text-sm text-gray-500">Loading comments...</div>
    <div v-else-if="commentsStore.comments[messageId] && commentsStore.comments[messageId].length > 0" class="space-y-2">
      <MessageComment 
        v-for="comment in commentsStore.comments[messageId]" 
        :key="comment.id" 
        :comment="comment" 
        :message-id="messageId"
      />
    </div>
    <div v-else class="text-sm text-gray-500">No comments yet.</div>

    <!-- Add comment form -->
    <div class="flex gap-2 pt-2">
      <UTextarea v-model="newCommentContent" placeholder="Add a comment..." autoresize class="flex-1" />
      <UButton @click="onAddComment">Comment</UButton>
    </div>
  </div>

</template>