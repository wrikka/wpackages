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
              ? 'bg-indigo text-white' 
              : 'text-text-secondary hover:bg-background-block'
          ]"
        >
          <div class="i-mdi-grid w-5 h-5"></div>
        </button>
        <button 
          @click="viewMode = 'list'" 
          :class="[
            'p-2 rounded-md',
            viewMode === 'list' 
              ? 'bg-indigo text-white' 
              : 'text-text-secondary hover:bg-background-block'
          ]"
        >
          <div class="i-mdi-format-list-bulleted w-5 h-5"></div>
        </button>
      </div>
      
      <!-- Filter Controls -->
      <div class="flex space-x-4">
        <select 
          v-model="selectedCategory" 
          class="px-3 py-2 bg-background border border-gray-200 rounded-md text-sm text-text"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        
        <select 
          v-model="selectedYear" 
          class="px-3 py-2 bg-background border border-gray-200 rounded-md text-sm text-text"
        >
          <option value="">All Years</option>
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>

        <select 
          v-model="selectedTag" 
          class="px-3 py-2 bg-background border border-gray-200 rounded-md text-sm text-text"
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
      <h2 class="text-2xl font-bold mb-6 text-text">{{ groupName }}</h2>
      
      <!-- Grid View -->
      <div 
        v-if="viewMode === 'grid'" 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div 
          v-for="framework in group" 
          :key="framework.id" 
          class="card h-full cursor-pointer overflow-hidden bg-background border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          @click="navigateToBlog(framework.slug)"
        >
          <div class="h-48 bg-background-block overflow-hidden">
            <div class="w-full h-full flex items-center justify-center text-text-tertiary">
              <div class="i-mdi-image-outline w-16 h-16"></div>
            </div>
          </div>
          <div class="card-body p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs font-medium text-indigo flex items-center">
                <div class="i-mdi-calendar-outline w-4 h-4 mr-1"></div>
                <span>{{ formatDate(framework.date) }}</span>
              </div>
              <div class="px-2 py-1 text-xs font-semibold bg-indigo/10 text-indigo rounded-full">
                {{ framework.category || 'Blog' }}
              </div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-text line-clamp-2 hover:text-indigo">{{ framework.title }}</h3>
            <p class="text-text-secondary mb-4 line-clamp-3">{{ framework.excerpt }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="tag in framework.tags" 
                :key="tag"
                class="px-2 py-1 text-xs bg-background-block text-text-secondary rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
              <span class="inline-flex items-center text-sm font-medium text-indigo hover:text-purple">
                Read more
                <div class="i-mdi-arrow-right ml-1 w-4 h-4"></div>
              </span>
              <div class="flex space-x-1">
                <div class="i-mdi-eye w-4 h-4 text-text-tertiary"></div>
                <div class="i-mdi-heart w-4 h-4 text-text-tertiary"></div>
                <div class="i-mdi-share w-4 h-4 text-text-tertiary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="space-y-4">
        <div 
          v-for="framework in group" 
          :key="framework.id" 
          class="flex flex-col md:flex-row gap-6 p-6 bg-background border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
          @click="navigateToBlog(framework.slug)"
        >
          <div class="md:w-1/3 h-48 bg-background-block rounded-lg overflow-hidden">
            <div class="w-full h-full flex items-center justify-center text-text-tertiary">
              <div class="i-mdi-image-outline w-16 h-16"></div>
            </div>
          </div>
          <div class="md:w-2/3 flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs font-medium text-indigo flex items-center">
                <div class="i-mdi-calendar-outline w-4 h-4 mr-1"></div>
                <span>{{ formatDate(framework.date) }}</span>
              </div>
              <div class="px-2 py-1 text-xs font-semibold bg-indigo/10 text-indigo rounded-full">
                {{ framework.category || 'Blog' }}
              </div>
            </div>
            <h3 class="text-xl font-bold mb-3 text-text line-clamp-2 hover:text-indigo">
              {{ framework.title }}
            </h3>
            <p class="text-text-secondary mb-4 line-clamp-3">{{ framework.excerpt }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="tag in framework.tags" 
                :key="tag"
                class="px-2 py-1 text-xs bg-background-block text-text-secondary rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
              <span class="inline-flex items-center text-sm font-medium text-indigo hover:text-purple">
                Read more
                <div class="i-mdi-arrow-right ml-1 w-4 h-4"></div>
              </span>
              <div class="flex space-x-1">
                <div class="i-mdi-eye w-4 h-4 text-text-tertiary"></div>
                <div class="i-mdi-heart w-4 h-4 text-text-tertiary"></div>
                <div class="i-mdi-share w-4 h-4 text-text-tertiary"></div>
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

const frameworks = ref<BlogPost[]>([
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
	const allCategories = frameworks.value.map(
		(framework) => framework.category || "Blog",
	);
	return [...new Set(allCategories)];
});

const years = computed(() => {
	return [
		...new Set(
			frameworks.value.map((framework) =>
				new Date(framework.date).getFullYear(),
			),
		),
	];
});

const allTags = computed(() => {
	const tags = frameworks.value.flatMap((framework) => framework.tags || []);
	return [...new Set(tags)];
});

const filteredPosts = computed(() => {
	return frameworks.value.filter((framework) => {
		const matchesCategory =
			!selectedCategory.value ||
			(framework.category || "Blog") === selectedCategory.value;

		const matchesYear =
			!selectedYear.value ||
			new Date(framework.date).getFullYear().toString() === selectedYear.value;

		const matchesTag =
			!selectedTag.value || (framework.tags || []).includes(selectedTag.value);

		return matchesCategory && matchesYear && matchesTag;
	});
});

const groupedPosts = computed(() => {
	const groups: Record<string, BlogPost[]> = {};

	for (const framework of filteredPosts.value) {
		const date = new Date(framework.date);
		const groupName = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

		if (!groups[groupName]) {
			groups[groupName] = [];
		}

		groups[groupName].push(framework);
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