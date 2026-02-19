export function runLengthEncoding(text: string): string {
	if (text.length === 0) return "";

	let result = "";
	let count = 1;

	for (let i = 1; i < text.length; i++) {
		if (text[i] === text[i - 1]) {
			count++;
		} else {
			result += text[i - 1]! + count;
			count = 1;
		}
	}

	result += text[text.length - 1]! + count;
	return result;
}

export function runLengthDecoding(encoded: string): string {
	let result = "";
	let i = 0;

	while (i < encoded.length) {
		const char = encoded[i];
		i++;
		let countStr = "";

		while (i < encoded.length && !isNaN(Number(encoded[i]))) {
			countStr += encoded[i];
			i++;
		}

		const count = Number.parseInt(countStr, 10);
		result += char!.repeat(count);
	}

	return result;
}
