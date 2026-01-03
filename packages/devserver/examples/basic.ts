import { createDevServer } from '../src';

const devServer = createDevServer({
  root: process.cwd(), // Watch the current directory
  port: 3000,
  hostname: 'localhost',
});

devServer.onReload(() => {
  console.log('Reload triggered!');
});

devServer.start();

console.log('Dev server started on http://localhost:3000');

process.on('SIGINT', () => {
  devServer.stop().then(() => {
    console.log('Dev server stopped.');
    process.exit(0);
  });
});
