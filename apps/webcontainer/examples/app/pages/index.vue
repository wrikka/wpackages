<script setup lang="ts">
import { computed, ref } from "vue";
import { useWebContainer } from "~/composables/useWebContainer";

const {
	containers,
	activeContainerId,
	loading,
	error,
	fetchContainers,
	createContainer,
	deleteContainer,
	executeCommand,
	installPackages,
	runScript,
	listFiles,
	getPorts,
} = useWebContainer();

const showCreateModal = ref(false);
const commandInput = ref("");
const output = ref<string[]>([]);

const activeContainer = computed(() =>
	containers.value.find((c) => c.id === activeContainerId.value),
);

const handleCreateContainer = async (name: string, workdir: string) => {
	await createContainer(name, workdir);
	showCreateModal.value = false;
};

const handleExecute = async () => {
	if (!commandInput.value.trim() || !activeContainerId.value) return;

	output.value.push(`$ ${commandInput.value}`);
	const result = await executeCommand(
		activeContainerId.value,
		commandInput.value,
	);

	if (result) {
		output.value.push(result.output || "");
		if (result.error) {
			output.value.push(`Error: ${result.error}`);
		}
	}

	commandInput.value = "";
};

const handleQuickAction = async (action: string) => {
	if (!activeContainerId.value) return;

	output.value.push(`⚡ Running: ${action}`);

	switch (action) {
		case "install":
			await installPackages(activeContainerId.value);
			output.value.push("✅ Dependencies installed");
			break;
		case "dev":
			await runScript(activeContainerId.value, "dev");
			output.value.push("🔥 Dev server started");
			break;
		case "build":
			await runScript(activeContainerId.value, "build");
			output.value.push("🔨 Build completed");
			break;
		case "test":
			await runScript(activeContainerId.value, "test");
			output.value.push("🧪 Tests completed");
			break;
		case "files": {
			const files = await listFiles(activeContainerId.value);
			output.value.push("📂 Files:");
			files.forEach((f) => output.value.push(`  ${f.name}`));
			break;
		}
		case "ports": {
			const ports = await getPorts(activeContainerId.value);
			output.value.push("📍 Ports:", JSON.stringify(ports, null, 2));
			break;
		}
	}
};

// Load containers on mount
fetchContainers();
</script>

<template>
	<div class="app">
		<header class="header">
			<h1>🚀 WebContainer Demo</h1>
			<button @click="showCreateModal = true" class="btn-primary">+ New Container</button>
		</header>

		<div v-if="error" class="error-banner">{{ error }}</div>

		<main class="main">
			<aside class="sidebar">
				<h2>Containers</h2>
				<div v-if="loading" class="loading">Loading...</div>
				<div v-else class="containers-list">
					<ContainerCard
						v-for="container in containers"
						:key="container.id"
						:container="container"
						:active="container.id === activeContainerId"
						@select="activeContainerId = container.id"
						@delete="deleteContainer(container.id)"
					/>
				</div>
			</aside>

			<section class="content">
				<div v-if="!activeContainer" class="empty-state">
					<p>Select or create a container to get started</p>
				</div>

				<div v-else class="container-view">
					<div class="container-header">
						<h2>{{ activeContainer.name }}</h2>
						<span class="status" :class="activeContainer.status">{{
							activeContainer.status
						}}</span>
					</div>

					<div class="quick-actions">
						<button @click="handleQuickAction('install')" class="btn-action">
							📦 Install
						</button>
						<button @click="handleQuickAction('dev')" class="btn-action">🔥 Dev</button>
						<button @click="handleQuickAction('build')" class="btn-action">🔨 Build</button>
						<button @click="handleQuickAction('test')" class="btn-action">🧪 Test</button>
						<button @click="handleQuickAction('files')" class="btn-action">📂 Files</button>
						<button @click="handleQuickAction('ports')" class="btn-action">📍 Ports</button>
					</div>

					<Terminal :output="output" />

					<div class="command-input">
						<input
							v-model="commandInput"
							@keyup.enter="handleExecute"
							placeholder="Enter command..."
							class="input"
						/>
						<button @click="handleExecute" class="btn-primary">Run</button>
					</div>
				</div>
			</section>
		</main>

		<CreateContainerModal
			v-if="showCreateModal"
			@create="handleCreateContainer"
			@close="showCreateModal = false"
		/>
	</div>
</template>

<style scoped>
.app {
	min-height: 100vh;
	background: #0a0a0a;
	color: #fff;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem 2rem;
	background: #111;
	border-bottom: 1px solid #222;
}

.header h1 {
	margin: 0;
	font-size: 1.5rem;
}

.error-banner {
	padding: 1rem 2rem;
	background: #ff4444;
	color: white;
	text-align: center;
}

.main {
	display: flex;
	height: calc(100vh - 80px);
}

.sidebar {
	width: 300px;
	background: #111;
	border-right: 1px solid #222;
	padding: 1rem;
	overflow-y: auto;
}

.sidebar h2 {
	margin-top: 0;
	font-size: 1.2rem;
}

.loading {
	text-align: center;
	padding: 2rem;
	color: #888;
}

.containers-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.content {
	flex: 1;
	padding: 2rem;
	overflow-y: auto;
}

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #888;
	font-size: 1.2rem;
}

.container-view {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
}

.container-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 1rem;
	border-bottom: 1px solid #222;
}

.container-header h2 {
	margin: 0;
}

.status {
	padding: 0.25rem 0.75rem;
	border-radius: 4px;
	font-size: 0.875rem;
	font-weight: 500;
}

.status.running {
	background: #00ff00;
	color: #000;
}

.status.stopped {
	background: #ff4444;
}

.quick-actions {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.command-input {
	display: flex;
	gap: 0.5rem;
	margin-top: auto;
}

.input {
	flex: 1;
	padding: 0.75rem 1rem;
	background: #111;
	border: 1px solid #333;
	border-radius: 6px;
	color: #fff;
	font-family: 'Monaco', 'Courier New', monospace;
}

.input:focus {
	outline: none;
	border-color: #4a9eff;
}

.btn-primary {
	padding: 0.75rem 1.5rem;
	background: #4a9eff;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	transition: background 0.2s;
}

.btn-primary:hover {
	background: #357abd;
}

.btn-action {
	padding: 0.5rem 1rem;
	background: #222;
	color: white;
	border: 1px solid #333;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-action:hover {
	background: #333;
	border-color: #444;
}
</style>