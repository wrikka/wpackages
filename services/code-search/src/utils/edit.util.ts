export type TextEdit = {
	start: number;
	end: number;
	insertedText: string;
};

export const applyEdits = (source: string, edits: readonly TextEdit[]): string => {
	const sorted = [...edits].sort((a, b) => b.start - a.start);
	let out = source;
	for (const e of sorted) {
		out = `${out.slice(0, e.start)}${e.insertedText}${out.slice(e.end)}`;
	}
	return out;
};
