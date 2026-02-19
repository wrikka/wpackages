<script setup lang="ts">

const { initializeApp } = useAppInitialization()

onMounted(() => {
	initializeApp()
})

</script>

<template>

	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>

</template>