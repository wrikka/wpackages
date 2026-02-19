import type { ChatSession } from '#shared/types/session';

export const useSessionPinning = () => {
  const sessionsStore = useSessionsStore();
  const toast = useToast();

  const togglePin = async (session: ChatSession) => {
    const newPinnedState = !session.pinned;
    try {
      // Optimistic update
      sessionsStore.updateSession(session.id, { pinned: newPinnedState });

      await $fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        body: { pinned: newPinnedState },
      });

      toast.add({
        title: `Session ${newPinnedState ? 'pinned' : 'unpinned'}!`,
        color: 'green',
      });
    } catch (error) {
      // Revert on error
      sessionsStore.updateSession(session.id, { pinned: session.pinned });
      toast.add({
        color: 'red',
        title: 'Error',
        description: 'Failed to update pin status. Please try again.',
      });
    }
  };

  return {
    togglePin,
  };
};
