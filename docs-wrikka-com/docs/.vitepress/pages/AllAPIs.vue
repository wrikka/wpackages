

<script setup lang="ts">
import { useRouter } from "vitepress";
import { ref, computed } from "vue";

interface ApiItem {
	id: number;
	title: string;
	excerpt: string;
	slug: string;
	category: "components" | "composables" | "packages";
	tags?: string[];
}

const router = useRouter();
const selectedCategory = ref("");
const selectedTag = ref("");

const apis = ref<ApiItem[]>([
	{
		id: 1,
		title: "Button",
		excerpt: "A versatile button component with various styles and states.",
		slug: "button",
		category: "components",
		tags: ["UI", "Interactive", "Form"],
	},
	{
		id: 2,
		title: "Modal",
		excerpt: "Create accessible modal dialogs with customizable content.",
		slug: "modal",
		category: "components",
		tags: ["UI", "Overlay", "Dialog"],
	},
	{
		id: 3,
		title: "useForm",
		excerpt: "A composable for form handling with validation and submission.",
		slug: "use-form",
		category: "composables",
		tags: ["Form", "Validation", "State"],
	},
	{
		id: 4,
		title: "useStorage",
		excerpt: "Reactive wrapper for localStorage and sessionStorage.",
		slug: "use-storage",
		category: "composables",
		tags: ["Storage", "State", "Persistence"],
	},
	{
		id: 5,
		title: "@mylib/core",
		excerpt: "Core utilities and shared functions for the library.",
		slug: "core-package",
		category: "packages",
		tags: ["Core", "Utilities"],
	},
	{
		id: 6,
		title: "@mylib/icons",
		excerpt: "Icon pack with various styles and customization options.",
		slug: "icons-package",
		category: "packages",
		tags: ["UI", "Icons", "SVG"],
	},
]);

// Computed Properties
const categories = computed(() => {
	const allCategories = apis.value.map((api) => api.category);
	return [...new Set(allCategories)];
});

const allTags = computed(() => {
	const tags = apis.value.flatMap((api) => api.tags || []);
	return [...new Set(tags)];
});

const filteredApis = computed(() => {
	const filtered = apis.value.filter((api) => {
		const matchesCategory =
			!selectedCategory.value || api.category === selectedCategory.value;
		const matchesTag =
			!selectedTag.value || (api.tags || []).includes(selectedTag.value);

		return matchesCategory && matchesTag;
	});

	return {
		components: filtered.filter((api) => api.category === "components"),
		composables: filtered.filter((api) => api.category === "composables"),
		packages: filtered.filter((api) => api.category === "packages"),
	};
});

const navigateToApi = (slug: string): void => {
	router.go(`/api/${slug}`);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Filter Controls -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-text">API Documentation</h1>
      
      <div class="flex space-x-4">
        <select 
          v-model="selectedCategory" 
          class="px-3 py-2 bg-background-block border border-gray-200 rounded-md text-sm"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        
        <select 
          v-model="selectedTag" 
          class="px-3 py-2 bg-background-block border border-gray-200 rounded-md text-sm"
        >
          <option value="">All Tags</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>
    </div>

    <!-- API Categories -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Components Card -->
      <div class="bg-background-block border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold mb-4 text-text flex items-center">
          <div class="i-mdi-puzzle-outline w-5 h-5 mr-2 text-brand"></div>
          Components
        </h2>
        <div class="border-t border-gray-100 pt-4">
          <ul class="space-y-3">
            <li v-for="api in filteredApis.components" :key="api.id" 
                class="hover:bg-gray-50 p-2 rounded cursor-pointer"
                @click="navigateToApi(api.slug)">
              <div class="flex justify-between items-center">
                <span class="font-medium text-text">{{ api.title }}</span>
                <div class="i-mdi-chevron-right w-5 h-5 text-gray-400"></div>
              </div>
              <p class="text-sm text-text-secondary mt-1 line-clamp-2">{{ api.excerpt }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <span v-for="tag in api.tags" :key="tag"
                  class="px-2 py-0.5 text-xs bg-gray-100 text-text-secondary rounded-full">
                  {{ tag }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Composables Card -->
      <div class="bg-background-block border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold mb-4 text-text flex items-center">
          <div class="i-mdi-function w-5 h-5 mr-2 text-brand"></div>
          Composables
        </h2>
        <div class="border-t border-gray-100 pt-4">
          <ul class="space-y-3">
            <li v-for="api in filteredApis.composables" :key="api.id" 
                class="hover:bg-gray-50 p-2 rounded cursor-pointer"
                @click="navigateToApi(api.slug)">
              <div class="flex justify-between items-center">
                <span class="font-medium text-text">{{ api.title }}</span>
                <div class="i-mdi-chevron-right w-5 h-5 text-gray-400"></div>
              </div>
              <p class="text-sm text-text-secondary mt-1 line-clamp-2">{{ api.excerpt }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <span v-for="tag in api.tags" :key="tag"
                  class="px-2 py-0.5 text-xs bg-gray-100 text-text-secondary rounded-full">
                  {{ tag }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Packages Card -->
      <div class="bg-background-block border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold mb-4 text-text flex items-center">
          <div class="i-mdi-package-variant w-5 h-5 mr-2 text-brand"></div>
          Packages
        </h2>
        <div class="border-t border-gray-100 pt-4">
          <ul class="space-y-3">
            <li v-for="api in filteredApis.packages" :key="api.id" 
                class="hover:bg-gray-50 p-2 rounded cursor-pointer"
                @click="navigateToApi(api.slug)">
              <div class="flex justify-between items-center">
                <span class="font-medium text-text">{{ api.title }}</span>
                <div class="i-mdi-chevron-right w-5 h-5 text-gray-400"></div>
              </div>
              <p class="text-sm text-text-secondary mt-1 line-clamp-2">{{ api.excerpt }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <span v-for="tag in api.tags" :key="tag"
                  class="px-2 py-0.5 text-xs bg-gray-100 text-text-secondary rounded-full">
                  {{ tag }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
