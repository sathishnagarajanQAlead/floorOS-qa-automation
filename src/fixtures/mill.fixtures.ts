import { test as base } from '@playwright/test';
import { MillPage } from '../pages/mill/mill.page';

interface MillFixtures {
  millPage: MillPage;
}

/**
 * Fixture set scoped to the Fabric Mill module only. Each module gets its own
 * file on purpose — the Fabric Mill QA never needs to touch another module's
 * fixtures, and vice versa.
 */
export const test = base.extend<MillFixtures>({
  millPage: async ({ page }, use) => {
    await use(new MillPage(page));
  },
});

export { expect } from '@playwright/test';
