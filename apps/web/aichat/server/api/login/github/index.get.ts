import { generateState, GitHub } from 'arctic';

import { requireAuth, requireOrg, useDb } from '../../../composables';
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const github = new GitHub(
    config.githubClientId,
    config.githubClientSecret,
  );

  const state = generateState();
  const url = await github.createAuthorizationURL(state);

  setCookie(event, 'github_oauth_state', state, {
    path: '/',
    secure: !import.meta.dev,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  return sendRedirect(event, url.toString());
});
