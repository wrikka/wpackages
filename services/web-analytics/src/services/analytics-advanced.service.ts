import { Event } from '../types/analytics.js';

export interface FunnelStep {
  name: string;
  eventName: string;
  properties?: Record<string, unknown>;
}

export interface FunnelConfig {
  name: string;
  steps: FunnelStep[];
  windowDuration?: number;
}

export class FunnelTracker {
  private funnels: Map<string, FunnelConfig> = new Map();
  private funnelEvents: Map<string, Event[]> = new Map();

  addFunnel(config: FunnelConfig): void {
    this.funnels.set(config.name, config);
    this.funnelEvents.set(config.name, []);
  }

  trackEvent(event: Event): void {
    this.funnels.forEach((funnel, funnelName) => {
      const events = this.funnelEvents.get(funnelName) || [];
      
      const currentStepIndex = events.length;
      if (currentStepIndex >= funnel.steps.length) return;

      const currentStep = funnel.steps[currentStepIndex];
      
      if (currentStep && event.name === currentStep.eventName) {
        const newEvents = [...events, event];
        this.funnelEvents.set(funnelName, newEvents);

        if (newEvents.length === funnel.steps.length) {
          this.completeFunnel(funnelName);
        }
      }
    });
  }

  private completeFunnel(funnelName: string): void {
    const events = this.funnelEvents.get(funnelName) || [];
    const funnel = this.funnels.get(funnelName);

    if (!funnel) return;

    const lastEvent = events[events.length - 1];
      const firstEvent = events[0];
      const duration = lastEvent?.timestamp && firstEvent?.timestamp 
        ? lastEvent.timestamp - firstEvent.timestamp 
        : 0;
      
      this.trackCallback({
        name: 'funnel_complete',
        properties: {
          funnelName,
          steps: events.map((e) => e.name),
          duration,
        },
      });

    this.funnelEvents.set(funnelName, []);
  }

  getFunnelProgress(funnelName: string): { completed: number; total: number; percentage: number } {
    const funnel = this.funnels.get(funnelName);
    const events = this.funnelEvents.get(funnelName) || [];

    if (!funnel) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    return {
      completed: events.length,
      total: funnel.steps.length,
      percentage: (events.length / funnel.steps.length) * 100,
    };
  }

  resetFunnel(funnelName: string): void {
    this.funnelEvents.set(funnelName, []);
  }

  private trackCallback(event: Event): void {
  }
}

export interface CohortConfig {
  name: string;
  groupingProperty: string;
  timeWindow: number;
}

export class CohortTracker {
  private cohorts: Map<string, CohortConfig> = new Map();
  private cohortData: Map<string, Map<string, Event[]>> = new Map();

  addCohort(config: CohortConfig): void {
    this.cohorts.set(config.name, config);
    this.cohortData.set(config.name, new Map());
  }

  trackEvent(event: Event): void {
    this.cohorts.forEach((cohort, cohortName) => {
      const groupingValue = event.properties?.[cohort.groupingProperty] as string;
      
      if (!groupingValue) return;

      const cohortMap = this.cohortData.get(cohortName);
      if (!cohortMap) return;

      const events = cohortMap.get(groupingValue) || [];
      
      const now = Date.now();
      const filteredEvents = events.filter((e) => now - (e.timestamp || 0) <= cohort.timeWindow);
      
      filteredEvents.push(event);
      cohortMap.set(groupingValue, filteredEvents);
    });
  }

  getCohortData(cohortName: string): Map<string, Event[]> {
    return this.cohortData.get(cohortName) || new Map();
  }

  getCohortSize(cohortName: string): number {
    return this.cohortData.get(cohortName)?.size || 0;
  }

  getCohortEvents(cohortName: string, groupingValue: string): Event[] {
    return this.cohortData.get(cohortName)?.get(groupingValue) || [];
  }
}
