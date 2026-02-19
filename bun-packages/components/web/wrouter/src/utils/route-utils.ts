export const normalizeRoutePath = (pathName: string): string => {
	if (pathName === "index") {
		return "/";
	}
	if (pathName.endsWith("/index")) {
		return `/${pathName.slice(0, -"/index".length)}`;
	}
	return `/${pathName}`;
};

export const routeNameFromPath = (pathName: string): string => {
	if (pathName === "index") {
		return "index";
	}
	return pathName.replaceAll("/", "-");
};
