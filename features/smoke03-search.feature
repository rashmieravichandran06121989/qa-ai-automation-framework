Feature: Product Search
  As a visitor
  I want to search for products by keyword
  So that I can quickly find relevant items

  Scenario: Search returns relevant results for a known term
    Given I navigate to the homepage
    When I search for "Pliers"
    Then at least one product should be displayed
    And the first result should be relevant to "Pliers"
