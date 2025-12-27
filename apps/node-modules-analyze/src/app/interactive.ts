import * as p from '@clack/prompts';
import pc from 'picocolors';
import { analyzeProject } from '../services/analyzer.service';
import type { AnalysisReport, AnalyzedPackage } from '../types/analysis.types';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function showSummary(report: AnalysisReport) {
  p.note(
    `Total Size: ${pc.yellow(formatBytes(report.totalSize))}\n` +
    `Packages: ${pc.yellow(report.packageCount)}\n` +
    `Duplicates: ${pc.yellow(Object.keys(report.duplicates).length)}`,
    'Analysis Summary'
  );
}

async function showDuplicates(report: AnalysisReport) {
    if (Object.keys(report.duplicates).length === 0) {
        p.note('No duplicate packages found. Great!', 'Duplicates');
        return;
    }

    const duplicateOptions = Object.entries(report.duplicates).map(([name, pkgs]) => ({
        value: name,
        label: `${name} (${pkgs.length} versions)`,
        hint: pkgs.map(p => p.version).join(', ')
    }));

    const selected = await p.select({
        message: 'Found duplicates. Select a package to see details:',
        options: duplicateOptions,
    });

    if (typeof selected === 'string') {
        const pkgs = report.duplicates[selected];
        const tableData = pkgs.map(pkg => ({
            Version: pkg.version,
            Path: pkg.path.replace(process.cwd(), '.'),
            Size: formatBytes(pkg.size),
        }));
        p.table(tableData, `Versions of ${selected}`);
    }
}

export async function startInteractiveSession(projectPath: string) {
  p.intro(pc.inverse(`Analyzing ${projectPath}`));

  const s = p.spinner();
  s.start('Reading node_modules...');

  try {
    const report = await analyzeProject(projectPath);
    s.stop('Analysis complete!');

    await showSummary(report);

    const mainMenu = async () => {
        const choice = await p.select({
            message: 'What would you like to do?',
            options: [
                { value: 'duplicates', label: 'View Duplicates' },
                { value: 'top-heavy', label: 'View Largest Packages' },
                { value: 'exit', label: 'Exit' },
            ],
        });

        switch (choice) {
            case 'duplicates':
                await showDuplicates(report);
                await mainMenu();
                break;
            case 'top-heavy':
                const top10 = [...report.packages].sort((a, b) => b.size - a.size).slice(0, 10);
                p.table(top10.map(pkg => ({
                    Package: `${pkg.name}@${pkg.version}`,
                    Size: formatBytes(pkg.size),
                })), 'Top 10 Largest Packages');
                await mainMenu();
                break;
            case 'exit':
                p.outro('Goodbye!');
                break;
        }
    }

    await mainMenu();

  } catch (error) {
    s.stop('An error occurred during analysis.');
    p.error(error instanceof Error ? error.message : 'Unknown error');
  }
}
