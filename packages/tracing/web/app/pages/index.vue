<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { Span, TraceId } from "../../../src/types/tracing";
import TraceWaterfall from "../components/TraceWaterfall.vue";

type TraceGroup = {
	traceId: TraceId;
	spans: Span[];
};

const pollIntervalMs = 1500;

const isLive = ref(true);
const query = ref("");
const lastUpdatedAt = ref<Date | null>(null);
const selectedSpan = ref<Span | null>(null);

const { data, error, refresh } = await useFetch<Span[]>("/api/v1/traces", {
	default: () => [],
});

const spans = computed(() => data.value ?? []);

const filteredSpans = computed(() => {
	const q = query.value.trim().toLowerCase();
	if (!q) return spans.value;

	return spans.value.filter((s) => {
		const serviceName =
			(typeof s.resource.attributes["service.name"] === "string"
				? s.resource.attributes["service.name"]
				: "") ?? "";

		return (
			s.traceId.toLowerCase().includes(q) ||
			s.spanId.toLowerCase().includes(q) ||
			s.name.toLowerCase().includes(q) ||
			serviceName.toLowerCase().includes(q) ||
			s.status.toLowerCase().includes(q)
		);
	});
});

const groupedTraces = computed<TraceGroup[]>(() => {
	const map = new Map<TraceId, Span[]>();

	for (const span of filteredSpans.value) {
		const list = map.get(span.traceId);
		if (list) {
			list.push(span);
			continue;
		}
		map.set(span.traceId, [span]);
	}

	const groups = Array.from(map.entries()).map(([traceId, spans]) => ({
		traceId,
		spans,
	}));

	groups.sort((a, b) => {
		const aStart = Math.min(...a.spans.map((s) => s.startTime));
		const bStart = Math.min(...b.spans.map((s) => s.startTime));
		return bStart - aStart;
	});

	return groups;
});

let timer: ReturnType<typeof setInterval> | undefined;

async function doRefresh() {
	await refresh();
	lastUpdatedAt.value = new Date();
}

async function toggleLive() {
	isLive.value = !isLive.value;
}

async function generateSpans() {
	await $fetch("/api/generate-spans", { method: "POST" });
	await doRefresh();
}

async function resetSpans() {
	await $fetch("/api/v1/reset", { method: "POST" });
	selectedSpan.value = null;
	await doRefresh();
}

function onSelectSpan(span: Span) {
	selectedSpan.value = span;
}

function closeDrawer() {
	selectedSpan.value = null;
}

const selectedSpanDurationMs = computed(() => {
	if (!selectedSpan.value) return 0;
	return (selectedSpan.value.endTime ?? selectedSpan.value.startTime) - selectedSpan.value.startTime;
});

const selectedSpanServiceName = computed(() => {
	const span = selectedSpan.value;
	if (!span) return undefined;
	const value = span.resource.attributes["service.name"];
	return typeof value === "string" ? value : undefined;
});

onMounted(async () => {
	await doRefresh();
	timer = setInterval(async () => {
		if (!isLive.value) return;
		await doRefresh();
	}, pollIntervalMs);
});

onUnmounted(() => {
	if (timer) clearInterval(timer);
});
</script>

<template>
	<div class="mx-auto max-w-6xl">
		<div class="mb-6 flex flex-col gap-3">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<h2 class="text-2xl font-semibold">Tracing Dashboard</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						{{ spans.length }} spans
						<span v-if="lastUpdatedAt" class="ml-2">Updated: {{ lastUpdatedAt.toLocaleTimeString() }}</span>
					</p>
				</div>
				<div class="flex flex-wrap items-center justify-end gap-2">
					<button
						class="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
						@click="toggleLive"
					>
						{{ isLive ? 'Pause' : 'Live' }}
					</button>
					<button
						class="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
						@click="resetSpans"
					>
						Reset
					</button>
					<button
						class="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
						@click="generateSpans"
					>
						Generate Sample
					</button>
					<button
						class="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
						@click="doRefresh"
					>
						Refresh
					</button>
				</div>
			</div>

			<div class="flex gap-3 items-center">
				<input
					v-model="query"
					placeholder="Search traceId, spanId, name, service.name, status"
					class="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/40"
				/>
			</div>
		</div>

		<div v-if="error" class="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-200">
			<p class="font-semibold">Error</p>
			<p class="text-sm">{{ error.message }}</p>
		</div>

		<div v-else-if="groupedTraces.length === 0" class="text-center py-16">
			<p class="text-gray-500 dark:text-gray-400">No traces yet</p>
			<p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Send spans to <code class="font-mono">/v1/traces</code> or click Generate Sample</p>
		</div>

		<div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
			<div class="space-y-4">
				<TraceWaterfall
					v-for="group in groupedTraces"
					:key="group.traceId"
					:trace="group.spans"
					:selected-span-id="selectedSpan?.spanId"
					@select-span="onSelectSpan"
				/>
			</div>

			<div class="lg:sticky lg:top-4">
				<div
					v-if="selectedSpan"
					class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
				>
					<div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="text-xs text-gray-500 dark:text-gray-400">Selected span</p>
							<p class="font-mono text-sm truncate">{{ selectedSpan.name }}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
								{{ selectedSpanServiceName ?? '-' }}
								<span class="mx-2">·</span>
								{{ selectedSpanDurationMs.toFixed(2) }} ms
							</p>
						</div>
						<button
							type="button"
							class="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
							@click="closeDrawer"
						>
							Close
						</button>
					</div>

					<div class="p-4 space-y-4">
						<div class="grid grid-cols-2 gap-3">
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Trace ID</p>
								<p class="font-mono text-xs break-all">{{ selectedSpan.traceId }}</p>
							</div>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Span ID</p>
								<p class="font-mono text-xs break-all">{{ selectedSpan.spanId }}</p>
							</div>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Parent ID</p>
								<p class="font-mono text-xs break-all">{{ selectedSpan.parentId ?? '-' }}</p>
							</div>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
								<p class="font-mono text-xs">{{ selectedSpan.status }}</p>
							</div>
						</div>

						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Attributes</p>
							<pre class="text-xs bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-lg p-3 overflow-auto">{{ JSON.stringify(selectedSpan.attributes, null, 2) }}</pre>
						</div>

						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Resource</p>
							<pre class="text-xs bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-lg p-3 overflow-auto">{{ JSON.stringify(selectedSpan.resource.attributes, null, 2) }}</pre>
						</div>

						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Events</p>
							<pre class="text-xs bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-lg p-3 overflow-auto">{{ JSON.stringify(selectedSpan.events, null, 2) }}</pre>
						</div>
					</div>
				</div>

				<div
					v-else
					class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4"
				>
					<p class="text-sm text-gray-500 dark:text-gray-400">Click a span to view details</p>
				</div>
			</div>
		</div>
	</div>
</template>
