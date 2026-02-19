export function requireAuth(event: any) {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  return user;
}

export function requireOrg(event: any) {
  const org = event.context.org;
  if (!org) {
    throw createError({ statusCode: 400, statusMessage: 'Organization ID is required' });
  }
  return org;
}
