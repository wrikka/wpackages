import { TERMINAL_DEFAULTS, createEmptyBuffer } from "~/constants/terminal";

export const useTerminal = (id: string) => {
	const terminalStore = useTerminalStore();
	const ptyId = ref<string | null>(null);
	const isConnected = ref(false);

	onMounted(async () => {
		try {
			// TODO: Connect to PTY service
			const result = await $fetch<{ success: boolean; data: string }>(
				"/api/pty/create",
				{
					method: "POST",
					body: { cols: TERMINAL_DEFAULTS.COLS, rows: TERMINAL_DEFAULTS.ROWS },
				},
			);

			if (result.success && result.data) {
				ptyId.value = result.data;
				isConnected.value = true;

				terminalStore.setBuffer(
					id,
					createEmptyBuffer(TERMINAL_DEFAULTS.COLS, TERMINAL_DEFAULTS.ROWS),
				);
			}
		} catch (error) {
			console.error("Failed to initialize PTY:", error);
		}
	});

	const write = async (data: string) => {
		if (!ptyId.value) return;
		try {
			await $fetch(`/api/pty/${ptyId.value}/write`, {
				method: "POST",
				body: { data },
			});
			return true;
		} catch (error) {
			console.error("Failed to write to PTY:", error);
			return false;
		}
	};

	const resize = async (cols: number, rows: number) => {
		if (!ptyId.value) return;
		try {
			await $fetch(`/api/pty/${ptyId.value}/resize`, {
				method: "POST",
				body: { cols, rows },
			});
			return true;
		} catch (error) {
			console.error("Failed to resize PTY:", error);
			return false;
		}
	};

	onUnmounted(() => {
		if (ptyId.value) {
			$fetch(`/api/pty/${ptyId.value}/close`, { method: "POST" }).catch(
				console.error,
			);
		}
	});

	return {
		ptyId,
		isConnected,
		buffer: computed(() => terminalStore.getBuffer(id)),
		write,
		resize,
	};
};
