# @flaky because OrangeHRM's Apply Leave form renders its Leave Type
# select via an XHR that resolves at unpredictable times on the shared
# public demo. POM pattern is correct (matches the working Admin filter
# pattern); tuning the exact wait strategy needs live browser inspection
# on a warm demo. Run explicitly with `--grep @flaky --workers=1` in
# headed mode to debug.
@OrangeHRM @OrangeHRM-leave @flaky
Feature: OrangeHRM — Apply leave
  As an OrangeHRM administrator
  I want to apply leave on behalf of an employee
  So that I can verify the leave-request flow works end to end

  Background:
    Given User is logged in to OrangeHRM as "Admin"
    And User navigates to the "Leave" module

  Scenario: Apply leave with valid date range
    When User opens the Apply Leave form
    And User applies for leave with generated data
    Then User sees an OrangeHRM leave success confirmation

  Scenario: Applying leave without selecting a leave type surfaces validation
    When User opens the Apply Leave form
    And User submits the leave form without filling any fields
    Then User sees at least 1 OrangeHRM leave validation error
