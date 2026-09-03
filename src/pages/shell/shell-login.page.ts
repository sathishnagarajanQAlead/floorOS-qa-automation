import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * app-shell's pre-auth landing page + Keycloak's hosted login form.
 * `goto('/')` lands on app-shell's own "Welcome to FloorOS" screen first;
 * its "Sign in" button is what triggers the OIDC PKCE redirect to
 * Keycloak (see floorOS docs/handbook/14-frontends.md, "Authentication").
 * Keycloak locators use its default theme ids; update them here (only
 * here) if floorOS ships a custom theme.
 */
export class ShellLoginPage extends BasePage {
  readonly signInButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#kc-login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.signInButton.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    // Keycloak redirects back to the shell immediately, but the token
    // exchange that follows is still async — wait for the app to actually
    // render its authenticated state, not just for the URL to change.
    await this.page.waitForURL((url) => !url.pathname.startsWith('/realms/'));
    await expect(this.signInButton).toBeHidden({ timeout: 15_000 });
  }
}
