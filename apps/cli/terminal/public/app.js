// Terminal App - Main Application

class TerminalApp {
	constructor() {
		this.terminals = new Map(); // tabId -> { terminal, fitAddon, searchAddon, webLinksAddon }
		this.tabs = [];
		this.activeTabId = null;
		this.panes = [];
		this.activePaneId = null;
		this.commandPaletteOpen = false;
		this.searchOpen = false;
		this.selectedCommandIndex = 0;
		this.commands = [];

		this.init();
	}

	async init() {
		await this.loadCommands();
		this.setupEventListeners();
		this.createInitialTab();
		this.setupKeyboardShortcuts();

		// Listen for Tauri events
		if (window.__TAURI__) {
			this.setupTauriEventListeners();
		}
	}

	async loadCommands() {
		// Define available commands
		this.commands = [
			{
				id: "new-tab",
				title: "New Tab",
				description: "Create a new terminal tab",
				shortcut: "Ctrl+T",
				action: () => this.createNewTab(),
			},
			{
				id: "close-tab",
				title: "Close Tab",
				description: "Close the current tab",
				shortcut: "Ctrl+W",
				action: () => this.closeActiveTab(),
			},
			{
				id: "split-horizontal",
				title: "Split Pane Horizontal",
				description: "Split the current pane horizontally",
				shortcut: "Ctrl+Shift+D",
				action: () => this.splitPaneHorizontal(),
			},
			{
				id: "split-vertical",
				title: "Split Pane Vertical",
				description: "Split the current pane vertically",
				shortcut: "Ctrl+D",
				action: () => this.splitPaneVertical(),
			},
			{
				id: "command-palette",
				title: "Command Palette",
				description: "Open command palette",
				shortcut: "Ctrl+Shift+P",
				action: () => this.toggleCommandPalette(),
			},
			{
				id: "search",
				title: "Search",
				description: "Search in terminal",
				shortcut: "Ctrl+F",
				action: () => this.toggleSearch(),
			},
			{
				id: "zoom-in",
				title: "Zoom In",
				description: "Increase font size",
				shortcut: "Ctrl++",
				action: () => this.zoomIn(),
			},
			{
				id: "zoom-out",
				title: "Zoom Out",
				description: "Decrease font size",
				shortcut: "Ctrl+-",
				action: () => this.zoomOut(),
			},
			{
				id: "zoom-reset",
				title: "Reset Zoom",
				description: "Reset font size to default",
				shortcut: "Ctrl+0",
				action: () => this.resetZoom(),
			},
			{
				id: "clear",
				title: "Clear Screen",
				description: "Clear the terminal screen",
				shortcut: "Ctrl+L",
				action: () => this.clearScreen(),
			},
			{
				id: "copy",
				title: "Copy",
				description: "Copy selected text",
				shortcut: "Ctrl+Shift+C",
				action: () => this.copySelection(),
			},
			{
				id: "paste",
				title: "Paste",
				description: "Paste from clipboard",
				shortcut: "Ctrl+Shift+V",
				action: () => this.paste(),
			},
			{
				id: "settings",
				title: "Settings",
				description: "Open settings",
				shortcut: "Ctrl+,",
				action: () => this.openSettings(),
			},
			{
				id: "themes",
				title: "Themes",
				description: "Manage themes",
				shortcut: "",
				action: () => this.openThemes(),
			},
			{
				id: "profiles",
				title: "Profiles",
				description: "Manage profiles",
				shortcut: "",
				action: () => this.openProfiles(),
			},
			{
				id: "sessions",
				title: "Sessions",
				description: "Manage sessions",
				shortcut: "",
				action: () => this.openSessions(),
			},
		];
	}

	setupEventListeners() {
		// Command palette input
		const commandInput = document.getElementById("command-palette-input");
		commandInput.addEventListener("input", (e) =>
			this.filterCommands(e.target.value),
		);
		commandInput.addEventListener("keydown", (e) =>
			this.handleCommandPaletteKeydown(e),
		);

		// Search input
		const searchInput = document.getElementById("search-input");
		searchInput.addEventListener("input", (e) =>
			this.performSearch(e.target.value),
		);
		searchInput.addEventListener("keydown", (e) => this.handleSearchKeydown(e));

		// Search buttons
		document
			.getElementById("search-prev")
			.addEventListener("click", () => this.searchPrevious());
		document
			.getElementById("search-next")
			.addEventListener("click", () => this.searchNext());
		document
			.getElementById("search-close")
			.addEventListener("click", () => this.toggleSearch(false));

		// Window resize
		window.addEventListener("resize", () => this.handleResize());
	}

