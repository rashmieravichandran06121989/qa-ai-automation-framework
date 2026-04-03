Feature: Homepage Product Catalogue
  As a visitor
  I want to open the Toolshop homepage
  So that I can browse the product catalogue

  Scenario: Homepage loads and displays the product catalogue
    Given I navigate to the homepage
    Then the page title should contain "Practice Software Testing"
    And the product catalogue should display at least one product

    
