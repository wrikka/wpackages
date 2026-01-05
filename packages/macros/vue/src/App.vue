<template>
	<div>
		<h1>Vue Macros Demo</h1>
		<MyComponent
			:count="count"
			@update:count="(newValue) => count = newValue"
		/>
		<p>Current count: {{ count }}</p>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MyComponent from "./components/MyComponent.vue";

defineOptions({
	name: "App",
});

const count = ref(0);
</script>
