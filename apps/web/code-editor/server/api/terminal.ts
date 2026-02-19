import { Server } from 'socket.io'
import os from 'os'
import pty from 'node-pty'

// NOTE TO USER: To make this work, you need to install 'socket.io' and 'node-pty'.
// Run: bun add socket.io node-pty

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

export default defineEventHandler((event) => {
  const { server } = event.node.res.socket;
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Terminal client connected');

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env
    });

    // Pipe PTY output to the client
    ptyProcess.on('data', (data) => {
      socket.emit('terminal:data', data);
    });

    // Handle client input
    socket.on('terminal:write', (data) => {
      ptyProcess.write(data);
    });

    // Handle client resize
    socket.on('terminal:resize', (size) => {
      ptyProcess.resize(size.cols, size.rows);
    });

    socket.on('disconnect', () => {
      console.log('Terminal client disconnected');
      ptyProcess.kill();
    });
  });

  // We need to end the request to avoid it hanging
  event.node.res.end();
})
