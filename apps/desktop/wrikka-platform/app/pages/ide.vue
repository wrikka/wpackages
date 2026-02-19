<script setup lang="ts">

import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

import RepoSidebar from "~/components/RepoSidebar.vue";
import CenterPanel from "~/components/CenterPanel.vue";
import AIPanel from "~/components/AIPanel.vue";

import { useGit } from "~/composables/useGit";
import { useFiles } from "~/composables/useFiles";
import { useAI } from "~/composables/useAI";

type CenterView = "code" | "git";
type RepoSummary = { root: string; name: string };

const workspaceRoot = ref<string>("");
const repos = ref<RepoSummary[]>([]);
const selectedRepo = ref<RepoSummary | null>(null);
const centerView = ref<CenterView>("code");

const { branches, commits, status, diffs, loadRepo } = useGit();
const {
  selectedFilePath,
  selectedFileText,
  repoFileTree,
  driveDTree,
  driveDLoading,
  openFile,
  loadRepoFiles,
  loadDriveD,
} = useFiles();

const {
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
} = useAI(repoFileTree);

const pickFolder = async (): Promise<void> => {
  const result = await open({ directory: true, multiple: false });
  if (typeof result !== "string") return;

  workspaceRoot.value = result;
  repos.value = await invoke("list_repos", { root: result });
  selectedRepo.value = repos.value[0] ?? null;

  selectedFilePath.value = "";
  selectedFileText.value = "";
  centerView.value = "code";
  driveDTree.value = [];
  await loadDriveD();

  if (selectedRepo.value) {
    await selectRepo(selectedRepo.value);
  }
};

const selectRepo = async (repo: RepoSummary): Promise<void> => {
  selectedRepo.value = repo;
  selectedFilePath.value = "";
  selectedFileText.value = "";
  await loadRepo(repo.root);
  await loadRepoFiles(repo.root);
};

</script>

<template>

  <div class="h-[calc(100vh-0px)] w-full p-4">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <button
          class="rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 hover:bg-slate-800"
          @click="pickFolder"
        >
          Open Folder
        </button>
        <div class="min-w-0 truncate text-xs text-slate-400" v-if="workspaceRoot">
          {{ workspaceRoot }}
        </div>
      </div>

      <div class="flex items-center gap-2" v-if="workspaceRoot">
        <button
          class="rounded-md px-3 py-2 text-xs ring-1 ring-slate-800"
          :class="centerView === 'code' ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-400 hover:bg-slate-900'"
          @click="centerView = 'code'"
        >
          Code
        </button>
        <button
          class="rounded-md px-3 py-2 text-xs ring-1 ring-slate-800"
          :class="centerView === 'git' ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-400 hover:bg-slate-900'"
          @click="centerView = 'git'"
        >
          Git
        </button>
      </div>
    </div>

    <div v-if="!workspaceRoot" class="grid h-[calc(100%-52px)] place-items-center rounded-xl border border-slate-800 bg-slate-950">
      <div class="text-center">
        <div class="mb-2 text-sm text-slate-200">Open a folder to get started</div>
        <div class="text-xs text-slate-400">Pick a workspace root that contains one or more Git repositories.</div>
      </div>
    </div>

    <div v-else class="grid h-[calc(100%-52px)] grid-cols-12 gap-4">
      <RepoSidebar
        :repos="repos"
        :selected-repo="selectedRepo"
        :repo-file-tree="repoFileTree"
        :drive-d-tree="driveDTree"
        :drive-d-loading="driveDLoading"
        :selected-file-path="selectedFilePath"
        @select-repo="selectRepo"
        @open-file="openFile"
        @load-drive-d="loadDriveD"
      />

      <CenterPanel
        :center-view="centerView"
        :selected-file-path="selectedFilePath"
        :selected-file-text="selectedFileText"
        :status="status"
        :branches="branches"
        :commits="commits"
        :diffs="diffs"
        @set-view="centerView = $event"
        @copy-to-prompt="copyToPrompt"
      />

      <AIPanel
        :chat="chat"
        :selected-model="selectedModel"
        :selected-workflow="selectedWorkflow"
        :prompt="prompt"
        :suggestions-open="suggestionsOpen"
        :suggestions="suggestions"
        @send-prompt="sendPrompt"
        @clear-prompt="clearPrompt"
        @accept-suggestion="acceptFirstSuggestion"
        @apply-suggestion="applySuggestion"
      />
    </div>
  </div>

</template>