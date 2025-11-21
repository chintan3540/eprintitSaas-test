@generateEmail
Feature: Generate Email for CustomizationTexts

  Background:
    Given I have valid authentication credentials
    And I have access to the GraphQL API

  Scenario: Successfully generate color email for TBS customer
    Given I have a TBS customer with valid customer ID
    When I send a generateEmail mutation request with "color" combination
    Then the generateEmail response should have status code 200
    And the response should contain a valid email object with color combination
    And the email should be stored in HowToLogoSection.EmailAddressAssignedColor field
    And the email format should be "color-{domainName}@{domainName}"

  Scenario: Successfully generate bw email for TBS customer
    Given I have a TBS customer with valid customer ID
    When I send a generateEmail mutation request with "bw" combination
    Then the generateEmail response should have status code 200
    And the response should contain a valid email object with bw combination
    And the email should be stored in HowToLogoSection.EmailAddressAssignedGrayscale field
    And the email format should be "bw-{domainName}@{domainName}"

  Scenario: Successfully generate color email for non-TBS customer
    Given I have a non-TBS customer with valid customer ID
    When I send a generateEmail mutation request with "color" combination
    Then the generateEmail response should have status code 200
    And the response should contain a valid email object with color combination
    And the email should be stored in AdvancedEmailConfiguration.AdvancedEmailAlias array
    And AdvancedEmailConfiguration.Enabled should be set to true
    And the email format should be "color-{domainName}@{domainName}"

  Scenario: Successfully generate bw email for non-TBS customer
    Given I have a non-TBS customer with valid customer ID
    When I send a generateEmail mutation request with "bw" combination
    Then the generateEmail response should have status code 200
    And the response should contain a valid email object with bw combination
    And the email should be stored in AdvancedEmailConfiguration.AdvancedEmailAlias array
    And AdvancedEmailConfiguration.Enabled should be set to true
    And the email format should be "bw-{domainName}@{domainName}"

  Scenario: Attempt to generate duplicate color email for TBS customer
    Given I have a TBS customer with valid customer ID
    And the customer already has existing color email in HowToLogoSection
    When I send a generateEmail mutation request with "color" combination
    Then the response should have an error
    And the error message should be "Email combination already exists"

  Scenario: Attempt to generate duplicate bw email for TBS customer
    Given I have a TBS customer with valid customer ID
    And the customer already has existing bw email in HowToLogoSection
    When I send a generateEmail mutation request with "bw" combination
    Then the response should have an error
    And the error message should be "Email combination already exists"

  Scenario: Attempt to generate duplicate color email for non-TBS customer
    Given I have a non-TBS customer with valid customer ID
    And the customer already has existing color email in AdvancedEmailConfiguration
    When I send a generateEmail mutation request with "color" combination
    Then the response should have an error
    And the error message should be "Email combination already exists"

  Scenario: Attempt to generate duplicate bw email for non-TBS customer
    Given I have a non-TBS customer with valid customer ID
    And the customer already has existing bw email in AdvancedEmailConfiguration
    When I send a generateEmail mutation request with "bw" combination
    Then the response should have an error
    And the error message should be "Email combination already exists"

  Scenario: Generate email with case insensitive combination
    Given I have a TBS customer with valid customer ID
    When I send a generateEmail mutation request with "COLOR" combination
    Then the generateEmail response should have status code 200
    And the combination should be converted to lowercase "color"
    And the email should be generated successfully

  Scenario: Generate multiple different combinations for same customer
    Given I have a TBS customer with valid customer ID
    When I send a generateEmail mutation request with "color" combination
    Then the generateEmail response should have status code 200
    When I send a generateEmail mutation request with "bw" combination
    Then the generateEmail response should have status code 200
    And both emails should be stored correctly

  Scenario: Verify email format consistency
    Given I have a TBS customer with domain name "testdomain"
    When I generate a color email combination
    Then the generated email should follow the pattern "color-testdomain@{configuredDomainName}"
    When I generate a bw email combination
    Then the generated email should follow the pattern "bw-testdomain@{configuredDomainName}"
