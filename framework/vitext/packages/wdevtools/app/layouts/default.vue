<script setup lang="ts">
const tabs = [
	{ name: "Package Info", icon: "i-mdi-package-variant-closed", path: "/" },
	{ name: "Vite Config", icon: "i-mdi-vite", path: "/vite-config" },
	{ name: "Storage", icon: "i-mdi-database", path: "/storage" },
	{ name: "Routes", icon: "i-mdi-map-marker-path", path: "/routes" },
	{ name: "Assets", icon: "i-mdi-image-multiple", path: "/assets" },
	{ name: "Performance", icon: "i-mdi-speedometer", path: "/performance" },
	{ name: "Logs", icon: "i-mdi-console-line", path: "/logs" },
	{ name: "Git", icon: "i-mdi-git", path: "/git" },
	{ name: "Files", icon: "i-mdi-folder-outline", path: "/files" },
];
</script>

<template>
  <div class="h-screen w-screen bg-gray-900 text-white flex font-sans">
    <!-- Sidebar -->
    <div class="w-60 border-r border-gray-800 flex-shrink-0 flex flex-col">
      <div class="p-4 border-b border-gray-800">
        <h1 class="text-xl font-bold">🚀 WDevtools</h1>
      </div>
      <nav class="flex-grow p-2">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.path"
          class="w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-colors"
          active-class="bg-gray-700"
          exact-active-class="bg-gray-700"
        >
          <Icon :name="tab.icon" class="text-lg" />
          <span>{{ tab.name }}</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Content -->
    <main class="flex-grow p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
