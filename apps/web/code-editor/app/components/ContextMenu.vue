<script setup>

defineProps({
  show: Boolean,
  x: Number,
  y: Number,
  items: Array, // [{ label: '...', action: () => {} }]
});

</script>

<template>

  <div 
    v-if="show"
    class="absolute bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-50"
    :style="{ top: `${y}px`, left: `${x}px` }"
  >
    <ul class="py-1">
      <li 
        v-for="item in items" 
        :key="item.label"
        @click="item.action"
        class="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>

</template>