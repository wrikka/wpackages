import type { Nitro } from 'nitropack';
import { Server } from 'socket.io';

export default defineNitroPlugin((nitroApp) => {
  const io = new Server();

  nitroApp.hooks.hook('request', (event) => {
    // @ts-expect-error: `io` is not typed on `event.node.res`
    if (!event.node.res.io) {
      // @ts-expect-error: `io` is not typed on `event.node.res`
      event.node.res.io = io;
      io.attach(event.node.res.socket?.server);
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });
});
