<script setup lang="ts">
import { useTabs } from "~/composables/useTabs";

const { tabs } = useTabs();
</script>

<template>
	<header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
		<nav class="flex items-center space-x-1">
			<NuxtLink
				v-for="tab in tabs"
				:key="tab.path"
				:to="tab.path"
				class="nav-link"
				active-class="nav-link-active"
			>
				{{ tab.name }}
			</NuxtLink>
		</nav>
		<ThemeToggle />
	</header>
</template>

<style scoped>
.nav-link {
	@apply px-3 py-2 rounded-md text-sm font-medium text-gray-500
		dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
		hover:text-gray-900 dark:hover:text-gray-100 transition-colors;
}
.nav-link-active {
	@apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100;
}
</style>
