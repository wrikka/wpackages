import type { Pane } from "~/types";

export const usePaneStore = defineStore("pane", () => {
	const panes = ref<Pane[]>([]);
	const activePaneId = ref<string | null>(null);
	const rootPaneId = ref<string | null>(null);

	const createPane = (parentId: string | null): string => {
		const id = crypto.randomUUID();
		const newPane: Pane = {
			id,
			parentId,
			children: [],
			splitDirection: null,
			splitRatio: 0.5,
			terminalId: null,
			active: false,
		};
		panes.value.push(newPane);

		if (!parentId) {
			rootPaneId.value = id;
		} else {
			const parent = panes.value.find((p) => p.id === parentId);
			if (parent) {
				parent.children.push(id);
			}
		}

		return id;
	};

	const closePane = (id: string) => {
		const pane = panes.value.find((p) => p.id === id);
		if (!pane) return;

		if (pane.parentId) {
			const parent = panes.value.find((p) => p.id === pane.parentId);
			if (parent) {
				parent.children = parent.children.filter((c) => c !== id);
			}
		}

		const index = panes.value.findIndex((p) => p.id === id);
		panes.value.splice(index, 1);

		if (rootPaneId.value === id) {
			rootPaneId.value = null;
		}
	};

	const splitPane = (
		id: string,
		direction: "horizontal" | "vertical",
	): string => {
		const pane = panes.value.find((p) => p.id === id);
		if (!pane) return "";

		const newPaneId = createPane(pane.parentId);
		const newPane = panes.value.find((p) => p.id === newPaneId);
		if (!newPane) return "";

		pane.splitDirection = direction;
		pane.children = [id, newPaneId];

		return newPaneId;
	};

	const resizePane = (id: string, ratio: number) => {
		const pane = panes.value.find((p) => p.id === id);
		if (pane) {
			pane.splitRatio = Math.max(0.1, Math.min(0.9, ratio));
		}
	};

	const focusPane = (id: string) => {
		panes.value.forEach((p) => (p.active = false));
		const pane = panes.value.find((p) => p.id === id);
		if (pane) {
			pane.active = true;
			activePaneId.value = id;
		}
	};

	const getPane = (id: string): Pane | undefined => {
		return panes.value.find((p) => p.id === id);
	};

	const getPaneChildren = (id: string): Pane[] => {
		const pane = panes.value.find((p) => p.id === id);
		if (!pane) return [];
		return pane.children
			.map((childId) => getPane(childId))
			.filter(Boolean) as Pane[];
	};

	const isLeafPane = (id: string): boolean => {
		const pane = panes.value.find((p) => p.id === id);
		return pane ? pane.children.length === 0 : false;
	};

	return {
		panes,
		activePaneId,
		rootPaneId,
		createPane,
		closePane,
		splitPane,
		resizePane,
		focusPane,
		getPane,
		getPaneChildren,
		isLeafPane,
	};
});
