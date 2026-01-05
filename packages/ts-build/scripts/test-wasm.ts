import { build } from '../src/index';
import testConfig from '../bunpack.test.config';

console.log('Running WASM build test...');

build(testConfig).then(() => {
    console.log('WASM build test completed successfully.');
}).catch(err => {
    console.error('WASM build test failed:', err);
    process.exit(1);
});
