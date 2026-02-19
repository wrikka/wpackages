export function useChatSharing() {
  const isShareModalOpen = ref(false);
  const shareLink = ref('');
  const sessionsStore = useSessionsStore();
  const { copy } = useClipboard();
  const toast = useToast();

  async function handleShare() {
    if (!sessionsStore.currentSession) return;
    try {
      const result = await $fetch<{ shareId: string }>(
        `/api/sessions/${sessionsStore.currentSession.id}/share`,
        {
          method: 'POST',
        },
      );
      const origin = useRequestURL().origin;
      shareLink.value = `${origin}/shared/${result.shareId}`;
      isShareModalOpen.value = true;
    } catch {
      toast.add({ title: 'Error', description: 'Could not create share link.', color: 'error' });
    }
  }

  function copyShareLink() {
    copy(shareLink.value);
    toast.add({ title: 'Link copied!' });
    isShareModalOpen.value = false;
  }

  return {
    isShareModalOpen,
    shareLink,
    handleShare,
    copyShareLink,
  };
}
