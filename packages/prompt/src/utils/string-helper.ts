export const capitalize = (s: string): string => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncate = (s: string, maxLength: number): string => {
	if (s.length <= maxLength) return s;
	return s.slice(0, maxLength - 3) + "...";
};

export const padEnd = (s: string, length: number, char = " "): string => {
	while (s.length < length) {
		s += char;
	}
	return s;
};

export const padStart = (s: string, length: number, char = " "): string => {
	while (s.length < length) {
		s = char + s;
	}
	return s;
};
