type MenuType = 'mention' | 'command';
type MenuItem = { id: string; label: string; insert: string };

export function useInputMenu(textareaRef: Ref<HTMLTextAreaElement | null>) {
  const isMenuOpen = ref(false);
  const menuType = ref<MenuType>('mention');
  const menuQuery = ref('');
  const message = ref('');

  const mentionItems = computed<MenuItem[]>(() => {
    const base: MenuItem[] = [
      { id: 'agent', label: 'Agent: Default', insert: '@agent:default ' },
      { id: 'kb', label: 'Knowledge Base', insert: '@kb ' },
      { id: 'file', label: 'File', insert: '@file ' },
    ];
    const q = menuQuery.value.trim().toLowerCase();
    if (!q) return base;
    return base.filter(i =>
      i.label.toLowerCase().includes(q) || i.insert.toLowerCase().includes(q)
    );
  });

  const commandItems = computed<MenuItem[]>(() => {
    const base: MenuItem[] = [
      { id: 'chat', label: '/chat', insert: '/chat ' },
      { id: 'research', label: '/research', insert: '/research ' },
      { id: 'code', label: '/code', insert: '/code ' },
      { id: 'agent', label: '/agent', insert: '/agent ' },
    ];
    const q = menuQuery.value.trim().toLowerCase();
    if (!q) return base;
    return base.filter(i =>
      i.label.toLowerCase().includes(q) || i.insert.toLowerCase().includes(q)
    );
  });

  const menuItems = computed(
    () => (menuType.value === 'mention' ? mentionItems.value : commandItems.value),
  );

  function computeTokenAtCursor(value: string, cursor: number) {
    const before = value.slice(0, cursor);
    const lastSpace = Math.max(
      before.lastIndexOf(' '),
      before.lastIndexOf('\n'),
      before.lastIndexOf('\t'),
    );
    const tokenStart = lastSpace === -1 ? 0 : lastSpace + 1;
    const token = before.slice(tokenStart);
    return { tokenStart, token };
  }

  function syncMenuFromCursor() {
    const el = textareaRef.value;
    if (!el) return;
    const cursor = el.selectionStart ?? message.value.length;
    const { token } = computeTokenAtCursor(message.value, cursor);
    if (token.startsWith('@')) {
      isMenuOpen.value = true;
      menuType.value = 'mention';
      menuQuery.value = token.slice(1);
      return;
    }
    if (token.startsWith('/')) {
      isMenuOpen.value = true;
      menuType.value = 'command';
      menuQuery.value = token.slice(1);
      return;
    }
    isMenuOpen.value = false;
    menuQuery.value = '';
  }

  function insertMenuItem(item: MenuItem) {
    const el = textareaRef.value;
    if (!el) return;
    const cursor = el.selectionStart ?? message.value.length;
    const { tokenStart, token } = computeTokenAtCursor(message.value, cursor);
    const replacement = item.insert;
    message.value = message.value.slice(0, tokenStart) + replacement
      + message.value.slice(tokenStart + token.length);
    nextTick(() => {
      const nextCursor = tokenStart + replacement.length;
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
      syncMenuFromCursor();
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isMenuOpen.value) {
      if (e.key === 'Escape') {
        e.preventDefault();
        isMenuOpen.value = false;
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const first = menuItems.value[0];
        if (first) {
          insertMenuItem(first);
        }
        return;
      }
    }
  }

  function handleInput() {
    syncMenuFromCursor();
  }

  function handleClick() {
    syncMenuFromCursor();
  }

  function setMessage(next: string) {
    message.value = next;
    nextTick(() => {
      textareaRef.value?.focus();
      syncMenuFromCursor();
    });
  }

  return {
    message,
    isMenuOpen,
    menuType,
    menuQuery,
    menuItems,
    setMessage,
    handleKeydown,
    handleInput,
    handleClick,
    insertMenuItem,
  };
}
