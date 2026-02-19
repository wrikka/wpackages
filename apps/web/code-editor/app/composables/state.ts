import type { Ref } from 'vue'

// This will be our shared state for the currently selected file
export const useCurrentFile = () => useState('currentFile', () => null) as Ref<any | null>
