<script setup lang="ts">

type RepoSummary = { root: string; name: string };
type FileNode = {
  path: string;
  name: string;
  kind: "file" | "dir";
  children?: FileNode[];
};

defineProps<{
  repos: RepoSummary[];
  selectedRepo: RepoSummary | null;
  repoFileTree: FileNode[];
  driveDTree: FileNode[];
  driveDLoading: boolean;
  selectedFilePath: string;
}>();

defineEmits<{
  "select-repo": [repo: RepoSummary];
  "open-file": [path: string];
  "load-drive-d": [];
}>();

</script>

<template>

  <aside class="col-span-3 flex min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-950">
    <div class="border-b border-slate-800 p-3">
      <div class="text-xs text-slate-400">Repositories</div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-2">
      <div class="flex flex-col gap-1">
        <button
          v-for="r in repos"
          :key="r.root"
          class="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ring-1 ring-transparent hover:bg-slate-900"
          :class="selectedRepo?.root === r.root ? 'bg-slate-900 text-slate-100 ring-slate-800' : 'text-slate-300'"
          @click="$emit('select-repo', r)"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3v12" />
            <circle cx="6" cy="3" r="2" />
            <circle cx="6" cy="15" r="2" />
            <path d="M18 6a3 3 0 0 0-3 3v8" />
            <circle cx="18" cy="6" r="2" />
          </svg>
          <span class="min-w-0 flex-1 truncate">{{ r.name }}</span>
        </button>
      </div>

      <div class="mt-4 border-t border-slate-800 pt-3">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-xs text-slate-400">Repo Files</div>
          <div class="text-[11px] text-slate-500">read-only</div>
        </div>
        <div class="rounded-lg bg-slate-950">
          <div class="max-h-[36vh] overflow-auto p-1">
            <div v-for="n in repoFileTree" :key="n.path">
              <FileTreeNode :node="n" :selected="selectedFilePath" @open="$emit('open-file', $event)" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 border-t border-slate-800 pt-3">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-xs text-slate-400">Drive D:</div>
          <button
            class="rounded-md bg-slate-950 px-2 py-1 text-[11px] text-slate-400 ring-1 ring-slate-800 hover:bg-slate-900"
            @click="$emit('load-drive-d')"
          >
            Refresh
          </button>
        </div>
        <div class="rounded-lg bg-slate-950">
          <div class="max-h-[30vh] overflow-auto p-1">
            <div v-if="driveDLoading" class="px-2 py-2 text-xs text-slate-500">Loading...</div>
            <div v-else>
              <div v-for="n in driveDTree" :key="n.path">
                <FileTreeNode :node="n" :selected="selectedFilePath" @open="$emit('open-file', $event)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>

</template>