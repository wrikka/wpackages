<script setup lang="ts">
import { useBlog, type BlogPost } from "../composables/useBlog";
import { ref, computed } from "vue";

const { filteredPosts, categories, tags } = useBlog();

// State for storing selected filters
const selectedCategory = ref<string | null>(null);
const selectedTag = ref<string | null>(null);

// Function to filter posts
const filteredPostsByCategoryAndTag = computed(() => {
	return filteredPosts.value.filter((post) => {
		const matchCategory =
			!selectedCategory.value || post.category === selectedCategory.value;
		const matchTag =
			!selectedTag.value || post.tags?.includes(selectedTag.value);
		return matchCategory && matchTag;
	});
});

// Function when clicking category
const handleCategoryClick = (category: string) => {
	selectedCategory.value =
		selectedCategory.value === category ? null : category;
	selectedTag.value = null;
};

// Function when clicking tag
const handleTagClick = (tag: string) => {
	selectedTag.value = selectedTag.value === tag ? null : tag;
	selectedCategory.value = null;
};

const formatPostForCard = (post: BlogPost) => ({
	title: post.title || "No Title",
	href: post.url,
	image: post.image || "/placeholder-image.jpg",
	alt: post.title || "Blog post image",
	icon: "i-mdi-post",
	description: post.description || "",
	tags: post.tags || [],
	color: "brand",
});

// CardProject Component
const CardProject = {
  props: {
    title: { type: String, required: true },
    href: { type: String, required: true },
    image: { type: String, default: '' },
    alt: { type: String, default: '' },
    icon: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: { type: Array, default: () => [] },
    color: { type: String, default: 'brand' }
  },
  template: `
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-bold text-text">{{ title }}</h2>
      <p class="text-sm text-gray-600">{{ description }}</p>
      <div class="flex justify-between items-center mt-4">
        <div class="flex items-center">
          <i :class="icon + ' text-lg text-gray-500'"></i>
          <span class="text-sm text-gray-600">{{ tags.join(', ') }}</span>
        </div>
        <a :href="href" class="text-sm text-brand hover:text-brand-dark">Read more</a>
      </div>
    </div>
  `
};

// Tag Component
const Tag = {
  props: {
    tag: { type: String, required: true },
    selected: { type: Boolean, default: false },
    onClick: { type: Function, default: () => {} }
  },
  template: `
    <div
      class="bg-gray-100 rounded-full py-1 px-3 text-sm text-gray-600 cursor-pointer"
      :class="{ 'bg-brand text-white': selected }"
      @click="onClick"
    >
      {{ tag }}
    </div>
  `
};
</script>

<template>
  <div class="container mx-auto">
    <div>
      <h2 class="text-3xl font-bold text-text text-center">All Articles</h2>
      
      <!-- Categories and Tags Section -->
      <div>
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex-1">
            <h3 class="text-lg text-text">Categories</h3>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="category in categories"
                :key="category as string"
                :tag="category"
                :selected="selectedCategory === category"
                :onClick="() => handleCategoryClick(category as string)"
              />
            </div>
          </div>
          
          <div class="flex-1">
            <h3 class="text-lg text-text">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="tag in tags"
                :key="tag as string"
                :tag="tag"
                :selected="selectedTag === tag"
                :onClick="() => handleTagClick(tag as string)"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Show filter results -->
      <div v-if="selectedCategory || selectedTag" class="flex items-center gap-2">
        <Tag
          v-if="selectedCategory"
          :tag="selectedCategory"
          :selected="true"
          :onClick="() => selectedCategory = null"
        />
        <Tag
          v-if="selectedTag"
          :tag="selectedTag"
          :selected="true"
          :onClick="() => selectedTag = null"
        />
        <button 
          @click="() => { selectedCategory = null; selectedTag = null; }" 
          class="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredPostsByCategoryAndTag.length === 0" class="text-center py-12">
        <div class="i-mdi-emoticon-sad-outline text-5xl text-gray-400 mx-auto"></div>
        <h3 class="text-lg font-medium text-gray-900">No articles found</h3>
        <p class="text-sm text-gray-500">
          {{ selectedCategory || selectedTag ? 'No articles match the filter' : 'No articles available yet' }}
        </p>
      </div>

      <!-- Posts Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        <CardProject
          v-for="post in filteredPostsByCategoryAndTag"
          :key="post.url"
          v-bind="formatPostForCard(post)"
        />
      </div>
    </div>
  </div>
</template>