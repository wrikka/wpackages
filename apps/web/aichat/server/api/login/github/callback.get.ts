import { createDbClient, users } from '@aichat/db';
import { GitHub } from 'arctic';
import { OAuth2RequestError } from 'arctic';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { lucia } from '../../../utils/auth';

import { requireAuth, requireOrg, useDb } from '../../../composables';
export default defineEventHandler(async (event) => {
  const db = useDb();
  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(event, 'github_oauth_state') ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    throw createError({
      status: 400,
    });
  }

  try {
    const config = useRuntimeConfig();
    const github = new GitHub(
      config.githubClientId,
      config.githubClientSecret,
    );
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.githubId, githubUser.id),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize());
      return sendRedirect(event, '/');
    }

    const userId = generateId(15);
    await db.insert(users).values({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
    });

    const session = await lucia.createSession(userId, {});
    appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize());
    return sendRedirect(event, '/');
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      throw createError({
        status: 400,
      });
    }
    throw createError({
      status: 500,
    });
  }
});

interface GitHubUser {
  id: number;
  login: string;
}
