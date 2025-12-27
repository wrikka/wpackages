import { ref } from "vue";
import type { VideoItem } from "../data/video";
import { videoPlaylist } from "../data/video";

export function useFetchVideoData() {
	const data = ref<VideoItem[]>([]);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	const fetchVideoData = async (): Promise<VideoItem[]> => {
		isLoading.value = true;
		error.value = null;

		try {
			// Simulate API call with a small delay
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Use the videoPlaylist data from video.ts
			const videoData = [...videoPlaylist];

			data.value = videoData;
			return videoData;
		} catch (err) {
			console.error("Error fetching video data:", err);
			error.value = err as Error;
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	return {
		data,
		isLoading,
		error,
		fetchVideoData,
	};
}
