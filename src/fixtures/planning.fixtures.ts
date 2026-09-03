import { test as base } from '@playwright/test';
import { PlanningPage } from '../pages/planning/planning.page';

interface PlanningFixtures {
  planningPage: PlanningPage;
}

/**
 * Fixture set scoped to the Planning module only. Each module gets its own
 * file on purpose — the Planning QA never needs to touch another module's
 * fixtures, and vice versa.
 */
export const test = base.extend<PlanningFixtures>({
  planningPage: async ({ page }, use) => {
    await use(new PlanningPage(page));
  },
});

export { expect } from '@playwright/test';
