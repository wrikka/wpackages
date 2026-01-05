<script setup lang="ts">
import type { Span } from "../../../src/types/tracing";

const props = defineProps<{ span: Span; selected?: boolean }>();

const emit = defineEmits<{ select: [span: Span] }>();

const duration = (props.span.endTime ?? 0) - props.span.startTime;

const hashCode = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
};

const serviceName =
	(typeof props.span.resource.attributes["service.name"] === "string"
		? props.span.resource.attributes["service.name"]
		: undefined) ?? props.span.name;

const colorIndex = Math.abs(hashCode(serviceName)) % 5;

const colors = [
	"bg-sky-500/50 border-sky-400",
	"bg-emerald-500/50 border-emerald-400",
	"bg-amber-500/50 border-amber-400",
	"bg-rose-500/50 border-rose-400",
	"bg-indigo-500/50 border-indigo-400",
] as const;

const colorClasses = colors[colorIndex];
</script>

<template>
	<button
		type="button"
		class="h-6 rounded-sm border text-white text-xs flex items-center px-2 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out cursor-pointer"
		:class="[colorClasses, selected ? 'ring-2 ring-blue-400/70' : '']"
		:title="`${span.name} (${duration.toFixed(2)} ms)`"
		@click="emit('select', span)"
	>
		<span class="font-semibold truncate">{{ span.name }}</span>
		<span class="ml-2 text-gray-300 font-mono">{{ duration.toFixed(2) }}ms</span>
	</button>
</template>
