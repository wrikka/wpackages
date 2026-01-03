export type PathParts = Readonly<{
  pathname?: string;
  search?: string;
  hash?: string;
}>;

export function createPath({ pathname = '/', search = '', hash = '' }: PathParts): string {
  let path = pathname;

  if (search && search !== '?') {
    path += search.charAt(0) === '?' ? search : `?${search}`;
  }

  if (hash && hash !== '#') {
    path += hash.charAt(0) === '#' ? hash : `#${hash}`;
  }

  return path;
}

export type ParsedPath = Readonly<{
  pathname: string;
  search: string;
  hash: string;
}>;

export function parsePath(path: string): ParsedPath {
  const partialPath: { pathname?: string; search?: string; hash?: string } = {};
  let remaining = path;

  if (remaining) {
    const hashIndex = remaining.indexOf('#');
    if (hashIndex >= 0) {
      partialPath.hash = remaining.substring(hashIndex);
      remaining = remaining.substring(0, hashIndex);
    }

    const searchIndex = remaining.indexOf('?');
    if (searchIndex >= 0) {
      partialPath.search = remaining.substring(searchIndex);
      remaining = remaining.substring(0, searchIndex);
    }

    if (remaining) {
      partialPath.pathname = remaining;
    }
  }

  return {
    pathname: partialPath.pathname || '/',
    search: partialPath.search || '',
    hash: partialPath.hash || '',
  };
}

export function createKey(): string {
  return Math.random().toString(36).substring(2, 8);
}
