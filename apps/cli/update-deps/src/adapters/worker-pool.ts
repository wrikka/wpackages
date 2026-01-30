import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface WorkerMessage {
  type: 'fetch-package';
  packageName: string;
}

export interface WorkerResponse {
  type: 'fetch-package-result';
  packageName: string;
  data?: any;
  error?: string;
}

export class WorkerPool {
  private workers: Array<{ worker: any; busy: boolean }> = [];
  private concurrency: number;

  constructor(concurrency: number = 10) {
    this.concurrency = concurrency;
  }

  async init(): Promise<void> {
    for (let i = 0; i < this.concurrency; i++) {
      const workerPath = join(__dirname, 'worker.js');
      const worker = spawn('bun', [workerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      this.workers.push({ worker, busy: false });
    }
  }

  async execute<T>(message: WorkerMessage): Promise<T> {
    const worker = this.getAvailableWorker();
    if (!worker) {
      throw new Error('No available workers');
    }

    worker.busy = true;

    return new Promise((resolve, reject) => {
      const handleMessage = (data: WorkerResponse) => {
        if (data.type === 'fetch-package-result' && data.packageName === (message as any).packageName) {
          worker.worker.stdout.off('data', handleMessage);
          worker.busy = false;
          
          if (data.error) {
            reject(new Error(data.error));
          } else {
            resolve(data.data);
          }
        }
      };

      worker.worker.stdout.on('data', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse worker message:', error);
        }
      });

      worker.worker.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  private getAvailableWorker() {
    return this.workers.find((w) => !w.busy);
  }

  async close(): Promise<void> {
    for (const { worker } of this.workers) {
      worker.kill();
    }
    this.workers = [];
  }
}
