import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

// OrangeHRM PIM (Personnel Information Management). Used for adding a
// new employee and searching the employee list by name or employee ID.

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  employeeId?: string;
}

export class OrangePIMPage extends BasePage {
  readonly addEmployeeButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly personalDetailsHeader: Locator;

  readonly employeeListLink: Locator;
  readonly searchEmployeeNameInput: Locator;
  readonly searchEmployeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly resultsRows: Locator;
  readonly noRecordsFound: Locator;

  constructor(page: Page) {
    super(page);

    // Add Employee form. Placeholders are the only stable hook for name
    // fields. For Employee Id, scope to the .oxd-input-group container
    // that has the "Employee Id" label — OrangeHRM pre-populates it with
    // a numeric default, so `.fill()` replaces cleanly.
    this.addEmployeeButton = page.getByRole('button', { name: 'Add' });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = this.inputInGroup('Employee Id');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.personalDetailsHeader = page.getByRole('heading', {
      name: 'Personal Details',
    });

    // Employee List search.
    this.employeeListLink = page.getByRole('link', { name: 'Employee List' });
    this.searchEmployeeNameInput = page.getByPlaceholder('Type for hints...');
    this.searchEmployeeIdInput = this.inputInGroup('Employee Id');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resultsRows = page.locator('.oxd-table-card');
    this.noRecordsFound = page.getByText('No Records Found');
  }

  async clickAddEmployee(): Promise<void> {
    await this.addEmployeeButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForVisible(this.firstNameInput, 15_000);
  }

  async addEmployee(employee: EmployeeInput): Promise<void> {
    await this.firstNameInput.fill(employee.firstName);
    await this.lastNameInput.fill(employee.lastName);
    if (employee.employeeId) {
      await this.employeeIdInput.fill(employee.employeeId);
    }
    await this.saveButton.click();
    // Redirects to /pim/viewPersonalDetails/empNumber/XXX on success.
    await this.waitForVisible(this.personalDetailsHeader, 20_000);
  }

  async goToEmployeeList(): Promise<void> {
    await this.employeeListLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForVisible(this.searchButton, 15_000);
  }

  async searchByName(name: string): Promise<void> {
    await this.searchEmployeeNameInput.first().fill(name);
    // OrangeHRM's name filter is a typeahead — typing raw text and
    // clicking Search filters by exact match (zero rows). The real
    // flow is: type, wait for the autocomplete dropdown, click an
    // option, then Search.
    const firstOption = this.page.locator('.oxd-autocomplete-option').first();
    await firstOption.waitFor({ state: 'visible', timeout: 8_000 });
    await firstOption.click();
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getResultsRowCount(): Promise<number> {
    return this.resultsRows.count();
  }

  async expectResultCountAtLeast(min: number): Promise<void> {
    // Wait for either results or the "No Records Found" message before
    // counting — OrangeHRM paints the table after the XHR settles.
    await this.page
      .locator('.oxd-table-card, :text("No Records Found")')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
    const count = await this.getResultsRowCount();
    expect(count).toBeGreaterThanOrEqual(min);
  }
}
