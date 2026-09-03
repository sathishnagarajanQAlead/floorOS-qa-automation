import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { MODULES } from '../../config/modules';

/**
 * Owned by the Master Data QA. Add this module's real locators/actions here
 * — nothing else in the framework needs to change to extend Master Data coverage.
 */
export class MasterDataPage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    // TODO(Master Data QA): replace with a locator specific to this module's
    // landing view once you've confirmed it against the running app.
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async open(): Promise<void> {
    await this.gotoAuthenticated(MODULES['master-data'].path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${MODULES['master-data'].path}`));
    await expect(this.heading).toBeVisible();
  }
}
