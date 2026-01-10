import * as cheerio from "cheerio";
import { Effect } from "effect";

export const parseHTML = (html: string) => {
  return Effect.try({
    try: () => cheerio.load(html),
    catch: (error) => new Error(`Failed to parse HTML: ${error}`),
  });
};

export const extractText = ($: cheerio.CheerioAPI, selector: string): string => {
  return $(selector).first().text().trim();
};

export const extractAttribute = ($: cheerio.CheerioAPI, selector: string, attribute: string): string | undefined => {
  return $(selector).first().attr(attribute);
};

export const extractAllText = ($: cheerio.CheerioAPI, selector: string): string[] => {
  const texts: string[] = [];
  $(selector).each((_, element) => {
    const text = $(element).text().trim();
    if (text) {
      texts.push(text);
    }
  });
  return texts;
};

export const extractLinks = ($: cheerio.CheerioAPI, selector: string): Array<{ text: string; url: string }> => {
  const links: Array<{ text: string; url: string }> = [];
  $(selector).each((_, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    const url = $el.attr("href");
    if (text && url) {
      links.push({ text, url });
    }
  });
  return links;
};

export const removeScriptsAndStyles = ($: cheerio.CheerioAPI): cheerio.CheerioAPI => {
  $("script, style, noscript, iframe").remove();
  return $;
};

export const extractMainContent = ($: cheerio.CheerioAPI): string => {
  const selectors = [
    "main",
    "article",
    '[role="main"]',
    ".content",
    ".post-content",
    ".article-content",
    "#content",
    "#main",
  ];

  for (const selector of selectors) {
    const content = $(selector);
    if (content.length > 0) {
      return content.text().trim();
    }
  }

  return $("body").text().trim();
};
