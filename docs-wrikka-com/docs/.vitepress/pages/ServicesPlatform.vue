<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-800">
    <!-- Sidebar -->
    <div class="w-64 bg-white dark:bg-gray-900 shadow-md">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">Services Platform</h2>
      </div>
      <nav class="p-4">
        <ul class="space-y-2">
          <li v-for="item in navigationItems" :key="item.id">
            <a 
              :href="item.path" 
              class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              :class="{ 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300': isActive(item.path) }"
            >
              <div :class="item.icon" class="mr-3 text-lg"></div>
              {{ item.name }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <div class="p-6">
        <div v-if="activeContent === 'services'">
          <h1 class="text-2xl font-bold mb-4">Services</h1>
          <!-- Services content here -->
        </div>
        <div v-else-if="activeContent === 'store'">
          <h1 class="text-2xl font-bold mb-4">Store</h1>
          <!-- Store content here -->
        </div>
        <div v-else-if="activeContent === 'customers'">
          <h1 class="text-2xl font-bold mb-4">Customers</h1>
          <!-- Customers content here -->
        </div>
        <div v-else-if="activeContent === 'transactions'">
          <h1 class="text-2xl font-bold mb-4">Transactions</h1>
          <!-- Transactions content here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useData } from "vitepress";

interface NavigationItem {
	id: string;
	name: string;
	icon: string;
	path: string;
}

const { page } = useData();
const activeContent = ref("services");

const navigationItems: NavigationItem[] = [
	{
		id: "services",
		name: "Services",
		icon: "i-mdi-cube-outline",
		path: "/services-platform/services",
	},
	{
		id: "store",
		name: "Store",
		icon: "i-mdi-store-outline",
		path: "/services-platform/store",
	},
	{
		id: "customers",
		name: "Customers",
		icon: "i-mdi-account-group-outline",
		path: "/services-platform/customers",
	},
	{
		id: "transactions",
		name: "Transactions",
		icon: "i-mdi-swap-horizontal",
		path: "/services-platform/transactions",
	},
];

// Check if current page path matches navigation item path
function isActive(path: string): boolean {
	return page.value.path === path;
}

// Set active content based on current page path
onMounted(() => {
	const currentItem = navigationItems.find((item) => isActive(item.path));
	if (currentItem) {
		activeContent.value = currentItem.id;
	}
});
</script>
