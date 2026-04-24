@SauceDemo @SauceDemo-inventory
Feature: SauceDemo — Inventory browsing
  As a logged-in SauceDemo user
  I want to sort and browse the product catalog
  So that I can find items quickly

  Background:
    Given User is logged in to SauceDemo as "standard_user"
    And User is on the SauceDemo inventory page

  Scenario: Inventory grid displays six items on first load
    Then the inventory grid shows 6 items

  Scenario Outline: User sorts the inventory by <sort_label>
    When User sorts the inventory by "<sort_code>"
    Then the inventory order matches "<sort_code>"

    Examples:
      | sort_label            | sort_code |
      | Name (A to Z)         | az        |
      | Name (Z to A)         | za        |
      | Price (low to high)   | lohi      |
      | Price (high to low)   | hilo      |

  @visual
  Scenario: Inventory grid visual baseline
    Then the SauceDemo inventory page matches the visual baseline
