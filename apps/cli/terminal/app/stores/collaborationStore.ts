import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Participant {
	id: string;
	name: string;
	color: string;
	cursorPosition?: { line: number; column: number };
	isHost: boolean;
}

interface SessionInfo {
	id: string;
	name: string;
	host: string;
	createdAt: string;
	participants: Participant[];
}

interface CollaborationState {
	activeSession: SessionInfo | null;
	isVoiceChatActive: boolean;
	isScreenSharing: boolean;
	createSession: (name: string) => Promise<SessionInfo>;
	joinSession: (sessionId: string, name: string) => Promise<SessionInfo>;
	leaveSession: (sessionId: string) => Promise<void>;
	sendMessage: (message: string) => Promise<void>;
	startVoiceChat: () => Promise<void>;
	stopVoiceChat: () => Promise<void>;
	startScreenSharing: () => Promise<void>;
	stopScreenSharing: () => Promise<void>;
	updateCursorPosition: (position: { line: number; column: number }) => void;
}

export const useCollaborationStore = create<CollaborationState>()(
	persist(
		(set, get) => ({
			activeSession: null,
			isVoiceChatActive: false,
			isScreenSharing: false,

			createSession: async (name: string) => {
				const session: SessionInfo = {
					id: crypto.randomUUID(),
					name,
					host: "localhost",
					createdAt: new Date().toISOString(),
					participants: [
						{
							id: crypto.randomUUID(),
							name: "You",
							color: "#FF5733",
							isHost: true,
						},
					],
				};

				set({ activeSession: session });
				return session;
			},

			joinSession: async (sessionId: string, name: string) => {
				const session: SessionInfo = {
					id: sessionId,
					name: "Shared Session",
					host: "remote",
					createdAt: new Date().toISOString(),
					participants: [
						{
							id: crypto.randomUUID(),
							name,
							color: "#33FF57",
							isHost: false,
						},
					],
				};

				set({ activeSession: session });
				return session;
			},

			leaveSession: async (sessionId: string) => {
				set({
					activeSession: null,
					isVoiceChatActive: false,
					isScreenSharing: false,
				});
			},

			sendMessage: async (message: string) => {
				console.log("Sending message:", message);
			},

			startVoiceChat: async () => {
				set({ isVoiceChatActive: true });
			},

			stopVoiceChat: async () => {
				set({ isVoiceChatActive: false });
			},

			startScreenSharing: async () => {
				set({ isScreenSharing: true });
			},

			stopScreenSharing: async () => {
				set({ isScreenSharing: false });
			},

			updateCursorPosition: (position) => {
				console.log("Updating cursor position:", position);
			},
		}),
		{
			name: "collaboration-storage",
		},
	),
);
