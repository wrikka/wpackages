export type FilePath = string;
export type FileContent = string;
export type FileOperationResult = Readonly<{
  success: boolean;
  message: string;
  path: FilePath;
}>;
