import { generateId } from 'lucia';
import { z } from 'zod';

import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { organizationPlugins, plugins } from '../../db';
import { logAuditEvent } from '../../services/audit';

const bodySchema = z.object({
  manifest: z.record(z.string(), z.unknown()),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const PLUGIN_ID_LENGTH = 15;

const allowedPermissions = [
  'ui:chatInput.toolbar',
  'ui:sidebar_section',
  'ui:message_actions',
  'chat:write_draft',
] as const;

const allowedExtensionPoints = [
  'ui:chatInput.toolbar',
  'ui:sidebar_section',
  'ui:message_actions',
  'chat:beforeSend',
] as const;

const manifestSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  description: z.string().optional(),
  entry: z.string().min(1),
  permissions: z.array(z.string()).optional(),
  extensionPoints: z.array(z.string()).optional(),
  configSchema: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const { manifest: rawManifest, enabled, config } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const parsedManifest = manifestSchema.parse(rawManifest);
  const normalizedManifest = {
    ...parsedManifest,
    permissions: (parsedManifest.permissions ?? []).filter(
      (p): p is (typeof allowedPermissions)[number] => {
        return (allowedPermissions as readonly string[]).includes(p);
      },
    ),
    extensionPoints: (parsedManifest.extensionPoints ?? []).filter(
      (p): p is (typeof allowedExtensionPoints)[number] => {
        return (allowedExtensionPoints as readonly string[]).includes(p);
      },
    ),
  };

  const manifestId =
    typeof normalizedManifest.id === 'string' && normalizedManifest.id.trim().length > 0
      ? normalizedManifest.id.trim()
      : null;
  const id = manifestId ?? `plg_${generateId(PLUGIN_ID_LENGTH)}`;

  const name = typeof normalizedManifest.name === 'string' ? normalizedManifest.name : id;
  const version = typeof normalizedManifest.version === 'string'
    ? normalizedManifest.version
    : '0.0.0';
  const description = typeof normalizedManifest.description === 'string'
    ? normalizedManifest.description
    : null;
  const entryUrl =
    typeof normalizedManifest.entry === 'string' && normalizedManifest.entry.trim().length > 0
      ? normalizedManifest.entry.trim()
      : null;

  if (!entryUrl) {
    throw createError({ statusCode: 400, statusMessage: 'manifest.entry is required' });
  }

  // v1 hardening: only allow same-origin plugin entry URLs
  // Require a relative path that will be served by this app (e.g. /plugins/hello/index.html)
  if (!entryUrl.startsWith('/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'manifest.entry must be a same-origin path starting with "/"',
    });
  }
  if (entryUrl.startsWith('//') || entryUrl.startsWith('/\\')) {
    throw createError({ statusCode: 400, statusMessage: 'manifest.entry is invalid' });
  }

  const db = await useDb();

  const [existing] = await db.select({ id: plugins.id }).from(plugins).where(eq(plugins.id, id));

  if (!existing) {
    await db.insert(plugins).values({
      id,
      name,
      version,
      description,
      entryUrl,
      manifest: normalizedManifest,
      createdAt: new Date(),
    });
  } else {
    await db
      .update(plugins)
      .set({ name, version, description, entryUrl, manifest: normalizedManifest })
      .where(eq(plugins.id, id));
  }

  const now = new Date();

  const [existingOrg] = await db
    .select({ pluginId: organizationPlugins.pluginId })
    .from(organizationPlugins)
    .where(and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, id),
    ));

  if (!existingOrg) {
    await db.insert(organizationPlugins).values({
      organizationId: org.id,
      pluginId: id,
      enabled: enabled ?? true,
      config: config ?? {},
      installedAt: now,
      updatedAt: now,
    });
  } else {
    await db
      .update(organizationPlugins)
      .set({
        enabled: enabled ?? true,
        config: config ?? {},
        updatedAt: now,
      })
      .where(and(
        eq(organizationPlugins.organizationId, org.id),
        eq(organizationPlugins.pluginId, id),
      ));
  }

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'plugin.install',
    targetId: id,
    targetType: 'plugin',
    details: { id, name, version, entryUrl },
  });

  return { id };
});
