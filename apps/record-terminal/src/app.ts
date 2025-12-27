import * as p from '@clack/prompts';
import pc from 'picocolors';
import { startRecording, convertToGif, convertGifToMp4 } from './services/index.js';

interface RecordOptions {
  output?: string;
  format?: 'gif' | 'mp4';
}

export async function run(options: RecordOptions) {
  p.intro(pc.cyan('Welcome to Terminal Recorder!'));

  const project = await p.group(
    {
      output: () =>
        p.text({
          message: 'Enter the output filename (without extension):',
          placeholder: options.output ?? 'recording',
          defaultValue: options.output ?? 'recording',
        }),
      format: () =>
        p.select<{
          value: 'gif' | 'mp4';
          label: string;
        }[], 'gif' | 'mp4'>({
          message: 'Select the output format:',
          options: [
            { value: 'gif', label: 'GIF' },
            { value: 'mp4', label: 'MP4' },
          ],
          initialValue: options.format ?? 'gif',
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    },
  );

  const s = p.spinner();
  s.start('Starting recording process...');

  const castFilePath = `${project.output}.cast`;
  const gifFilePath = `${project.output}.gif`;

  try {
    s.message('Waiting for you to start recording... Press Enter to start.');
    await startRecording(castFilePath);

    if (project.format === 'gif') {
      s.message('Converting to GIF...');
      await convertToGif(castFilePath, gifFilePath);
    } else if (project.format === 'mp4') {
      s.message('Converting to GIF first...');
      await convertToGif(castFilePath, gifFilePath);
      s.message('Converting GIF to MP4...');
      await convertGifToMp4(gifFilePath, `${project.output}.mp4`);
    }
  } catch (error) {
    p.cancel((error as Error).message);
    process.exit(1);
  }


  s.stop(`Recording saved to ${project.output}.${project.format}`)

  p.outro(pc.green('All done!'));
}
