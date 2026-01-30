/**
 * Dockerfile Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { parseDockerfile } from "./dockerfile.parser";

describe("Dockerfile Parser", () => {
	it("should parse Dockerfile", () => {
		const dockerfile = `
      FROM node:18-alpine
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci
      COPY . .
      EXPOSE 3000
      CMD ["npm", "start"]
    `;

		const result = parseDockerfile(dockerfile, "Dockerfile");
		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.language).toBe("dockerfile");
			expect(result.value.data.instructions?.length).toBeGreaterThan(0);
		}
	});
});
