import { test as base } from '@playwright/test';
import { MasterDataPage } from '../pages/master-data/master-data.page';

interface MasterDataFixtures {
  masterDataPage: MasterDataPage;
}

/**
 * Fixture set scoped to the Master Data module only. Each module gets its own
 * file on purpose — the Master Data QA never needs to touch another module's
 * fixtures, and vice versa.
 */
export const test = base.extend<MasterDataFixtures>({
  masterDataPage: async ({ page }, use) => {
    await use(new MasterDataPage(page));
  },
});

export { expect } from '@playwright/test';
