export const sanitizeName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
};

export const generateIdentifier = (name: string): string => {
  const sanitized = sanitizeName(name);
  return `com.wts.${sanitized}`;
};
