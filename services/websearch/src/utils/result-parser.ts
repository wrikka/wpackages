import * as cheerio from "cheerio";
import { SearchResult, SearchEngineType } from "../types";

export const parseGoogleResults = (html: string): SearchResult[] => {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('div[data-hveid]').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find("h3").first();
    const linkEl = $el.find("a").first();
    const snippetEl = $el.find("div[data-sncf]").first();

    if (titleEl.length && linkEl.length) {
      results.push({
        title: titleEl.text().trim(),
        url: linkEl.attr("href") || "",
        snippet: snippetEl.text().trim() || $el.find("span[st]").first().text().trim(),
        score: 0.5,
        engine: "google",
        metadata: {},
      });
    }
  });

  return results;
};

export const parseBingResults = (html: string): SearchResult[] => {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('li.b_algo').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find("h2 a").first();
    const snippetEl = $el.find("p").first();

    if (titleEl.length) {
      results.push({
        title: titleEl.text().trim(),
        url: titleEl.attr("href") || "",
        snippet: snippetEl.text().trim(),
        score: 0.5,
        engine: "bing",
        metadata: {},
      });
    }
  });

  return results;
};

export const parseDuckDuckGoResults = (html: string): SearchResult[] => {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('div.result').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find("a.result__a").first();
    const snippetEl = $el.find("a.result__snippet").first();

    if (titleEl.length) {
      results.push({
        title: titleEl.text().trim(),
        url: titleEl.attr("href") || "",
        snippet: snippetEl.text().trim(),
        score: 0.5,
        engine: "duckduckgo",
        metadata: {},
      });
    }
  });

  return results;
};

export const parseBraveResults = (html: string): SearchResult[] => {
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('div[data-type="web"]').each((_, element) => {
    const $el = $(element);
    const titleEl = $el.find("a.title").first();
    const snippetEl = $el.find("div.snippet").first();

    if (titleEl.length) {
      results.push({
        title: titleEl.text().trim(),
        url: titleEl.attr("href") || "",
        snippet: snippetEl.text().trim(),
        score: 0.5,
        engine: "brave",
        metadata: {},
      });
    }
  });

  return results;
};

export const parseResults = (html: string, engine: SearchEngineType): SearchResult[] => {
  switch (engine) {
    case "google":
      return parseGoogleResults(html);
    case "bing":
      return parseBingResults(html);
    case "duckduckgo":
      return parseDuckDuckGoResults(html);
    case "brave":
      return parseBraveResults(html);
    default:
      return [];
  }
};
