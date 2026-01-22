<script setup lang="ts">
import DependencyGraph from "~/components/DependencyGraph.vue";
import PageShell from "~/components/PageShell.vue";

// Hardcoded package data for visualization
const packagesData = {
	nodes: [
		{ id: "@wpackages/program" },
		{ id: "@wpackages/cli-builder" },
		{ id: "@wpackages/tui" },
		{ id: "@wpackages/config-manager" },
		{ id: "effect" },
	],
	links: [
		{ source: "@wpackages/program", target: "@wpackages/config-manager" },
		{ source: "@wpackages/cli-builder", target: "@wpackages/tui" },
		{ source: "@wpackages/cli-builder", target: "@wpackages/config-manager" },
		{ source: "@wpackages/cli-builder", target: "effect" },
		{ source: "@wpackages/tui", target: "effect" },
	],
};
</script>

<template>
	<PageShell title="Dependency Graph">
		<DependencyGraph :data="packagesData" />
	</PageShell>
</template>
