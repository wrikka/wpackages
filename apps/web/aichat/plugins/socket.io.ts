import { io } from 'socket.io-client';

export default defineNuxtPlugin((_nuxtApp) => {
  const socket = io();

  return {
    provide: {
      socket,
    },
  };
});
