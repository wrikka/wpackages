import { Effect } from 'effect';
import { NetworkStatus } from '../types/analytics.js';

export class NetworkAwareness {
  private status: NetworkStatus = { online: true };
  private listeners: ((status: NetworkStatus) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      this.status.online = navigator.onLine;
      window.addEventListener('online', () => this.updateStatus(true));
      window.addEventListener('offline', () => this.updateStatus(false));
      
      const connection = (navigator as any).connection;
      if (connection) {
        this.updateConnectionInfo(connection);
        connection.addEventListener('change', () => this.updateConnectionInfo(connection));
      }
    }
  }

  private updateStatus(online: boolean): void {
    this.status.online = online;
    this.notifyListeners();
  }

  private updateConnectionInfo(connection: any): void {
    this.status = {
      ...this.status,
      connectionType: connection.effectiveType,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.status));
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }

  isOnline(): boolean {
    return this.status.online;
  }

  getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    if (!this.status.downlink) return 'medium';
    if (this.status.downlink < 1) return 'slow';
    if (this.status.downlink < 5) return 'medium';
    return 'fast';
  }

  onStatusChange(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getOptimalBatchSize(): Effect.Effect<number, never> {
    const speed = this.getConnectionSpeed();
    const isOnline = this.isOnline();
    
    if (!isOnline) {
      return Effect.succeed(0);
    }

    switch (speed) {
      case 'slow':
        return Effect.succeed(5);
      case 'medium':
        return Effect.succeed(10);
      case 'fast':
        return Effect.succeed(20);
    }
  }
}
