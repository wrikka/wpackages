export interface BWTResult {
	transformed: string;
	index: number;
}

export function bwtEncode(text: string): BWTResult {
	if (text.length === 0) {
		return { transformed: "", index: 0 };
	}

	const rotations: string[] = [];
	for (let i = 0; i < text.length; i++) {
		rotations.push(text.slice(i) + text.slice(0, i));
	}

	rotations.sort();

	const transformed = rotations.map((r) => r[r.length - 1]).join("");
	const index = rotations.indexOf(text);

	return { transformed, index };
}

export function bwtDecode(transformed: string, index: number): string {
	if (transformed.length === 0) {
		return "";
	}

	const table = Array.from({ length: transformed.length }, () => "");

	for (let i = 0; i < transformed.length; i++) {
		for (let j = 0; j < transformed.length; j++) {
			table[j] = transformed[j] + (table[j] ?? "");
		}
		table.sort();
	}

	return table[index] ?? "";
}

export function bwtCoding(text: string): { encoded: BWTResult; decoded: string } {
	const encoded = bwtEncode(text);
	const decoded = bwtDecode(encoded.transformed, encoded.index);
	return { encoded, decoded };
}
