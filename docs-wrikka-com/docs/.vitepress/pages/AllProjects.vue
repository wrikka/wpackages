<template>
  <div class="container mx-auto px-4 py-8">
    <!-- View Controls -->
    <div class="flex justify-between items-center mb-8">
      <div class="flex space-x-2">
        <button 
          @click="viewMode = 'grid'" 
          :class="[
            'p-2 rounded-md',
            viewMode === 'grid' 
              ? 'bg-brand text-white' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          <div class="i-mdi-grid w-5 h-5"></div>
        </button>
        <button 
          @click="viewMode = 'list'" 
          :class="[
            'p-2 rounded-md',
            viewMode === 'list' 
              ? 'bg-brand text-white' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          <div class="i-mdi-format-list-bulleted w-5 h-5"></div>
        </button>
      </div>
      
      <!-- Filter Controls -->
      <div class="flex space-x-4">
        <select 
          v-model="selectedCategory" 
          class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        
        <select 
          v-model="selectedYear" 
          class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
        >
          <option value="">All Years</option>
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>

        <select 
          v-model="selectedTag" 
          class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
        >
          <option value="">All Tags</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>
    </div>

    <!-- Grouped Posts -->
    <div v-for="(group, groupName) in groupedPosts" :key="groupName" class="mb-12">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{{ groupName }}</h2>
      
      <!-- Grid View -->
      <div 
        v-if="viewMode === 'grid'" 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div 
          v-for="post in group" 
          :key="post.id" 
          class="card h-full cursor-pointer overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          @click="navigateToBlog(post.slug)"
        >
          <div class="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div class="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
              <div class="i-mdi-image-outline w-16 h-16"></div>
            </div>
          </div>
          <div class="card-body p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs font-medium text-brand dark:text-brand-light flex items-center">
                <div class="i-mdi-calendar-outline w-4 h-4 mr-1"></div>
                <span>{{ formatDate(post.date) }}</span>
              </div>
              <div class="px-2 py-1 text-xs font-semibold bg-brand/10 text-brand rounded-full">
                {{ post.category || 'Blog' }}
              </div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 line-clamp-2 hover:text-brand">{{ post.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{{ post.excerpt }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="tag in post.tags" 
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span class="inline-flex items-center text-sm font-medium text-brand dark:text-brand-light hover:text-brand-dark dark:hover:text-brand-light">
                Read more
                <div class="i-mdi-arrow-right ml-1 w-4 h-4"></div>
              </span>
              <div class="flex space-x-1">
                <div class="i-mdi-eye w-4 h-4 text-gray-400"></div>
                <div class="i-mdi-heart w-4 h-4 text-gray-400"></div>
                <div class="i-mdi-share w-4 h-4 text-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="space-y-4">
        <div 
          v-for="post in group" 
          :key="post.id" 
          class="flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300"
          @click="navigateToBlog(post.slug)"
        >
          <div class="md:w-1/3 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div class="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
              <div class="i-mdi-image-outline w-16 h-16"></div>
            </div>
          </div>
          <div class="md:w-2/3 flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs font-medium text-brand dark:text-brand-light flex items-center">
                <div class="i-mdi-calendar-outline w-4 h-4 mr-1"></div>
                <span>{{ formatDate(post.date) }}</span>
              </div>
              <div class="px-2 py-1 text-xs font-semibold bg-brand/10 text-brand rounded-full">
                {{ post.category || 'Blog' }}
              </div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 line-clamp-2 hover:text-brand">
              {{ post.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{{ post.excerpt }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="tag in post.tags" 
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span class="inline-flex items-center text-sm font-medium text-brand dark:text-brand-light hover:text-brand-dark dark:hover:text-brand-light">
                Read more
                <div class="i-mdi-arrow-right ml-1 w-4 h-4"></div>
              </span>
              <div class="flex space-x-1">
                <div class="i-mdi-eye w-4 h-4 text-gray-400"></div>
                <div class="i-mdi-heart w-4 h-4 text-gray-400"></div>
                <div class="i-mdi-share w-4 h-4 text-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vitepress";
import { ref, computed } from "vue";

interface BlogPost {
	id: number;
	title: string;
	excerpt: string;
	date: string;
	slug: string;
	category?: string;
	views?: number;
	likes?: number;
	tags?: string[];
}

const router = useRouter();
const viewMode = ref<"grid" | "list">("grid");
const selectedCategory = ref("");
const selectedYear = ref("");
const selectedTag = ref("");

const products = ref<BlogPost[]>([
	{
		id: 1,
		title: "Article 1",
		excerpt:
			"Brief content of the article with more detailed information to show the layout.",
		date: "2023-10-01",
		slug: "blog-post-1",
		category: "Technology",
		views: 100,
		likes: 20,
		tags: ["AI", "Machine Learning", "Python"],
	},
	{
		id: 2,
		title: "Article 2",
		excerpt:
			"Brief content of the article with more detailed information to show the layout.",
		date: "2023-10-05",
		slug: "blog-post-2",
		category: "Business",
		views: 150,
		likes: 30,
		tags: ["Startup", "Marketing"],
	},
	{
		id: 3,
		title: "Article 3",
		excerpt:
			"Brief content of the article with more detailed information to show the layout.",
		date: "2023-10-10",
		slug: "blog-post-3",
		category: "Technology",
		views: 80,
		likes: 15,
		tags: ["JavaScript", "Vue"],
	},
	{
		id: 4,
		title: "Article 4",
		excerpt:
			"Brief content of the article with more detailed information to show the layout.",
		date: "2023-10-15",
		slug: "blog-post-4",
		category: "Design",
		views: 120,
		likes: 25,
		tags: ["UI/UX", "Figma"],
	},
]);

// Computed Properties
const categories = computed(() => {
	const allCategories = products.value.map((post) => post.category || "Blog");
	return [...new Set(allCategories)];
});

const years = computed(() => {
	return [
		...new Set(products.value.map((post) => new Date(post.date).getFullYear())),
	];
});

const allTags = computed(() => {
	const tags = products.value.flatMap((post) => post.tags || []);
	return [...new Set(tags)];
});

const filteredPosts = computed(() => {
	return products.value.filter((post) => {
		const matchesCategory =
			!selectedCategory.value ||
			(post.category || "Blog") === selectedCategory.value;

		const matchesYear =
			!selectedYear.value ||
			new Date(post.date).getFullYear().toString() === selectedYear.value;

		const matchesTag =
			!selectedTag.value || (post.tags || []).includes(selectedTag.value);

		return matchesCategory && matchesYear && matchesTag;
	});
});

const groupedPosts = computed(() => {
	const groups: Record<string, BlogPost[]> = {};

	for (const post of filteredPosts.value) {
		const date = new Date(post.date);
		const groupName = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

		if (!groups[groupName]) {
			groups[groupName] = [];
		}

		groups[groupName].push(post);
	}

	return groups;
});

const navigateToBlog = (slug: string): void => {
	router.go(`/blog/${slug}`);
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
};
</script>
