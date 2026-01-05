<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, ref } from "vue";

type Node = {
	id: string;
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
};

type Link = {
	source: string | Node;
	target: string | Node;
};

type GraphData = {
	nodes: Node[];
	links: Link[];
};

const props = defineProps<{ data: GraphData }>();

const graphContainer = ref<HTMLElement | null>(null);

onMounted(() => {
	const el = graphContainer.value;
	if (!el) return;

	const width = el.clientWidth;
	const height = 800;

	const simulation = d3
		.forceSimulation<Node>(props.data.nodes)
		.force(
			"link",
			d3
				.forceLink<Node, Link>(props.data.links)
				.id((d) => d.id)
				.distance(100),
		)
		.force("charge", d3.forceManyBody().strength(-200))
		.force("center", d3.forceCenter(width / 2, height / 2));

	const svg = d3
		.select(el)
		.append("svg")
		.attr("viewBox", [0, 0, width, height])
		.attr("width", width)
		.attr("height", height);

	const link = svg
		.append("g")
		.attr("stroke", "#999")
		.attr("stroke-opacity", 0.6)
		.selectAll("line")
		.data(props.data.links)
		.join("line");

	const node = svg
		.append("g")
		.selectAll("g")
		.data(props.data.nodes)
		.join("g")
		.call(createDrag(simulation));

	node.append("circle").attr("r", 10).attr("fill", "skyblue");

	node
		.append("text")
		.text((d) => d.id)
		.attr("x", 15)
		.attr("y", 5)
		.attr("fill", "currentColor");

	simulation.on("tick", () => {
		link
			.attr("x1", (d) => (d.source as Node).x ?? 0)
			.attr("y1", (d) => (d.source as Node).y ?? 0)
			.attr("x2", (d) => (d.target as Node).x ?? 0)
			.attr("y2", (d) => (d.target as Node).y ?? 0);

		node.attr(
			"transform",
			(d) => `translate(${d.x ?? 0},${d.y ?? 0})`,
		);
	});

	function createDrag(sim: d3.Simulation<Node, undefined>) {
		function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
			if (!event.active) sim.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x ?? null;
			event.subject.fy = event.subject.y ?? null;
		}
		function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}
		function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
			if (!event.active) sim.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
		return d3
			.drag<SVGGElement, Node>()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended);
	}
});
</script>

<template>
	<div
		ref="graphContainer"
		class="w-full h-[800px] border rounded-lg bg-white dark:bg-gray-800"
	>
	</div>
</template>
