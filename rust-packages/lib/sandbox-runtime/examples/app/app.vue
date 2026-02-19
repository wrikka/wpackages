<template>
	<div style="font-family: sans-serif; padding: 2rem">
		<h1>Rust WASM SandboxRuntime</h1>
		<div v-if="webcontainer">
			<h2>Virtual Filesystem</h2>
			<p>Current Path: <code>{{ currentPath }}</code></p>

			<div style="margin-bottom: 1rem">
				<input
					v-model="newItemName"
					placeholder="Enter name..."
					@keyup.enter="handleMkdir"
				/>
				<button @click="handleTouch">Touch File</button>
				<button @click="handleMkdir">Mkdir</button>
			</div>

			<div v-if="error" style="color: red; margin-bottom: 1rem">
				<strong>Error:</strong> {{ error }}
			</div>

			<pre style="background: #eee; padding: 1rem; border-radius: 5px">
        <code>
          <div v-if="entries.length === 0">- empty -</div>
          <div v-for="entry in entries" :key="entry.name">
            {{ entry.is_dir ? '[d]' : '[f]' }} {{ entry.name }}
          </div>
        </code>
      </pre>
		</div>
		<div v-else></div>
	</div>
</template>

<script setup>
import { SandboxRuntime } from "@wpackages/sandbox-runtime";
import { nextTick, onMounted, ref } from "vue";

const webcontainer = ref(null);
const history = ref([]);
const command = ref("");
const terminalInput = ref(null);

onMounted(() => {
	try {
		webcontainer.value = new SandboxRuntime();
		history.value.push({
			type: "info",
			content: "SandboxRuntime Initialized. Type a command and press Enter.",
		});
		focusInput();
	} catch (e) {
		console.error("Error initializing SandboxRuntime:", e);
		history.value.push({
			type: "error",
			content: "Failed to load WebAssembly module.",
		});
	}
});

const focusInput = () => {
	nextTick(() => {
		terminalInput.value?.focus();
	});
};

const handleCommand = () => {
	if (!webcontainer.value || !command.value) return;

	const currentCmd = command.value;
	history.value.push({ type: "command", content: currentCmd });
	command.value = "";

	try {
		const result = webcontainer.value.run_command(currentCmd);
		if (result) {
			history.value.push({ type: "result", content: result });
		}
	} catch (e) {
		history.value.push({ type: "error", content: e.toString() });
	}
};
</script>
