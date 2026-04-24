@SauceDemo @SauceDemo-checkout
Feature: SauceDemo — Cart and checkout
  As a logged-in SauceDemo user
  I want to add items to my cart and complete checkout
  So that I can verify the full purchase flow works end to end

  Background:
    Given User is logged in to SauceDemo as "standard_user"
    And User is on the SauceDemo inventory page

  Scenario: User adds and removes an item from the cart
    When User adds "Sauce Labs Backpack" to the cart
    Then the cart badge shows 1
    When User removes "Sauce Labs Backpack" from the cart
    Then the cart badge is empty

  @visual
  Scenario: User completes checkout with valid information
    When User adds "Sauce Labs Backpack" to the cart
    And User opens the cart
    And User proceeds to checkout
    And User fills the checkout form with generated personal information
    And User continues to the order overview
    And User finishes the order
    Then User sees the SauceDemo order-complete confirmation
    And the SauceDemo order-complete page matches the visual baseline

  Scenario: Checkout rejects a missing postal code
    When User adds "Sauce Labs Bike Light" to the cart
    And User opens the cart
    And User proceeds to checkout
    And User fills the checkout form with first name "Rashmie", last name "E", postal code ""
    And User continues to the order overview
    Then User sees the SauceDemo checkout error "Error: Postal Code is required"
