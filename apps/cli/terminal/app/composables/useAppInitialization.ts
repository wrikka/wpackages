import { TERMINAL_DEFAULTS, createEmptyBuffer } from '~/constants/terminal'

export const useAppInitialization = () => {
	const terminalStore = useTerminalStore()
	const tabStore = useTabStore()
	const paneStore = usePaneStore()
	const sessionStore = useSessionStore()
	const themeStore = useThemeStore()

	const initializeApp = () => {
		themeStore.setActiveTheme('default-dark')
		sessionStore.createSession('Default Session')
		const rootPaneId = paneStore.createPane(null)
		const tabId = tabStore.createTab(rootPaneId)

		terminalStore.setBuffer(tabId, createEmptyBuffer(TERMINAL_DEFAULTS.COLS, TERMINAL_DEFAULTS.ROWS))
	}

	return {
		initializeApp,
	}
}
