<script setup lang="ts">
import { computed } from "vue";
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;

const isDev = computed(() => import.meta.env.DEV);
</script>

<template>
  <Layout>

    <!-- Authentication modal at top level -->
    <template #layout-top>
    </template>

    <!-- Course header in sidebar -->
    <template #sidebar-nav-before>
      <!-- <CourseHeader />-->
    </template>

    <!-- Auth buttons in navbar -->
    <template #nav-bar-content-after>
      <div class="flex items-center gap-2 px-2">
      </div>
    </template>
  </Layout>
</template>