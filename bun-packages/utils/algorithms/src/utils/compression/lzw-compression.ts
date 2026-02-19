export function encode(str: string): number[] {
	if (!str) return [];

	const dict: { [key: string]: number } = {};
	const data = str.split('');
	const out: number[] = [];
	let phrase = data[0]!;
	let code = 256;

	for (let i = 1; i < data.length; i++) {
		const currChar = data[i]!;
		if (dict[phrase + currChar] != null) {
			phrase += currChar;
		} else {
			out.push(phrase.length > 1 ? dict[phrase]! : phrase.charCodeAt(0));
			dict[phrase + currChar] = code;
			code++;
			phrase = currChar;
		}
	}
	out.push(phrase.length > 1 ? dict[phrase]! : phrase.charCodeAt(0));
	return out;
}

export function decode(arr: number[]): string {
	if (arr.length === 0) return '';

	const dict: { [key: number]: string } = {};
	let currChar = String.fromCharCode(arr[0]!);
	let oldPhrase = currChar;
	const out = [currChar];
	let code = 256;
	let phrase: string;

	for (let i = 1; i < arr.length; i++) {
		const currCode = arr[i]!;
		if (currCode < 256) {
			phrase = String.fromCharCode(currCode);
		} else {
			phrase = dict[currCode] ?? oldPhrase + currChar;
		}
		out.push(phrase);
		currChar = phrase.charAt(0);
		dict[code] = oldPhrase + currChar;
		code++;
		oldPhrase = phrase;
	}
	return out.join('');
}
