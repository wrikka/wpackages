import type {
	SidebarPage,
	SidebarPageId,
} from "../../shared/types/sidebar-page";

const storageKey = "wterminal.desktop.sidebarPages";

type SidebarPagesState = {
	pages: SidebarPage[];
	activeId?: SidebarPageId;
};

function safeParseJson<T>(value: string | null): T | null {
	if (!value) return null;
	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
}

function createId(): SidebarPageId {
	return `pg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useSidebarPages() {
	const state = useState<SidebarPagesState>("sidebar-pages", () => ({
		pages: [],
	}));

	const isClient = typeof window !== "undefined";
	if (isClient) {
		onMounted(() => {
			const saved = safeParseJson<SidebarPagesState>(
				localStorage.getItem(storageKey),
			);
			if (saved?.pages?.length) {
				state.value = {
					pages: saved.pages,
					activeId: saved.activeId,
				};
			}
		});

		watch(
			state,
			(next: SidebarPagesState) => {
				localStorage.setItem(storageKey, JSON.stringify(next));
			},
			{ deep: true },
		);
	}

	const pages = computed(() => state.value.pages);
	const activeId = computed(() => state.value.activeId);

	function setActive(id?: SidebarPageId) {
		state.value.activeId = id;
	}

	function upsert(
		input: Omit<SidebarPage, "id" | "createdAt" | "updatedAt"> &
			Partial<Pick<SidebarPage, "id">>,
	) {
		const now = new Date().toISOString();

		if (!input.id) {
			const next: SidebarPage = {
				id: createId(),
				url: input.url,
				title: input.title,
				faviconUrl: input.faviconUrl,
				createdAt: now,
				updatedAt: now,
			};
			state.value.pages.unshift(next);
			state.value.activeId = next.id;
			return next;
		}

		const idx = state.value.pages.findIndex(
			(p: SidebarPage) => p.id === input.id,
		);
		if (idx === -1) {
			const next: SidebarPage = {
				id: input.id,
				url: input.url,
				title: input.title,
				faviconUrl: input.faviconUrl,
				createdAt: now,
				updatedAt: now,
			};
			state.value.pages.unshift(next);
			state.value.activeId = next.id;
			return next;
		}

		const current = state.value.pages[idx]!;
		const updated: SidebarPage = {
			...current,
			url: input.url,
			title: input.title,
			faviconUrl: input.faviconUrl,
			updatedAt: now,
		};

		state.value.pages.splice(idx, 1);
		state.value.pages.unshift(updated);
		state.value.activeId = updated.id;
		return updated;
	}

	function remove(id: SidebarPageId) {
		const idx = state.value.pages.findIndex((p: SidebarPage) => p.id === id);
		if (idx !== -1) state.value.pages.splice(idx, 1);
		if (state.value.activeId === id)
			state.value.activeId = state.value.pages[0]?.id;
	}

	return {
		pages,
		activeId,
		setActive,
		upsert,
		remove,
	};
}
