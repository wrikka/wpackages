export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

export function parseVersion(version: string): ParsedVersion {
  const cleanVersion = (version || '0.0.0').replace(/^[\^~]/, "").replace(/-.+$/, "");
  const parts = cleanVersion.split(".").map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1 || '0.0.0');
  const parsed2 = parseVersion(v2 || '0.0.0');

  if (parsed1.major !== parsed2.major) return parsed1.major - parsed2.major;
  if (parsed1.minor !== parsed2.minor) return parsed1.minor - parsed2.minor;
  return parsed1.patch - parsed2.patch;
}

export function isBreakingChange(currentVersion: string, newVersion: string): boolean {
  const current = parseVersion(currentVersion || '0.0.0');
  const newVer = parseVersion(newVersion || '0.0.0');
  return newVer.major > current.major;
}

export function calculateTimeDiff(currentTime: string, newTime: string): number {
  const current = new Date(currentTime);
  const newDate = new Date(newTime);
  return Math.floor((newDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
}
