export function useResearchSources() {
  const messagesStore = useMessagesStore();

  const latestAssistantContent = computed(() => {
    const last = [...messagesStore.messages].reverse().find(m =>
      m.role === 'assistant' && typeof m.content === 'string' && m.content.trim().length > 0
    );
    return (last?.content as string | undefined) ?? '';
  });

  const researchSources = computed(() => {
    const text = latestAssistantContent.value;
    const idx = text.toLowerCase().lastIndexOf('sources:');
    if (idx === -1) return [] as { title: string; url: string }[];
    const section = text.slice(idx);
    const lines = section.split('\n').map(l => l.trim());
    const links: { title: string; url: string }[] = [];
    for (const line of lines) {
      if (!line.startsWith('-')) continue;
      const m = line.match(/^-\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
      if (m && m[2]) {
        const url = String(m[2]);
        const title = String((m[1] ?? '').trim() || url);
        links.push({ title, url });
        continue;
      }
      const m2 = line.match(/^-\s*(.+?)\s+(https?:\/\/\S+)/);
      if (m2 && m2[2]) {
        const url = String(m2[2]);
        const title = String((m2[1] ?? '').trim() || url);
        links.push({ title, url });
      }
    }
    return links;
  });

  return {
    latestAssistantContent,
    researchSources,
  };
}
