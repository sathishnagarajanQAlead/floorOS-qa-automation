import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/** Customers list, under the CRM module (confirmed against the running app). */
const CUSTOMERS_LIST_PATH = '/crm/customers';

/**
 * "Create Customer" (CRM, Sprint 1 user story). Owned by the CRM QA.
 *
 * Locators are confirmed against the real running form (dumped via
 * ariaSnapshot() against a local `tilt up` stack), not guessed from the
 * ClickUp test-case text — see test-cases/crm/create-customer.md for that
 * text. Two things worth knowing before touching this file:
 *
 * - Country / CRM Stage / Origin Type / Origin / Buyer are custom
 *   comboboxes (a button that opens a `dialog` with a search combobox +
 *   a "Suggestions" listbox of `option`s), not fillable text inputs —
 *   use selectComboboxOption(), not .fill().
 * - As of this writing, none of that reference data is seeded in the
 *   local dev stack (every one of those comboboxes shows "No X
 *   available." / never finishes loading) — confirmed by probing the
 *   live app, not assumed. Every test case here that needs to pick a
 *   real value (TC:4 onward) is blocked on that seed data, independent
 *   of anything in this file. See test-cases/crm/create-customer.md.
 */
export interface CustomerProfileDetails {
  name?: string;
  email?: string;
  city?: string;
  country?: string;
  crmStage?: string;
  originType?: string;
  origin?: string;
  buyer?: string;
  linkedIn?: string;
  facebook?: string;
  instagram?: string;
}

export class CreateCustomerPage extends BasePage {
  // Customers list entry point
  readonly createCustomerEntry: Locator;

  // Form sections (layout check — TC:1)
  readonly profileSection: Locator;
  readonly managementSection: Locator;
  readonly departmentsSection: Locator;
  readonly linkContactsSection: Locator;

  // Profile fields
  readonly customerNameInput: Locator;
  readonly emailInput: Locator;
  readonly cityInput: Locator;
  readonly countryCombobox: Locator;
  readonly linkedInInput: Locator;
  readonly facebookInput: Locator;
  readonly instagramInput: Locator;

  // Management fields
  readonly crmStageCombobox: Locator;
  readonly originTypeCombobox: Locator;
  readonly originCombobox: Locator;
  readonly buyerCombobox: Locator;

  // Business Process / Department rows
  readonly addBusinessProcessButton: Locator;

  // Link Contacts
  readonly linkContactsCombobox: Locator;

  // Primary actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Duplicate-detection modal
  readonly duplicateWarningModal: Locator;
  readonly saveAnywayButton: Locator;
  readonly cancelToReviewButton: Locator;

