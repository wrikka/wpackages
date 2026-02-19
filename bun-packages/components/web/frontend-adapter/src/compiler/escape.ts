const escapeAttrValue = (s: string): string => s.replaceAll('"', "&quot;");

export const escapeHtmlText = (s: string): string =>
	s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const escapeHtmlAttr = (s: string): string =>
	escapeAttrValue(escapeHtmlText(s));
