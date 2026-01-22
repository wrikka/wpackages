// Example TypeScript file with Interface
interface User {
	name: string;
	age: number;
	email?: string; // Optional property
}

const createUser = (user: User): string => {
	return `User ${user.name}, age ${user.age} created`;
};

// ตัวอย่างการใช้งาน
const newUser: User = {
	name: "John Doe",
	age: 30,
};

console.log(createUser(newUser));

// ตัวอย่างกับ optional property
const userWithEmail: User = {
	name: "Jane Smith",
	age: 25,
	email: "jane@example.com",
};

console.log(createUser(userWithEmail));

const message: string = "Hello, TypeScript!";
console.log(message);
