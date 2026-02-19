import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OpenFile {
	id: string;
	path: string;
	name: string;
	content: string;
	language: string;
	modified: boolean;
	cursorPosition?: { line: number; column: number };
}

interface EditorState {
	openFiles: Record<string, OpenFile>;
	activeFileId: string | null;
	recentFiles: string[];
	openFile: (file: OpenFile) => void;
	closeFile: (fileId: string) => void;
	setActiveFile: (fileId: string) => void;
	saveFile: (fileId: string, content: string) => void;
	updateFileContent: (fileId: string, content: string) => void;
	getOpenFile: (fileId: string) => OpenFile | undefined;
	addToRecentFiles: (path: string) => void;
	clearRecentFiles: () => void;
}

export const useEditorStore = create<EditorState>()(
	persist(
		(set, get) => ({
			openFiles: {},
			activeFileId: null,
			recentFiles: [],

			openFile: (file) =>
				set((state) => ({
					openFiles: {
						...state.openFiles,
						[file.id]: file,
					},
					activeFileId: file.id,
					recentFiles: [
						file.path,
						...state.recentFiles.filter((p) => p !== file.path),
					].slice(0, 20),
				})),

			closeFile: (fileId) =>
				set((state) => {
					const newFiles = { ...state.openFiles };
					delete newFiles[fileId];
					return {
						openFiles: newFiles,
						activeFileId:
							state.activeFileId === fileId ? null : state.activeFileId,
					};
				}),

			setActiveFile: (fileId) => set({ activeFileId: fileId }),

			saveFile: (fileId, content) =>
				set((state) => ({
					openFiles: {
						...state.openFiles,
						[fileId]: {
							...state.openFiles[fileId],
							content,
							modified: false,
						},
					},
				})),

			updateFileContent: (fileId, content) =>
				set((state) => ({
					openFiles: {
						...state.openFiles,
						[fileId]: {
							...state.openFiles[fileId],
							content,
							modified: true,
						},
					},
				})),

			getOpenFile: (fileId) => {
				return get().openFiles[fileId];
			},

			addToRecentFiles: (path) =>
				set((state) => ({
					recentFiles: [
						path,
						...state.recentFiles.filter((p) => p !== path),
					].slice(0, 20),
				})),

			clearRecentFiles: () => set({ recentFiles: [] }),
		}),
		{
			name: "editor-storage",
			partialize: (state) => ({
				recentFiles: state.recentFiles,
			}),
		},
	),
);
