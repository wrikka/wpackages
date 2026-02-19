/**
 * Output Redirection for wshell
 * Advanced pipes and file redirection
 */
import { createWriteStream, createReadStream, promises as fs } from "fs";
import type { PipelineData } from "../types/pipeline.types";
import { pipelineValue, pipelineByteStream, collectToValue } from "../types/pipeline.types";
import type { ShellValue } from "../types/value.types";
import { str, binary } from "../types/value.types";

// Redirection options
export interface RedirectionOptions {
  stdout?: string;
  stderr?: string;
  stdin?: string;
  append?: boolean;
  overwrite?: boolean;
}

// Redirect output to file
export async function redirectToFile(
  data: PipelineData,
  filePath: string,
  append: boolean = false
): Promise<void> {
  const value = await collectToValue(data);
  
  let content: string | Buffer;
  if (value._tag === "Binary") {
    content = Buffer.from(value.data);
  } else if (value._tag === "String") {
    content = value.value;
  } else {
    content = JSON.stringify(value);
  }

  const flag = append ? "a" : "w";
  await fs.writeFile(filePath, content, { flag });
}

// Redirect from file to input
export async function redirectFromFile(filePath: string): Promise<PipelineData> {
  try {
    const content = await fs.readFile(filePath);
    return pipelineValue(binary(content));
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

// Tee - split output to multiple destinations
export async function tee(
  data: PipelineData,
  destinations: string[]
): Promise<PipelineData> {
  const value = await collectToValue(data);
  
  // Write to all destinations
  await Promise.all(
    destinations.map(dest => redirectToFile(pipelineValue(value), dest))
  );
  
  // Return original data for further processing
  return pipelineValue(value);
}

// Append to file
export async function appendToFile(
  data: PipelineData,
  filePath: string
): Promise<void> {
  return redirectToFile(data, filePath, true);
}

// Here document
export function hereDocument(content: string): PipelineData {
  return pipelineValue(str(content));
}

// Pipe to multiple commands (tee-like for commands)
export async function multiPipe(
  data: PipelineData,
  handlers: ((data: PipelineData) => Promise<PipelineData>)[]
): Promise<PipelineData[]> {
  const value = await collectToValue(data);
  
  return Promise.all(
    handlers.map(handler => handler(pipelineValue(value)))
  );
}
