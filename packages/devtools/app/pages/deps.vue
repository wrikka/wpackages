<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, ref } from "vue";

const graphContainer = ref(null);

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

onMounted(() => {
	if (!graphContainer.value) return;

	const width = graphContainer.value.clientWidth;
	const height = 800;

	const simulation = d3.forceSimulation(packagesData.nodes)
		.force("link", d3.forceLink(packagesData.links).id(d => d.id).distance(100))
		.force("charge", d3.forceManyBody().strength(-200))
		.force("center", d3.forceCenter(width / 2, height / 2));

	const svg = d3.select(graphContainer.value).append("svg")
		.attr("viewBox", [0, 0, width, height])
		.attr("width", width)
		.attr("height", height);

	const link = svg.append("g")
		.attr("stroke", "#999")
		.attr("stroke-opacity", 0.6)
		.selectAll("line")
		.data(packagesData.links)
		.join("line");

	const node = svg.append("g")
		.selectAll("g")
		.data(packagesData.nodes)
		.join("g")
		.call(drag(simulation));

	node.append("circle")
		.attr("r", 10)
		.attr("fill", "skyblue");

	node.append("text")
		.text(d => d.id)
		.attr("x", 15)
		.attr("y", 5)
		.attr("fill", "currentColor");

	simulation.on("tick", () => {
		link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

		node
			.attr("transform", d => `translate(${d.x},${d.y})`);
	});

	function drag(simulation) {
		function dragstarted(event) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}
		function dragged(event) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}
		function dragended(event) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
		return d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended);
	}
});
</script>

<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
			Dependency Graph
		</h1>
		<div
			ref="graphContainer"
			class="w-full h-[800px] border rounded-lg bg-white dark:bg-gray-800"
		>
		</div>
	</div>
</template>
