import type { TerminalBuffer } from "~/types";
import { createEmptyCell, TERMINAL_COLORS } from "~/constants/terminal";

export const useTerminalStore = defineStore("terminal", () => {
	const buffers = ref<Map<string, TerminalBuffer>>(new Map());
	const activeTerminalId = ref<string | null>(null);
	const cursorVisible = ref(true);

	const setBuffer = (id: string, buffer: TerminalBuffer) => {
		buffers.value.set(id, buffer);
	};

	const getBuffer = (id: string): TerminalBuffer | undefined => {
		return buffers.value.get(id);
	};

	const clearBuffer = (id: string) => {
		const buffer = buffers.value.get(id);
		if (buffer) {
			buffer.rows = buffer.rows.map((row) =>
				row.map(() =>
					createEmptyCell(
						TERMINAL_COLORS.DEFAULT_FG,
						TERMINAL_COLORS.DEFAULT_BG,
					),
				),
			);
			buffer.cursor = { x: 0, y: 0, visible: true };
		}
	};

	const removeBuffer = (id: string) => {
		buffers.value.delete(id);
	};

	const setActiveTerminal = (id: string | null) => {
		activeTerminalId.value = id;
	};

	const setCursorVisible = (visible: boolean) => {
		cursorVisible.value = visible;
	};

	return {
		buffers,
		activeTerminalId,
		cursorVisible,
		setBuffer,
		getBuffer,
		clearBuffer,
		removeBuffer,
		setActiveTerminal,
		setCursorVisible,
	};
});
