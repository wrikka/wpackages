<script setup lang="ts">

const props = withDefaults(
	defineProps<{
		modelValue: string;
		language?: string;
		readOnly?: boolean;
	}>(),
	{
		language: "plaintext",
		readOnly: true,
	},
);
void props;

</script>

<template>

  <pre class="h-full w-full overflow-auto whitespace-pre font-mono text-xs leading-5 text-slate-200 p-3">{{ modelValue }}</pre>

</template>