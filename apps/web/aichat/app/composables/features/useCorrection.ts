import { onMounted, onUnmounted } from 'vue';
import { useCorrectionStore } from '~/stores/correctionStore';

export function useCorrection() {
  const store = useCorrectionStore();

  const handleKeyDown = (event: KeyboardEvent) => {
    // Use a specific hotkey for correction, e.g., Ctrl+Shift+C
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'c') {
      event.preventDefault();
      if (!store.isActive) {
        // In a real scenario, we'd get the last action from the agent's state
        store.activate({
          id: 'action-123',
          type: 'Click',
          targetElementId: 'el1',
          params: {},
        });
      } else {
        store.deactivate();
      }
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    isCorrectionActive: store.isActive,
    activateCorrection: store.activate,
    deactivateCorrection: store.deactivate,
  };
}
