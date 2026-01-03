import { execa } from "execa";

export async function convertToGif(inputPath: string, outputPath: string): Promise<void> {
	try {
		await execa("asciicast2gif", [inputPath, outputPath], { stdio: "pipe" });
	} catch (error) {
		if (error instanceof Error && "exitCode" in error && error.exitCode === 127) {
			throw new Error("`asciicast2gif` command not found. Please install it first.");
		}
		throw new Error("Failed to convert to GIF.");
	}
}

export async function convertGifToMp4(inputPath: string, outputPath: string): Promise<void> {
	try {
		await execa("ffmpeg", [
			"-i",
			inputPath,
			"-movflags",
			"faststart",
			"-pix_fmt",
			"yuv420p",
			"-vf",
			"scale=trunc(iw/2)*2:trunc(ih/2)*2",
			outputPath,
		], { stdio: "pipe" });
	} catch (error) {
		if (error instanceof Error && "exitCode" in error && error.exitCode === 127) {
			throw new Error("`ffmpeg` command not found. Please install it first.");
		}
		throw new Error("Failed to convert to MP4.");
	}
}
