import { db } from '~/server/utils/db'
import { eq, desc, count, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Get basic stats
    const [userCount, projectCount, activityCount] = await Promise.all([
      db.select({ count: count() }).from(users).then(res => res[0]?.count || 0),
      db.select({ count: count() }).from(projects).then(res => res[0]?.count || 0),
      db.select({ count: count() }).from(activities).then(res => res[0]?.count || 0),
    ])

    // Get recent activities
    const recentActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(10)

    // Get recent projects
    const recentProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(5)

    return {
      success: true,
      data: {
        stats: {
          users: userCount,
          projects: projectCount,
          activities: activityCount,
        },
        recentActivities,
        recentProjects,
      },
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dashboard data',
    })
  }
})
