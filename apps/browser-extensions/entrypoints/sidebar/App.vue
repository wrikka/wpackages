<script setup lang="ts">

import { ref, computed } from "vue";
import ChatTab from "@/components/shared/ChatTab.vue";
import SummaryTab from "@/components/shared/SummaryTab.vue";
import ToolsTab from "@/components/shared/ToolsTab.vue";
import Tabs from "@/components/ui/tabs.vue";
import { useStorage } from "@/composables/useStorage";
import { useBookmarks } from "@/composables/useBookmarks";
import { MessageSquare, FileText, Wrench } from "lucide-vue-next";
import type { SummaryLength } from "@/types";

const activeTab = ref("chat");
const inputMessage = ref("");

const tabs = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "tools", label: "Tools", icon: Wrench },
];

const activeTabIndex = computed(() => tabs.findIndex(t => t.id === activeTab.value));

const {
	pageContent,
	chatMessages,
	bookmarks,
	notes,
	customPrompts,
	saveChatHistory,
	saveBookmarks,
	saveNotes,
	saveCustomPrompts,
	clearPageContent,
	setPageContent,
} = useStorage();

const { addBookmark, removeBookmark } = useBookmarks(bookmarks, saveBookmarks);

const handleSearch = async (query: string) => {
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
	if (tab?.id) {
		browser.tabs.sendMessage(tab.id, { action: "search-page", query });
	}
};

const handleSummarize = async () => {
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
	if (tab?.id) {
		const response = await browser.tabs.sendMessage(tab.id, {
			action: "get-page-content",
		});
		if (response?.content) {
			await setPageContent(response.content);
		}
	}
};

const summarizePage = async (length: SummaryLength) => {
	if (!pageContent.value) return;

	const lengthPrompt = {
		short: "Provide a brief summary in 2-3 sentences.",
		medium: "Provide a detailed summary with key points.",
		long: "Provide a comprehensive summary covering all important aspects.",
	};

	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
	if (tab?.id) {
		browser.tabs.sendMessage(tab.id, {
			action: "send-message",
			message: `${lengthPrompt[length]}\n\nContent to summarize:\n${pageContent.value.slice(0, 5000)}`,
		});
		activeTab.value = "chat";
	}
};

</script>

<template>

  <div class="flex flex-col h-screen bg-background text-foreground animate-fade-in">
    <Tabs v-model="activeTab" class="flex-1 flex flex-col">
      <div class="grid w-full grid-cols-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'px-4 py-3 text-sm font-medium transition-all duration-200 relative',
            activeTab === tab.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          ]"
          @click="activeTab = tab.id"
        >
          <div class="flex items-center justify-center gap-2">
            <component :is="tab.icon" class="h-4 w-4" />
            <span>{{ tab.label }}</span>
          </div>
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-slide-in"
          />
        </button>
      </div>
      
      <div v-if="activeTab === 'chat'" class="flex-1">
        <ChatTab
          :chat-messages="chatMessages"
          :save-chat-history="saveChatHistory"
          :input-message="inputMessage"
        />
      </div>
      
      <div v-if="activeTab === 'summary'" class="flex-1">
        <SummaryTab
          :page-content="pageContent"
          @summarize="summarizePage"
          @clear="clearPageContent"
        />
      </div>
      
      <div v-if="activeTab === 'tools'" class="flex-1">
        <ToolsTab
          :bookmarks="bookmarks"
          :notes="notes"
          :custom-prompts="customPrompts"
          :save-bookmarks="saveBookmarks"
          :save-notes="saveNotes"
          :save-custom-prompts="saveCustomPrompts"
          :input-message="inputMessage"
          :active-tab="activeTab"
          @add-bookmark="addBookmark"
          @remove-bookmark="removeBookmark"
        />
      </div>
    </Tabs>
  </div>

</template>

<style>

body {
  margin: 0;
}

.prose {
  color: inherit;
}

.prose p {
  margin-bottom: 0.5rem;
}

.prose ul, .prose ol {
  margin-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.prose pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose pre code {
  background: none;
  padding: 0;
}

</style>