import { fetchPackageInfo } from './npm-registry.js';

process.stdin.on('data', async (data: Buffer) => {
  try {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'fetch-package') {
      const packageInfo = await fetchPackageInfo(message.packageName);
      
      process.stdout.write(JSON.stringify({
        type: 'fetch-package-result',
        packageName: message.packageName,
        data: packageInfo,
      }) + '\n');
    }
  } catch (error) {
    process.stdout.write(JSON.stringify({
      type: 'fetch-package-result',
      packageName: message.packageName,
      error: (error as Error).message,
    }) + '\n');
  }
});
