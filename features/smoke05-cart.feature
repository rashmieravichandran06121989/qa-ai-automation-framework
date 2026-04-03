Feature: Cart Summary
  As a visitor
  I want to review my cart contents and total
  So that I can proceed to checkout

  Scenario: Cart displays correct item and total after adding a product
    Given I navigate to the homepage
    When I click on product number 2
    And I add the product to the cart
    And I navigate to the cart page
    Then the cart should contain at least 1 item
    And the cart total should be displayed
    And the proceed to checkout button should be visible
