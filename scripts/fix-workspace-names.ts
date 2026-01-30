#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// ฟังก์ชันสำหรับแปลง path เป็น workspace name
function pathToWorkspaceName(fullPath: string): string {
	const relativePath = fullPath.replace(rootDir, "").replace(/\\/g, "/");
	const parts = relativePath.split("/").filter(Boolean);

	// ลบ package.json ออกจาก path
	if (parts[parts.length - 1] === "package.json") {
		parts.pop();
	}

	// ถ้าไม่มี path หลังจากลบ package.json แสดงว่าเป็น root package.json
	if (parts.length === 0) {
		return null; // ไม่แก้ไข root package.json
	}

	// สร้าง workspace name จาก folder สุดท้าย
	const folderName = parts[parts.length - 1];
	return `@wpackages/${folderName}`;
}

// ฟังก์ชันสำหรับหา package.json ทั้งหมด
function findPackageJsonFiles(dir: string): string[] {
	const files: string[] = [];
	const { readdirSync, statSync } = require("fs");
	const { join } = require("path");

	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			// ข้ามโฟลเดอร์ที่ไม่ต้องการ
			if (
				entry === "node_modules" || entry === "dist" || entry === ".git"
				|| entry === "examples" || entry === "pkg" || entry === ".turbo"
			) {
				continue;
			}
			files.push(...findPackageJsonFiles(fullPath));
		} else if (entry === "package.json") {
			files.push(fullPath);
		}
	}

	return files;
}

// หา package.json ทั้งหมด
const packageJsonFiles = findPackageJsonFiles(rootDir);

console.log(`พบ ${packageJsonFiles.length} ไฟล์ package.json`);

// ตรวจสอบและแก้ไขแต่ละไฟล์
const changes: Array<{ file: string; oldName: string; newName: string }> = [];

for (const file of packageJsonFiles) {
	try {
		const content = readFileSync(file, "utf-8");
		const pkg = JSON.parse(content);

		if (!pkg.name) {
			console.log(`⚠️  ${file.replace(rootDir, "")}: ไม่มี name`);
			continue;
		}

		const expectedName = pathToWorkspaceName(file);

		if (pkg.name !== expectedName) {
			console.log(`📝 ${file.replace(rootDir, "")}:`);
			console.log(`   เดิม: ${pkg.name}`);
			console.log(`   ใหม่: ${expectedName}`);

			pkg.name = expectedName;
			writeFileSync(file, JSON.stringify(pkg, null, "\t") + "\n");

			changes.push({
				file: file.replace(rootDir, ""),
				oldName: pkg.name,
				newName: expectedName,
			});
		}
	} catch (error) {
		console.error(`❌ Error processing ${file}:`, error);
	}
}

console.log(`\n✅ แก้ไข ${changes.length} ไฟล์`);
