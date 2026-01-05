<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
			{{ title }}
		</h1>
		<slot />
	</div>
</template>
