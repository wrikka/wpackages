export interface KnowledgeBaseFile {
  id: string;
  knowledgeBaseId: string;
  fileName: string;
  storagePath: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  createdAt: Date | string;
}

export interface KnowledgeBase {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  files?: KnowledgeBaseFile[]; // Populated from a join
}
