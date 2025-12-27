// Type definitions
export type CronExpression = string;

export interface Interval {
	seconds: number;
	minutes: number;
	hours: number;
	days: number;
}

export interface ScheduleConfig {
	name: string;
	description?: string;
	enabled: boolean;
	timezone?: string;
}
