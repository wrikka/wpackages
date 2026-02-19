import { ref } from 'vue'
import type { Note } from '@/types'

export function useNotes(notesRef?: any, saveFunction?: () => Promise<void>) {
  const noteInput = ref('')

  const addNote = async () => {
    if (!noteInput.value.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Quick Note',
      content: noteInput.value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (notesRef?.value) {
      notesRef.value.unshift(newNote)
    }

    noteInput.value = ''

    if (saveFunction) {
      await saveFunction()
    }
  }

  return {
    noteInput,
    addNote
  }
}
