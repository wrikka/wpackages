import { load } from "cheerio";
import { defineEventHandler, getQuery, createError } from "h3";
import { $fetch } from "ofetch";

export default defineEventHandler(async (event) => {
	const { url } = getQuery(event);
	if (!url || typeof url !== "string") {
		throw createError({
			statusCode: 400,
			statusMessage: "URL is required",
		});
	}

	const html = await $fetch<string>(url);
	const $ = load(html);

	const title = $("title").first().text();
	const faviconUrl = $('link[rel="icon"]').attr("href");

	return {
		url,
		title,
		faviconUrl,
	};
});
