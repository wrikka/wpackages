export const useHotkeys = (
	hotkeys: Array<{
		key: string;
		ctrl?: boolean;
		shift?: boolean;
		alt?: boolean;
		meta?: boolean;
		action: () => void;
		preventDefault?: boolean;
	}>,
) => {
	const handleKeyDown = (e: KeyboardEvent) => {
		for (const hotkey of hotkeys) {
			const match =
				e.key.toLowerCase() === hotkey.key.toLowerCase() &&
				(hotkey.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey) &&
				(hotkey.shift ? e.shiftKey : !e.shiftKey) &&
				(hotkey.alt ? e.altKey : !e.altKey) &&
				(hotkey.meta ? e.metaKey : !e.metaKey);

			if (match) {
				if (hotkey.preventDefault) {
					e.preventDefault();
				}
				hotkey.action();
				break;
			}
		}
	};

	onMounted(() => {
		window.addEventListener("keydown", handleKeyDown);
	});

	onUnmounted(() => {
		window.removeEventListener("keydown", handleKeyDown);
	});
};
