import { generateRoutes } from "../src";

const routes = generateRoutes({
	pagesDir: "./pages",
});

console.log(routes);
