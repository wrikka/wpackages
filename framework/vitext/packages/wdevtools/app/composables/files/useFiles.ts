interface FileEntry {
  name: string;
  isDirectory: boolean;
}

export const useFiles = () => {
  const currentPath = ref('');

  const url = computed(() => `/api/files/list?path=${encodeURIComponent(currentPath.value)}`);

  const { data, error, refresh, pending } = useAsyncData<FileEntry[]>(
    'files-list',
    () => $fetch(url.value),
    { watch: [currentPath] }
  );

  const navigateTo = (path: string) => {
    currentPath.value = path;
  };

  return { data, error, pending, refresh, navigateTo, currentPath };
};
