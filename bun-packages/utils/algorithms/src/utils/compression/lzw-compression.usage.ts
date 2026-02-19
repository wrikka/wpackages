import { encode, decode } from './lzw-compression';

const text = 'TOBEORNOTTOBEORTOBEORNOT';

const encoded = encode(text);
console.log('Encoded:', encoded);

const decoded = decode(encoded);
console.log('Decoded:', decoded);
