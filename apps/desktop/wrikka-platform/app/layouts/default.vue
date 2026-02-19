<script setup lang="ts">

const { isOpen, initial, close } = usePageUpsertModal();
const { upsert, setActive } = useSidebarPages();
const router = useRouter();

function onSave(payload: {
	id?: string;
	url: string;
	title: string;
	faviconUrl?: string;
}) {
	const saved = upsert({
		id: payload.id,
		url: payload.url,
		title: payload.title,
		faviconUrl: payload.faviconUrl,
	});

	close();
	setActive(saved.id);
	router.push(`/pages/${saved.id}`);
}

</script>

<template>

  <div class="flex h-screen bg-slate-950 text-slate-100">
    <AppSidebar />

    <main class="min-w-0 flex-1">
      <div class="h-full overflow-auto">
        <slot />
      </div>
    </main>

    <PageUpsertModal :open="isOpen" :initial="initial" @close="close" @save="onSave" />
  </div>

</template>