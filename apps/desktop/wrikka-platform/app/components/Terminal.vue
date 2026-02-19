<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import { Terminal, type ITerminalAddon } from "xterm";
import "xterm/css/xterm.css";
import { FitAddon } from "xterm-addon-fit";
import { invoke } from "@tauri-apps/api/core";
import {
	listen,
	type EventCallback,
	type UnlistenFn,
} from "@tauri-apps/api/event";

const terminalRef: Ref<HTMLElement | null> = ref(null);
let term: Terminal | null = null;
let fitAddon: FitAddon | null = null;
let unlisten: UnlistenFn | null = null;
const tabId = "terminal-main";

onMounted(async () => {
	if (terminalRef.value) {
		term = new Terminal({
			cursorBlink: true,
			fontFamily: "monospace",
		});
		fitAddon = new FitAddon();
		term.loadAddon(fitAddon);
		term.open(terminalRef.value);
		fitAddon.fit();

		// @ai: Only run Tauri-specific code in a Tauri environment
		if (window.__TAURI__) {
			const cols = Math.max(10, term.cols || 80);
			const rows = Math.max(5, term.rows || 24);
			await invoke("init_pty", {
				tabId,
				config: {
					cols,
					rows,
					shell: "pwsh",
					shellArgs: ["-NoLogo"],
				},
			});

			term?.onData((data: string) => {
				invoke("pty_write", { tabId, data });
			});

			unlisten = await listen(
				"pty-data",
				(event: { payload: { tab_id: string; data: string } }) => {
					if (event.payload.tab_id === tabId && term) {
						term.write(event.payload.data);
					}
				},
			);
		}

		const handleResize = () => {
			fitAddon?.fit();
			if (!window.__TAURI__ || !term) return;
			invoke("pty_resize", {
				tabId,
				cols: Math.max(10, term.cols || 80),
				rows: Math.max(5, term.rows || 24),
			});
		};
		window.addEventListener("resize", handleResize);

		onBeforeUnmount(() => {
			window.removeEventListener("resize", handleResize);
			if (window.__TAURI__) {
				invoke("pty_close", { tabId });
			}
			if (unlisten) {
				unlisten();
			}
		});
	}
});

</script>

<template>

  <div ref="terminalRef" class="h-full"></div>

</template>