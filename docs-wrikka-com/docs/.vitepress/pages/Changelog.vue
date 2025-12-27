<script setup lang="ts">
import { ref, computed } from "vue";
import { useData } from "vitepress";

interface Tab {
	id: string;
	label: string;
}

interface Change {
	type: "feature" | "fix" | "improvement" | "chore";
	description: string;
}

interface Release {
	version: string;
	date: string;
	type: "major" | "minor" | "patch";
	changes: Change[];
}

interface Commit {
	hash: string;
	date: string;
	author: string;
	message: string;
	files: string[];
}

interface Contributor {
	id: number;
	name: string;
	role: string;
	avatar: string;
	contributions: number;
}

const { isDark } = useData();
const activeTab = ref<string>("releases");

const tabs: Tab[] = [
	{ id: "releases", label: "Releases" },
	{ id: "commits", label: "Commits" },
	{ id: "contributors", label: "Contributors" },
];

// Mock data for releases
const releases: Release[] = [
	{
		version: "v1.2.0",
		date: "2023-10-15",
		type: "minor",
		changes: [
			{ type: "feature", description: "Added new Dropdown component" },
			{ type: "feature", description: "Implemented dark mode support" },
			{ type: "fix", description: "Fixed button hover state in Safari" },
		],
	},
	{
		version: "v1.1.2",
		date: "2023-09-22",
		type: "patch",
		changes: [
			{ type: "fix", description: "Fixed modal close animation" },
			{ type: "chore", description: "Updated dependencies" },
		],
	},
	{
		version: "v1.1.0",
		date: "2023-08-15",
		type: "minor",
		changes: [
			{ type: "feature", description: "Added Table component" },
			{ type: "improvement", description: "Enhanced form validation" },
			{ type: "fix", description: "Fixed sidebar navigation on mobile" },
		],
	},
];

// Mock data for commits
const commits: Commit[] = [
	{
		hash: "a1b2c3d",
		date: "2023-10-14",
		author: "Jane Doe",
		message: "feat: add dropdown component",
		files: [
			"packages/components/src/Dropdown/Dropdown.vue",
			"packages/components/src/index.ts",
		],
	},
	{
		hash: "e4f5g6h",
		date: "2023-10-12",
		author: "John Smith",
		message: "fix: button hover state in Safari",
		files: [
			"packages/components/src/Button/Button.vue",
			"packages/components/src/Button/Button.css",
		],
	},
	{
		hash: "i7j8k9l",
		date: "2023-10-10",
		author: "Alex Johnson",
		message: "docs: update component documentation",
		files: ["docs/components/button.md", "docs/components/modal.md"],
	},
];

// Mock data for contributors
const contributors: Contributor[] = [
	{
		id: 1,
		name: "Jane Doe",
		role: "Lead Developer",
		avatar: "https://randomuser.me/api/portraits/women/1.jpg",
		contributions: 156,
	},
	{
		id: 2,
		name: "John Smith",
		role: "UI Designer",
		avatar: "https://randomuser.me/api/portraits/men/1.jpg",
		contributions: 89,
	},
	{
		id: 3,
		name: "Alex Johnson",
		role: "Documentation",
		avatar: "https://randomuser.me/api/portraits/women/2.jpg",
		contributions: 42,
	},
];

const setActiveTab = (tabId: string) => {
	activeTab.value = tabId;
};

const getTabClass = (tabId: string) => [
	"py-3 px-6 transition-all duration-200 font-medium cursor-pointer relative",
	{
		"text-brand font-semibold": activeTab.value === tabId,
		"text-text-secondary hover:text-text": activeTab.value !== tabId,
	},
];

const getReleaseTypeClass = (type: string) => [
	"px-2.5 py-1 rounded-full text-xs font-medium",
	{
		"bg-blue-100 text-blue-600": type === "minor",
		"bg-red-100 text-red-600": type === "major",
		"bg-green-100 text-green-600": type === "patch",
	},
];

const getChangeTypeClass = (type: string) => [
	"inline-block py-1 px-2.5 rounded-md text-xs font-medium mr-2",
	{
		"bg-blue-100 text-blue-600": type === "feature",
		"bg-red-100 text-red-600": type === "fix",
		"bg-amber-100 text-amber-700": type === "improvement",
		"bg-gray-100 text-gray-600": type === "chore",
	},
];

