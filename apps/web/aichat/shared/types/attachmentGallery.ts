export interface AttachmentGallery {
  sessionId: string;
  viewMode: 'grid' | 'list' | 'timeline';
  sortBy: 'date' | 'name' | 'type' | 'size';
  filterByType?: string[];
  searchQuery: string;
  selectedAttachments: string[];
}

export interface GalleryItem {
  id: string;
  messageId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date | string;
  metadata?: Record<string, unknown>;
}

export interface GalleryPreview {
  item: GalleryItem;
  currentIndex: number;
  totalItems: number;
  isFullscreen: boolean;
}
