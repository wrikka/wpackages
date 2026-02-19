export interface UploadedAttachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export function useMessageUpload() {
  async function uploadFiles(
    files: File[],
  ): Promise<{ attachmentIds: string[]; uploadedAttachments: UploadedAttachment[] }> {
    const attachmentIds: string[] = [];
    const uploadedAttachments: UploadedAttachment[] = [];

    if (files && files.length > 0) {
      for (const f of files) {
        const form = new FormData();
        form.append('file', f);
        const uploaded = await $fetch<UploadedAttachment>(
          '/api/attachments',
          {
            method: 'POST',
            body: form,
          },
        );
        attachmentIds.push(uploaded.id);
        uploadedAttachments.push(uploaded);
      }
    }

    return { attachmentIds, uploadedAttachments };
  }

  return {
    uploadFiles,
  };
}
