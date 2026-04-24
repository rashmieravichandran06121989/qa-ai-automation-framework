@OrangeHRM @OrangeHRM-pim
Feature: OrangeHRM — Employee management via PIM
  As an OrangeHRM administrator
  I want to add and search for employees in the PIM module
  So that I can verify personnel data flows work end to end

  Background:
    Given User is logged in to OrangeHRM as "Admin"
    And User navigates to the "PIM" module

  @visual
  Scenario: Admin adds a new employee with generated data
    When User clicks Add Employee
    And User fills the employee form with generated data
    Then User sees the Personal Details page for the new employee
    And the OrangeHRM personal-details page matches the visual baseline

  Scenario: Admin searches the employee list by name
    When User goes to the Employee List
    And User searches the employee list by name "a"
    Then the employee list shows at least 1 result
