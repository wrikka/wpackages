export function useSessionTitle() {
  const isEditingTitle = ref(false);
  const newTitle = ref('');
  const sessionsStore = useSessionsStore();

  function startEditingTitle() {
    if (sessionsStore.currentSession) {
      newTitle.value = sessionsStore.currentSession.title;
      isEditingTitle.value = true;
    }
  }

  async function saveNewTitle() {
    if (sessionsStore.currentSession && newTitle.value.trim()) {
      await sessionsStore.renameSession(sessionsStore.currentSession.id, newTitle.value.trim());
      isEditingTitle.value = false;
    }
  }

  return {
    isEditingTitle,
    newTitle,
    startEditingTitle,
    saveNewTitle,
  };
}
