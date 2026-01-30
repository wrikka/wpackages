import type { FilePath, FileContent } from "../types";
import { readTextFile, writeTextFile, removeFile, checkFileExists } from "../services";

export const FileAdapter = {
  read: (path: FilePath) => readTextFile(path),
  write: (path: FilePath, content: FileContent) => writeTextFile(path, content),
  delete: (path: FilePath) => removeFile(path),
  exists: (path: FilePath) => checkFileExists(path)
};
