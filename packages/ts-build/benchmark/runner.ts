import { exec } from 'child_process';
import { promisify } from 'util';
import pc from 'picocolors';

const execAsync = promisify(exec);

async function runBenchmark(name: string, command: string) {
  console.log(`
${pc.cyan(`Running benchmark for: ${pc.bold(name)}`)}`);
  console.log(`${pc.gray(`> ${command}`)}`);

  const startTime = performance.now();
  try {
    await execAsync(command, { cwd: process.cwd() });
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`${pc.green('✔ Success!')} ${pc.gray(`(${duration}ms)`)}`);
  } catch (error) {
    console.error(`${pc.red('✖ Failed!')}`);
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

async function main() {
  const benchProjectEntry = 'examples/bench-project/src/index.ts';
  const benchProjectOutDir = 'examples/bench-project/dist';

  await runBenchmark(
    'ts-build (rolldown)',
    `bun ./bin/ts-build.ts build --entry ${benchProjectEntry} --outDir ${benchProjectOutDir}`
  );

  // You need to have tsup and tsdown installed globally or in the root devDependencies
  // to run these benchmarks.
  await runBenchmark(
    'tsup',
    `tsup ${benchProjectEntry} --out-dir ${benchProjectOutDir} --format esm --dts`
  );

  await runBenchmark(
    'tsdown',
    `tsdown --entry ${benchProjectEntry} --outdir ${benchProjectOutDir}`
  );
}

main().catch(console.error);
