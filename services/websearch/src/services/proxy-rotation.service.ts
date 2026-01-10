import { Effect } from "effect";
import { ProxyConfig } from "../types";

interface ProxyEntry {
  url: string;
  username?: string;
  password?: string;
  priority: number;
  failures: number;
  lastUsed: number;
  cooldownUntil: number;
}

export class ProxyRotationService {
  private proxies: ProxyEntry[] = [];
  private currentIndex = 0;
  private strategy: "round-robin" | "random" | "least-used" = "round-robin";
  private maxFailures = 3;
  private cooldownPeriod = 60000;

  constructor(config: ProxyConfig) {
    this.strategy = config.rotationStrategy;
    this.maxFailures = config.maxFailures;
    this.cooldownPeriod = config.cooldownPeriod;

    this.proxies = config.proxies.map((p) => ({
      ...p,
      failures: 0,
      lastUsed: 0,
      cooldownUntil: 0,
    }));

    this.proxies.sort((a, b) => b.priority - a.priority);
  }

  getNextProxy(): Effect.Effect<string | null, Error> {
    return Effect.sync(() => {
      const now = Date.now();
      const availableProxies = this.proxies.filter((p) => p.failures < this.maxFailures && p.cooldownUntil <= now);

      if (availableProxies.length === 0) {
        return null;
      }

      switch (this.strategy) {
        case "round-robin":
          return this.getRoundRobinProxy(availableProxies);
        case "random":
          return this.getRandomProxy(availableProxies);
        case "least-used":
          return this.getLeastUsedProxy(availableProxies);
        default:
          return this.getRoundRobinProxy(availableProxies);
      }
    });
  }

  private getRoundRobinProxy(proxies: ProxyEntry[]): string {
    const proxy = proxies[this.currentIndex % proxies.length];
    this.currentIndex++;
    this.markUsed(proxy);
    return this.buildProxyUrl(proxy);
  }

  private getRandomProxy(proxies: ProxyEntry[]): string {
    const index = Math.floor(Math.random() * proxies.length);
    const proxy = proxies[index];
    this.markUsed(proxy);
    return this.buildProxyUrl(proxy);
  }

  private getLeastUsedProxy(proxies: ProxyEntry[]): string {
    const sorted = [...proxies].sort((a, b) => a.lastUsed - b.lastUsed);
    const proxy = sorted[0];
    this.markUsed(proxy);
    return this.buildProxyUrl(proxy);
  }

  private markUsed(proxy: ProxyEntry): void {
    proxy.lastUsed = Date.now();
  }

  private buildProxyUrl(proxy: ProxyEntry): string {
    if (proxy.username && proxy.password) {
      const url = new URL(proxy.url);
      url.username = proxy.username;
      url.password = proxy.password;
      return url.toString();
    }
    return proxy.url;
  }

  markFailure(proxyUrl: string): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      const proxy = this.proxies.find((p) => this.buildProxyUrl(p) === proxyUrl);
      if (proxy) {
        proxy.failures++;
        if (proxy.failures >= this.maxFailures) {
          proxy.cooldownUntil = Date.now() + this.cooldownPeriod;
        }
      }
    });
  }

  markSuccess(proxyUrl: string): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      const proxy = this.proxies.find((p) => this.buildProxyUrl(p) === proxyUrl);
      if (proxy) {
        proxy.failures = Math.max(0, proxy.failures - 1);
      }
    });
  }

  getStats(): Effect.Effect<{ total: number; available: number; failed: number; inCooldown: number }, Error> {
    return Effect.sync(() => {
      const now = Date.now();
      const available = this.proxies.filter((p) => p.failures < this.maxFailures && p.cooldownUntil <= now).length;
      const failed = this.proxies.filter((p) => p.failures >= this.maxFailures).length;
      const inCooldown = this.proxies.filter((p) => p.cooldownUntil > now).length;

      return {
        total: this.proxies.length,
        available,
        failed,
        inCooldown,
      };
    });
  }

  resetFailures(): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      for (const proxy of this.proxies) {
        proxy.failures = 0;
        proxy.cooldownUntil = 0;
      }
    });
  }
}
