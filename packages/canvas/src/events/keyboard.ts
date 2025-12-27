export type KeyboardEventType = "keydown" | "keyup";

export interface KeyboardEvent {
	type: KeyboardEventType;
	key: string;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
}
