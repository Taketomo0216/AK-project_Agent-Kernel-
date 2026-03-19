import { LogEvent } from './types';

export class KernelLogger {
  private readonly events: LogEvent[] = [];

  add(event: Omit<LogEvent, 'timestamp'>): void {
    this.events.push({ ...event, timestamp: new Date().toISOString() });
  }

  list(): LogEvent[] {
    return [...this.events];
  }
}
