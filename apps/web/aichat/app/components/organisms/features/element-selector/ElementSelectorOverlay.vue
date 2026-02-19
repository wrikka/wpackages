<script setup lang="ts">

import { useElementSelectorStore } from '~/stores/elementSelectorStore';
import ElementHighlighter from './ElementHighlighter.vue';
import ActionMenu from './ActionMenu.vue';

const store = useElementSelectorStore();
const handleSelect = (element: any) => {
  store.setSelectedElement(element);
  store.showActionMenu();
};
const handleClose = () => {
  store.deactivate();
};

</script>

<template>

  <div v-if="store.isActive" class="fixed inset-0 z-50 bg-black bg-opacity-20 backdrop-blur-sm">
    <div class="absolute top-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg flex items-center">
      <span>Select an element on the screen...</span>
      <button @click="handleClose" class="ml-4 text-gray-400 hover:text-white">Esc</button>
    </div>
    
    <!-- This would be replaced by actual screen element detection -->
    <ElementHighlighter 
      v-for="el in store.detectedElements"
      :key="el.id"
      :element="el"
      @select="handleSelect(el)"
    />

    <ActionMenu v-if="store.isActionMenuVisible" />
  </div>

</template>