  // Post-save modal + confirmation toast (app-shell uses sonner — see
  // frontends/app-shell/package.json)
  readonly postSaveModal: Locator;
  readonly createContactButton: Locator;
  readonly postSaveCancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);

    this.createCustomerEntry = page.getByRole('button', { name: 'Create Customer' });

    this.profileSection = page.getByRole('heading', { name: 'Customer Profile' });
    this.managementSection = page.getByRole('heading', { name: 'Customer Management' });
    // Not a heading in the real DOM — a plain paragraph.
    this.departmentsSection = page.getByText('Departments and Assignees');
    this.linkContactsSection = page.getByRole('heading', { name: 'Link Contacts' });

    this.customerNameInput = page.getByLabel('Customer Name');
    this.emailInput = page.getByLabel('Email');
    this.cityInput = page.getByLabel('City');
    // "Country" also substring-matches the "Phone country code" combobox's
    // label — exact: true is required to disambiguate.
    this.countryCombobox = page.getByRole('combobox', { name: 'Country', exact: true });
    this.linkedInInput = page.getByLabel('LinkedIn');
    this.facebookInput = page.getByLabel('Facebook');
    this.instagramInput = page.getByLabel('Instagram');

    this.crmStageCombobox = page.getByRole('combobox', { name: 'CRM Stage', exact: true });
    this.originTypeCombobox = page.getByRole('combobox', { name: 'Origin Type', exact: true });
    this.originCombobox = page.getByRole('combobox', { name: 'Origin', exact: true });
    this.buyerCombobox = page.getByRole('combobox', { name: 'Buyer', exact: true });

    this.addBusinessProcessButton = page.getByRole('button', { name: 'Add', exact: true });

    this.linkContactsCombobox = page.getByRole('combobox', { name: 'Contacts to link' });

    this.saveButton = page.getByRole('button', { name: 'Save Customer' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    this.duplicateWarningModal = page.getByRole('dialog').filter({ hasText: /may already exist/i });
    this.saveAnywayButton = this.duplicateWarningModal.getByRole('button', { name: 'Save anyway' });
    this.cancelToReviewButton = this.duplicateWarningModal.getByRole('button', {
      name: 'Cancel to review',
    });

    this.postSaveModal = page.getByRole('dialog').filter({ hasText: /created successfully/i });
    this.createContactButton = this.postSaveModal.getByRole('button', { name: 'Create Contact' });
    this.postSaveCancelButton = this.postSaveModal.getByRole('button', { name: 'Cancel' });

    this.toast = page.locator('[data-sonner-toast]');
  }

  async openFromCrmHome(): Promise<void> {
    await this.gotoAuthenticated(CUSTOMERS_LIST_PATH);
    await this.createCustomerEntry.click();
  }

  async fillProfile(details: CustomerProfileDetails): Promise<void> {
    if (details.name !== undefined) await this.customerNameInput.fill(details.name);
    if (details.email !== undefined) await this.emailInput.fill(details.email);
    if (details.city !== undefined) await this.cityInput.fill(details.city);
    if (details.country !== undefined)
      await this.selectComboboxOption(this.countryCombobox, details.country);
    if (details.crmStage !== undefined)
      await this.selectComboboxOption(this.crmStageCombobox, details.crmStage);
    if (details.originType !== undefined) {
      await this.selectComboboxOption(this.originTypeCombobox, details.originType);
    }
    if (details.origin !== undefined)
      await this.selectComboboxOption(this.originCombobox, details.origin);
    if (details.buyer !== undefined)
      await this.selectComboboxOption(this.buyerCombobox, details.buyer);
    if (details.linkedIn !== undefined) await this.linkedInInput.fill(details.linkedIn);
    if (details.facebook !== undefined) await this.facebookInput.fill(details.facebook);
    if (details.instagram !== undefined) await this.instagramInput.fill(details.instagram);
  }

  /**
   * Country / CRM Stage / Origin Type / Origin / Buyer all share this
   * component: clicking the trigger opens a `dialog` containing a search
   * combobox and a "Suggestions" listbox of `option`s.
   */
  private async selectComboboxOption(trigger: Locator, optionText: string | RegExp): Promise<void> {
    await trigger.click();
    await this.page.getByRole('dialog').last().getByRole('option', { name: optionText }).click();
  }

  /** Adds a Business Process/Department row without assigning anyone (TC:4). */
  async addBusinessProcessWithoutAssignee(process: string): Promise<void> {
    await this.addBusinessProcessButton.click();
    await this.page
      .getByLabel(/business process|department/i)
      .last()
      .fill(process);
  }

  async addBusinessProcessWithAssignee(process: string, assignee: string): Promise<void> {
    await this.addBusinessProcessWithoutAssignee(process);
    await this.page
      .getByLabel(/assignee/i)
      .last()
      .fill(assignee);
  }

  async linkExistingContact(contactName: string): Promise<void> {
    await this.selectComboboxOption(this.linkContactsCombobox, contactName);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Matches one of the form's `.crm-error` messages — several can be on screen at once. */
  async expectFieldError(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible();
  }

  async expectDuplicateWarningVisible(): Promise<void> {
    await expect(this.duplicateWarningModal).toBeVisible();
  }

  async expectSavedSuccessfully(): Promise<void> {
    await expect(this.toast).toBeVisible();
    await expect(this.postSaveModal).toBeVisible();
  }

  async expectFormSectionsVisible(): Promise<void> {
    await expect(this.profileSection).toBeVisible();
    await expect(this.managementSection).toBeVisible();
    await expect(this.departmentsSection).toBeVisible();
    await expect(this.linkContactsSection).toBeVisible();
  }
}
