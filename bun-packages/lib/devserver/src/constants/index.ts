export const DEFAULT_PORT = 5173;
export const DEFAULT_HOST = 'localhost';
export const DEFAULT_ROOT = process.cwd();
export const DEFAULT_BASE = '/';

export const HMR_DEFAULT_PORT = 24678;
export const HMR_DEFAULT_PATH = '/@hmr';
export const HMR_TIMEOUT = 30000;

export const DEFAULT_CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
export const DEFAULT_CORS_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

export const DEFAULT_SERVER_HEADERS = {
  'X-Powered-By': '@wpackages/devserver',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export const SUPPORTED_FILE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json',
  '.css', '.scss', '.sass', '.less',
  '.html', '.htm',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.woff', '.woff2', '.eot', '.ttf',
];

export const MIME_TYPES = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.ts': 'application/typescript',
  '.tsx': 'application/typescript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.scss': 'text/css',
  '.sass': 'text/css',
  '.less': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'font/ttf',
};

export const HMR_CLIENT_CODE = `
// HMR Client Code
const socket = new WebSocket('ws://${DEFAULT_HOST}:${HMR_DEFAULT_PORT}');

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'connected':
      console.log('[HMR] Connected to dev server');
      break;
    case 'update':
      if (message.file && import.meta.hot) {
        import.meta.hot.accept();
      }
      break;
    case 'full-reload':
      console.log('[HMR] Full page reload');
      window.location.reload();
      break;
    case 'error':
      console.error('[HMR]', message.data);
      break;
  }
});

socket.addEventListener('close', () => {
  console.log('[HMR] Disconnected from dev server');
});

socket.addEventListener('error', (error) => {
  console.error('[HMR] WebSocket error:', error);
});
`;
