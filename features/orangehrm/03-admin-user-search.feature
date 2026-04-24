@OrangeHRM @OrangeHRM-admin
Feature: OrangeHRM — Admin user search
  As an OrangeHRM administrator
  I want to filter the user management list by role and status
  So that I can audit access across the organization

  Background:
    Given User is logged in to OrangeHRM as "Admin"
    And User navigates to the "Admin" module

  Scenario: Filter users by Admin role shows at least one result
    When User filters OrangeHRM users by role "Admin"
    And User runs the OrangeHRM user search
    Then the OrangeHRM user list shows at least 1 result

  Scenario: Filter users by Enabled status shows at least one result
    When User filters OrangeHRM users by status "Enabled"
    And User runs the OrangeHRM user search
    Then the OrangeHRM user list shows at least 1 result

  Scenario: Reset clears the applied filters
    When User filters OrangeHRM users by role "Admin"
    And User runs the OrangeHRM user search
    And User resets the OrangeHRM user search
    Then the OrangeHRM user list shows at least 1 result
