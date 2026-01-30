export interface A11yOptions {
	announceChanges?: boolean;
	announceInterval?: number;
	screenReaderMode?: boolean;
	highContrast?: boolean;
	reducedMotion?: boolean;
	keyboardNavigation?: boolean;
	focusIndicator?: boolean;
}

export interface A11yAnnouncement {
	message: string;
	priority: "polite" | "assertive";
}

export interface A11yContext {
	announce: (message: string, priority?: "polite" | "assertive") => void;
	setFocus: (element: string) => void;
	getFocus: () => string | null;
	isScreenReaderActive: () => boolean;
}
