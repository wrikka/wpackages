import { invoke } from "@tauri-apps/api/core";

export type FileNode = {
  path: string;
  name: string;
  kind: "file" | "dir";
  children?: FileNode[];
};

export function useFiles() {
  const selectedFilePath = ref<string>("");
  const selectedFileText = ref<string>("");
  const repoFileTree = ref<FileNode[]>([]);
  const driveDTree = ref<FileNode[]>([]);
  const driveDLoading = ref<boolean>(false);

  const openFile = async (path: string): Promise<void> => {
    selectedFilePath.value = path;
    selectedFileText.value = await invoke<string>("read_text_file", { path });
  };

  const loadRepoFiles = async (repoRoot: string): Promise<void> => {
    repoFileTree.value = await invoke<FileNode[]>("list_files", {
      root: repoRoot,
      maxDepth: 4,
    });
  };

  const loadDriveD = async (): Promise<void> => {
    driveDLoading.value = true;
    try {
      driveDTree.value = await invoke<FileNode[]>("list_drive_d_folders", {
        maxDepth: 2,
      });
    } finally {
      driveDLoading.value = false;
    }
  };

  return {
    selectedFilePath,
    selectedFileText,
    repoFileTree,
    driveDTree,
    driveDLoading,
    openFile,
    loadRepoFiles,
    loadDriveD,
  };
}
