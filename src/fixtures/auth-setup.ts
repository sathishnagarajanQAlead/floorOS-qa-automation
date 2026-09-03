import path from 'path';
import { test as setup } from '@playwright/test';
import { ShellLoginPage } from '../pages/shell/shell-login.page';
import { moduleCredentials } from '../config/env';
import { MODULES, type ModuleId } from '../config/modules';

/** Where a module's logged-in storage state is cached between test runs. */
export function authFile(moduleId: ModuleId): string {
  return path.resolve(__dirname, `../../.auth/${moduleId}.json`);
}

/**
 * Wire this up from `tests/<module>/auth.setup.ts`:
 *
 *   import { registerAuthSetup } from '../../src/fixtures/auth-setup';
 *   registerAuthSetup('crm');
 *
 * Logs in once as that module's seeded test user (see moduleCredentials in
 * env.ts) and saves storage state to `.auth/<module>.json`. The module's
 * Playwright project depends on this setup project and reuses that state
 * (see playwright.config.ts), so specs never need to log in themselves —
 * though every fresh page still needs BasePage.gotoAuthenticated() (not
 * plain goto()) to actually redeem it: see the comment there for why.
 */
export function registerAuthSetup(moduleId: ModuleId): void {
  const module = MODULES[moduleId];

  setup(`authenticate - ${module.label}`, async ({ page }) => {
    const { username, password } = moduleCredentials(module);
    const loginPage = new ShellLoginPage(page);

    await loginPage.goto('/');
    await loginPage.login(username, password);

    await page.context().storageState({ path: authFile(moduleId) });
  });
}
