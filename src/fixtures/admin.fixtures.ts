import { test as base } from '@playwright/test';
import { AdminPage } from '../pages/admin/admin.page';

interface AdminFixtures {
  adminPage: AdminPage;
}

/**
 * Fixture set scoped to the Admin module only. Each module gets its own
 * file on purpose — the Admin QA never needs to touch another module's
 * fixtures, and vice versa.
 */
export const test = base.extend<AdminFixtures>({
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
});

export { expect } from '@playwright/test';
