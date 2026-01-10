import type { PluginPermission, PluginPermissions, PluginSecurityContext } from "../types/permissions.types";

export const createPermissionManager = (defaultPermissions: PluginPermissions = {}): {
	readonly checkPermissions: (
		required: readonly PluginPermission[],
		context: PluginSecurityContext,
	) => boolean;
	readonly grantPermission: (context: PluginSecurityContext, permission: PluginPermission) => void;
	readonly revokePermission: (context: PluginSecurityContext, permission: PluginPermission) => void;
	readonly hasPermission: (context: PluginSecurityContext, permission: PluginPermission) => boolean;
} => {
	const permissions: Map<string, PluginPermissions> = new Map();

	const checkPermissions = (
		required: readonly PluginPermission[],
		context: PluginSecurityContext,
	): boolean => {
		const pluginPerms = permissions.get(context.pluginId) ?? defaultPermissions;

		return required.every((perm) => {
			const has = pluginPerms[perm];
			return has === true;
		});
	};

	const grantPermission = (context: PluginSecurityContext, permission: PluginPermission): void => {
		const pluginPerms = permissions.get(context.pluginId) ?? { ...defaultPermissions };
		pluginPerms[permission] = true;
		permissions.set(context.pluginId, pluginPerms);
	};

	const revokePermission = (context: PluginSecurityContext, permission: PluginPermission): void => {
		const pluginPerms = permissions.get(context.pluginId);
		if (pluginPerms) {
			pluginPerms[permission] = false;
			permissions.set(context.pluginId, pluginPerms);
		}
	};

	const hasPermission = (context: PluginSecurityContext, permission: PluginPermission): boolean => {
		const pluginPerms = permissions.get(context.pluginId) ?? defaultPermissions;
		return pluginPerms[permission] === true;
	};

	return Object.freeze({
		checkPermissions,
		grantPermission,
		revokePermission,
		hasPermission,
	});
};
