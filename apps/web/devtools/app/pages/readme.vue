<script setup lang="ts">
import { onMounted } from "vue";
import PageShell from "~/components/PageShell.vue";
import ReadmePreview from "~/components/ReadmePreview.vue";
import { useReadmePreview } from "~/composables/useReadmePreview";

const { readmeContent, fetchReadme } = useReadmePreview();

// Placeholder for fetching README content
onMounted(() => {
	fetchReadme();
});
</script>

<template>
	<PageShell title="README Preview">
		<ReadmePreview :html="readmeContent" />
	</PageShell>
</template>

<style>
.prose {
	/* Add some basic prose styling if not covered by UnoCSS reset */
	line-height: 1.6;
}
</style>
