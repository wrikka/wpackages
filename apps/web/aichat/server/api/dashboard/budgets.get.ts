import { join } from 'node:path';

// In a real application, this path would be configurable.
const BUDGET_STORE_PATH = process.env.BUDGET_STORE_PATH || join(process.cwd(), '.data', 'budgets.json');

export default defineEventHandler(async () => {
  try {
    const file = Bun.file(BUDGET_STORE_PATH);
    if (!(await file.exists())) {
      return {};
    }

    const store = await file.json();
    return store;

  } catch (error) {
    console.error('Failed to read budget store file:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load budget data',
    });
  }
});
