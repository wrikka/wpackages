import { ref, onMounted, type Ref } from "vue";

export interface FaviconOptions {
	href: string;
	type?: string;
	sizes?: string;
	rel?: string;
}

export interface UseLinkFaviconReturn {
	setFavicon: (options: FaviconOptions) => void;
	removeFavicon: () => void;
	faviconUrl: Ref<string>;
}

export default function useLinkFavicon(
	initialOptions: FaviconOptions,
): UseLinkFaviconReturn {
	const faviconUrl = ref(initialOptions.href);
	const domReady = ref(false);

	onMounted(() => {
		domReady.value = true;
	});

	function setFavicon(options: FaviconOptions) {
		faviconUrl.value = options.href;
		if (!domReady.value) return;

		const link = document.createElement("link");
		link.rel = options.rel || "icon";
		link.href = options.href;
		if (options.type) link.type = options.type;
		if (options.sizes) link.sizes = options.sizes;

		document.head.appendChild(link);
	}

	function removeFavicon() {
		if (!domReady.value) return;

		const links = document.querySelectorAll(
			'link[rel="icon"], link[rel="shortcut icon"]',
		);
		links.forEach((link) => {
			document.head.removeChild(link);
		});
	}

	return {
		setFavicon,
		removeFavicon,
		faviconUrl,
	};
}
