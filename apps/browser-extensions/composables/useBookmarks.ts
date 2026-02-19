import type { Bookmark } from '@/types'

export function useBookmarks(bookmarksRef?: any, saveFunction?: () => Promise<void>) {
  const addBookmark = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (tab?.url && tab?.title) {
        const newBookmark: Bookmark = {
          id: Date.now().toString(),
          title: tab.title,
          url: tab.url,
          timestamp: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        if (bookmarksRef?.value) {
          bookmarksRef.value.push(newBookmark)
        }

        if (saveFunction) {
          await saveFunction()
        }
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error)
    }
  }

  const removeBookmark = async (id: string) => {
    try {
      if (bookmarksRef?.value) {
        const index = bookmarksRef.value.findIndex((bookmark: Bookmark) => bookmark.id === id)
        if (index > -1) {
          bookmarksRef.value.splice(index, 1)
        }
      }

      if (saveFunction) {
        await saveFunction()
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
    }
  }

  return {
    addBookmark,
    removeBookmark
  }
}
