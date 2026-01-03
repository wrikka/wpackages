import { describe, expect, it } from "bun:test";

const BASE_URL = "http://localhost:3000";

describe("Server", () => {
	it("should return 200 on /", async () => {
		const response = await fetch(`${BASE_URL}/`);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("Hello from /index");
	});

	it("should return JSON on /hello", async () => {
		const response = await fetch(`${BASE_URL}/hello`);
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ message: "Hello from /hello" });
	});

	describe("/users/:id", () => {
		it("should return a user when found", async () => {
			const response = await fetch(`${BASE_URL}/users/123`);
			expect(response.status).toBe(200);
			const json = await response.json();
			expect(json).toEqual({
				user: { id: "123", name: "John Doe (from Service)" },
			});
		});

		it("should return 404 when user is not found", async () => {
			const response = await fetch(`${BASE_URL}/users/456`);
			expect(response.status).toBe(404);
		});
	});

	it("should return 404 on unknown route", async () => {
		const response = await fetch(`${BASE_URL}/not-found`);
		expect(response.status).toBe(404);
	});

	describe("CORS Plugin", () => {
		it("should handle pre-flight OPTIONS request", async () => {
			const response = await fetch(`${BASE_URL}/posts`, {
				method: "OPTIONS",
				headers: {
					Origin: "http://example.com",
					"Access-Control-Request-Method": "POST",
				},
			});
			expect(response.status).toBe(204);
			expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		});

		it("should add CORS headers to actual requests", async () => {
			const response = await fetch(`${BASE_URL}/hello`, {
				headers: {
					Origin: "http://example.com",
				},
			});
			expect(response.status).toBe(200);
			expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		});
	});

	describe("Static Plugin", () => {
		it("should serve a static file from the public directory", async () => {
			const response = await fetch(`${BASE_URL}/index.html`);
			expect(response.status).toBe(200);
			const text = await response.text();
			expect(text).toContain("<h1>Hello from a static HTML file!</h1>");
		});

		it("should return 404 for a static file that does not exist", async () => {
			const response = await fetch(`${BASE_URL}/non-existent-file.html`);
			expect(response.status).toBe(404);
		});
	});

	describe("POST /posts", () => {
		it("should create a new post with valid data", async () => {
			const response = await fetch(`${BASE_URL}/posts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: "New Post",
					content: "This is the content",
				}),
			});
			expect(response.status).toBe(201);
			const json = await response.json();
			expect(json.title).toBe("New Post");
			expect(json.content).toBe("This is the content");
		});

		it("should return 400 with invalid data", async () => {
			const response = await fetch(`${BASE_URL}/posts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: "New Post" }), // Missing content
			});
			expect(response.status).toBe(400);
		});

		it("should return 405 for non-POST requests", async () => {
			const response = await fetch(`${BASE_URL}/posts`, { method: "GET" });
			expect(response.status).toBe(405);
		});
	});
});
