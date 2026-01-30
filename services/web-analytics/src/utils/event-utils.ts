export const generateEventId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const generateBatchId = (): string => {
  return `batch-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const formatTimestamp = (timestamp?: number): number => {
  return timestamp ?? Date.now();
};

export const sanitizeEventName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
};

export const isValidEventName = (name: string): boolean => {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(name);
};

export const chunkEvents = <T>(events: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < events.length; i += chunkSize) {
    chunks.push(events.slice(i, i + chunkSize));
  }
  return chunks;
};
