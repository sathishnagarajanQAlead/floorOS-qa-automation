import path from 'path';
import * as dotenv from 'dotenv';
import type { ModuleConfig } from './modules';

// Load order (later files win): a shared `.env`, then an env-specific
// override. `TEST_ENV` itself must come from `.env` or the shell, since we
// need it before we know which override file to load.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export type TestEnv = 'local' | 'dev';

function resolveTestEnv(): TestEnv {
  const raw = (process.env.TEST_ENV ?? 'local').toLowerCase();
  if (raw !== 'local' && raw !== 'dev') {
    throw new Error(
      `TEST_ENV must be "local" or "dev" (got "${raw}"). Run e.g. TEST_ENV=dev npm run test:crm`,
    );
  }
  return raw;
}

const testEnv = resolveTestEnv();

// `.env.local` / `.env.dev` are optional per-environment overrides (gitignored).
dotenv.config({ path: path.resolve(__dirname, `../../.env.${testEnv}`), override: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name} (see .env.example, TEST_ENV=${testEnv})`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  testEnv,
  /**
   * app-shell is the only app every module test talks to directly — it
   * owns auth and mounts every remote under its own routes. Local defaults
   * to the shell's Vite dev port (see floorOS docs/handbook/14-frontends.md);
   * dev has no safe default and must be set explicitly.
   */
  shellBaseUrl:
    testEnv === 'local'
      ? optional('LOCAL_APP_SHELL_URL', 'http://localhost:3100')
      : required('DEV_APP_SHELL_URL'),
};

export interface ModuleCredentials {
  username: string;
  password: string;
}

/**
 * Reads `<envPrefix>_USER_<LOCAL|DEV>` / `<envPrefix>_PASSWORD_<LOCAL|DEV>`
 * for the active TEST_ENV. Every module has its own seeded Keycloak test
 * user (per-module, not shared) so each QA's login reflects the
 * permissions their module actually needs.
 */
export function moduleCredentials(moduleOrPrefix: ModuleConfig | string): ModuleCredentials {
  const prefix = typeof moduleOrPrefix === 'string' ? moduleOrPrefix : moduleOrPrefix.envPrefix;
  const suffix = testEnv.toUpperCase();
  return {
    username: required(`${prefix}_USER_${suffix}`),
    password: required(`${prefix}_PASSWORD_${suffix}`),
  };
}
