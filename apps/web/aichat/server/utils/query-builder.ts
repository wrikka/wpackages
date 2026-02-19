import { eq, and, or, desc, asc, sql, count, sum } from 'drizzle-orm';

export interface QueryOptions {
  orderBy?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class QueryBuilder<T> {
  constructor(private db: any, private table: any) {}

  async findById(id: string): Promise<T | null> {
    return await this.db.query[this.table].findFirst({
      where: eq(this.table.id, id),
    });
  }

  async findByOrg(orgId: string, options: QueryOptions = {}): Promise<T[]> {
    const { orderBy: order = 'asc', limit, offset } = options;
    const orderByField = order === 'asc' ? asc : desc;

    return await this.db.query[this.table].findMany({
      where: eq(this.table.organizationId, orgId),
      ...(limit && { limit }),
      ...(offset && { offset }),
      orderBy: (table: any) => [orderByField(table.createdAt)],
    });
  }

  async findByUser(userId: string, options: QueryOptions = {}): Promise<T[]> {
    const { orderBy: order = 'asc', limit, offset } = options;
    const orderByField = order === 'asc' ? asc : desc;

    return await this.db.query[this.table].findMany({
      where: eq(this.table.userId, userId),
      ...(limit && { limit }),
      ...(offset && { offset }),
      orderBy: (table: any) => [orderByField(table.createdAt)],
    });
  }

  async findMany(conditions: Record<string, any> = {}, options: QueryOptions = {}): Promise<T[]> {
    const { orderBy: order = 'asc', limit, offset } = options;
    const orderByField = order === 'asc' ? asc : desc;

    const whereConditions = Object.entries(conditions).map(([key, value]) =>
      eq(this.table[key], value)
    );

    return await this.db.query[this.table].findMany({
      ...(whereConditions.length > 0 && {
        where: and(...whereConditions),
      }),
      ...(limit && { limit }),
      ...(offset && { offset }),
      orderBy: (table: any) => [orderByField(table.createdAt)],
    });
  }

  async count(conditions: Record<string, any> = {}): Promise<number> {
    const whereConditions = Object.entries(conditions).map(([key, value]) =>
      eq(this.table[key], value)
    );

    const result = await this.db
      .select({ count: count() })
      .from(this.table)
      .where(and(...whereConditions));

    return result[0]?.count || 0;
  }

  async exists(conditions: Record<string, any> = {}): Promise<boolean> {
    const whereConditions = Object.entries(conditions).map(([key, value]) =>
      eq(this.table[key], value)
    );

    const result = await this.db
      .select({ count: count() })
      .from(this.table)
      .where(and(...whereConditions));

    return (result[0]?.count || 0) > 0;
  }

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db.insert(this.table).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const [result] = await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id));

    return result > 0;
  }

  async softDelete(id: string): Promise<T> {
    return await this.update(id, { isDeleted: true, deletedAt: new Date() } as any);
  }

  async search(
    searchField: string,
    searchTerm: string,
    conditions: Record<string, any> = {}
  ): Promise<T[]> {
    const whereConditions = [
      ...Object.entries(conditions).map(([key, value]) => eq(this.table[key], value)),
      sql`LOWER(${this.table[searchField]}) LIKE LOWER(${`%${searchTerm}%`})`,
    ];

    return await this.db.query[this.table].findMany({
      where: and(...whereConditions),
    });
  }

  async aggregate(
    field: string,
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max' = 'count',
    conditions: Record<string, any> = {}
  ): Promise<number> {
    const whereConditions = Object.entries(conditions).map(([key, value]) =>
      eq(this.table[key], value)
    );

    const aggFn = operation === 'count' ? count : sum;

    const result = await this.db
      .select({ value: aggFn(this.table[field]) })
      .from(this.table)
      .where(and(...whereConditions));

    return result[0]?.value || 0;
  }
}

export function createQueryBuilder<T>(db: any, table: any): QueryBuilder<T> {
  return new QueryBuilder(db, table);
}
