<template>
	<div>
		<p>MyComponent</p>
		<button @click="increment">Increment</button>
	</div>
</template>

<script setup lang="ts">
const { count } = defineModels<{
	count: number;
}>();

function increment() {
	count.value++;
}
</script>
