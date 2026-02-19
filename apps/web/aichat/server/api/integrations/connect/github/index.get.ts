import { generateState, GitHub } from 'arctic';
import { requireAuth } from '../../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const config = useRuntimeConfig();
  const github = new GitHub(
    config.githubClientId,
    config.githubClientSecret,
  );

  const state = generateState();
  const url = await github.createAuthorizationURL(state, {
    scopes: ['repo', 'user'], // Request necessary scopes
  });

  setCookie(event, 'github_oauth_state_integration', state, {
    path: '/',
    secure: !import.meta.dev,
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax',
  });

  return sendRedirect(event, url.toString());
});
