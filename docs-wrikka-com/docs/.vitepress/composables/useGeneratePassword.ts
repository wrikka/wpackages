export const useGeneratePassword = () => {
	const generatePassword = () => {
		const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		const lowercase = "abcdefghijkmnopqrstuvwxyz";
		const numbers = "23456789";
		const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

		let password = "";

		// ใส่ตัวอักษรจากทุกกลุ่มอย่างน้อย 2 ตัว
		password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
		password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
		password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
		password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
		password += numbers.charAt(Math.floor(Math.random() * numbers.length));
		password += numbers.charAt(Math.floor(Math.random() * numbers.length));
		password += symbols.charAt(Math.floor(Math.random() * symbols.length));
		password += symbols.charAt(Math.floor(Math.random() * symbols.length));

		// เติมส่วนที่เหลือด้วยอักขระแบบสุ่ม
		const allChars = uppercase + lowercase + numbers + symbols;
		for (let i = password.length; i < 20; i++) {
			password += allChars.charAt(Math.floor(Math.random() * allChars.length));
		}

		// สลับตำแหน่งอักขระเพื่อความสุ่มมากขึ้น
		return password
			.split("")
			.sort(() => Math.random() - 0.5)
			.join("");
	};

	const animatePasswordGeneration = (
		passwordField: HTMLInputElement,
		callback: (password: string) => void,
	) => {
		const _originalValue = passwordField.value;
		let count = 0;

		const animationInterval = setInterval(() => {
			let tempPassword = "";
			for (let i = 0; i < 16; i++) {
				tempPassword += String.fromCharCode(
					Math.random() > 0.5
						? Math.floor(Math.random() * (90 - 65 + 1)) + 65 // A-Z
						: Math.floor(Math.random() * (122 - 97 + 1)) + 97, // a-z
				);
			}
			passwordField.value = tempPassword;
			count++;

			if (count > 10) {
				clearInterval(animationInterval);
				callback(generatePassword());
			}
		}, 100);
	};

	return {
		generatePassword,
		animatePasswordGeneration,
	};
};
