export class FileOperationError extends Error {
  readonly _tag: "FileOperationError" | "FileNotFoundError" | "PermissionError" = "FileOperationError";
  
  constructor(
    message: string,
    public readonly path?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "FileOperationError";
  }
}

export class FileNotFoundError extends FileOperationError {
  readonly _tag = "FileNotFoundError" as const;
  
  constructor(path: string, cause?: unknown) {
    super(`File not found: ${path}`, path, cause);
    this.name = "FileNotFoundError";
  }
}

export class PermissionError extends FileOperationError {
  readonly _tag = "PermissionError" as const;
  
  constructor(path: string, cause?: unknown) {
    super(`Permission denied: ${path}`, path, cause);
    this.name = "PermissionError";
  }
}
