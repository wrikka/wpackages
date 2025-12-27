<template>
  <div class="marketplace-container flex">
    <!-- Sidebar -->
    <div class="sidebar w-64 border-r border-gray-200 dark:border-gray-800 h-screen p-4">
      <!-- Search Bar -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- Categories Section -->
      <h2 class="text-xl font-semibold mb-4">Categories</h2>
      <div class="space-y-2 mb-6">
        <div 
          v-for="category in categories" 
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'cursor-pointer p-2 rounded', 
            selectedCategory === category.id ? 
            'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          {{ category.name }}
        </div>
      </div>

      <!-- Tags Section -->
      <h2 class="text-xl font-semibold mb-4">Tags</h2>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="tag in tags" 
          :key="tag.id"
          @click="selectTag(tag.id)"
          :class="[
            'cursor-pointer px-3 py-1 rounded-full text-sm font-medium', 
            selectedTag === tag.id ? 
            'bg-primary text-white' : 
            'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          <span :class="['inline-block w-3 h-3 rounded-full mr-2', getTagColorClass(tag.colorKey)]"></span>
          {{ tag.name }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="content flex-1 p-6">
      <h1 class="text-2xl font-bold mb-6">{{ getCategoryName(selectedCategory) }}</h1>
      
      <div v-if="filteredItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="item in filteredItems" 
          :key="item.id"
          class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          @click="goToDetail(item.id)"
        >
          <div class="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div class="i-mdi-package text-4xl text-gray-400"></div>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-lg mb-1">{{ item.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ item.description }}</p>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-500">
              <div class="i-mdi-download mr-1"></div>
              <span>{{ item.downloads }} downloads</span>
              <div class="i-mdi-star ml-3 mr-1"></div>
              <span>{{ item.stars }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center p-10 text-center">
        <div class="i-mdi-package-variant text-6xl text-gray-300 dark:text-gray-700 mb-4"></div>
        <p class="text-lg text-gray-500 dark:text-gray-400">No items found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute, useData } from "vitepress";

interface Category {
	id: string;
	name: string;
}

interface Tag {
	id: string;
	name: string;
	colorKey: string;
}

interface Item {
	id: string;
	categoryId: string;
	name: string;
	description: string;
	downloads: number;
	stars: number;
	tags: string[];
}

const router = useRouter();
const route = useRoute();
const { theme } = useData();
const selectedCategory = ref<string>("ui");
const selectedTag = ref<string | null>(null);
const searchQuery = ref<string>("");

// Mock data for categories
const categories: Category[] = [
	{ id: "ui", name: "UI Components" },
	{ id: "mcp", name: "MCP Solutions" },
	{ id: "function", name: "Functions" },
	{ id: "template", name: "Templates" },
];

// Mock data for tags with VitePress theme colors
const tags: Tag[] = [
	{ id: "billing", name: "billing", colorKey: "pink" },
	{ id: "marketing", name: "marketing", colorKey: "teal" },
	{ id: "metrics", name: "metrics", colorKey: "blue" },
	{ id: "product", name: "product", colorKey: "yellow" },
	{ id: "sales", name: "sales", colorKey: "orange" },
	{ id: "utils", name: "utils", colorKey: "gray" },
];

const items: Item[] = [
	{
		id: "ui-1",
		categoryId: "ui",
		name: "Button Collection",
		description: "Button set for general use",
		downloads: 1250,
		stars: 4.8,
		tags: ["product", "utils"],
	},
	{
		id: "ui-2",
		categoryId: "ui",
		name: "Form Elements",
		description: "Components for forms",
		downloads: 980,
		stars: 4.5,
		tags: ["product"],
	},
	{
		id: "ui-3",
		categoryId: "ui",
		name: "Navigation Bar",
		description: "Customizable navigation bar",
		downloads: 1500,
		stars: 4.7,
		tags: ["utils"],
	},
	{
		id: "ui-4",
		categoryId: "ui",
		name: "Card Components",
		description: "Multiple data display cards",
		downloads: 850,
		stars: 4.2,
		tags: ["product"],
	},
	{
		id: "ui-5",
		categoryId: "ui",
		name: "Modal Dialogs",
		description: "Various modal window styles",
		downloads: 1100,
		stars: 4.6,
		tags: ["utils"],
	},
	{
		id: "mcp-1",
		categoryId: "mcp",
		name: "Payment Gateway",
		description: "Payment system integration",
		downloads: 780,
		stars: 4.4,
		tags: ["billing"],
	},
	{
		id: "mcp-2",
		categoryId: "mcp",
		name: "Authentication",
		description: "Identity verification system",
		downloads: 1300,
		stars: 4.9,
		tags: ["product"],
	},
	{
		id: "mcp-3",
		categoryId: "mcp",
		name: "CRM Integration",
		description: "Connect with CRM systems",
		downloads: 650,
		stars: 4.0,
		tags: ["sales", "marketing"],
	},
	{
		id: "function-1",
		categoryId: "function",
		name: "Date Formatter",
		description: "Format dates",
		downloads: 920,
		stars: 4.3,
		tags: ["utils"],
	},
	{
		id: "function-2",
		categoryId: "function",
		name: "Data Validator",
		description: "Validate data",
		downloads: 870,
		stars: 4.5,
		tags: ["utils"],
	},
	{
		id: "function-3",
		categoryId: "function",
		name: "Currency Helper",
		description: "Currency related helper functions",
		downloads: 750,
		stars: 4.2,
		tags: ["billing", "metrics"],
	},
];

const filteredItems = computed(() =>
	items
		.filter((item) =>
			selectedCategory.value
				? item.categoryId === selectedCategory.value
				: true,
		)
		.filter((item) =>
			selectedTag.value ? item.tags?.includes(selectedTag.value) : true,
		)
		.filter((item) => {
			if (!searchQuery.value) return true;
			const query = searchQuery.value.toLowerCase();
			return (
				item.name.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query)
			);
		}),
);

const getTagColorClass = (colorKey: string): string =>
	`bg-${colorKey}-500 dark:bg-${colorKey}-500`;

const updateQueryParams = (): void => {
	const params = new URLSearchParams();

	if (selectedCategory.value) {
		params.set("category", selectedCategory.value);
	}

	if (selectedTag.value) {
		params.set("tag", selectedTag.value);
	}

	const newUrl =
		window.location.pathname +
		(params.toString() ? `?${params.toString()}` : "");
	window.history.pushState({}, "", newUrl);
};

const selectCategory = (categoryId: string): void => {
	selectedCategory.value = categoryId;
	updateQueryParams();
};

const selectTag = (tagId: string): void => {
	selectedTag.value = tagId === selectedTag.value ? null : tagId;
	updateQueryParams();
};

const getCategoryName = (categoryId: string): string => {
	const category = categories.find((cat) => cat.id === categoryId);
	return category ? category.name : "";
};

const goToDetail = (itemId: string): void => {
	router.go(`/marketplace/${itemId}`);
};

// Read initial filters from URL on mount
onMounted(() => {
	const urlParams = new URLSearchParams(window.location.search);
	const categoryParam = urlParams.get("category");
	const tagParam = urlParams.get("tag");

	if (categoryParam) selectedCategory.value = categoryParam;
	if (tagParam) selectedTag.value = tagParam;
});

// Update URL when filters change
watch([selectedCategory, selectedTag], updateQueryParams);
</script>