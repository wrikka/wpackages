import { Effect } from "effect";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

const ACCEPT_LANGUAGES = ["en-US,en;q=0.9", "en-GB,en;q=0.9", "en-US,en;q=0.8", "en-GB,en;q=0.8"];

const PLATFORMS = ["Win32", "MacIntel", "Linux x86_64"];

export class AntiDetectionService {
  private userAgentIndex = 0;
  private acceptLanguageIndex = 0;
  private platformIndex = 0;

  getRandomUserAgent(): Effect.Effect<string, Error> {
    return Effect.sync(() => {
      const index = Math.floor(Math.random() * USER_AGENTS.length);
      return USER_AGENTS[index];
    });
  }

  getRotatingUserAgent(): Effect.Effect<string, Error> {
    return Effect.sync(() => {
      const agent = USER_AGENTS[this.userAgentIndex];
      this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
      return agent;
    });
  }

  getRandomAcceptLanguage(): Effect.Effect<string, Error> {
    return Effect.sync(() => {
      const index = Math.floor(Math.random() * ACCEPT_LANGUAGES.length);
      return ACCEPT_LANGUAGES[index];
    });
  }

  getRandomPlatform(): Effect.Effect<string, Error> {
    return Effect.sync(() => {
      const index = Math.floor(Math.random() * PLATFORMS.length);
      return PLATFORMS[index];
    });
  }

  getRandomHeaders(): Effect.Effect<Record<string, string>, Error> {
    return Effect.gen(this, function* () {
      const userAgent = yield* this.getRandomUserAgent();
      const acceptLanguage = yield* this.getRandomAcceptLanguage();

      return {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": acceptLanguage,
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      };
    });
  }

  getRandomDelay(min: number = 1000, max: number = 3000): Effect.Effect<void, Error> {
    return Effect.gen(this, function* () {
      const delay = Math.floor(Math.random() * (max - min + 1)) + min;
      yield* Effect.sleep(delay);
    });
  }

  generateRandomSessionId(): Effect.Effect<string, Error> {
    return Effect.sync(() => {
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    });
  }

  generateRandomFingerprint(): Effect.Effect<Record<string, string>, Error> {
    return Effect.gen(this, function* () {
      const sessionId = yield* this.generateRandomSessionId();
      const platform = yield* this.getRandomPlatform();

      return {
        sessionId,
        platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth.toString(),
      };
    });
  }

  simulateHumanBehavior(): Effect.Effect<void, Error> {
    return Effect.gen(this, function* () {
      yield* this.getRandomDelay(500, 2000);
      yield* this.getRandomDelay(300, 1000);
    });
  }
}
