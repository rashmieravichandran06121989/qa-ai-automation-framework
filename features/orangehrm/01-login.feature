@OrangeHRM @OrangeHRM-login
Feature: OrangeHRM — User authentication
  As an OrangeHRM administrator
  I want to log in with valid credentials
  So that I can access the HRMS dashboard

  Background:
    Given User opens the OrangeHRM login page

  @visual
  Scenario: Admin logs in successfully
    When User logs in to OrangeHRM as "Admin" with password "admin123"
    Then User lands on the OrangeHRM dashboard
    And the OrangeHRM dashboard matches the visual baseline

  Scenario: Invalid credentials are rejected
    When User logs in to OrangeHRM as "Admin" with password "wrong_password"
    Then User sees the OrangeHRM login error "Invalid credentials"

  Scenario: Empty username and password trigger required-field validation
    When User logs in to OrangeHRM as "" with password ""
    Then User sees at least 2 OrangeHRM required-field errors
