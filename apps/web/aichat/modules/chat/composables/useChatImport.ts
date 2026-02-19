export function useChatImport() {
  const sessionsStore = useSessionsStore();
  const toast = useToast();

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const data = JSON.parse(content);
        await $fetch('/api/sessions/import', {
          method: 'POST',
          body: data,
        });
        toast.add({ title: 'Import successful' });
        await sessionsStore.fetchSessions();
      } catch {
        toast.add({ title: 'Import failed', description: 'Invalid file format.', color: 'error' });
      }
    };
    input.click();
  }

  return {
    handleImport,
  };
}
