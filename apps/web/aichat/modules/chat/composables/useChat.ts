export function useChat() {
  const messageSending = useMessageSending();

  return {
    sendMessage: messageSending.sendMessage,
    regenerateResponse: messageSending.regenerateResponse,
    editAndResend: messageSending.editAndResend,
    forkAndSendMessage: messageSending.forkAndSendMessage,
    stopGenerating: messageSending.stopGenerating,
  };
}
