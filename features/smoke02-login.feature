Feature: User Authentication
  As a registered customer
  I want to log in with valid credentials
  So that I can access my account

  Scenario: User can log in with valid credentials
    Given I am on the login page
    When I log in with email "customer3@practicesoftwaretesting.com" and password "pass123"
    Then I should be redirected away from the login page
