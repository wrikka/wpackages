<script setup lang="ts">

type FileNode = {
	path: string;
	name: string;
	kind: "file" | "dir";
	children?: FileNode[];
};

defineOptions({
	name: "FileTreeNode",
});

defineProps<{
	node: FileNode;
	selected: string;
}>();

defineEmits<(e: "open", path: string) => void>();

const isOpen = ref(false);

</script>

<template>

  <div v-if="node.kind === 'file'">
    <button
      class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-slate-900"
      :class="selected === node.path ? 'bg-slate-900 text-slate-100' : 'text-slate-300'"
      @click="$emit('open', node.path)"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
      <span class="min-w-0 flex-1 truncate">{{ node.name }}</span>
    </button>
  </div>

  <div v-else class="pl-1">
    <button
      class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-slate-300 hover:bg-slate-900"
      @click="isOpen = !isOpen"
    >
      <svg v-if="isOpen" viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
      <span class="min-w-0 flex-1 truncate">{{ node.name }}</span>
      <svg v-if="isOpen" viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
      <svg v-else viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>

    <div v-if="isOpen && node.children?.length" class="pl-3">
      <FileTreeNode
        v-for="c in node.children"
        :key="c.path"
        :node="c"
        :selected="selected"
        @open="$emit('open', $event)"
      />
    </div>
  </div>

</template>