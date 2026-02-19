export type SidebarPageId = string;

export interface SidebarPage {
	id: SidebarPageId;
	url: string;
	title: string;
	faviconUrl?: string;
	createdAt: string;
	updatedAt: string;
}
