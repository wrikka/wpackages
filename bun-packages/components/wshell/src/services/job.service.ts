/**
 * Job Control for wshell
 * Background jobs (fg, bg, jobs)
 */
import { spawn, type ChildProcess } from "child_process";
import type { ShellValue } from "../types/value.types";
import { record, str, int, list, bool } from "../types/value.types";

// Job status
export type JobStatus = "running" | "stopped" | "done" | "error";

// Job definition
export interface Job {
  id: number;
  command: string;
  process: ChildProcess;
  status: JobStatus;
  exitCode?: number;
  startTime: Date;
  endTime?: Date;
}

// Job manager
export class JobManager {
  private jobs: Map<number, Job> = new Map();
  private nextId: number = 1;

  // Start a background job
  async start(command: string, args: string[] = []): Promise<Job> {
    const id = this.nextId++;
    
    const process = spawn(command, args, {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const job: Job = {
      id,
      command: `${command} ${args.join(" ")}`,
      process,
      status: "running",
      startTime: new Date(),
    };

    this.jobs.set(id, job);

    // Monitor process
    process.on("exit", (code) => {
      job.status = code === 0 ? "done" : "error";
      job.exitCode = code ?? undefined;
      job.endTime = new Date();
    });

    process.on("error", () => {
      job.status = "error";
      job.endTime = new Date();
    });

    return job;
  }

  // List all jobs
  list(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Get job by id
  get(id: number): Job | undefined {
    return this.jobs.get(id);
  }

  // Bring job to foreground (wait for completion)
  async foreground(id: number): Promise<number | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    return new Promise((resolve) => {
      if (job.status === "done" || job.status === "error") {
        resolve(job.exitCode);
        return;
      }

      job.process.on("exit", (code) => {
        resolve(code ?? undefined);
      });
    });
  }

  // Stop a running job
  stop(id: number): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== "running") return false;

    job.process.kill("SIGSTOP");
    job.status = "stopped";
    return true;
  }

  // Resume a stopped job
  resume(id: number): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== "stopped") return false;

    job.process.kill("SIGCONT");
    job.status = "running";
    return true;
  }

  // Kill a job
  kill(id: number, signal: NodeJS.Signals = "SIGTERM"): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    job.process.kill(signal);
    job.status = "error";
    job.endTime = new Date();
    return true;
  }

  // Remove completed jobs
  cleanup(): void {
    for (const [id, job] of this.jobs) {
      if (job.status === "done" || job.status === "error") {
        this.jobs.delete(id);
      }
    }
  }

  // Export jobs as ShellValue
  export(): ShellValue {
    return list(
      this.list().map(job => record({
        id: { _tag: "Int", value: BigInt(job.id) } as const,
        command: str(job.command),
        status: str(job.status),
        pid: { _tag: "Int", value: BigInt(job.process.pid || 0) } as const,
        exitCode: job.exitCode !== undefined 
          ? { _tag: "Int", value: BigInt(job.exitCode) } as const
          : { _tag: "Null" } as const,
      }))
    );
  }
}

// Global job manager
let globalJobManager: JobManager | null = null;

export function getJobManager(): JobManager {
  if (!globalJobManager) {
    globalJobManager = new JobManager();
  }
  return globalJobManager;
}
