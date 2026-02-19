import { defineStore } from 'pinia';

export interface ConversationBranch {
  id: string;
  parentConversationId: string;
  branchConversationId: string;
  branchPointMessageId: string | null;
  branchName: string;
  createdAt: Date;
  parentConversation?: {
    id: string;
    title: string;
  };
  branchConversation?: {
    id: string;
    title: string;
  };
  branchPointMessage?: {
    id: string;
    content: string;
  };
}

export const useConversationBranchesStore = defineStore('conversationBranches', () => {
  const branches = ref<ConversationBranch[]>([]);
  const loading = ref(false);

  const fetchBranches = async (conversationId: string) => {
    loading.value = true;
    try {
      const data = await $fetch<ConversationBranch[]>('/api/conversations/branches', {
        query: { conversationId },
      });
      branches.value = data;
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      loading.value = false;
    }
  };

  const createBranch = async (branch: {
    parentConversationId: string;
    branchName: string;
    branchPointMessageId?: string;
  }) => {
    try {
      const result = await $fetch<{ branch: ConversationBranch; conversation: any }>(
        '/api/conversations/branches',
        {
          method: 'POST',
          body: branch,
        },
      );
      branches.value.push(result.branch);
      return result;
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  };

  const deleteBranch = async (branchId: string) => {
    try {
      await $fetch('/api/conversations/branches', {
        method: 'DELETE',
        query: { branchId },
      });
      branches.value = branches.value.filter(b => b.id !== branchId);
    } catch (error) {
      console.error('Failed to delete branch:', error);
    }
  };

  return {
    branches,
    loading,
    fetchBranches,
    createBranch,
    deleteBranch,
  };
});