	setupKeyboardShortcuts() {
		document.addEventListener("keydown", (e) => {
			// Ignore if in input field
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
				return;
			}

			const key = this.getKeyString(e);

			// Command palette
			if (key === "Ctrl+Shift+P") {
				e.preventDefault();
				this.toggleCommandPalette();
			}
			// Search
			else if (key === "Ctrl+F") {
				e.preventDefault();
				this.toggleSearch();
			}
			// New tab
			else if (key === "Ctrl+T") {
				e.preventDefault();
				this.createNewTab();
			}
			// Close tab
			else if (key === "Ctrl+W") {
				e.preventDefault();
				this.closeActiveTab();
			}
			// Split horizontal
			else if (key === "Ctrl+Shift+D") {
				e.preventDefault();
				this.splitPaneHorizontal();
			}
			// Split vertical
			else if (key === "Ctrl+D") {
				e.preventDefault();
				this.splitPaneVertical();
			}
			// Zoom in
			else if (key === "Ctrl+=" || key === "Ctrl++") {
				e.preventDefault();
				this.zoomIn();
			}
			// Zoom out
			else if (key === "Ctrl+-") {
				e.preventDefault();
				this.zoomOut();
			}
			// Reset zoom
			else if (key === "Ctrl+0") {
				e.preventDefault();
				this.resetZoom();
			}
			// Clear screen
			else if (key === "Ctrl+L") {
				e.preventDefault();
				this.clearScreen();
			}
			// Copy
			else if (key === "Ctrl+Shift+C") {
				e.preventDefault();
				this.copySelection();
			}
			// Paste
			else if (key === "Ctrl+Shift+V") {
				e.preventDefault();
				this.paste();
			}
			// Escape
			else if (key === "Escape") {
				if (this.commandPaletteOpen) {
					this.toggleCommandPalette(false);
				} else if (this.searchOpen) {
					this.toggleSearch(false);
				}
			}
		});
	}

	setupTauriEventListeners() {
		// Listen for PTY data events
		if (window.__TAURI__?.event) {
			window.__TAURI__.event.listen("pty-data", (event) => {
				const { tab_id, data } = event.payload;
				this.writeToTerminal(tab_id, data);
			});

			// Listen for tab events
			window.__TAURI__.event.listen("tab-event", (event) => {
				this.handleTabEvent(event.payload);
			});

			// Listen for pane events
			window.__TAURI__.event.listen("pane-event", (event) => {
				this.handlePaneEvent(event.payload);
			});

			// Listen for theme events
			window.__TAURI__.event.listen("theme-event", (event) => {
				this.handleThemeEvent(event.payload);
			});
		}
	}

	getKeyString(e) {
		const parts = [];
		if (e.ctrlKey) parts.push("Ctrl");
		if (e.altKey) parts.push("Alt");
		if (e.shiftKey) parts.push("Shift");
		if (e.metaKey) parts.push("Meta");

		if (e.key && e.key.length === 1) {
			parts.push(e.key.toUpperCase());
		} else if (e.key) {
			parts.push(e.key);
		}

		return parts.join("+");
	}

	// Tab Management
	async createInitialTab() {
		if (window.__TAURI__?.invoke) {
			try {
				const tabId = await window.__TAURI__.invoke("create_tab", {
					config: {
						title: "Terminal",
						icon: null,
						pinned: false,
						closable: true,
					},
				});
				this.addTab(tabId, "Terminal");
				await this.createPTYSession(tabId);
			} catch (error) {
				console.error("Failed to create initial tab:", error);
				// Fallback: create tab without PTY
				this.addTab("local-" + Date.now(), "Terminal");
			}
		} else {
			// Running in browser without Tauri
			this.addTab("local-" + Date.now(), "Terminal");
		}
	}

	async createNewTab() {
		if (window.__TAURI__?.invoke) {
			try {
				const tabId = await window.__TAURI__.invoke("create_tab", {
					config: {
						title: "Terminal",
						icon: null,
						pinned: false,
						closable: true,
					},
				});
				this.addTab(tabId, "Terminal");
				await this.createPTYSession(tabId);
			} catch (error) {
				console.error("Failed to create tab:", error);
			}
		}
	}

	async closeActiveTab() {
		if (this.activeTabId && this.tabs.length > 1) {
			this.removeTab(this.activeTabId);

			if (window.__TAURI__?.invoke) {
				try {
					await window.__TAURI__.invoke("close_tab", {
						tabId: this.activeTabId,
					});
				} catch (error) {
					console.error("Failed to close tab:", error);
				}
			}
		}
	}

	async switchTab(tabId) {
		if (window.__TAURI__?.invoke) {
			try {
				await window.__TAURI__.invoke("switch_tab", { tabId });
			} catch (error) {
				console.error("Failed to switch tab:", error);
			}
		}
		this.setActiveTab(tabId);
	}

	addTab(tabId, title) {
		this.tabs.push({ id: tabId, title });
		this.renderTabs();
		this.setActiveTab(tabId);
	}

	removeTab(tabId) {
		const index = this.tabs.findIndex((t) => t.id === tabId);
		if (index !== -1) {
			this.tabs.splice(index, 1);

			// Clean up terminal
			if (this.terminals.has(tabId)) {
				const terminalData = this.terminals.get(tabId);
				terminalData.terminal.dispose();
				this.terminals.delete(tabId);
			}

			this.renderTabs();

			// Activate another tab
			if (this.tabs.length > 0) {
				const newActiveIndex = Math.min(index, this.tabs.length - 1);
				this.switchTab(this.tabs[newActiveIndex].id);
			} else {
				this.activeTabId = null;
			}
		}
	}

	setActiveTab(tabId) {
		this.activeTabId = tabId;
		this.renderTabs();
		this.renderPanes();
	}

	renderTabs() {
		const tabBar = document.getElementById("tab-bar");
		tabBar.innerHTML = "";

		this.tabs.forEach((tab) => {
			const tabEl = document.createElement("div");
			tabEl.className = `tab ${tab.id === this.activeTabId ? "active" : ""}`;
			tabEl.innerHTML = `
                <span class="tab-title">${tab.title}</span>
                <span class="tab-close" data-tab-id="${tab.id}">×</span>
            `;

			tabEl.addEventListener("click", (e) => {
				if (!e.target.classList.contains("tab-close")) {
					this.switchTab(tab.id);
				}
			});

			tabEl.querySelector(".tab-close").addEventListener("click", (e) => {
				e.stopPropagation();
				this.removeTab(tab.id);
			});

			tabBar.appendChild(tabEl);
		});

		// New tab button
		const newTabBtn = document.createElement("div");
		newTabBtn.className = "tab-new";
		newTabBtn.innerHTML = "+";
		newTabBtn.addEventListener("click", () => this.createNewTab());
		tabBar.appendChild(newTabBtn);
	}

	// Terminal Management
	async createPTYSession(tabId) {
		if (!window.__TAURI__?.invoke) return;

		try {
			await window.__TAURI__.invoke("create_pty_session", {
				tabId,
				config: {
					rows: 24,
					cols: 80,
					shell: "powershell.exe",
					shellArgs: [],
				},
			});
		} catch (error) {
			console.error("Failed to create PTY session:", error);
		}
	}

	createTerminal(tabId) {
		const container = document.createElement("div");
		container.className = "terminal-container";
		container.id = `terminal-${tabId}`;

		const terminal = new Terminal({
			cursorBlink: true,
			fontSize: 14,
			fontFamily: 'Consolas, "Courier New", monospace',
			theme: {
				background: "#1E1E2E",
				foreground: "#CDD6F4",
				cursor: "#F5E0DC",
				selection: "#45475A",
				black: "#45475A",
				red: "#F38BA8",
				green: "#A6E3A1",
				yellow: "#F9E2AF",
				blue: "#89B4FA",
				magenta: "#F5C2E7",
				cyan: "#94E2D5",
				white: "#BAC2DE",
				brightBlack: "#585B70",
				brightRed: "#F38BA8",
				brightGreen: "#A6E3A1",
				brightYellow: "#F9E2AF",
				brightBlue: "#89B4FA",
				brightMagenta: "#F5C2E7",
				brightCyan: "#94E2D5",
				brightWhite: "#A6ADC8",
			},
		});

		// Load addons
		const fitAddon = new FitAddon.FitAddon();
		const searchAddon = new SearchAddon.SearchAddon();
		const webLinksAddon = new WebLinksAddon.WebLinksAddon();

		terminal.loadAddon(fitAddon);
		terminal.loadAddon(searchAddon);
		terminal.loadAddon(webLinksAddon);

		// Handle input
		terminal.onData((data) => {
			this.handleTerminalInput(tabId, data);
		});

		// Handle selection
		terminal.onSelectionChange(() => {
			const selection = terminal.getSelection();
			if (selection) {
				this.handleSelection(tabId, selection);
			}
		});

		container.appendChild(terminal.element);
		return { container, terminal, fitAddon, searchAddon, webLinksAddon };
	}

	async handleTerminalInput(tabId, data) {
		if (window.__TAURI__?.invoke) {
			try {
				await window.__TAURI__.invoke("write_to_pty", {
					tabId,
					data,
				});
			} catch (error) {
				console.error("Failed to write to PTY:", error);
			}
		}
	}

	writeToTerminal(tabId, data) {
		if (this.terminals.has(tabId)) {
			const terminalData = this.terminals.get(tabId);
			terminalData.terminal.write(data);
		}
	}

	handleSelection(tabId, selection) {
		// Handle selection change
		console.log("Selection changed:", selection);
	}

	// Pane Management
	renderPanes() {
		const paneContainer = document.getElementById("pane-container");
		paneContainer.innerHTML = "";

		if (!this.activeTabId) return;

		// Create or get terminal for active tab
		if (!this.terminals.has(this.activeTabId)) {
			const terminalData = this.createTerminal(this.activeTabId);
			this.terminals.set(this.activeTabId, terminalData);
		}

		const terminalData = this.terminals.get(this.activeTabId);
		paneContainer.appendChild(terminalData.container);

		// Fit terminal
		setTimeout(() => {
			terminalData.fitAddon.fit();
		}, 10);
	}

	async splitPaneHorizontal() {
		if (!this.activeTabId) return;

		if (window.__TAURI__?.invoke) {
			try {
				const paneId = await window.__TAURI__.invoke("split_pane_horizontal", {
					paneId: this.activeTabId,
					ratio: 0.5,
				});
				console.log("Created pane:", paneId);
			} catch (error) {
				console.error("Failed to split pane:", error);
			}
		}
	}

	async splitPaneVertical() {
		if (!this.activeTabId) return;

		if (window.__TAURI__?.invoke) {
			try {
				const paneId = await window.__TAURI__.invoke("split_pane_vertical", {
					paneId: this.activeTabId,
					ratio: 0.5,
				});
				console.log("Created pane:", paneId);
			} catch (error) {
				console.error("Failed to split pane:", error);
			}
		}
	}

	// Command Palette
	toggleCommandPalette(show = null) {
		const commandPalette = document.getElementById("command-palette");
		const commandInput = document.getElementById("command-palette-input");

		this.commandPaletteOpen = show !== null ? show : !this.commandPaletteOpen;

		if (this.commandPaletteOpen) {
			commandPalette.classList.remove("hidden");
			commandInput.value = "";
			commandInput.focus();
			this.filterCommands("");
		} else {
			commandPalette.classList.add("hidden");
		}
	}

	filterCommands(query) {
		const resultsContainer = document.getElementById("command-palette-results");
		resultsContainer.innerHTML = "";

		const filteredCommands = this.commands.filter((cmd) => {
			const searchStr = `${cmd.title} ${cmd.description}`.toLowerCase();
			return searchStr.includes(query.toLowerCase());
		});

		this.selectedCommandIndex = 0;

		filteredCommands.forEach((cmd, index) => {
			const item = document.createElement("div");
			item.className = `command-palette-item ${index === 0 ? "selected" : ""}`;
			item.innerHTML = `
                <div class="command-palette-item-title">${cmd.title}</div>
                <div class="command-palette-item-description">${cmd.description}</div>
                ${cmd.shortcut ? `<div class="command-palette-item-shortcut">${cmd.shortcut}</div>` : ""}
            `;
			item.addEventListener("click", () => {
				cmd.action();
				this.toggleCommandPalette(false);
			});
			resultsContainer.appendChild(item);
		});
	}

	handleCommandPaletteKeydown(e) {
		const items = document.querySelectorAll(".command-palette-item");

		if (e.key === "ArrowDown") {
			e.preventDefault();
			this.selectedCommandIndex = Math.min(
				this.selectedCommandIndex + 1,
				items.length - 1,
			);
			this.updateSelectedCommand(items);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			this.selectedCommandIndex = Math.max(this.selectedCommandIndex - 1, 0);
			this.updateSelectedCommand(items);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const selectedItem = items[this.selectedCommandIndex];
			if (selectedItem) {
				selectedItem.click();
			}
		}
	}

	updateSelectedCommand(items) {
		items.forEach((item, index) => {
			item.classList.toggle("selected", index === this.selectedCommandIndex);
		});
	}

	// Search
	toggleSearch(show = null) {
		const searchBar = document.getElementById("search-bar");
		const searchInput = document.getElementById("search-input");

		this.searchOpen = show !== null ? show : !this.searchOpen;

		if (this.searchOpen) {
			searchBar.classList.remove("hidden");
			searchInput.value = "";
			searchInput.focus();
		} else {
			searchBar.classList.add("hidden");
			this.clearSearchHighlights();
		}
	}

	performSearch(query) {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);

		if (query) {
			const matches = terminalData.searchAddon.findNext(query, {
				regex: false,
				caseSensitive: false,
				wholeWord: false,
			});
		} else {
			this.clearSearchHighlights();
		}
	}

	searchNext() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		const searchInput = document.getElementById("search-input");

		if (searchInput.value) {
			terminalData.searchAddon.findNext(searchInput.value);
		}
	}

	searchPrevious() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		const searchInput = document.getElementById("search-input");

		if (searchInput.value) {
			terminalData.searchAddon.findPrevious(searchInput.value);
		}
	}

	clearSearchHighlights() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		terminalData.searchAddon.clearDecorations();
	}

	handleSearchKeydown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			this.searchNext();
		}
	}

	// Zoom
	zoomIn() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		const currentFontSize = terminalData.terminal.options.fontSize;
		terminalData.terminal.options.fontSize = Math.min(currentFontSize + 2, 72);
		terminalData.fitAddon.fit();
	}

	zoomOut() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		const currentFontSize = terminalData.terminal.options.fontSize;
		terminalData.terminal.options.fontSize = Math.max(currentFontSize - 2, 8);
		terminalData.fitAddon.fit();
	}

	resetZoom() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		terminalData.terminal.options.fontSize = 14;
		terminalData.fitAddon.fit();
	}

	// Clear
	clearScreen() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		terminalData.terminal.clear();
	}

	// Copy/Paste
	async copySelection() {
		if (!this.activeTabId || !this.terminals.has(this.activeTabId)) return;

		const terminalData = this.terminals.get(this.activeTabId);
		const selection = terminalData.terminal.getSelection();

		if (selection) {
			try {
				await navigator.clipboard.writeText(selection);
			} catch (error) {
				console.error("Failed to copy:", error);
			}
		}
	}

	async paste() {
		try {
			const text = await navigator.clipboard.readText();
			if (this.activeTabId) {
				this.handleTerminalInput(this.activeTabId, text);
			}
		} catch (error) {
			console.error("Failed to paste:", error);
		}
	}

	// Event Handlers
	handleTabEvent(event) {
		console.log("Tab event:", event);
		// Handle tab events from backend
	}

	handlePaneEvent(event) {
		console.log("Pane event:", event);
		// Handle pane events from backend
	}

	handleThemeEvent(event) {
		console.log("Theme event:", event);
		// Handle theme events from backend
	}

	handleResize() {
		this.terminals.forEach((terminalData) => {
			terminalData.fitAddon.fit();
		});
	}

	// Placeholder methods
	openSettings() {
		console.log("Open settings");
	}

	openThemes() {
		console.log("Open themes");
	}

	openProfiles() {
		console.log("Open profiles");
	}

	openSessions() {
		console.log("Open sessions");
	}
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	window.app = new TerminalApp();
});
