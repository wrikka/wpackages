import { Event } from '../types/analytics.js';

export interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  trafficAllocation: number[];
}

export interface Variant {
  id: string;
  name: string;
  weight: number;
  properties?: Record<string, unknown>;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  userId: string;
  assignedAt: number;
}

export class ABTestingTracker {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, Map<string, ExperimentAssignment>> = new Map();

  addExperiment(experiment: Experiment): void {
    this.experiments.set(experiment.id, experiment);
    if (!this.assignments.has(experiment.id)) {
      this.assignments.set(experiment.id, new Map());
    }
  }

  assignVariant(experimentId: string, userId: string): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const existingAssignment = this.assignments.get(experimentId)?.get(userId);
    if (existingAssignment) {
      return experiment.variants.find((v) => v.id === existingAssignment.variantId) || null;
    }

    const variant = this.selectVariant(experiment, userId);
    if (!variant) return null;

    const assignment: ExperimentAssignment = {
      experimentId,
      variantId: variant.id,
      userId,
      assignedAt: Date.now(),
    };

    this.assignments.get(experimentId)?.set(userId, assignment);

    return variant;
  }

  private selectVariant(experiment: Experiment, userId: string): Variant | null {
    const hash = this.hashString(`${experiment.id}-${userId}`);
    const normalizedHash = hash / 0xFFFFFFFF;
    let cumulative = 0;

    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.variants[i].weight;
      if (normalizedHash < cumulative) {
        return experiment.variants[i];
      }
    }

    return experiment.variants[experiment.variants.length - 1];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  trackExposure(experimentId: string, userId: string, trackCallback: (event: Event) => void): void {
    const assignment = this.assignments.get(experimentId)?.get(userId);
    if (!assignment) return;

    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    const variant = experiment.variants.find((v) => v.id === assignment.variantId);
    if (!variant) return;

    trackCallback({
      name: 'experiment_exposure',
      properties: {
        experimentId: experiment.id,
        experimentName: experiment.name,
        variantId: variant.id,
        variantName: variant.name,
        userId,
      },
    });
  }

  trackConversion(experimentId: string, userId: string, trackCallback: (event: Event) => void): void {
    const assignment = this.assignments.get(experimentId)?.get(userId);
    if (!assignment) return;

    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    const variant = experiment.variants.find((v) => v.id === assignment.variantId);
    if (!variant) return;

    trackCallback({
      name: 'experiment_conversion',
      properties: {
        experimentId: experiment.id,
        experimentName: experiment.name,
        variantId: variant.id,
        variantName: variant.name,
        userId,
        timeToConversion: Date.now() - assignment.assignedAt,
      },
    });
  }

  getExperiment(experimentId: string): Experiment | null {
    return this.experiments.get(experimentId) || null;
  }

  getAssignment(experimentId: string, userId: string): ExperimentAssignment | null {
    return this.assignments.get(experimentId)?.get(userId) || null;
  }

  getAllAssignments(experimentId: string): ExperimentAssignment[] {
    return Array.from(this.assignments.get(experimentId)?.values() || []);
  }

  removeExperiment(experimentId: string): void {
    this.experiments.delete(experimentId);
    this.assignments.delete(experimentId);
  }

  clearAssignments(userId: string): void {
    this.assignments.forEach((assignments) => {
      assignments.delete(userId);
    });
  }
}

export const createABTestingTracker = (): ABTestingTracker => {
  return new ABTestingTracker();
};
