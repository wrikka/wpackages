/**
 * Notification System for wshell
 * Desktop notifications for long commands
 */
import { spawn } from "child_process";
import type { ShellValue } from "../types/value.types";
import { str, bool, record } from "../types/value.types";

// Notification options
export interface NotificationOptions {
  title: string;
  message: string;
  icon?: string;
  sound?: boolean;
  timeout?: number;
}

// Show desktop notification
export async function notify(options: NotificationOptions): Promise<boolean> {
  try {
    if (process.platform === "darwin") {
      // macOS - use osascript
      const script = `display notification "${options.message}" with title "${options.title}"`;
      spawn("osascript", ["-e", script]);
      return true;
    } else if (process.platform === "linux") {
      // Linux - try notify-send
      const args = [options.title, options.message];
      if (options.icon) args.push("-i", options.icon);
      if (options.timeout) args.push("-t", String(options.timeout));
      
      spawn("notify-send", args);
      return true;
    } else if (process.platform === "win32") {
      // Windows - use PowerShell
      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        $global:balloon = New-Object System.Windows.Forms.NotifyIcon
        $path = (Get-Process -id $pid).Path
        $balloon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
        $balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
        $balloon.BalloonTipText = '${options.message}'
        $balloon.BalloonTipTitle = '${options.title}'
        $balloon.Visible = $true
        $balloon.ShowBalloonTip(5000)
      `;
      spawn("powershell", ["-Command", script]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Quick notify function
export async function notifyQuick(message: string, title: string = "wshell"): Promise<boolean> {
  return notify({ title, message });
}

// Notify when command completes
export async function notifyOnComplete(
  command: string,
  exitCode: number,
  duration: number
): Promise<boolean> {
  const title = exitCode === 0 ? "Command Completed" : "Command Failed";
  const status = exitCode === 0 ? "✓" : "✗";
  const message = `${status} ${command} (${(duration / 1000).toFixed(1)}s)`;
  
  return notify({ title, message });
}

// Auto-notify for long-running commands
export class AutoNotify {
  private threshold: number = 10000; // 10 seconds
  private enabled: boolean = false;

  constructor(thresholdMs?: number) {
    if (thresholdMs) this.threshold = thresholdMs;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setThreshold(ms: number): void {
    this.threshold = ms;
  }

  async maybeNotify(command: string, duration: number, exitCode: number): Promise<boolean> {
    if (!this.enabled || duration < this.threshold) {
      return false;
    }
    return notifyOnComplete(command, exitCode, duration);
  }
}

// Global auto-notify
let globalAutoNotify: AutoNotify | null = null;

export function getAutoNotify(): AutoNotify {
  if (!globalAutoNotify) {
    globalAutoNotify = new AutoNotify();
  }
  return globalAutoNotify;
}

// Export notification status
export function getNotificationStatus(): ShellValue {
  const autoNotify = getAutoNotify();
  return record({
    enabled: { _tag: "Bool", value: false } as const, // placeholder
    threshold: { _tag: "Int", value: BigInt(10000) } as const,
    supported: { _tag: "Bool", value: true } as const,
  });
}
