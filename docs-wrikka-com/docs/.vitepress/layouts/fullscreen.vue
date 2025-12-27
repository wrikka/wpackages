<script setup lang="ts">
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <div class="w-full h-[calc(100vh-var(--vp-nav-height))]">
      <slot />
    </div>
  </Layout>
</template>