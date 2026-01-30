import { describe, expect, it, spyOn } from "bun:test";
import { setupMicroservices } from "./index";

describe("Microservices Pattern", () => {
	it("should allow services to communicate via a message bus", () => {
		const { userService, orderService } = setupMicroservices();

		// Spy on the private method to verify it's called
		const handleUserCreatedSpy = spyOn(orderService as any, "handleUserCreated");

		// Action in one service triggers a reaction in another
		userService.createUser("Alice", "user-123");

		expect(handleUserCreatedSpy).toHaveBeenCalledWith({ userId: "user-123", name: "Alice" });
	});
});
