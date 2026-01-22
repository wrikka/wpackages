<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";

type Stage = "enhance" | "search" | "summarize" | "cluster";

type WorkflowEvent =
	| { type: "workflow:start"; at: string; query: string }
	| { type: "workflow:stage:start"; at: string; stage: Stage }
	| {
		type: "workflow:stage:success";
		at: string;
		stage: Stage;
		durationMs: number;
	}
	| {
		type: "workflow:stage:error";
		at: string;
		stage: Stage;
		durationMs: number;
		error: string;
	}
	| { type: "workflow:complete"; at: string; durationMs: number }
	| { type: "workflow:error"; at: string; durationMs: number; error: string }
	| { type: "engine:start"; engine: string; at: string }
	| {
		type: "engine:success";
		engine: string;
		at: string;
		resultsCount: number;
		durationMs: number;
	}
	| {
		type: "engine:error";
		engine: string;
		at: string;
		error: string;
		durationMs: number;
	};

type StreamEvent =
	| WorkflowEvent
	| { type: "result"; at: string; payload: any }
	| { type: "error"; at: string; error: string }
	| { type: "ping"; at: string };

type StepStatus = "idle" | "active" | "success" | "error";

const q = ref("Samsung Galaxy flagship 2025");
const isRunning = ref(false);
const events = ref<StreamEvent[]>([]);
const result = ref<any | null>(null);
const lastError = ref<string | null>(null);

const currentStage = ref<Stage | null>(null);
const stageStatus = ref<Record<Stage, StepStatus>>({
	enhance: "idle",
	search: "idle",
	summarize: "idle",
	cluster: "idle",
});

const engines = ref<Record<string, StepStatus>>({});

let es: EventSource | null = null;

const stageOrder: Stage[] = ["enhance", "search", "summarize", "cluster"];

const prettyStage = (stage: Stage) => {
	switch (stage) {
		case "enhance":
			return "Planning";
		case "search":
			return "Searching";
		case "summarize":
			return "Summarizing";
		case "cluster":
			return "Clustering";
	}
};

const reset = () => {
	events.value = [];
	result.value = null;
	lastError.value = null;
	currentStage.value = null;
	stageStatus.value = {
		enhance: "idle",
		search: "idle",
		summarize: "idle",
		cluster: "idle",
	};
	engines.value = {};
};

const stop = () => {
	if (es) {
		es.close();
		es = null;
	}
	isRunning.value = false;
};

const start = async () => {
	stop();
	reset();

	const query = q.value.trim();
	if (!query) {
		lastError.value = "กรุณาใส่คำค้น";
		return;
	}

	isRunning.value = true;

	await nextTick();

	es = new EventSource(`/api/search/stream?q=${encodeURIComponent(query)}`);

	es.onmessage = (msg) => {
		const data: StreamEvent = JSON.parse(msg.data);
		events.value.push(data);

		if (data.type === "error") {
			lastError.value = "error" in data ? data.error : "Unknown error";
			for (const stage of stageOrder) {
				if (stageStatus.value[stage] === "active") {
					stageStatus.value[stage] = "error";
				}
			}
			stop();
			return;
		}

		if (data.type === "workflow:stage:start") {
			currentStage.value = data.stage;
			stageStatus.value[data.stage] = "active";
			return;
		}

		if (data.type === "workflow:stage:success") {
			stageStatus.value[data.stage] = "success";
			return;
		}

		if (data.type === "workflow:stage:error") {
			stageStatus.value[data.stage] = "error";
			lastError.value = data.error;
			return;
		}

		if (data.type === "engine:start") {
			engines.value[data.engine] = "active";
			return;
		}

		if (data.type === "engine:success") {
			engines.value[data.engine] = "success";
			return;
		}

		if (data.type === "engine:error") {
			engines.value[data.engine] = "error";
			return;
		}

		if (data.type === "result") {
			result.value = data.payload;
			stop();
			return;
		}
	};

	es.onerror = () => {
		lastError.value = "การเชื่อมต่อหลุด (SSE error)";
		stop();
	};
};

onBeforeUnmount(() => {
	stop();
});

const enginesList = computed(() => {
	const entries = Object.entries(engines.value);
	entries.sort((a, b) => a[0].localeCompare(b[0]));
	return entries;
});

const resultsList = computed(() => {
	const items = result.value?.results;
	return Array.isArray(items) ? items : [];
});

const summaryText = computed(() => {
	const s = result.value?.summary?.summary;
	return typeof s === "string" ? s : "";
});

const keyPoints = computed(() => {
	const points = result.value?.summary?.keyPoints;
	return Array.isArray(points) ? points : [];
});

const clusters = computed(() => {
	const items = result.value?.clusters;
	return Array.isArray(items) ? items : [];
});

const statusClass = (status: StepStatus) => {
	switch (status) {
		case "idle":
			return "bg-gray-800 border-gray-700 text-gray-400";
		case "active":
			return "bg-blue-900/30 border-blue-700 text-blue-200";
		case "success":
			return "bg-emerald-900/30 border-emerald-700 text-emerald-200";
		case "error":
			return "bg-red-900/30 border-red-700 text-red-200";
	}
};

const statusDotClass = (status: StepStatus) => {
	switch (status) {
		case "idle":
			return "bg-gray-600";
		case "active":
			return "bg-blue-400 animate-pulse";
		case "success":
			return "bg-emerald-400";
		case "error":
			return "bg-red-400";
	}
};
</script>

