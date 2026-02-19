import type { Tab } from "~/types";

export const useTabStore = defineStore("tab", () => {
	const tabs = ref<Tab[]>([]);
	const activeTabId = ref<string | null>(null);

	const createTab = (paneId: string): string => {
		const id = crypto.randomUUID();
		const newTab: Tab = {
			id,
			title: "New Tab",
			active: false,
			paneId,
			metadata: {},
		};
		tabs.value.push(newTab);
		activeTabId.value = id;
		return id;
	};

	const closeTab = (id: string) => {
		const index = tabs.value.findIndex((t) => t.id === id);
		if (index !== -1) {
			tabs.value.splice(index, 1);
			if (activeTabId.value === id) {
				activeTabId.value = tabs.value[Math.max(0, index - 1)]?.id || null;
			}
		}
	};

	const switchTab = (id: string) => {
		const tab = tabs.value.find((t) => t.id === id);
		if (tab) {
			tabs.value.forEach((t) => (t.active = false));
			tab.active = true;
			activeTabId.value = id;
		}
	};

	const setActiveTab = (id: string) => {
		activeTabId.value = id;
	};

	const renameTab = (id: string, title: string) => {
		const tab = tabs.value.find((t) => t.id === id);
		if (tab) {
			tab.title = title;
		}
	};

	const moveTab = (fromIndex: number, toIndex: number) => {
		const [tab] = tabs.value.splice(fromIndex, 1);
		tabs.value.splice(toIndex, 0, tab);
	};

	const setTabMetadata = (id: string, metadata: Record<string, unknown>) => {
		const tab = tabs.value.find((t) => t.id === id);
		if (tab) {
			tab.metadata = { ...tab.metadata, ...metadata };
		}
	};

	const getTab = (id: string): Tab | undefined => {
		return tabs.value.find((t) => t.id === id);
	};

	return {
		tabs,
		activeTabId,
		createTab,
		closeTab,
		switchTab,
		setActiveTab,
		renameTab,
		moveTab,
		setTabMetadata,
		getTab,
	};
});
