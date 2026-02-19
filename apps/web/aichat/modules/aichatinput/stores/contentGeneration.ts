import { defineStore } from 'pinia';

export const useContentGenerationStore = defineStore('contentGeneration', () => {
  const isModalOpen = ref(false);

  function openModal() {
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
  }

  return {
    isModalOpen,
    openModal,
    closeModal,
  };
});
