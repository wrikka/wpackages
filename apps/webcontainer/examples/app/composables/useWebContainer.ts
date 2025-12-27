import { ref } from "vue";

const API_BASE = "/api";

interface ContainerInfo {
	id: string;
	name: string;
	status: string;
	workdir: string;
	packageManager: string;
}

interface ExecuteResult {
	output: string;
	error?: string;
	exitCode: number;
	duration: number;
}

export function useWebContainer() {
	const containers = ref<ContainerInfo[]>([]);
	const activeContainerId = ref<string | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function fetchContainers() {
		loading.value = true;
		error.value = null;
		try {
			const res = await fetch(`${API_BASE}/containers`);
			const data = await res.json();
			if (data.success) {
				containers.value = data.data;
			}
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to fetch containers";
		} finally {
			loading.value = false;
		}
	}

	async function createContainer(name: string, workdir: string) {
		loading.value = true;
		error.value = null;
		try {
			const res = await fetch(`${API_BASE}/containers`, {
				body: JSON.stringify({ name, workdir }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = await res.json();
			if (data.success) {
				containers.value.push(data.data);
				activeContainerId.value = data.data.id;
			}
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to create container";
		} finally {
			loading.value = false;
		}
	}

	async function deleteContainer(id: string) {
		try {
			await fetch(`${API_BASE}/containers/${id}`, { method: "DELETE" });
			containers.value = containers.value.filter((c) => c.id !== id);
			if (activeContainerId.value === id) {
				activeContainerId.value = null;
			}
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to delete container";
		}
	}

	async function executeCommand(
		id: string,
		command: string,
	): Promise<ExecuteResult | null> {
		try {
			const res = await fetch(`${API_BASE}/containers/${id}/execute`, {
				body: JSON.stringify({ command }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = await res.json();
			return data.success ? data.data : null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to execute command";
			return null;
		}
	}

	async function installPackages(id: string, packages?: string[]) {
		try {
			const res = await fetch(`${API_BASE}/containers/${id}/install`, {
				body: JSON.stringify({ packages: packages || [] }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = await res.json();
			return data.success ? data.data : null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to install packages";
			return null;
		}
	}

	async function runScript(id: string, script: string) {
		try {
			const res = await fetch(`${API_BASE}/containers/${id}/script`, {
				body: JSON.stringify({ script }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = await res.json();
			return data.success ? data.data : null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to run script";
			return null;
		}
	}

	async function listFiles(id: string) {
		try {
			const res = await fetch(`${API_BASE}/containers/${id}/files`);
			const data = await res.json();
			return data.success ? data.data : [];
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to list files";
			return [];
		}
	}

	async function getPorts(id: string) {
		try {
			const res = await fetch(`${API_BASE}/containers/${id}/ports`);
			const data = await res.json();
			return data.success ? data.data : [];
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to get ports";
			return [];
		}
	}

	return {
		activeContainerId,
		containers,
		createContainer,
		deleteContainer,
		error,
		executeCommand,
		fetchContainers,
		getPorts,
		installPackages,
		listFiles,
		loading,
		runScript,
	};
}