<template>
	<div class="min-h-screen bg-gray-950 text-gray-100">
		<header class="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/70 backdrop-blur">
			<div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
				<div class="min-w-0">
					<div class="text-sm text-gray-400">@wpackages</div>
					<h1 class="text-lg font-semibold truncate">Websearch Workflow UI</h1>
				</div>
				<div class="flex items-center gap-2">
					<button
						class="rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
						:disabled="isRunning"
						@click="start"
					>
						Search
					</button>
					<button
						class="rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
						:disabled="!isRunning"
						@click="stop"
					>
						Stop
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
			<section class="lg:col-span-5 space-y-4">
				<div class="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
					<label class="block text-xs text-gray-400 mb-2">Search query</label>
					<input
						class="w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-blue-700"
						v-model="q"
						:disabled="isRunning"
						@keyup.enter="start"
					/>
					<div class="mt-2 text-xs text-gray-500">Enter เพื่อค้นหา</div>
				</div>

				<div class="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
					<div class="flex items-center justify-between mb-3">
						<h2 class="text-sm font-semibold">Workflow</h2>
						<div class="text-xs text-gray-400">
							<span v-if="isRunning">Running…</span>
							<span v-else>Idle</span>
						</div>
					</div>

					<div class="space-y-2">
						<div
							v-for="stage in stageOrder"
							:key="stage"
							class="rounded-lg border px-3 py-2 flex items-center gap-3 transition"
							:class="statusClass(stageStatus[stage])"
						>
							<div
								class="h-2.5 w-2.5 rounded-full"
								:class="statusDotClass(stageStatus[stage])"
							/>
							<div class="min-w-0 flex-1">
								<div class="text-sm font-medium truncate">
									{{ prettyStage(stage) }}
								</div>
								<div class="text-xs opacity-80 truncate">{{ stage }}</div>
							</div>
							<div class="text-xs opacity-80" v-if="currentStage === stage">
								active
							</div>
						</div>
					</div>

					<div class="mt-4" v-if="enginesList.length">
						<div class="text-xs text-gray-400 mb-2">Engines</div>
						<div class="grid grid-cols-2 gap-2">
							<div
								v-for="([engine, status]) in enginesList"
								:key="engine"
								class="rounded-lg border px-3 py-2 flex items-center gap-2"
								:class="statusClass(status)"
							>
								<div
									class="h-2 w-2 rounded-full"
									:class="statusDotClass(status)"
								/>
								<div class="text-xs font-medium truncate">{{ engine }}</div>
							</div>
						</div>
					</div>

					<div
						v-if="lastError"
						class="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-3"
					>
						<div class="text-sm font-semibold text-red-200">Error</div>
						<div class="text-xs text-red-300 mt-1 wrap-break-word">
							{{ lastError }}
						</div>
					</div>
				</div>
			</section>

			<section class="lg:col-span-7 space-y-4">
				<div class="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
					<h2 class="text-sm font-semibold mb-2">Summary</h2>
					<p v-if="summaryText" class="text-sm text-gray-200 leading-relaxed">
						{{ summaryText }}
					</p>
					<div v-else class="text-sm text-gray-500">Waiting for summary…</div>

					<div v-if="keyPoints.length" class="mt-3">
						<div class="text-xs text-gray-400 mb-2">Key points</div>
						<ul class="space-y-1">
							<li
								v-for="(p, idx) in keyPoints"
								:key="idx"
								class="text-xs text-gray-200"
							>
								- {{ p }}
							</li>
						</ul>
					</div>
				</div>

				<div class="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
					<h2 class="text-sm font-semibold mb-2">Results</h2>

					<div v-if="resultsList.length" class="space-y-3">
						<a
							v-for="(r, idx) in resultsList"
							:key="idx"
							:href="r.url"
							target="_blank"
							rel="noreferrer"
							class="block rounded-lg border border-gray-800 bg-gray-950/40 p-3 hover:bg-gray-900"
						>
							<div class="text-sm font-medium text-gray-100">
								{{ r.title }}
							</div>
							<div class="text-xs text-blue-300 mt-1 truncate">{{ r.url }}</div>
							<div class="text-xs text-gray-300 mt-2 leading-relaxed">
								{{ r.snippet }}
							</div>
							<div class="mt-2 text-[11px] text-gray-500">
								engine: {{ r.engine }} | score: {{ r.score }}
							</div>
						</a>
					</div>

					<div v-else class="text-sm text-gray-500">Waiting for results…</div>
				</div>

				<div class="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
					<h2 class="text-sm font-semibold mb-2">Topics</h2>
					<div v-if="clusters.length" class="flex flex-wrap gap-2">
						<span
							v-for="(c, idx) in clusters"
							:key="idx"
							class="rounded-full border border-gray-800 bg-gray-950 px-3 py-1 text-xs text-gray-200"
						>
							{{ c.name || c.topic || "topic" }}
						</span>
					</div>
					<div v-else class="text-sm text-gray-500">
						Waiting for clustering…
					</div>
				</div>
			</section>
		</main>

		<footer class="mx-auto max-w-6xl px-4 pb-8">
			<div class="text-xs text-gray-600">
				Streaming via SSE: /api/search/stream
			</div>
		</footer>
	</div>
</template>
