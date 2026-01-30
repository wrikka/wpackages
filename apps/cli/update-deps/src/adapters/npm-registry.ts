import type { NpmPackageInfo } from '../types/index.js';
import { RegistryError, PackageNotFoundError } from '../error.js';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

export async function fetchPackageInfo(packageName: string): Promise<NpmPackageInfo> {
  try {
    const url = `${NPM_REGISTRY_URL}/${packageName}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new PackageNotFoundError(packageName);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof PackageNotFoundError) throw error;
    throw new RegistryError(`Failed to fetch package info for ${packageName}`);
  }
}

export async function fetchMultiplePackageInfos(
  packageNames: string[],
  concurrency: number = 10
): Promise<Map<string, NpmPackageInfo>> {
  const results = new Map<string, NpmPackageInfo>();
  const errors: Array<{ name: string; error: Error }> = [];
  
  for (let i = 0; i < packageNames.length; i += concurrency) {
    const batch = packageNames.slice(i, i + concurrency);
    const promises = batch.map(async (name) => {
      try {
        const info = await fetchPackageInfo(name);
        results.set(name, info);
      } catch (error) {
        errors.push({ name, error: error as Error });
      }
    });
    
    await Promise.all(promises);
  }
  
  if (errors.length > 0) {
    console.warn(`Failed to fetch ${errors.length} packages`);
  }
  
  return results;
}
