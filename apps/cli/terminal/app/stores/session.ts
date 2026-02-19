import type { Session, Tab, Pane } from "~/types";

export const useSessionStore = defineStore("session", () => {
	const sessions = ref<Session[]>([]);
	const activeSessionId = ref<string | null>(null);
	const currentSession = ref<Session | null>(null);

	const createSession = (name: string): string => {
		const id = crypto.randomUUID();
		const newSession: Session = {
			id,
			name,
			tabs: [],
			panes: [],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
		sessions.value.push(newSession);
		activeSessionId.value = id;
		currentSession.value = newSession;
		return id;
	};

	const updateSession = (id: string, updates: Partial<Session>) => {
		const session = sessions.value.find((s) => s.id === id);
		if (session) {
			Object.assign(session, updates);
			session.updatedAt = Date.now();
			if (currentSession.value?.id === id) {
				currentSession.value = session;
			}
		}
	};

	const deleteSession = (id: string) => {
		const index = sessions.value.findIndex((s) => s.id === id);
		if (index !== -1) {
			sessions.value.splice(index, 1);
			if (activeSessionId.value === id) {
				activeSessionId.value =
					sessions.value[Math.max(0, index - 1)]?.id || null;
				currentSession.value = sessions.value[Math.max(0, index - 1)] || null;
			}
		}
	};

	const activateSession = (id: string) => {
		const session = sessions.value.find((s) => s.id === id);
		if (session) {
			activeSessionId.value = id;
			currentSession.value = session;
		}
	};

	const saveSession = (id: string) => {
		const session = sessions.value.find((s) => s.id === id);
		if (session) {
			session.updatedAt = Date.now();
		}
	};

	const loadSession = (id: string) => {
		const session = sessions.value.find((s) => s.id === id);
		if (session) {
			currentSession.value = session;
			return session;
		}
		return null;
	};

	const restoreLastSession = () => {
		if (sessions.value.length > 0) {
			const lastSession = sessions.value[sessions.value.length - 1];
			activateSession(lastSession.id);
		}
	};

	return {
		sessions,
		activeSessionId,
		currentSession,
		createSession,
		updateSession,
		deleteSession,
		activateSession,
		saveSession,
		loadSession,
		restoreLastSession,
	};
});
