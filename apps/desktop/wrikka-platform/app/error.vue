<script setup>

const props = defineProps({
	error: Object,
});

</script>

<template>

  <div>
    <h1>Error</h1>
    <p>{{ error.message }}</p>
  </div>

</template>