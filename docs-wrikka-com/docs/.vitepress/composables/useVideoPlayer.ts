import { type Ref, ref } from "vue";

interface VideoPlayerOptions {
	onPlay?: () => void;
	onPause?: () => void;
}

export default function useVideoPlayer(
	videoPlayer: Ref<HTMLVideoElement | null>,
	options?: VideoPlayerOptions,
) {
	const progressBar = ref<HTMLInputElement | null>(null);
	const isPlaying = ref(false);
	const currentTime = ref(0);
	const duration = ref(0);
	const volume = ref(0.8);
	const isMuted = ref(false);
	const isFullScreen = ref(false);
	const subtitlesEnabled = ref(true);
	const showPreview = ref(false);
	const previewPosition = ref(0);
	const previewTime = ref(0);
	const showVolumeSlider = ref(false);

	// Video control functions
	const setupVideo = () => {
		if (!videoPlayer.value) {
			console.error("Video player element not found");
			return;
		}

		// Check if video URL is valid
		if (!videoPlayer.value.src) {
			console.error("Video source not set");
			return;
		}

		try {
			// Auto-play video when loaded
			videoPlayer.value
				.play()
				.then(() => {
					isPlaying.value = true;
				})
				.catch((err) => {
					console.error("Video play failed:", err);
					isPlaying.value = false;
				});

			duration.value = videoPlayer.value.duration || 0;

			videoPlayer.value.addEventListener("timeupdate", updateTime);
			videoPlayer.value.addEventListener("play", () => {
				isPlaying.value = true;
				options?.onPlay?.();
			});
			videoPlayer.value.addEventListener("pause", () => {
				isPlaying.value = false;
				options?.onPause?.();
			});
			videoPlayer.value.addEventListener("dblclick", toggleFullScreen);

			// Add error event listener
			videoPlayer.value.addEventListener("error", () => {
				console.error("Video error:", videoPlayer.value?.error);
				isPlaying.value = false;
			});
		} catch (err) {
			console.error("Video setup error:", err);
		}

		document.addEventListener("fullscreenchange", handleFullScreenChange);
	};

	const togglePlay = () => {
		if (videoPlayer.value) {
			if (isPlaying.value) {
				videoPlayer.value.pause();
			} else {
				videoPlayer.value.play();
			}
			isPlaying.value = !isPlaying.value;
		}
	};

	const toggleSubtitles = () => {
		subtitlesEnabled.value = !subtitlesEnabled.value;

		if (videoPlayer.value?.textTracks.length) {
			for (let i = 0; i < videoPlayer.value.textTracks.length; i++) {
				videoPlayer.value.textTracks[i].mode = subtitlesEnabled.value
					? "showing"
					: "hidden";
			}
		}
	};

	const toggleFullScreen = () => {
		if (!document.fullscreenElement && videoPlayer.value) {
			videoPlayer.value.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	const handleFullScreenChange = () => {
		isFullScreen.value = !!document.fullscreenElement;
	};

	const updatePreviewPosition = (event: MouseEvent) => {
		if (!progressBar.value) return;

		const rect = progressBar.value.getBoundingClientRect();
		const position = (event.clientX - rect.left) / rect.width;
		previewPosition.value = position * 100;
		previewTime.value = position * duration.value;
	};

	const updateTime = () => {
		if (videoPlayer.value) {
			currentTime.value = videoPlayer.value.currentTime;
		}
	};

	const seekToPosition = (event: Event) => {
		if (videoPlayer.value && event.target) {
			const target = event.target as HTMLInputElement;
			const seekTime = Number.parseFloat(target.value);
			videoPlayer.value.currentTime = seekTime;
			currentTime.value = seekTime;
		}
	};

	const updateVolume = () => {
		if (videoPlayer.value) {
			videoPlayer.value.volume = volume.value;
			isMuted.value = volume.value === 0;
		}
	};

	const toggleMute = () => {
		if (videoPlayer.value) {
			if (isMuted.value) {
				videoPlayer.value.volume = volume.value || 1;
				isMuted.value = false;
			} else {
				videoPlayer.value.volume = 0;
				isMuted.value = true;
			}
		}
	};

	const toggleVolumeSlider = () => {
		showVolumeSlider.value = !showVolumeSlider.value;
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
	};

	return {
		progressBar,
		isPlaying,
		currentTime,
		duration,
		volume,
		isMuted,
		isFullScreen,
		subtitlesEnabled,
		showPreview,
		previewPosition,
		previewTime,
		showVolumeSlider,
		setupVideo,
		togglePlay,
		toggleSubtitles,
		toggleFullScreen,
		handleFullScreenChange,
		updatePreviewPosition,
		updateTime,
		seekToPosition,
		updateVolume,
		toggleMute,
		toggleVolumeSlider,
		formatTime,
	};
}
