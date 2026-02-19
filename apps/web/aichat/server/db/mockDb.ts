import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MOCK_DB_DIR = join(process.cwd(), '.data');
const MOCK_DB_PATH = `file:${join(process.cwd(), '.data', 'mock.db')}`;

export function ensureMockDbDirectory() {
  mkdirSync(MOCK_DB_DIR, { recursive: true });
}

export function ensureMockDbFile() {
  const dbPath = join(process.cwd(), '.data', 'mock.db');
  if (!existsSync(dbPath)) {
    const sqliteHeader = Buffer.from('SQLite format 3\x00', 'binary');
    writeFileSync(dbPath, sqliteHeader);
  }
}

export function getMockDbPath() {
  return MOCK_DB_PATH;
}
