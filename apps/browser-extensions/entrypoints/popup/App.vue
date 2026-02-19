<script setup lang="ts">

import { ref, onMounted } from "vue";
import Button from "@/components/ui/button.vue";
import { useToast } from "@/composables/useToast";
import {
	MessageSquare,
	FileText,
	Zap,
	Settings,
	Activity,
	Keyboard,
	Sparkles,
	PanelRight,
} from "lucide-vue-next";

const { success, error } = useToast();
const recentActivity = ref<number>(0);

interface QuickAction {
	id: string;
	title: string;
	description: string;
	icon: any;
	action: () => void;
	shortcut?: string;
}

const quickActions: QuickAction[] = [
	{
		id: "summarize",
		title: "Summarize Page",
		description: "Get AI summary of current page",
		icon: FileText,
		action: async () => {
			try {
				const window = await browser.windows.getCurrent();
				if (window.id) {
					browser.sidePanel.open({ windowId: window.id });
					success("Opened sidebar", "Click 'Summarize Page' to get started");
				}
			} catch (err) {
				error(
					"Failed to open sidebar",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		},
		shortcut: "Alt+S",
	},
	{
		id: "ask-ai",
		title: "Ask AI",
		description: "Ask AI about selected text",
		icon: MessageSquare,
		action: async () => {
			try {
				const window = await browser.windows.getCurrent();
				if (window.id) {
					browser.sidePanel.open({ windowId: window.id });
					success("Opened sidebar", "Select text and click 'Ask AI'");
				}
			} catch (err) {
				error(
					"Failed to open sidebar",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		},
		shortcut: "Alt+A",
	},
	{
		id: "workflow",
		title: "Record Workflow",
		description: "Create automation workflow",
		icon: Zap,
		action: async () => {
			try {
				const window = await browser.windows.getCurrent();
				if (window.id) {
					browser.sidePanel.open({ windowId: window.id });
					success("Opened sidebar", "Go to Tools tab to create workflows");
				}
			} catch (err) {
				error(
					"Failed to open sidebar",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		},
	},
	{
		id: "settings",
		title: "Settings",
		description: "Configure extension settings",
		icon: Settings,
		action: async () => {
			try {
				const window = await browser.windows.getCurrent();
				if (window.id) {
					browser.sidePanel.open({ windowId: window.id });
					success("Opened sidebar", "Go to Tools tab to access settings");
				}
			} catch (err) {
				error(
					"Failed to open sidebar",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		},
	},
];

onMounted(async () => {
	try {
		const data = await browser.storage.local.get("recentActivity");
		recentActivity.value = (data.recentActivity as number) || 0;
	} catch (err) {
		console.error("Failed to load recent activity:", err);
		recentActivity.value = 0;
	}
});

function handleAction(action: QuickAction) {
	action.action();
}

async function openSidebar() {
	try {
		const window = await browser.windows.getCurrent();
		if (window.id) {
			browser.sidePanel.open({ windowId: window.id });
		}
	} catch (err) {
		error(
			"Failed to open sidebar",
			err instanceof Error ? err.message : "Unknown error",
		);
	}
}

</script>

<template>

	<div class="min-w-[320px] max-w-[400px] bg-background text-foreground animate-scale-in">
		<div class="p-4 border-b">
			<div class="flex items-center gap-3">
				<div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
					<Sparkles class="h-5 w-5 text-primary-foreground" />
				</div>
				<div class="flex-1">
					<h1 class="text-lg font-bold">Wai AI Extension</h1>
					<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Activity class="h-3 w-3" />
						<span>{{ recentActivity }} actions today</span>
					</div>
				</div>
			</div>
		</div>

		<div class="p-4 grid grid-cols-2 gap-3">
			<button
				v-for="action in quickActions"
				:key="action.id"
				class="group relative p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 text-left"
				@click="handleAction(action)"
			>
				<div class="flex items-start justify-between mb-2">
					<div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
						<component :is="action.icon" class="h-4 w-4 text-primary" />
					</div>
					<kbd
						v-if="action.shortcut"
						class="hidden group-hover:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground"
					>
						<Keyboard class="h-3 w-3" />
						{{ action.shortcut }}
					</kbd>
				</div>
				<div>
					<h3 class="font-semibold text-sm mb-0.5">{{ action.title }}</h3>
					<p class="text-xs text-muted-foreground line-clamp-2">{{ action.description }}</p>
				</div>
			</button>
		</div>

		<div class="p-4 pt-0">
			<Button
				variant="default"
				class="w-full btn-primary"
				@click="openSidebar"
			>
				<PanelRight class="h-4 w-4" />
				<span class="ml-2">Open Full Sidebar</span>
			</Button>
		</div>
	</div>

</template>

<style scoped>

.container {
	font-family: system-ui, -apple-system, sans-serif;
}

.animate-scale-in {
	animation: scale-in 0.3s ease-in-out;
}

@keyframes scale-in {
	0% {
		transform: scale(0.5);
		opacity: 0;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

</style>