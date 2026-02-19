import { createStorage } from 'unstorage';

const storage = createStorage();

const RATE_LIMIT = 10; // Max 10 requests
const TIME_FRAME = 60 * 1000; // per 1 minute

export async function checkRateLimit(key: string) {
  const records = (await storage.getItem<number[]>(key)) || [];
  const now = Date.now();

  // Filter out records that are outside the time frame
  const recentRecords = records.filter(timestamp => now - timestamp < TIME_FRAME);

  if (recentRecords.length >= RATE_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    });
  }

  // Add the new request timestamp
  recentRecords.push(now);
  await storage.setItem(key, recentRecords);
}
