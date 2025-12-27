export interface Task extends Record<string, unknown> {
	id: string;
	name: string;
	description: string;
	category: string;
	command: string;
}

export interface TaskSource {
	source: string;
	tasks: Task[];
}
