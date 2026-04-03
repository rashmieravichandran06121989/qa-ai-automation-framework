Feature: Product Detail and Add to Cart
  As a visitor
  I want to view a product detail page and add the item to my cart
  So that I can purchase it

  Scenario: Product detail page renders and item can be added to cart
    Given I navigate to the homepage
    When I click on product number 1
    Then the product name should not be empty
    And the product price should not be empty
    When I add the product to the cart
    And I navigate to the cart page
    Then the cart should contain at least 1 item
