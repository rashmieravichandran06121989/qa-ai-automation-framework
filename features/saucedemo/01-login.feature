@SauceDemo @SauceDemo-login
Feature: SauceDemo — User authentication
  As a registered SauceDemo user
  I want to log in with my credentials
  So that I can access the product inventory

  Background:
    Given User opens the SauceDemo login page

  @visual
  Scenario: User logs in successfully as standard_user
    When User logs in as "standard_user" with password "secret_sauce"
    Then User lands on the SauceDemo inventory page
    And the SauceDemo login page matches the visual baseline

  Scenario: Locked-out user is blocked from logging in
    When User logs in as "locked_out_user" with password "secret_sauce"
    Then User sees the SauceDemo login error "Epic sadface: Sorry, this user has been locked out."

  Scenario: Invalid password is rejected
    When User logs in as "standard_user" with password "wrong_password"
    Then User sees the SauceDemo login error "Epic sadface: Username and password do not match any user in this service"

  Scenario: Empty username triggers validation
    When User logs in as "" with password "secret_sauce"
    Then User sees the SauceDemo login error "Epic sadface: Username is required"
