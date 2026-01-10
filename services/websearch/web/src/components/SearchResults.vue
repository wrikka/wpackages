<script setup lang="ts">
import type { SearchResultItem } from "../lib/types";
import { faviconUrl, highlight, safeUrlHost } from "../lib/text";

defineProps<{
	query: string;
	items: SearchResultItem[];
}>();
</script>

<template>
	<div>
		<a
			v-for="(r, idx) in items"
			:key="idx"
			class="resultItem"
			:href="r.url"
			target="_blank"
			rel="noreferrer"
		>
			<img class="favicon" :src="faviconUrl(r.url)" alt="" />
			<div>
				<div class="resultTitle" v-html="highlight(r.title, query)" />
				<div class="resultUrl">{{ safeUrlHost(r.url) }}</div>
				<div v-if="r.snippet" class="resultSnippet" v-html="highlight(r.snippet, query)" />
			</div>
		</a>
	</div>
</template>
