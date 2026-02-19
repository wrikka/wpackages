import { onMounted, onUnmounted } from 'vue';
import { useCommandBarStore } from '~/stores/commandBarStore';

export function useCommandBar() {
  const store = useCommandBarStore();

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      store.toggle();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    isVisible: store.isVisible,
    show: store.show,
    hide: store.hide,
    toggle: store.toggle,
  };
}
