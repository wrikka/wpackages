<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import SearchResults from "./components/SearchResults.vue";
import StepsTimeline from "./components/StepsTimeline.vue";
import type { FinalPayload, Stage, StepStatus, StreamEvent } from "./lib/types";

const stageOrder: Stage[] = ["understanding", "planning", "searching", "summarizing", "clustering"];

const stageLabel = (s: Stage) => {
	switch (s) {
		case "understanding":
			return "Understanding query";
		case "planning":
			return "Planning";
		case "searching":
			return "Searching";
		case "summarizing":
			return "Summarizing";
		case "clustering":
			return "Clustering";
	}
};

const q = ref("Samsung Galaxy flagship 2025");
const isRunning = ref(false);
const events = ref<StreamEvent[]>([]);
const result = ref<FinalPayload | null>(null);
const lastError = ref<string | null>(null);

const currentStage = ref<Stage | null>(null);
const stageStatus = ref<Record<Stage, StepStatus>>({
	understanding: "idle",
	planning: "idle",
	searching: "idle",
	summarizing: "idle",
	clustering: "idle",
});

let es: EventSource | null = null;

const reset = () => {
	events.value = [];
	result.value = null;
	lastError.value = null;
	currentStage.value = null;
	stageStatus.value = {
		understanding: "idle",
		planning: "idle",
		searching: "idle",
		summarizing: "idle",
		clustering: "idle",
	};
};

const stop = () => {
	if (es) {
		es.close();
		es = null;
	}
	isRunning.value = false;
};

const apiBase = computed(() => {
	const raw = import.meta.env.VITE_API_BASE_URL;
	return typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
});

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

	const url = `${apiBase.value}/api/search/stream?q=${encodeURIComponent(query)}`;
	es = new EventSource(url);

	es.onmessage = (msg) => {
		const data: StreamEvent = JSON.parse(msg.data);
		events.value.push(data);

		if (data.type === "error") {
			lastError.value = data.error;
			for (const stage of stageOrder) {
				if (stageStatus.value[stage] === "active") stageStatus.value[stage] = "error";
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

		if (data.type === "result") {
			result.value = (data.payload ?? null) as FinalPayload | null;
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

const steps = computed(() => {
	return stageOrder.map((id) => ({
		id,
		label: stageLabel(id),
		status: stageStatus.value[id],
	}));
});

const resultsList = computed(() => {
	const items = result.value?.results;
	return Array.isArray(items) ? items : [];
});

const runningLabel = computed(() => {
	return isRunning.value ? "Running…" : "Idle";
});
</script>

<template>
	<div>
		<header class="header">
			<div class="container headerInner">
				<div class="brand">
					<div class="brandSub">@wpackages</div>
					<div class="brandTitle">Websearch UI</div>
				</div>
				<div class="actions">
					<button class="btn" :disabled="isRunning" @click="start">Search</button>
					<button class="btn" :disabled="!isRunning" @click="stop">Stop</button>
				</div>
			</div>
		</header>

		<main class="container layout">
			<section class="panel">
				<div class="panelHeader">
					<div class="panelTitle">Workflow</div>
					<div class="muted">{{ runningLabel }}</div>
				</div>
				<div class="panelBody">
					<div style="margin-bottom: 12px">
						<div class="muted" style="margin-bottom: 8px">Search query</div>
						<input class="input" v-model="q" :disabled="isRunning" @keyup.enter="start" />
						<div class="muted" style="margin-top: 6px">Enter เพื่อค้นหา</div>
					</div>

					<StepsTimeline :steps="steps" />

					<div
						v-if="lastError"
						class="panel"
						style="margin-top: 12px; border-color: rgba(251, 113, 133, 0.35)"
					>
						<div class="panelBody">
							<div style="font-weight: 700; color: rgba(251, 113, 133, 0.95); font-size: 13px">
								Error
							</div>
							<div class="muted" style="margin-top: 6px">{{ lastError }}</div>
						</div>
					</div>
				</div>
			</section>

			<section class="panel split">
				<div class="panelHeader">
					<div class="panelTitle">Results</div>
					<div class="muted">{{ resultsList.length }} items</div>
				</div>

				<div class="scroll">
					<SearchResults v-if="resultsList.length" :items="resultsList" :query="q" />
					<div v-else class="muted">Waiting for results…</div>
				</div>
			</section>
		</main>
	</div>
</template>
