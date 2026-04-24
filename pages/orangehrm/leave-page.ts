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
  readonly applyLink: Locator;
  readonly applyHeader: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly commentTextarea: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.applyLink = page.getByRole('link', { name: 'Apply', exact: true });
    this.applyHeader = page.getByRole('heading', { name: 'Apply Leave' });
    this.leaveTypeDropdown = this.selectWrapperInGroup('Leave Type');
    this.fromDateInput = this.inputInGroup('From Date');
    this.toDateInput = this.inputInGroup('To Date');
    this.commentTextarea = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Comment' })
      .locator('textarea')
      .first();
    // The form has two "Apply" buttons (sidebar link + form submit).
    // The submit button is a type=submit inside the form.
    this.applyButton = page.locator('button[type="submit"]').last();
    this.successToast = page.locator('.oxd-toast--success');
    this.errorMessage = page.locator('.oxd-input-field-error-message');
  }

  async openApplyForm(): Promise<void> {
    await this.applyLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForVisible(this.applyHeader, 15_000);
  }

  async selectLeaveType(type: string): Promise<void> {
    // Vue's click-outside handler races Playwright's actionability check
    // on OrangeHRM's select, so force-click the dropdown div. After it
    // opens, .oxd-select-dropdown is visible with .oxd-select-option
    // children. Try the text-matched option first; fall back to the
    // first available option so the test still exercises the flow when
    // the demo's leave-type catalogue drifts.
    await this.leaveTypeDropdown.scrollIntoViewIfNeeded();
    await this.leaveTypeDropdown.click({ force: true, timeout: 10_000 });

    const dropdown = this.page.locator('.oxd-select-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 8_000 });

    const matched = dropdown
      .locator('.oxd-select-option')
      .filter({ hasText: type });
    if ((await matched.count()) > 0) {
      await matched.first().click();
      return;
    }

    // First option is usually "-- Select --" which is a no-op. Skip it
    // and click the second option if present, otherwise the first.
    const options = dropdown.locator('.oxd-select-option');
    const count = await options.count();
    const index = count > 1 ? 1 : 0;
    await options.nth(index).click();
  }

  async setDateRange(fromDate: string, toDate: string): Promise<void> {
    await this.fromDateInput.fill(fromDate);
    await this.fromDateInput.press('Enter');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Enter');
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
