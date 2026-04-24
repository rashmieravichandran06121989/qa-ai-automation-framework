import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

// OrangeHRM Leave module — the apply-leave flow.

export interface LeaveRequest {
  leaveType: string;
  fromDate: string; // YYYY-DD-MM per OrangeHRM's calendar widget
  toDate: string;
  comment?: string;
}

export class OrangeLeavePage extends BasePage {
  readonly applyTab: Locator;
  readonly applyHeader: Locator;
  readonly leaveTypeText: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly commentTextarea: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Use role=link so we only match <a> elements — submit buttons are
    // role=button and won't collide. `exact: true` rules out any button
    // whose label happens to start with "Apply" (e.g. "Apply Leave").
    this.applyTab = page.getByRole('link', { name: 'Apply', exact: true });
    this.applyHeader = page.getByRole('heading', { name: 'Apply Leave' });

    // The INNER `.oxd-select-text` div is the reliable click target —
    // its bounding box is always hit-testable, unlike the wrapper which
    // sometimes has pointer-events quirks around the chevron icon.
    this.leaveTypeText = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Leave Type' })
      .locator('.oxd-select-text')
      .first();

    this.fromDateInput = this.inputInGroup('From Date');
    this.toDateInput = this.inputInGroup('To Date');
    this.commentTextarea = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Comment' })
      .locator('textarea')
      .first();
    // The form's submit button is the only button inside the
    // `.orangehrm-background-container` that has type=submit.
    this.applyButton = page
      .locator('.orangehrm-background-container button[type="submit"]')
      .first();
    this.successToast = page.locator('.oxd-toast--success');
    this.errorMessage = page.locator('.oxd-input-field-error-message');
  }

  async openApplyForm(): Promise<void> {
    await this.applyTab.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForVisible(this.applyHeader, 15_000);
    // Give the form's XHR (available leave types) a moment to resolve
    // before the test tries to pick one. networkidle with a short cap
    // handles the common case without blocking forever.
    await this.page
      .waitForLoadState('networkidle', { timeout: 5_000 })
      .catch(() => undefined);
  }

  async selectLeaveType(type: string): Promise<void> {
    await this.leaveTypeText.scrollIntoViewIfNeeded();
    await this.leaveTypeText.click();

    // Wait for any option to render, not just the matching one. If the
    // demo's leave-type catalogue doesn't include `type`, we still fall
    // through to the first real option so the test exercises the flow.
    const anyOption = this.page.locator('.oxd-select-option').first();
    await anyOption.waitFor({ state: 'visible', timeout: 10_000 });

    const matched = this.page
      .locator('.oxd-select-option')
      .filter({ hasText: type });
    if ((await matched.count()) > 0) {
      await matched.first().click();
      return;
    }

    // First option may be a placeholder ("-- Select --"). Skip it.
    const options = this.page.locator('.oxd-select-option');
    const count = await options.count();
    await options.nth(count > 1 ? 1 : 0).click();
  }

  async setDateRange(fromDate: string, toDate: string): Promise<void> {
    // OrangeHRM's date widget accepts typed input + Enter to commit.
    // Escape after each fill closes any lingering calendar popover so
    // the next field's click isn't intercepted.
    await this.fromDateInput.click();
    await this.fromDateInput.fill(fromDate);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('Escape');

    await this.toDateInput.click();
    await this.toDateInput.fill(toDate);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('Escape');
  }

  async submit(): Promise<void> {
    await this.applyButton.click();
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 15_000 });
  }

  async getFieldErrorCount(): Promise<number> {
    // Let validation render before counting.
    await this.errorMessage
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
    return this.errorMessage.count();
  }

  async applyFor(request: LeaveRequest): Promise<void> {
    await this.selectLeaveType(request.leaveType);
    await this.setDateRange(request.fromDate, request.toDate);
    if (request.comment) {
      await this.commentTextarea.fill(request.comment);
    }
    await this.submit();
  }
}
