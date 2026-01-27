export type RotationStrategy = "size" | "date" | "both";

export interface RotationConfig {
	/** Maximum file size in bytes before rotation (for 'size' or 'both' strategy) */
	maxBytes?: number;
	/** Date pattern for rotation (e.g., 'YYYY-MM-DD', 'YYYY-MM-DD-HH') */
	datePattern?: string;
	/** Maximum number of rotated files to keep */
	maxFiles?: number;
	/** Whether to compress rotated files with gzip */
	compress?: boolean;
	/** Rotation strategy */
	strategy?: RotationStrategy;
}

export interface RotatedFileInfo {
	path: string;
	size: number;
	compressed: boolean;
	createdAt: number;
}

export interface RotationState {
	currentSize: number;
	currentDate: string;
	rotatedFiles: RotatedFileInfo[];
}
