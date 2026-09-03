import { test as base } from '@playwright/test';
import { CostingPage } from '../pages/costing/costing.page';

interface CostingFixtures {
  costingPage: CostingPage;
}

/**
 * Fixture set scoped to the Costing module only. Each module gets its own
 * file on purpose — the Costing QA never needs to touch another module's
 * fixtures, and vice versa.
 */
export const test = base.extend<CostingFixtures>({
  costingPage: async ({ page }, use) => {
    await use(new CostingPage(page));
  },
});

export { expect } from '@playwright/test';
