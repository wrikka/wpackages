import type { Ref } from 'vue'

interface EditorFile {
  name: string;
  path: string;
  type: 'file';
}

interface EditorState {
  openFiles: EditorFile[];
  activeFile: EditorFile | null;
}

export const useEditorState = () => useState<EditorState>('editor-state', () => ({
  openFiles: [],
  activeFile: null,
}))

export function useOpenFile(file: Ref<EditorFile | null>) {
  const editorState = useEditorState()

  if (file.value) {
    // Don't open if it's already open
    if (!editorState.value.openFiles.find(f => f.path === file.value.path)) {
      editorState.value.openFiles.push(file.value)
    }
    editorState.value.activeFile = file.value
  }
}
