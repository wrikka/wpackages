<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = defineProps<{
	output: string[];
}>();

const terminalEl = ref<HTMLDivElement>();

watch(
	() => props.output,
	async () => {
		await nextTick();
		if (terminalEl.value) {
			terminalEl.value.scrollTop = terminalEl.value.scrollHeight;
		}
	},
);
</script>

<template>
	<div ref="terminalEl" class="terminal">
		<div v-for="(line, i) in output" :key="i" class="line">{{ line }}</div>
		<div v-if="output.length === 0" class="empty">Ready. Execute commands below.</div>
	</div>
</template>

<style scoped>
.terminal {
	flex: 1;
	background: #000;
	border: 1px solid #222;
	border-radius: 8px;
	padding: 1rem;
	font-family: 'Monaco', 'Courier New', monospace;
	font-size: 0.875rem;
	overflow-y: auto;
	min-height: 400px;
	max-height: 600px;
}

.line {
	margin: 0.25rem 0;
	white-space: pre-wrap;
	word-break: break-word;
}

.empty {
	color: #666;
	font-style: italic;
}
</style>
