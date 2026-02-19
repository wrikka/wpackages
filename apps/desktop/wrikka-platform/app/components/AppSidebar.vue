<script setup lang="ts">

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { SidebarPage } from "../../shared/types/sidebar-page";
import type { ContextMenuItem } from "./ContextMenu.vue";

const route = useRoute();
const router = useRouter();

const { pages, activeId, setActive, remove } = useSidebarPages();
const { open: openModal } = usePageUpsertModal();

const contextOpen = ref(false);
const contextX = ref(0);
const contextY = ref(0);
const contextTargetId = ref<string | null>(null);

const contextItems = computed<ContextMenuItem[]>(() => [
	{ id: "edit", label: "Edit" },
	{ id: "delete", label: "Delete" },
]);

function openAdd() {
	openModal();
}

function openEdit(id: string) {
	const p = pages.value.find((x) => x.id === id);
	if (!p) return;
	openModal(p);
}

async function onPageClick(page: SidebarPage) {
	const win = await WebviewWindow.getByLabel(page.id);

	if (win) {
		await win.setFocus();
	} else {
		new WebviewWindow(page.id, {
			url: page.url,
			title: page.title,
		});
	}
	setActive(page.id);
}

function onPageContextMenu(ev: MouseEvent, id: string) {
	ev.preventDefault();
	contextOpen.value = true;
	contextX.value = ev.clientX;
	contextY.value = ev.clientY;
	contextTargetId.value = id;
}

function closeContext() {
	contextOpen.value = false;
	contextTargetId.value = null;
}

function onContextSelect(actionId: string) {
	const id = contextTargetId.value;
	closeContext();
	if (!id) return;

	if (actionId === "edit") {
		openEdit(id);
		return;
	}

	if (actionId === "delete") {
		remove(id);
	}
}

const topNav = computed(() => [
	{ to: "/", label: "Home", icon: "heroicons:home" },
	{ to: "/terminal", label: "Terminal", icon: "heroicons:command-line" },
	{ to: "/pages", label: "Pages", icon: "heroicons:document-duplicate" },
	{ to: "/chat", label: "Chat", icon: "heroicons:chat-bubble-left-right" },
]);

</script>

<template>

  <aside class="flex h-full w-16 shrink-0 flex-col items-center border-r border-slate-800 bg-slate-950 py-2">
    <div class="flex items-center justify-center">
      <div class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">WT</div>
    </div>

    <nav class="flex flex-col items-center gap-1 px-2">
      <NuxtLink
        v-for="it in topNav"
        :key="it.to"
        :to="it.to"
        class="group flex h-12 w-12 items-center justify-center rounded-xl text-sm text-slate-300 hover:bg-slate-900 hover:text-slate-100"
        active-class="bg-slate-900 text-slate-100 ring-1 ring-slate-800"
      >
        <Icon :name="it.icon" class="h-5 w-5 text-slate-500 group-[.router-link-active]:text-indigo-400" />
      </NuxtLink>
    </nav>

    <div class="mt-4 px-2">

      <div class="max-h-[40vh] overflow-auto pr-1">
        <div v-if="!pages.length" class="rounded-xl border border-dashed border-slate-800 bg-slate-950 px-3 py-4 text-xs text-slate-500">
          Add your first page to quickly jump between dashboards.
        </div>

        <button
          v-for="p in pages"
          :key="p.id"
          class="group mb-1 flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2 text-left text-sm ring-1 ring-transparent hover:bg-slate-900"
          :class="activeId === p.id ? 'bg-slate-900 text-slate-100 ring-slate-800' : 'text-slate-300'"
          @click="onPageClick(p)"
          @contextmenu="onPageContextMenu($event, p.id)"
        >
          <div class="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800">
            <img v-if="p.faviconUrl" :src="p.faviconUrl" class="h-5 w-5" />
            <span v-else class="text-xs font-semibold text-slate-500">P</span>
          </div>
        </button>
      </div>
    </div>

    <div class="mt-auto flex w-full flex-col items-center gap-1 border-t border-slate-800 p-2">
      <button class="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-slate-200 ring-1 ring-slate-800 hover:bg-slate-800" @click="openAdd">
        <Icon name="heroicons:plus" class="h-4 w-4" />
      </button>
      <NuxtLink
        to="/settings"
        class="group flex h-12 w-12 items-center justify-center rounded-xl text-sm text-slate-300 hover:bg-slate-900 hover:text-slate-100"
        active-class="bg-slate-900 text-slate-100 ring-1 ring-slate-800"
      >
        <Icon name="heroicons:cog-6-tooth" class="h-5 w-5 text-slate-500 group-[.router-link-active]:text-indigo-400" />
      </NuxtLink>
    </div>

        <ContextMenu :open="contextOpen" :x="contextX" :y="contextY" :items="contextItems" @close="closeContext" @select="onContextSelect" />
  </aside>

</template>