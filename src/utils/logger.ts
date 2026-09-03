type LogLevel = 'info' | 'warn' | 'error';

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    console.log(line, meta);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};
