#!/usr/bin/env bun

import { intro, outro, select, text, spinner, isCancel } from '@clack/prompts';
import { spawn } from 'bun';
import { Recorder } from './pkg/core.js';
import path from 'path';

async function main() {
    intro(`Welcome to Terminal Recorder!`);

    const commandToRun = await text({
        message: 'What command would you like to record?',
        placeholder: 'e.g., ls -la',
        validate(value) {
            if (value.length === 0) return `Command cannot be empty!`
        },
    });

    if (isCancel(commandToRun)) {
        outro('Operation cancelled.');
        return;
    }

    const outputFileName = await text({
        message: 'Enter the output file name (without extension):',
        placeholder: 'recording',
        validate(value) {
            if (value.length === 0) return `File name cannot be empty!`
        },
    });

    if (isCancel(outputFileName)) {
        outro('Operation cancelled.');
        return;
    }

    const s = spinner();
    s.start('Starting recording...');

    const outputPath = path.resolve(process.cwd(), `${outputFileName}.gif`);
    const [command, ...args] = commandToRun.split(' ');

    try {
        const proc = spawn([command, ...args], {
            stdio: ['inherit', 'pipe', 'pipe'],
        });

        const recorder = new Recorder(80, 24, outputPath);
        let lastActivity = Date.now();

        const recordChunk = (chunk) => {
            const now = Date.now();
            const delay = now - lastActivity;
            lastActivity = now;
            recorder.record(chunk, delay > 1000 ? 100 : Math.round(delay / 10)); // delay in centiseconds
        };

        for await (const chunk of proc.stdout) {
            recordChunk(chunk);
        }
        for await (const chunk of proc.stderr) {
            recordChunk(chunk);
        }

        await proc.exited;

        s.stop('Recording finished!');
        outro(`Recording saved to ${outputPath}`);
    } catch (error) {
        s.stop('An error occurred.', 1);
        outro(`Error: ${error.message}`);
    }
}

main().catch(console.error);

