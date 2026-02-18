/**
 * Remote Execution for wshell
 * SSH remote command execution
 */
import { spawn } from "child_process";
import type { ShellValue } from "../types/value.types";
import { record, str, int, list, bool } from "../types/value.types";

// SSH connection config
export interface SSHConfig {
  host: string;
  port?: number;
  user?: string;
  keyFile?: string;
  password?: string;
}

// Execute command via SSH
export async function sshExec(
  config: SSHConfig,
  command: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const args = [
    "-p", String(config.port || 22),
  ];

  if (config.keyFile) {
    args.push("-i", config.keyFile);
  }

  const userHost = config.user 
    ? `${config.user}@${config.host}` 
    : config.host;

  args.push(userHost, command);

  return new Promise((resolve) => {
    const ssh = spawn("ssh", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    ssh.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    ssh.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    ssh.on("close", (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 0,
      });
    });

    // Handle password if provided
    if (config.password) {
      ssh.stdin?.write(config.password + "\n");
    }
  });
}

// Copy file to remote (scp)
export async function scpCopy(
  config: SSHConfig,
  localPath: string,
  remotePath: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const args = [
      "-P", String(config.port || 22),
    ];

    if (config.keyFile) {
      args.push("-i", config.keyFile);
    }

    const userHost = config.user 
      ? `${config.user}@${config.host}:${remotePath}` 
      : `${config.host}:${remotePath}`;

    args.push(localPath, userHost);

    const scp = spawn("scp", args);

    scp.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

// Remote host manager
export class RemoteHostManager {
  private hosts: Map<string, SSHConfig> = new Map();

  // Add host
  addHost(name: string, config: SSHConfig): void {
    this.hosts.set(name, config);
  }

  // Remove host
  removeHost(name: string): boolean {
    return this.hosts.delete(name);
  }

  // Get host
  getHost(name: string): SSHConfig | undefined {
    return this.hosts.get(name);
  }

  // Execute on host
  async exec(hostName: string, command: string): Promise<ShellValue> {
    const config = this.hosts.get(hostName);
    if (!config) {
      return str(`Host '${hostName}' not found`);
    }

    const result = await sshExec(config, command);

    return record({
      host: str(hostName),
      command: str(command),
      stdout: str(result.stdout),
      stderr: str(result.stderr),
      exitCode: { _tag: "Int", value: BigInt(result.exitCode) } as const,
      success: { _tag: "Bool", value: result.exitCode === 0 } as const,
    });
  }

  // List hosts
  listHosts(): ShellValue {
    const hosts: Record<string, ShellValue> = {};
    
    for (const [name, config] of this.hosts) {
      hosts[name] = record({
        name: str(name),
        host: str(config.host),
        port: { _tag: "Int", value: BigInt(config.port || 22) } as const,
        user: str(config.user || ""),
      });
    }
    
    return record(hosts);
  }
}

// Global remote host manager
let globalRemoteManager: RemoteHostManager | null = null;

export function getRemoteHostManager(): RemoteHostManager {
  if (!globalRemoteManager) {
    globalRemoteManager = new RemoteHostManager();
  }
  return globalRemoteManager;
}
