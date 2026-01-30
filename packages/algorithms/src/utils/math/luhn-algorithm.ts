export function luhnCheck(numStr: string): boolean {
	const sanitizedStr = numStr.replace(/\s+/g, "");
	if (!/^[0-9]+$/.test(sanitizedStr)) {
		return false; // Invalid characters
	}

	const n = sanitizedStr.length;
	let sum = 0;
	let isSecond = false;

	for (let i = n - 1; i >= 0; i--) {
		const digitChar = sanitizedStr[i];
		if (digitChar === undefined) continue;

		let digit = parseInt(digitChar, 10);

		if (isSecond) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		isSecond = !isSecond;
	}

	return sum % 10 === 0;
}
