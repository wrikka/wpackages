<script setup>

import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { io } from 'socket.io-client'

// NOTE TO USER: To make this work, you need to install 'xterm', 'xterm-addon-fit', and 'socket.io-client'.
// Run: bun add xterm xterm-addon-fit socket.io-client

const terminalContainer = ref(null)
let term = null
let fitAddon = null
let socket = null

onMounted(() => {
  term = new Terminal({
    cursorBlink: true,
    theme: {
      background: '#1e1e1e',
    }
  });
  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  term.open(terminalContainer.value);
  fitAddon.fit();

  // Establish WebSocket connection
  // The fetch is just to initialize the WebSocket server on the backend
  fetch('/api/terminal')
  socket = io();

  // Handle incoming data from the server
  socket.on('terminal:data', (data) => {
    term.write(data);
  });

  // Send user input to the server
  term.onData((data) => {
    socket.emit('terminal:write', data);
  });

  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    fitAddon.fit();
    socket.emit('terminal:resize', { cols: term.cols, rows: term.rows });
  });
  resizeObserver.observe(terminalContainer.value);

  onBeforeUnmount(() => {
    socket.disconnect();
    term.dispose();
    resizeObserver.disconnect();
  });
});

</script>

<template>

  <div ref="terminalContainer" class="w-full h-full bg-black"></div>

</template>