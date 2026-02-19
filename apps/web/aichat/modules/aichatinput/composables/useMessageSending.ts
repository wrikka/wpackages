export function useMessageSending() {
  const messageFlow = useMessageFlow();

  return {
    sendMessage: messageFlow.sendMessage,
    regenerateResponse: messageFlow.regenerateResponse,
    editAndResend: messageFlow.editAndResend,
    forkAndSendMessage: messageFlow.forkAndSendMessage,
    stopGenerating: messageFlow.stopGenerating,
  };
}
