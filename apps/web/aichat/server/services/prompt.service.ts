import { eq, and, or, sql } from 'drizzle-orm';
import { generateId } from 'lucia';
import { promptTemplates, promptRatings } from '../db/schemas';
import { useDb } from '../composables';
import { promptTemplateSchema } from '../utils/validation-schemas';

export async function createPromptTemplate(data: any) {
  const db = await useDb();
  const validated = promptTemplateSchema.parse(data);

  const template = {
    id: generateId(15),
    organizationId: validated.organizationId,
    userId: validated.userId,
    ...validated,
    rating: 0,
    ratingCount: 0,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [result] = await db.insert(promptTemplates).values(template).returning();
  return result;
}

export async function ratePromptTemplate(templateId: string, userId: string, rating: number) {
  const db = await useDb();

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const existing = await db.query.promptRatings.findFirst({
    where: (promptRatings) =>
      sql`${promptRatings.promptTemplateId} = ${templateId} AND ${promptRatings.userId} = ${userId}`,
  });

  if (existing) {
    await db.update(promptRatings)
      .set({ rating })
      .where(eq(promptRatings.id, existing.id));
  } else {
    await db.insert(promptRatings).values({
      id: generateId(15),
      promptTemplateId: templateId,
      userId,
      rating,
      createdAt: new Date(),
    });
  }

  await db.execute(sql`
    UPDATE prompt_templates
    SET rating = (
      SELECT AVG(rating) FROM prompt_ratings WHERE prompt_template_id = ${templateId}
    ),
    rating_count = (
      SELECT COUNT(*) FROM prompt_ratings WHERE prompt_template_id = ${templateId}
    )
    WHERE id = ${templateId}
  `);

  const updated = await db.query.promptTemplates.findFirst({
    where: eq(promptTemplates.id, templateId),
  });

  return updated;
}

export async function getPromptTemplates(orgId: string, category?: string) {
  const db = await useDb();

  const templates = await db.query.promptTemplates.findMany({
    where: category
      ? and(
        eq(promptTemplates.organizationId, orgId),
        eq(promptTemplates.category, category),
      )
      : eq(promptTemplates.organizationId, orgId),
    orderBy: (promptTemplates) => [promptTemplates.rating],
  });

  return templates;
}

export async function searchPromptTemplates(searchTerm: string, orgId?: string) {
  const db = await useDb();

  const conditions = [
    sql`LOWER(${promptTemplates.name}) LIKE LOWER(${`%${searchTerm}%`})`,
    sql`LOWER(${promptTemplates.promptText}) LIKE LOWER(${`%${searchTerm}%`})`,
  ];

  if (orgId) {
    conditions.push(eq(promptTemplates.organizationId, orgId));
  }

  return await db.query.promptTemplates.findMany({
    where: or(...conditions),
    orderBy: (promptTemplates) => [promptTemplates.rating],
  });
}
