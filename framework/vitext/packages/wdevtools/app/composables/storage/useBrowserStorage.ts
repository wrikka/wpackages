import { ref, onMounted } from 'vue';

interface StorageItem {
  key: string;
  value: string | null;
}

export const useBrowserStorage = () => {
  const localStorageItems = ref<StorageItem[]>([]);
  const sessionStorageItems = ref<StorageItem[]>([]);

  const refresh = () => {
    if (typeof window === 'undefined') return;

    localStorageItems.value = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageItems.value.push({ key, value: localStorage.getItem(key) });
      }
    }

    sessionStorageItems.value = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionStorageItems.value.push({ key, value: sessionStorage.getItem(key) });
      }
    }
  };

  const setItem = (storage: 'local' | 'session', key: string, value: string) => {
    const storageApi = storage === 'local' ? localStorage : sessionStorage;
    storageApi.setItem(key, value);
    refresh();
  };

  const removeItem = (storage: 'local' | 'session', key: string) => {
    const storageApi = storage === 'local' ? localStorage : sessionStorage;
    storageApi.removeItem(key);
    refresh();
  };

  onMounted(refresh);

  return { localStorageItems, sessionStorageItems, refresh, setItem, removeItem };
};
