import { GitHub, OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { requireAuth, useDb } from '../../../../composables';
import { userIntegrations } from '../../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const db = await useDb();

  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(event, 'github_oauth_state_integration') ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    throw createError({ status: 400, message: 'Invalid state or code' });
  }

  try {
    const config = useRuntimeConfig();
    const github = new GitHub(
      config.githubClientId,
      config.githubClientSecret,
    );

    const tokens = await github.validateAuthorizationCode(code);

    // Check if an integration for this provider already exists
    const existingIntegration = await db.query.userIntegrations.findFirst({
      where: and(
        eq(userIntegrations.userId, user.id),
        eq(userIntegrations.provider, 'github'),
      ),
    });

    if (existingIntegration) {
      // Update existing integration
      await db.update(userIntegrations)
        .set({
          accessToken: tokens.accessToken,
          // refreshToken and expiresAt might not be provided by GitHub, handle accordingly
        })
        .where(eq(userIntegrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(userIntegrations).values({
        id: generateId(15),
        userId: user.id,
        provider: 'github',
        accessToken: tokens.accessToken,
        // refreshToken, scopes, and expiresAt can be added if available from the provider
      });
    }

    return sendRedirect(event, '/settings/integrations');
  } catch (e) {
    console.error('GitHub OAuth Error:', e);
    if (e instanceof OAuth2RequestError) {
      throw createError({ status: 400, message: 'OAuth request failed' });
    }
    throw createError({ status: 500, message: 'An internal error occurred' });
  }
});
