import {
	getPathDepth,
	getRelativePath,
	isAbsolutePath,
	isSubPath,
	joinPaths,
	normalizePath,
	resolvePath,
} from "./path-utils";

console.log("--- Path Utils Usage ---");

// normalizePath
const mixedPath = "some\\path//to/a/file.txt";
const normalized = normalizePath(mixedPath);
console.log(`normalizePath('${mixedPath}') ->`, normalized);

// resolvePath
const relative = "../another/path";
const resolved = resolvePath(relative);
console.log(`resolvePath('${relative}') ->`, resolved);

// getRelativePath
const fromPath = "/app/src";
const toPath = "/app/src/components/Button.ts";
const relativePath = getRelativePath(fromPath, toPath);
console.log(`getRelativePath('${fromPath}', '${toPath}') ->`, relativePath);

// isAbsolutePath
const absPath = "/is/absolute";
const relPath = "is/not/absolute";
console.log(`isAbsolutePath('${absPath}') ->`, isAbsolutePath(absPath));
console.log(`isAbsolutePath('${relPath}') ->`, isAbsolutePath(relPath));

// joinPaths
const joined = joinPaths("path", "to", "resource");
console.log(`joinPaths('path', 'to', 'resource') ->`, joined);

// getPathDepth
const deepPath = "/one/two/three/four";
const depth = getPathDepth(deepPath);
console.log(`getPathDepth('${deepPath}') ->`, depth);

// isSubPath
const parentPath = "/user/docs";
const childPath = "/user/docs/files/report.pdf";
const notChildPath = "/user/images/avatar.jpg";
console.log(
	`isSubPath('${parentPath}', '${childPath}') ->`,
	isSubPath(parentPath, childPath),
);
console.log(
	`isSubPath('${parentPath}', '${notChildPath}') ->`,
	isSubPath(parentPath, notChildPath),
);
