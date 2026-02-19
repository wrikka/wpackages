<script setup lang="ts">

import type { SidebarPage } from "../../shared/types/sidebar-page";

const route = useRoute();
const { pages } = useSidebarPages();

const page = computed<SidebarPage | undefined>(() => {
	const id = String(route.params.id || "");
	return pages.value.find((p) => p.id === id);
});

</script>

<template>

  <div class="h-full px-4 py-6">
    <div v-if="!page" class="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <div class="text-sm font-semibold text-slate-100">Page not found</div>
      <div class="mt-1 text-xs text-slate-500">Select a page from the sidebar.</div>
    </div>

    <div v-else class="mx-auto flex h-[calc(100vh-48px)] max-w-6xl flex-col gap-4">
      <div class="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
        <div class="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800">
          <img v-if="page.faviconUrl" :src="page.faviconUrl" class="h-5 w-5" />
          <span v-else class="text-xs font-semibold text-slate-500">P</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold text-slate-100">{{ page.title }}</div>
          <div class="truncate text-xs text-slate-500">{{ page.url }}</div>
        </div>
        <a
          :href="page.url"
          target="_blank"
          class="rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-200 ring-1 ring-slate-800 hover:bg-slate-800"
        >
          Open
        </a>
      </div>

      <div class="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <iframe :src="page.url" class="h-full w-full" />
      </div>
    </div>
  </div>

</template>