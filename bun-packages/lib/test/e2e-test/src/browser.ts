import puppeteer, { type Browser, type Page } from "puppeteer";

export type BrowserSession = {
  browser: Browser;
  page: Page;
  close: () => Promise<void>;
};

export async function createBrowserSession(params: {
  headless: boolean;
}): Promise<BrowserSession> {
  const browser = await puppeteer.launch({ headless: params.headless });
  const page = await browser.newPage();

  return {
    browser,
    page,
    async close() {
      await page.close();
      await browser.close();
    },
  };
}
