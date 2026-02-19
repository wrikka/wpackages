export function useCodeWorkspace() {
  const codeWorkspaceRef = ref<{ applyFile: (path: string, content: string) => void } | null>(null);

  function extractCodeBlocks(text: string) {
    const blocks: { lang: string; code: string }[] = [];
    const re = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      blocks.push({ lang: (m[1] || '').trim(), code: (m[2] || '').trimEnd() });
    }
    return blocks;
  }

  function guessFilePathFromLang(lang: string, index: number) {
    const l = lang.toLowerCase();
    if (l === 'html') return 'index.html';
    if (l === 'css') return 'styles.css';
    if (l === 'js' || l === 'javascript') return 'main.js';
    if (l === 'ts' || l === 'typescript') return 'main.ts';
    if (l === 'vue') return `components/Component${index + 1}.vue`;
    return `snippet-${index + 1}.txt`;
  }

  function applyFromToolResults(message: any) {
    const tr = message?.tool_results;
    if (!tr || typeof tr !== 'object') return false;
    const entries = Object.values(tr as Record<string, unknown>);
    let applied = false;
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const e = entry as any;
      const path = typeof e.path === 'string'
        ? e.path
        : (typeof e.filePath === 'string' ? e.filePath : null);
      const content = typeof e.content === 'string'
        ? e.content
        : (typeof e.text === 'string' ? e.text : null);
      if (!path || content === null) continue;
      codeWorkspaceRef.value?.applyFile(path, content);
      applied = true;
    }
    return applied;
  }

  function handleApplyToWorkspace(message: any) {
    if (!codeWorkspaceRef.value) return;

    if (applyFromToolResults(message)) return;

    const text = typeof message?.content === 'string' ? message.content : '';
    const blocks = extractCodeBlocks(text);
    if (blocks.length === 0) return;
    blocks.forEach((b, idx) => {
      const path = guessFilePathFromLang(b.lang, idx);
      codeWorkspaceRef.value?.applyFile(path, b.code);
    });
  }

  return {
    codeWorkspaceRef,
    handleApplyToWorkspace,
  };
}
