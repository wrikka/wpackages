<script setup lang="ts">
import DependencyGraph from "~/components/DependencyGraph.vue";
import PageShell from "~/components/PageShell.vue";

// Hardcoded package data for visualization
const packagesData = {
	nodes: [
		{ id: "@wpackages/program" },
		{ id: "@wpackages/cli-builder" },
		{ id: "@wpackages/cli-components" },
		{ id: "@wpackages/config-manager" },
		{ id: "effect" },
	],
	links: [
		{ source: "@wpackages/program", target: "@wpackages/config-manager" },
		{ source: "@wpackages/cli-builder", target: "@wpackages/cli-components" },
		{ source: "@wpackages/cli-builder", target: "@wpackages/config-manager" },
		{ source: "@wpackages/cli-builder", target: "effect" },
		{ source: "@wpackages/cli-components", target: "effect" },
	],
};
</script>

<template>
	<PageShell title="Dependency Graph">
		<DependencyGraph :data="packagesData" />
	</PageShell>
</template>
