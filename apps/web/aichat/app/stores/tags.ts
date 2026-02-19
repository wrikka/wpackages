import { defineStore } from 'pinia';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface ConversationTag {
  id: string;
  conversationId: string;
  tagId: string;
  tag: Tag;
}

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([]);
  const conversationTags = ref<Record<string, Tag[]>>({});
  const loading = ref(false);

  const fetchTags = async () => {
    loading.value = true;
    try {
      const data = await $fetch<Tag[]>('/api/tags');
      tags.value = data;
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchConversationTags = async (conversationId: string) => {
    try {
      const data = await $fetch<Tag[]>('/api/tags', {
        query: { conversationId },
      });
      conversationTags.value[conversationId] = data;
    } catch (error) {
      console.error('Failed to fetch conversation tags:', error);
    }
  };

  const getConversationTags = (conversationId: string) => {
    return conversationTags.value[conversationId] || [];
  };

  const createTag = async (tag: { name: string; color: string }) => {
    try {
      const newTag = await $fetch<Tag>('/api/tags', {
        method: 'POST',
        body: tag,
      });
      tags.value.push(newTag);
      return newTag;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  const toggleTagOnConversation = async (conversationId: string, tagId: string) => {
    try {
      const currentTags = conversationTags.value[conversationId] || [];
      const isApplied = currentTags.some(t => t.id === tagId);

      if (isApplied) {
        await $fetch('/api/tags', {
          method: 'DELETE',
          query: { conversationId, tagId },
        });
        conversationTags.value[conversationId] = currentTags.filter(t => t.id !== tagId);
      } else {
        await $fetch('/api/tags', {
          method: 'POST',
          body: { conversationId, tagId },
        });
        const tag = tags.value.find(t => t.id === tagId);
        if (tag) {
          conversationTags.value[conversationId] = [...currentTags, tag];
        }
      }
    } catch (error) {
      console.error('Failed to toggle tag:', error);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      await $fetch('/api/tags', {
        method: 'DELETE',
        query: { tagId },
      });
      tags.value = tags.value.filter(t => t.id !== tagId);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  return {
    tags,
    loading,
    fetchTags,
    fetchConversationTags,
    getConversationTags,
    createTag,
    toggleTagOnConversation,
    deleteTag,
  };
});
