export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'txt' | 'html';
  includeMetadata: boolean;
  includeTimestamps: boolean;
  includeModelInfo: boolean;
  includeTokenUsage: boolean;
  dateRange?: { from?: Date; to?: Date };
  filterByModel?: string[];
  maxMessages?: number;
}

export interface ExportPreset {
  id: string;
  name: string;
  options: ExportOptions;
  isDefault: boolean;
}

export interface ExportJob {
  id: string;
  sessionIds: string[];
  options: ExportOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date | string;
  completedAt?: Date | string;
}
