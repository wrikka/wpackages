<script setup lang="ts">


interface Bookmark {
  id: string
  title: string
  preview: string
  messageId: string
  timestamp: string
}
const showBookmarks = ref(false)
const bookmarks = ref<Bookmark[]>([
  { id: '1', title: 'Authentication Guide', preview: 'Here is the complete authentication implementation...', messageId: 'msg-1', timestamp: '2 hours ago' },
  { id: '2', title: 'API Design Tips', preview: 'Best practices for RESTful API design...', messageId: 'msg-2', timestamp: '1 day ago' }
])
const addBookmark = () => {
  // Add bookmark logic
}
const jumpToBookmark = (bookmark: Bookmark) => {
  // Navigate to bookmark
}
const removeBookmark = (id: string) => {
  bookmarks.value = bookmarks.value.filter(b => b.id !== id)
}

</script>

<template>

  <div class="chat-bookmarks">
    <UButton size="xs" color="gray" variant="soft" icon="i-heroicons-bookmark" @click="showBookmarks = true">
      {{ bookmarks.length }}
    </UButton>

    <USlideover v-model="showBookmarks">
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <UIcon name="i-heroicons-bookmark" class="text-primary" />
            Bookmarks
          </h3>
          <UButton size="xs" color="primary" variant="soft" icon="i-heroicons-plus" @click="addBookmark">
            Add
          </UButton>
        </div>

        <div v-if="bookmarks.length" class="bookmarks-list space-y-2">
          <div
            v-for="bookmark in bookmarks"
            :key="bookmark.id"
            class="bookmark-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
          >
            <div class="flex items-start gap-2">
              <UIcon name="i-heroicons-bookmark" class="text-primary mt-1" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">{{ bookmark.title }}</p>
                <p class="text-xs text-gray-500 line-clamp-2">{{ bookmark.preview }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs text-gray-400">{{ bookmark.timestamp }}</span>
                  <UButton size="xs" color="gray" variant="ghost" @click="jumpToBookmark(bookmark)">
                    Go to
                  </UButton>
                </div>
              </div>
              <UButton
                size="xs"
                color="gray"
                variant="ghost"
                icon="i-heroicons-trash"
                class="opacity-0 group-hover:opacity-100"
                @click="removeBookmark(bookmark.id)"
              />
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-bookmark-slash" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No bookmarks yet</p>
          <p class="text-sm mt-1">Save important messages to bookmarks</p>
        </div>
      </div>
    </USlideover>
  </div>

</template>