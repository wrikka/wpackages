import { ref, computed } from "vue";
import { data as postsData, type BlogPost } from "../data/posts.data";

export type { BlogPost };

export const useBlog = () => {
	const posts = ref(postsData);
	const filteredPosts = ref(postsData); // Initialize with all posts

	const getPostsByCategory = (category: string) => {
		if (category === "All") {
			filteredPosts.value = posts.value;
		} else {
			filteredPosts.value = posts.value.filter(
				(post) => post.category === category,
			);
		}
	};

	const getPostsByTag = (tag: string) => {
		filteredPosts.value = posts.value.filter((post) =>
			post.tags?.includes(tag),
		);
	};

	return {
		posts,
		filteredPosts,
		categories: computed(() => [
			"All",
			...new Set(posts.value.map((p) => p.category).filter(Boolean)),
		]),
		tags: computed(() => [
			...new Set(posts.value.flatMap((p) => p.tags).filter(Boolean)),
		]),
		getPostsByCategory,
		getPostsByTag,
	};
};
