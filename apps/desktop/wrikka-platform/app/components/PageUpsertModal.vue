<script setup lang="ts">

import type { SidebarPage } from "../../shared/types/sidebar-page";

type UrlMetadata = {
	url: string;
	title: string;
	faviconUrl?: string;
};

const props = defineProps<{
	open: boolean;
	initial?: SidebarPage;
}>();

const emit = defineEmits<{
	(e: "close"): void;
	(
		e: "save",
		page: { id?: string; url: string; title: string; faviconUrl?: string },
	): void;
}>();

const url = ref("");
const title = ref("");
const faviconUrl = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);

watch(
	() => props.open,
	(isOpen) => {
		if (!isOpen) return;
		url.value = props.initial?.url ?? "";
		title.value = props.initial?.title ?? "";
		faviconUrl.value = props.initial?.faviconUrl ?? "";
		errorMessage.value = null;
		loading.value = false;
	},
	{ immediate: true },
);

watch(url, (value) => {
	if (value.trim()) {
		fetchMeta();
	}
});

async function fetchMeta() {
	if (!url.value.trim()) return;
	errorMessage.value = null;
	loading.value = true;
	try {
		const meta = await $fetch<UrlMetadata>("/api/url-metadata", {
			query: {
				url: url.value.trim(),
			},
		});

		url.value = meta.url;
		if (!title.value.trim()) title.value = meta.title;
		if (!faviconUrl.value.trim() && meta.faviconUrl)
			faviconUrl.value = meta.faviconUrl;
	} catch (e) {
		errorMessage.value = "Could not fetch metadata";
	} finally {
		loading.value = false;
	}
}

function onSave() {
	if (!url.value.trim()) {
		errorMessage.value = "URL is required";
		return;
	}
	if (!title.value.trim()) {
		errorMessage.value = "Title is required";
		return;
	}

	emit("save", {
		id: props.initial?.id,
		url: url.value.trim(),
		title: title.value.trim(),
		faviconUrl: faviconUrl.value.trim() || undefined,
	});
}

</script>

<template>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" @keydown.esc="$emit('close')" @click="$emit('close')">
      <div class="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl" @click.stop>
        <div class="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-slate-100">
              {{ initial ? 'Edit Page' : 'Add Page' }}
            </div>
            <div class="text-xs text-slate-400">Paste a URL and preview metadata before saving.</div>
          </div>
          <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-900" @click="$emit('close')">
            <span class="sr-only">Close</span>
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-4 px-5 py-4">
          <div class="space-y-2">
            <div class="text-xs font-medium text-slate-300">URL</div>
            <div class="flex items-center gap-2">
              <input
                v-model="url"
                class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-slate-600"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <div class="text-xs font-medium text-slate-300">Title</div>
              <input
                v-model="title"
                class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-slate-600"
                placeholder="Page title"
              />
            </div>

            <div class="space-y-2">
              <div class="text-xs font-medium text-slate-300">Favicon URL</div>
              <input
                v-model="faviconUrl"
                class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-slate-600"
                placeholder="https://.../favicon.ico"
              />
            </div>
          </div>

          
          <div v-if="errorMessage" class="rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
            {{ errorMessage }}
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-4">
          <button class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900" @click="$emit('close')">Cancel</button>
          <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" @click="onSave">
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>

</template>