const activeContent = computed(() => {
	return activeTab.value;
});
</script>

<template>
  <div class="my-8 max-w-4xl mx-auto">
    <!-- Tab navigation -->
    <div class="flex border-b border-gray mb-8 relative">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        :class="[
          'py-3 px-6 transition-all duration-200 font-medium cursor-pointer relative',
          activeTab === tab.id 
            ? 'text-brand font-semibold' 
            : 'text-text-secondary hover:text-text'
        ]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
        <div 
          v-if="activeTab === tab.id" 
          class="absolute bottom-0 left-0 w-full h-0.5 bg-brand transition-all duration-300"
        ></div>
      </button>
    </div>

    <!-- Tab content -->
    <div class="transition-all duration-300">
      <!-- Releases tab -->
      <div v-if="activeContent === 'releases'">
        <div 
          v-for="release in releases" 
          :key="release.version" 
          class="mb-10 pb-8 border-b border-gray last:border-0"
        >
          <div class="flex flex-wrap items-center gap-4 mb-6">
            <h2 class="m-0 text-2xl font-bold text-text">{{ release.version }}</h2>
            <span class="text-text-secondary flex items-center">
              <div class="i-mdi-calendar w-4 h-4 mr-1.5"></div>
              {{ release.date }}
            </span>
            <span :class="[
              'px-2.5 py-1 rounded-full text-xs font-medium',
              release.type === 'minor' ? 'bg-blue-100 text-blue-600' :
              release.type === 'major' ? 'bg-red-100 text-red-600' :
              'bg-green-100 text-green-600'
            ]">
              {{ release.type }}
            </span>
          </div>
          <div>
            <ul class="space-y-4 pl-0 list-none">
              <li 
                v-for="(change, index) in release.changes" 
                :key="index"
                class="flex items-start p-3 rounded-lg transition-colors hover:bg-gray-100"
              >
                <span :class="[
                  'inline-block py-1 px-2.5 rounded-md text-xs font-medium mr-2',
                  change.type === 'feature' ? 'bg-blue-100 text-blue-600' :
                  change.type === 'fix' ? 'bg-red-100 text-red-600' :
                  change.type === 'improvement' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                ]">
                  {{ change.type }}
                </span>
                <span class="text-text">{{ change.description }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Commits tab -->
      <div v-else-if="activeContent === 'commits'">
        <div 
          v-for="commit in commits" 
          :key="commit.hash" 
          class="mb-6 p-5 border border-gray rounded-xl bg-background-block hover:shadow-md transition-all duration-200"
        >
          <div class="flex flex-wrap justify-between mb-3 text-sm gap-3">
            <span class="font-mono text-text bg-gray-100 px-2 py-1 rounded">{{ commit.hash }}</span>
            <span class="text-text-secondary flex items-center">
              <div class="i-mdi-calendar w-4 h-4 mr-1.5"></div>
              {{ commit.date }}
            </span>
            <span class="text-text-secondary flex items-center">
              <div class="i-mdi-account w-4 h-4 mr-1.5"></div>
              {{ commit.author }}
            </span>
          </div>
          <div class="font-medium mb-3 text-text">{{ commit.message }}</div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(file, index) in commit.files" 
              :key="index" 
              class="text-xs py-1.5 px-3 bg-gray-100 rounded-full text-text-secondary"
            >
              {{ file }}
            </span>
          </div>
        </div>
      </div>

      <!-- Contributors tab -->
      <div v-else-if="activeContent === 'contributors'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="contributor in contributors" 
          :key="contributor.id" 
          class="flex items-center p-5 border border-gray rounded-xl bg-background-block hover:shadow-md transition-all duration-200"
        >
          <img 
            :src="contributor.avatar" 
            :alt="contributor.name" 
            class="w-16 h-16 rounded-full object-cover mr-4 border-2 border-brand"
          >
          <div>
            <h3 class="m-0 mb-1 font-bold text-lg text-text">{{ contributor.name }}</h3>
            <p class="m-0 mb-2 text-text-secondary text-sm">{{ contributor.role }}</p>
            <div class="flex items-center text-sm text-brand font-medium">
              <div class="i-mdi-check-circle w-4 h-4 mr-1.5"></div>
              {{ contributor.contributions }} contributions
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
