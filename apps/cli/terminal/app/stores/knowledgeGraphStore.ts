import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CommandNode {
	id: string;
	command: string;
	timestamp: string;
	exitCode: number | null;
	durationMs: number | null;
	workingDir: string;
	embedding?: number[];
}

interface CommandEdge {
	from: string;
	to: string;
	type: "sequential" | "similar" | "dependent" | "alternative" | "related";
	weight: number;
}

interface KnowledgeGraphState {
	nodes: Record<string, CommandNode>;
	edges: CommandEdge[];
	patterns: Array<{
		type: string;
		description: string;
		value: string;
		confidence: number;
	}>;
	addNode: (node: CommandNode) => void;
	addEdge: (edge: CommandEdge) => void;
	searchCommands: (
		query: string,
	) => Promise<Array<{ id: string; score: number }>>;
	getSimilarCommands: (
		commandId: string,
	) => Promise<Array<{ id: string; score: number }>>;
	getCommandHistory: (limit: number) => CommandNode[];
	getFrequentCommands: (
		limit: number,
	) => Array<{ command: string; count: number }>;
	getCommandSuggestions: (partial: string, limit: number) => string[];
	analyzePatterns: () => void;
}

export const useKnowledgeGraphStore = create<KnowledgeGraphState>()(
	persist(
		(set, get) => ({
			nodes: {},
			edges: [],
			patterns: [],

			addNode: (node) =>
				set((state) => ({
					nodes: {
						...state.nodes,
						[node.id]: node,
					},
				})),

			addEdge: (edge) =>
				set((state) => ({
					edges: [...state.edges, edge],
				})),

			searchCommands: async (query: string) => {
				const { nodes } = get();
				const results = Object.values(nodes)
					.map((node) => ({
						id: node.id,
						score: calculateSimilarity(query, node.command),
					}))
					.filter((r) => r.score > 0.5)
					.sort((a, b) => b.score - a.score)
					.slice(0, 10);

				return results;
			},

			getSimilarCommands: async (commandId: string) => {
				const { nodes, edges } = get();
				const command = nodes[commandId];
				if (!command) return [];

				const similar = Object.values(nodes)
					.filter((n) => n.id !== commandId)
					.map((node) => ({
						id: node.id,
						score: calculateSimilarity(command.command, node.command),
					}))
					.filter((r) => r.score > 0.7)
					.sort((a, b) => b.score - a.score)
					.slice(0, 5);

				return similar;
			},

			getCommandHistory: (limit: number) => {
				const { nodes } = get();
				return Object.values(nodes)
					.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
					.slice(0, limit);
			},

			getFrequentCommands: (limit: number) => {
				const { nodes } = get();
				const frequency: Record<string, number> = {};

				Object.values(nodes).forEach((node) => {
					frequency[node.command] = (frequency[node.command] || 0) + 1;
				});

				return Object.entries(frequency)
					.map(([command, count]) => ({ command, count }))
					.sort((a, b) => b.count - a.count)
					.slice(0, limit);
			},

			getCommandSuggestions: (partial: string, limit: number) => {
				const { nodes } = get();
				const suggestions = Object.values(nodes)
					.map((n) => n.command)
					.filter((cmd) => cmd.startsWith(partial))
					.sort()
					.slice(0, limit);

				return suggestions;
			},

			analyzePatterns: () => {
				const { getFrequentCommands } = get();
				const frequent = getFrequentCommands(10);

				const patterns = frequent
					.filter((item) => item.count > 5)
					.map((item) => ({
						type: "frequent_command",
						description: `You run '${item.command}' ${item.count} times frequently`,
						value: item.command,
						confidence: Math.min(item.count / 100, 1),
					}));

				set({ patterns });
			},
		}),
		{
			name: "knowledge-graph-storage",
			partialize: (state) => ({
				nodes: state.nodes,
				edges: state.edges,
			}),
		},
	),
);

function calculateSimilarity(a: string, b: string): number {
	const distance = levenshteinDistance(a, b);
	const maxLen = Math.max(a.length, b.length);
	return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1,
				);
			}
		}
	}

	return matrix[b.length][a.length];
}
