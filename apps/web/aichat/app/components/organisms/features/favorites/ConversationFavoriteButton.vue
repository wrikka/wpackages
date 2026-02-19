<script setup lang="ts">


const props = defineProps<{
  conversationId: string
}>()
const favoritesStore = useFavoritesStore()
onMounted(() => {
  favoritesStore.fetchFavorites()
})
const toggleFavorite = async () => {
  await favoritesStore.toggleFavorite(props.conversationId)
}

</script>

<template>

  <div class="conversation-favorites">
    <button
      class="relative p-2 rounded-lg transition-colors group"
      :class="favoritesStore.isFavorite(conversationId) ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
      :title="favoritesStore.isFavorite(conversationId) ? 'Remove from favorites' : 'Add to favorites'"
      @click="toggleFavorite"
    >
      <Icon
        :name="favoritesStore.isFavorite(conversationId) ? 'lucide:star' : 'lucide:star'"
        class="w-6 h-6"
        :class="favoritesStore.isFavorite(conversationId) ? 'text-yellow-500' : ''"
      />
      <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {{ favoritesStore.isFavorite(conversationId) ? 'Remove from favorites' : 'Add to favorites' }}
      </span>
    </button>
  </div>

</template>