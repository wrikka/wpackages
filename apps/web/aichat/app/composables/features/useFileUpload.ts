export function useChatFileUpload() {
  const fileInput = ref<HTMLInputElement | null>(null);
  const files = ref<File[]>([]);

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    files.value = input.files ? Array.from(input.files) : [];
  }

  async function uploadFiles(
    fileList: File[],
  ): Promise<{ id: string; url: string; fileName: string; fileType: string; fileSize: number }[]> {
    const uploadedAttachments: {
      id: string;
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }[] = [];
    const attachmentIds: string[] = [];

    for (const f of fileList) {
      const form = new FormData();
      form.append('file', f);
      const uploaded = await $fetch<
        { id: string; url: string; fileName: string; fileType: string; fileSize: number }
      >(
        '/api/attachments',
        {
          method: 'POST',
          body: form,
        },
      );
      attachmentIds.push(uploaded.id);
      uploadedAttachments.push(uploaded);
    }

    return uploadedAttachments;
  }

  function clearFiles() {
    files.value = [];
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }

  return {
    fileInput,
    files,
    onFileChange,
    uploadFiles,
    clearFiles,
  };
}
