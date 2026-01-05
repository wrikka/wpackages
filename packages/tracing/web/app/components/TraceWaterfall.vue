<script setup lang="ts">
import { computed } from "vue";
import type { Span } from "../../../src/types/tracing";
import SpanBar from "./SpanBar.vue";

const props = defineProps<{ trace: Span[]; selectedSpanId?: string }>();

const emit = defineEmits<{ selectSpan: [span: Span] }>();

const sortedSpans = computed(() => {
	return [...props.trace].sort((a, b) => a.startTime - b.startTime);
});

const traceStartTime = computed(() => sortedSpans.value[0]?.startTime ?? 0);

const traceEndTime = computed(() => {
	return Math.max(...sortedSpans.value.map((s) => s.endTime ?? s.startTime));
});

const traceDuration = computed(() => traceEndTime.value - traceStartTime.value);

const getSpanOffset = (span: Span) => {
	if (traceDuration.value === 0) return 0;
	return ((span.startTime - traceStartTime.value) / traceDuration.value) * 100;
};

const getSpanWidth = (span: Span) => {
	if (traceDuration.value === 0) return 100;
	const duration = (span.endTime ?? traceEndTime.value) - span.startTime;
	return (duration / traceDuration.value) * 100;
};
</script>

<template>
	<div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
		<div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
			<div class="min-w-0">
				<p class="font-mono text-sm text-gray-500 dark:text-gray-400 truncate">Trace</p>
				<p class="font-mono text-xs text-gray-400 dark:text-gray-500 truncate">{{ trace[0]?.traceId }}</p>
			</div>
			<div class="text-right">
				<p class="font-mono text-sm">{{ trace.length }}</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">{{ traceDuration.toFixed(2) }} ms</p>
			</div>
		</div>

		<div class="p-4">
			<div class="relative bg-gray-50 dark:bg-gray-950/30 p-2 rounded-lg space-y-1">
				<SpanBar
					v-for="span in sortedSpans"
					:key="span.spanId"
					:span="span"
					:selected="selectedSpanId === span.spanId"
					:style="{
						'margin-left': `${getSpanOffset(span)}%`,
						width: `${getSpanWidth(span)}%`,
					}"
					@select="emit('selectSpan', $event)"
				/>
			</div>
		</div>
	</div>
</template>
