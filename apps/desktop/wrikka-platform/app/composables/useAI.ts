type ChatMessage = { role: "user" | "assistant"; content: string };
type Suggestion = {
  key: string;
  label: string;
  insert: string;
  icon: "file" | "workflow";
};

const models = [
  "gpt-4.1",
  "claude-3.5-sonnet",
  "deepseek-r1",
  "local-ollama",
] as const;
const workflows = [
  "/summarize",
  "/refactor",
  "/explain",
  "/generate-tests",
  "/fix-lint",
] as const;

export function useAI(repoFileTree: Ref<{ path: string; name: string; kind: "file" | "dir"; children?: any[] }[]>) {
  const selectedModel = ref<(typeof models)[number]>(models[0]);
  const selectedWorkflow = ref<string>("");
  const prompt = ref<string>("");
  const chat = ref<ChatMessage[]>([]);
  const suggestionsOpen = ref<boolean>(false);
  const suggestions = ref<Suggestion[]>([]);

  const buildSuggestions = (): void => {
    const text = prompt.value;
    const at = text.lastIndexOf("@");
    const slash = text.lastIndexOf("/");
    const lastTrigger = Math.max(at, slash);
    if (lastTrigger < 0) {
      suggestionsOpen.value = false;
      suggestions.value = [];
      return;
    }

    const trigger = text[lastTrigger];
    const token = text.slice(lastTrigger + 1).trimStart();
    if (trigger === "@") {
      const allFiles: string[] = [];
      const walk = (nodes: any[]): void => {
        for (const n of nodes) {
          if (n.kind === "file") allFiles.push(n.path);
          if (n.kind === "dir" && n.children) walk(n.children);
        }
      };
      walk(repoFileTree.value);

      const hits = allFiles
        .filter((p) => p.toLowerCase().includes(token.toLowerCase()))
        .slice(0, 30)
        .map(
          (p) =>
            ({
              key: `file:${p}`,
              label: p,
              insert: `@${p}`,
              icon: "file",
            }) satisfies Suggestion,
        );

      suggestions.value = hits;
      suggestionsOpen.value = hits.length > 0;
      return;
    }

    if (trigger === "/") {
      const hits = workflows
        .filter((w) => w.toLowerCase().includes(("/" + token).toLowerCase()))
        .slice(0, 20)
        .map(
          (w) =>
            ({
              key: `workflow:${w}`,
              label: w,
              insert: w,
              icon: "workflow",
            }) satisfies Suggestion,
        );

      suggestions.value = hits;
      suggestionsOpen.value = hits.length > 0;
      return;
    }

    suggestionsOpen.value = false;
    suggestions.value = [];
  };

  watch(prompt, () => buildSuggestions());

  const applySuggestion = (s: Suggestion): void => {
    const text = prompt.value;
    const at = text.lastIndexOf("@");
    const slash = text.lastIndexOf("/");
    const idx = Math.max(at, slash);
    if (idx < 0) return;

    prompt.value = text.slice(0, idx) + s.insert + " ";
    suggestionsOpen.value = false;
    suggestions.value = [];
  };

  const acceptFirstSuggestion = (): void => {
    if (!suggestionsOpen.value) return;
    const first = suggestions.value[0];
    if (!first) return;
    applySuggestion(first);
  };

  const copyToPrompt = (text: string): void => {
    prompt.value = (prompt.value.trim() + " " + text).trim() + " ";
  };

  const sendPrompt = (): void => {
    const p = prompt.value.trim();
    if (!p) return;

    const meta = `model=${selectedModel.value}${selectedWorkflow.value ? ` workflow=${selectedWorkflow.value}` : ""}`;
    chat.value.push({ role: "user", content: `${meta}\n${p}` });

    chat.value.push({
      role: "assistant",
      content:
        "(mock response) I received your prompt. Wire this to your AI backend next.",
    });

    prompt.value = "";
    suggestionsOpen.value = false;
    suggestions.value = [];
  };

  const clearPrompt = (): void => {
    prompt.value = "";
  };

  return {
    models,
    workflows,
    selectedModel,
    selectedWorkflow,
    prompt,
    chat,
    suggestionsOpen,
    suggestions,
    applySuggestion,
    acceptFirstSuggestion,
    copyToPrompt,
    sendPrompt,
    clearPrompt,
  };
}
