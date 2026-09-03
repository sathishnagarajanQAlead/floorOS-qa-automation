import { test as base } from '@playwright/test';
import { CopilotPage } from '../pages/copilot/copilot.page';

interface CopilotFixtures {
  copilotPage: CopilotPage;
}

/**
 * Fixture set scoped to the Copilot module only. Each module gets its own
 * file on purpose — the Copilot QA never needs to touch another module's
 * fixtures, and vice versa.
 */
export const test = base.extend<CopilotFixtures>({
  copilotPage: async ({ page }, use) => {
    await use(new CopilotPage(page));
  },
});

export { expect } from '@playwright/test';
