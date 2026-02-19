<script setup lang="ts">

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

defineProps<{
  chat: ChatMessage[];
  selectedModel: (typeof models)[number];
  selectedWorkflow: string;
  prompt: string;
  suggestionsOpen: boolean;
  suggestions: Suggestion[];
}>();

defineEmits<{
  "send-prompt": [];
  "clear-prompt": [];
  "accept-suggestion": [];
  "apply-suggestion": [suggestion: Suggestion];
}>();

</script>

<template>

  <aside class="col-span-3 flex min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-950">
    <div class="border-b border-slate-800 p-3">
      <div class="text-xs text-slate-400">AI</div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-3">
      <div v-if="chat.length === 0" class="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-500">
        Mockup: interactive AI panel. Select a model/workflow, then type. Use @ to mention files and / to select workflows.
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="(m, idx) in chat"
          :key="idx"
          class="rounded-lg border border-slate-800 bg-slate-950 p-2"
        >
          <div class="mb-1 text-[11px] text-slate-500">{{ m.role }}</div>
          <div class="whitespace-pre-wrap text-xs text-slate-200">{{ m.content }}</div>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-800 p-3">
      <div class="mb-2 grid grid-cols-2 gap-2">
        <label class="block">
          <div class="mb-1 text-[11px] text-slate-500">Model</div>
          <select v-model="selectedModel" class="w-full rounded-md bg-slate-950 px-2 py-2 text-xs text-slate-200 ring-1 ring-slate-800">
            <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
          </select>
        </label>
        <label class="block">
          <div class="mb-1 text-[11px] text-slate-500">Workflow</div>
          <select v-model="selectedWorkflow" class="w-full rounded-md bg-slate-950 px-2 py-2 text-xs text-slate-200 ring-1 ring-slate-800">
            <option value="">(none)</option>
            <option v-for="w in workflows" :key="w" :value="w">{{ w }}</option>
          </select>
        </label>
      </div>

      <div class="relative">
        <textarea
          v-model="prompt"
          class="h-24 w-full resize-none rounded-lg bg-slate-950 p-3 text-sm text-slate-100 ring-1 ring-slate-800 focus:outline-none"
          placeholder="Type your prompt... (use @ to mention files, / for workflows)"
          @keydown.enter.exact.prevent="$emit('send-prompt')"
          @keydown.tab.prevent="$emit('accept-suggestion')"
        />

        <div
          v-if="suggestionsOpen"
          class="absolute bottom-[110px] right-0 z-20 w-full max-h-52 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-1 shadow"
        >
          <button
            v-for="s in suggestions"
            :key="s.key"
            class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-slate-200 hover:bg-slate-900"
            @click="$emit('apply-suggestion', s)"
          >
            <svg v-if="s.icon === 'file'" viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 4V2" />
              <path d="M15 16v-2" />
              <path d="M8 9h.01" />
              <path d="M12 9h.01" />
              <path d="M16 9h.01" />
              <path d="M8 13h.01" />
              <path d="M12 13h.01" />
              <path d="M16 13h.01" />
              <path d="M4 6h16" />
              <path d="M4 18h16" />
            </svg>
            <span class="min-w-0 flex-1 truncate">{{ s.label }}</span>
          </button>
        </div>
      </div>

      <div class="mt-2 flex items-center justify-end gap-2">
        <button
          class="rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-300 ring-1 ring-slate-800 hover:bg-slate-900"
          @click="$emit('clear-prompt')"
        >
          Clear
        </button>
        <button
          class="rounded-md bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-500"
          @click="$emit('send-prompt')"
        >
          Send
        </button>
      </div>
    </div>
  </aside>

</template>