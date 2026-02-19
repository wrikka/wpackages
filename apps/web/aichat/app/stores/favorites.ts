import { defineStore } from 'pinia';

export interface Favorite {
  id: string;
  conversationId: string;
  conversation?: {
    id: string;
    title: string;
    createdAt: Date;
  };
  createdAt: Date;
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Favorite[]>([]);
  const loading = ref(false);

  const isFavorite = computed(() => (conversationId: string) => {
    return favorites.value.some(f => f.conversationId === conversationId);
  });

  const fetchFavorites = async () => {
    loading.value = true;
    try {
      const data = await $fetch<Favorite[]>('/api/favorites');
      favorites.value = data;
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      loading.value = false;
    }
  };

  const toggleFavorite = async (conversationId: string) => {
    try {
      if (isFavorite.value(conversationId)) {
        await $fetch('/api/favorites', {
          method: 'DELETE',
          query: { conversationId },
        });
        favorites.value = favorites.value.filter(f => f.conversationId !== conversationId);
      } else {
        const newFavorite = await $fetch<Favorite>('/api/favorites', {
          method: 'POST',
          body: { conversationId },
        });
        favorites.value.push(newFavorite);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    fetchFavorites,
    toggleFavorite,
  };
});
