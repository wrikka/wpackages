<script setup lang="ts">
import type { Span } from "../types/tracing";

const props = defineProps<{ span: Span }>();

const duration = (props.span.endTime ?? 0) - props.span.startTime;

// Simple color hashing based on service name or span name
const hashCode = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
};

const colorIndex = Math.abs(
	hashCode(
		props.span.resource?.attributes?.["service.name"] ?? props.span.name,
	),
) % 5;
const colors = [
	"bg-sky-500/50 border-sky-400",
	"bg-emerald-500/50 border-emerald-400",
	"bg-amber-500/50 border-amber-400",
	"bg-rose-500/50 border-rose-400",
	"bg-indigo-500/50 border-indigo-400",
];
const colorClasses = colors[colorIndex];
</script>

<template>
	<div
		class="h-6 rounded-sm border text-white text-xs flex items-center px-2 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out"
		:class="colorClasses"
		:title="`${span.name} (${duration.toFixed(2)} ms)`"
	>
		<span class="font-semibold truncate">{{ span.name }}</span>
		<span class="ml-2 text-gray-400 font-mono">{{
				duration.toFixed(2)
			}}ms</span>
	</div>
</template>
