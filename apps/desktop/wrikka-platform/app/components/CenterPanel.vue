<script setup lang="ts">

type CenterView = "code" | "git";
type BranchSummary = { name: string; isHead: boolean };
type CommitSummary = {
  id: string;
  summary: string;
  author: string;
  time: number;
};
type GitStatusEntry = { path: string; status: string };
type DiffFile = { path: string; diff: string };

const props = defineProps<{
  centerView: CenterView;
  selectedFilePath: string;
  selectedFileText: string;
  status: GitStatusEntry[];
  branches: BranchSummary[];
  commits: CommitSummary[];
  diffs: DiffFile[];
}>();

const emit = defineEmits<{
  "set-view": [view: CenterView];
  "copy-to-prompt": [text: string];
}>();

const breadcrumb = computed(() => {
  if (!props.selectedFilePath) return [] as string[];
  return props.selectedFilePath
    .split(/[/\\]+/)
    .filter(Boolean)
    .slice(-8);
});

const editorLanguage = computed(() => {
  const p = props.selectedFilePath.toLowerCase();
  if (p.endsWith(".ts") || p.endsWith(".tsx")) return "typescript";
  if (p.endsWith(".js") || p.endsWith(".jsx")) return "javascript";
  if (p.endsWith(".rs")) return "rust";
  if (p.endsWith(".json")) return "json";
  if (p.endsWith(".toml")) return "toml";
  if (p.endsWith(".md")) return "markdown";
  if (p.endsWith(".yml") || p.endsWith(".yaml")) return "yaml";
  return "plaintext";
});

const outline = computed(() => {
  const text = props.selectedFileText;
  if (!text) return [] as string[];

  const out: string[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("fn ") || t.startsWith("pub fn ")) out.push(t);
    if (t.startsWith("struct ") || t.startsWith("pub struct ")) out.push(t);
    if (t.startsWith("enum ") || t.startsWith("pub enum ")) out.push(t);
    if (t.startsWith("class ") || t.startsWith("export class ")) out.push(t);
    if (t.startsWith("function ") || t.startsWith("export function "))
      out.push(t);
    if (t.startsWith("# ") || t.startsWith("## ")) out.push(t);
    if (out.length >= 60) break;
  }

  return out;
});

</script>

<template>

  <section class="col-span-6 flex min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-950">
    <div class="flex items-center justify-between gap-3 border-b border-slate-800 p-3">
      <div class="min-w-0">
        <div class="text-xs text-slate-400">Breadcrumb</div>
        <div class="mt-1 flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-200">
          <template v-if="selectedFilePath">
            <span v-for="(seg, idx) in breadcrumb" :key="idx" class="flex items-center gap-1">
              <span class="rounded-md bg-slate-900 px-2 py-1 ring-1 ring-slate-800">{{ seg }}</span>
              <span v-if="idx < breadcrumb.length - 1" class="text-slate-500">/</span>
            </span>
          
</template>