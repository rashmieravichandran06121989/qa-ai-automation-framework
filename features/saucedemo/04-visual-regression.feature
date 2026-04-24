@SauceDemo @SauceDemo-visual @visual
Feature: SauceDemo — Visual regression with Applitools
  As a QA engineer evaluating AI-assisted testing
  I want to prove visual AI catches defects that functional assertions miss
  So that the AI-augmented suite's business value is self-evident

  # These two scenarios use SauceDemo's purpose-built buggy identities:
  #
  #   problem_user  — every product image is the same dog photo (wrong images,
  #                   same layout, no text changes — functional assertions all pass)
  #   visual_user   — subtle layout perturbations (elements shifted a few px,
  #                   wrong sort order applied) that DOM-based tests can't detect
  #
  # Functional assertions intentionally PASS in both scenarios. Only the
  # Applitools checkpoint flags the regression.

  Scenario: problem_user shows incorrect product images that visual AI catches
    Given User is logged in to SauceDemo as "problem_user"
    And User is on the SauceDemo inventory page
    Then the inventory grid shows 6 items
    And the SauceDemo inventory page matches the visual baseline

  Scenario: visual_user shows subtle layout shifts that visual AI catches
    Given User is logged in to SauceDemo as "visual_user"
    And User is on the SauceDemo inventory page
    Then the inventory grid shows 6 items
    And the SauceDemo inventory page matches the visual baseline
