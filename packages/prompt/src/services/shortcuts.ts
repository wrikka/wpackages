import type { ShortcutContext, ShortcutOptions } from "../types/shortcuts";

export const createShortcutContext = (
	options: ShortcutOptions,
): ShortcutContext => {
	const { shortcuts, allowCustom: _allowCustom = false, showHelp: _showHelp = true, helpKey: _helpKey = "?" } = options;

	const active = true;
	const available = shortcuts;

	const execute = async (key: string): Promise<boolean> => {
		const shortcut = shortcuts.find((s) => s.key === key);
		if (shortcut) {
			if (shortcut.handler) {
				await shortcut.handler();
			}
			return true;
		}
		return false;
	};

	return {
		active,
		available,
		execute,
	};
};
