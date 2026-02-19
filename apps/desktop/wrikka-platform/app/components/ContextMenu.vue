<script setup lang="ts">

export type ContextMenuItem = {
	id: string;
	label: string;
};

const props = defineProps<{
	open: boolean;
	x: number;
	y: number;
	items: ContextMenuItem[];
}>();

const emit = defineEmits<{
	(e: "select", id: string): void;
	(e: "close"): void;
}>();

const menuRef = ref<HTMLElement | null>(null);

function onOutsidePointerDown(ev: MouseEvent) {
	if (!props.open) return;
	if (!menuRef.value) return;
	if (menuRef.value.contains(ev.target as Node)) return;
	emit("close");
}

onMounted(() => {
	window.addEventListener("mousedown", onOutsidePointerDown);
});

onBeforeUnmount(() => {
	window.removeEventListener("mousedown", onOutsidePointerDown);
});

</script>

<template>

  <Teleport to="body">
    <div v-if="props.open" class="fixed inset-0 z-50" @contextmenu.prevent>
      <div
        ref="menuRef"
        class="absolute min-w-44 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/95 p-1 text-sm text-slate-200 shadow-xl backdrop-blur"
        :style="{ left: `${props.x}px`, top: `${props.y}px` }"
      >
        <button
          v-for="it in props.items"
          :key="it.id"
          class="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-900"
          @click="$emit('select', it.id)"
        >
          {{ it.label }}
        </button>
      </div>
    </div>
  </Teleport>

</template>