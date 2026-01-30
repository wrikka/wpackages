import { Event } from '../types/analytics.js';

export interface AutoTrackingConfig {
  enablePageViewTracking: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  enableClickTracking: boolean;
  enableScrollTracking: boolean;
  enableFormTracking: boolean;
  samplingRate?: number;
}

export class AutoTracker {
  private config: AutoTrackingConfig;
  private trackCallback: (event: Event) => void;
  private initialized: boolean = false;

  constructor(config: AutoTrackingConfig, trackCallback: (event: Event) => void) {
    this.config = config;
    this.trackCallback = trackCallback;
  }

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (this.config.enablePageViewTracking) {
      this.setupPageViewTracking();
    }

    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    if (this.config.enableClickTracking) {
      this.setupClickTracking();
    }

    if (this.config.enableScrollTracking) {
      this.setupScrollTracking();
    }

    if (this.config.enableFormTracking) {
      this.setupFormTracking();
    }
  }

  private setupPageViewTracking(): void {
    if (typeof window === 'undefined') return;

    const trackPageView = () => {
      this.trackCallback({
        name: 'page_view',
        properties: {
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
        },
      });
    };

    trackPageView();

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(trackPageView, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setTimeout(trackPageView, 0);
    };

    window.addEventListener('popstate', trackPageView);
  }

  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackCallback({
        name: 'error',
        properties: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
        priority: 'high',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackCallback({
        name: 'error',
        properties: {
          type: 'unhandledrejection',
          reason: event.reason?.toString(),
          stack: event.reason?.stack,
        },
        priority: 'high',
      });
    });
  }

  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    const trackPerformance = () => {
      if (window.performance.timing) {
        const timing = window.performance.timing as any;
        this.trackCallback({
          name: 'performance',
          properties: {
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: timing.responseStart - timing.navigationStart,
            domCompleteTime: timing.domComplete - timing.navigationStart,
          },
        });
      }

      if (window.performance.getEntriesByType) {
        const paintEntries = window.performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          this.trackCallback({
            name: 'paint',
            properties: {
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
            },
          });
        });
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(trackPerformance, 0);
    } else {
      window.addEventListener('load', () => setTimeout(trackPerformance, 0));
    }
  }

  private setupClickTracking(): void {
    if (typeof window === 'undefined') return;

    let lastClickTime = 0;
    const clickDebounce = 1000;

    document.addEventListener('click', (event) => {
      const now = Date.now();
      if (now - lastClickTime < clickDebounce) return;
      lastClickTime = now;

      const target = event.target as HTMLElement;
      this.trackCallback({
        name: 'click',
        properties: {
          tagName: target.tagName,
          id: target.id,
          className: target.className,
          text: target.textContent?.slice(0, 100),
          href: (target as HTMLAnchorElement).href,
          x: event.clientX,
          y: event.clientY,
        },
      });
    }, true);
  }

  private setupScrollTracking(): void {
    if (typeof window === 'undefined') return;

    let lastScrollDepth = 0;
    const scrollDepths = [25, 50, 75, 90, 100];

    const trackScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

      scrollDepths.forEach((depth) => {
        if (scrollDepth >= depth && lastScrollDepth < depth) {
          this.trackCallback({
            name: 'scroll',
            properties: {
              depth,
              scrollTop,
              scrollHeight,
            },
          });
        }
      });

      lastScrollDepth = scrollDepth;
    };

    let scrollTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScroll, 100);
    }, { passive: true });
  }

  private setupFormTracking(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackCallback({
        name: 'form_submit',
        properties: {
          id: form.id,
          action: form.action,
          method: form.method,
          className: form.className,
        },
      });
    }, true);

    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        this.trackCallback({
          name: 'form_focus',
          properties: {
            tagName: target.tagName,
            type: target.type,
            name: target.name,
            id: target.id,
          },
        });
      }
    }, true);
  }

  destroy(): void {
    if (!this.initialized) return;
    this.initialized = false;
  }
}

export const createAutoTracker = (
  config: AutoTrackingConfig,
  trackCallback: (event: Event) => void,
): AutoTracker => {
  return new AutoTracker(config, trackCallback);
};
