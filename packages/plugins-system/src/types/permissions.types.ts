export type PluginPermission =
	| "filesystem:read"
	| "filesystem:write"
	| "network:fetch"
	| "network:listen"
	| "process:spawn"
	| "env:read"
	| "env:write"
	| "storage:read"
	| "storage:write";

export interface PluginPermissions {
	readonly granted: readonly PluginPermission[];
	readonly requested?: readonly PluginPermission[];
}

export interface PluginSecurityContext {
	readonly sandboxed: boolean;
	readonly permissions: PluginPermissions;
	readonly trustLevel: "trusted" | "verified" | "unverified";
}

export const hasPermission = (
	context: PluginSecurityContext,
	permission: PluginPermission,
): boolean => {
	return context.permissions.granted.includes(permission);
};

export const checkPermissions = (
	context: PluginSecurityContext,
	required: readonly PluginPermission[],
): readonly PluginPermission[] => {
	return required.filter((p) => !hasPermission(context, p));
};
