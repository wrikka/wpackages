<script setup lang="ts">
import type { Stage, StepStatus } from "../lib/types";

type Step = {
	id: Stage;
	label: string;
	status: StepStatus;
};

defineProps<{
	steps: Step[];
}>();

const dotClass = (status: StepStatus) => {
	switch (status) {
		case "idle":
			return "dot dotIdle";
		case "active":
			return "dot dotActive";
		case "success":
			return "dot dotOk";
		case "error":
			return "dot dotErr";
	}
};
</script>

<template>
	<div class="timeline">
		<div v-for="(s, idx) in steps" :key="s.id" class="row">
			<div class="rail">
				<div :class="dotClass(s.status)" />
				<div v-if="idx < steps.length - 1" class="line" />
			</div>
			<div class="meta">
				<div class="label">{{ s.label }}</div>
				<div class="small">{{ s.id }}</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.timeline {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 2px 2px 6px;
}

.row {
	display: grid;
	grid-template-columns: 18px 1fr;
	gap: 12px;
	align-items: start;
}

.rail {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.dot {
	width: 12px;
	height: 12px;
	border-radius: 999px;
	border: 2px solid rgba(255, 255, 255, 0.18);
	background: rgba(255, 255, 255, 0.16);
}

.dotIdle {
	background: rgba(255, 255, 255, 0.10);
}

.dotActive {
	background: var(--run);
	border-color: rgba(96, 165, 250, 0.65);
	box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.10);
	animation: pulse 1.1s ease-in-out infinite;
}

.dotOk {
	background: var(--ok);
	border-color: rgba(45, 212, 191, 0.65);
}

.dotErr {
	background: var(--err);
	border-color: rgba(251, 113, 133, 0.65);
}

.line {
	width: 2px;
	flex: 1;
	min-height: 26px;
	background: rgba(255, 255, 255, 0.12);
	margin-top: 8px;
	border-radius: 999px;
}

.meta {
	padding-top: 1px;
}

.label {
	font-size: 13px;
	font-weight: 650;
	color: rgba(255, 255, 255, 0.92);
	line-height: 1.25;
}

.small {
	margin-top: 3px;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.46);
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.95;
	}
	50% {
		transform: scale(1.04);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.95;
	}
}
</style>
