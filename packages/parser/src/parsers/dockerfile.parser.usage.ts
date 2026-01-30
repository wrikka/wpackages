/**
 * Dockerfile Parser - Usage Examples
 */

import { parseDockerfile, Result } from "../index";

const dockerfile = `
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  ENV NODE_ENV=production
  EXPOSE 3000
  HEALTHCHECK --interval=30s CMD node healthcheck.js
  CMD ["npm", "start"]
`;

const result = parseDockerfile(dockerfile, "Dockerfile");
if (Result.isOk(result)) {
	console.log("Instructions:", result.value.data.instructions?.length);
}
