<script setup lang="ts">
defineProps<{ html: string }>();
</script>

<template>
	<div class="prose dark:prose-invert max-w-none" v-html="html"></div>
</template>
