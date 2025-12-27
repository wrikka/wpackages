export const useExternalLink = () => {
	const openExternalLink = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const isExternalLink = (url: string): boolean => {
		if (!url?.trim()) return false;
		if (url.startsWith("/") || url.startsWith("#") || url.startsWith("."))
			return false;

		try {
			const urlObj = new URL(url);
			if (typeof window === "undefined") return false;
			return urlObj.hostname !== window.location.hostname;
		} catch {
			return false;
		}
	};

	return {
		openExternalLink,
		isExternalLink,
	};
};
