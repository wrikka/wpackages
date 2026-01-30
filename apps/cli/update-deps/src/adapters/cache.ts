import { mkdir, readFile, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const CACHE_DIR = join(homedir(), '.update-deps-cache');

export async function getCacheKey(packageName: string): Promise<string> {
  return `package:${packageName}`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cachePath = join(CACHE_DIR, `${key}.json`);
    const content = await readFile(cachePath, 'utf-8');
    const data = JSON.parse(content);
    
    const expiry = data.expiry;
    if (expiry && Date.now() > expiry) {
      return null;
    }
    
    return data.value;
  } catch (error) {
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttl: number = 3600000): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    const cachePath = join(CACHE_DIR, `${key}.json`);
    const data = {
      value,
      expiry: Date.now() + ttl,
    };
    await writeFile(cachePath, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to set cache:', error);
  }
}

export async function clearCache(): Promise<void> {
  try {
    await rm(CACHE_DIR, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}
