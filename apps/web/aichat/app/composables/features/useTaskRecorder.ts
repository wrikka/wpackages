import { onMounted, onUnmounted } from 'vue';
import { useTaskRecorderStore } from '~/stores/recorderStore';

export function useTaskRecorder() {
  const store = useTaskRecorderStore();

  // This is a simplified mock. A real implementation would need to listen to
  // OS-level events or use a browser extension to capture interactions accurately.
  const handleGlobalClick = (event: MouseEvent) => {
    if (store.status !== 'recording') return;

    // In a real app, we'd get the element's unique selector, not just tagName
    const target = event.target as HTMLElement;
    store.addAction({
      type: 'Click',
      details: `Clicked on a <${target.tagName.toLowerCase()}> element`,
      targetSelector: `css=${target.tagName.toLowerCase()}:nth-child(1)`, // Mock selector
    });
  };

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (store.status !== 'recording' || event.repeat) return;

    // Avoid capturing keys while typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      // Could add logic here to capture final text input instead of keystrokes
      return;
    }

    store.addAction({
      type: 'KeyPress',
      details: `Pressed key: ${event.key}`,
    });
  };

  onMounted(() => {
    document.body.addEventListener('click', handleGlobalClick, true); // Use capture phase
    window.addEventListener('keydown', handleGlobalKeyDown, true);
  });

  onUnmounted(() => {
    document.body.removeEventListener('click', handleGlobalClick, true);
    window.removeEventListener('keydown', handleGlobalKeyDown, true);
  });

  return {
    recorderStatus: store.status,
    recordedActions: store.recordedActions,
    startRecording: store.startRecording,
    stopRecording: store.stopRecording,
    pauseRecording: store.pauseRecording,
  };
}
