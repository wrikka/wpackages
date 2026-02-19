export function useMessageFeedback() {
  const toast = useToast();

  const sendFeedback = async (payload: { messageId: string; type: 'like' | 'dislike' }) => {
    try {
      await $fetch('/api/messages/feedback', {
        method: 'POST',
        body: payload,
      });
      toast.add({ title: 'Feedback received!', color: 'green' });
    } catch (error) {
      console.error('Failed to send feedback', error);
      toast.add({
        title: 'Error sending feedback',
        description: 'Please try again later.',
        color: 'red',
      });
    }
  };

  return {
    sendFeedback,
  };
}
