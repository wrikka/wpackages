import type { FilePath, FileContent } from "../types";
import { readFile, writeFile, deleteFile, existsFile } from "../utils";

export const readTextFile = (path: FilePath) => readFile(path);

export const writeTextFile = (
  path: FilePath,
  content: FileContent
) => writeFile(path, content);

export const removeFile = (path: FilePath) => deleteFile(path);

export const checkFileExists = (path: FilePath) => existsFile(path);
