export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const formatPath = (path: string): string =>
  path.replace(/\\/g, "/");

export const sanitizePath = (path: string): string =>
  path.trim().replace(/[<>:"|?*]/g, "");
