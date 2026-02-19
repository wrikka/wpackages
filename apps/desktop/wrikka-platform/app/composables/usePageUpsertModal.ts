import type { SidebarPage } from "../../shared/types/sidebar-page";

const modalOpen = ref(false);
const editing = ref<SidebarPage | undefined>(undefined);

export const usePageUpsertModal = () => {
	function open(initial?: SidebarPage) {
		editing.value = initial;
		modalOpen.value = true;
	}

	function close() {
		modalOpen.value = false;
		editing.value = undefined;
	}

	return {
		open,
		close,
		isOpen: computed(() => modalOpen.value),
		initial: computed(() => editing.value),
	};
};
