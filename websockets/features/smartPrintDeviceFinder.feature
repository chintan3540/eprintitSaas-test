Feature: Smart Print Device Finder
  As the ePRINTit system
  I want to intelligently match print jobs to the most suitable printer
  So that print jobs are sent to devices that best support their requirements

  Background:
    Given a pool of available devices for printing

  Scenario: Select device with exact color match
    Given a print job with the following specifications:
      | Color       | Color    |
      | Duplex      | false    |
      | PaperSize   | A4       |
      | Orientation | Portrait |
    And device A with the following capabilities:
      | ColorEnabled      | true                         |
      | Color             | {"Color": true, "GrayScale": true} |
      | DuplexEnabled     | false                        |
      | LayoutEnabled     | true                         |
      | Layout            | {"Portrait": true}           |
      | PaperSizesEnabled | true                         |
      | PaperSizes        | {"A4": true}                 |
    And device B with the following capabilities:
      | ColorEnabled      | true                         |
      | Color             | {"GrayScale": true}          |
      | DuplexEnabled     | false                        |
      | LayoutEnabled     | true                         |
      | Layout            | {"Portrait": true}           |
      | PaperSizesEnabled | true                         |
      | PaperSizes        | {"A4": true}                 |
    When the smart device finder algorithm runs
    Then device A should be selected
    And device A should have a match count of 3
    And device B should have a match count of 2

  Scenario: Select device based on grayscale capability
    Given a print job with the following specifications:
      | Color       | grayscale |
      | Duplex      | false     |
      | PaperSize   | Letter    |
      | Orientation | Portrait  |
    And device A with Color capability "GrayScale" enabled
    And device B with Color capability "Color" enabled but "GrayScale" disabled
    When the smart device finder algorithm runs
    Then device A should be selected

  Scenario: Select device with duplex two-sided printing support
    Given a print job with duplex set to true
    And device A with Duplex capability "TwoSided" enabled
    And device B with only Duplex capability "OneSided" enabled
    When the smart device finder algorithm runs
    Then device A should be selected
    And the duplex match should be counted for device A

  Scenario: Select device with duplex one-sided printing support
    Given a print job with duplex set to false
    And device A with Duplex capability "OneSided" enabled
    And device B with only Duplex capability "TwoSided" enabled
    When the smart device finder algorithm runs
    Then device A should be selected

  Scenario: Select device with landscape orientation support
    Given a print job with orientation "landscape"
    And device A with Layout capability "LandScape" enabled
    And device B with only Layout capability "Portrait" enabled
    When the smart device finder algorithm runs
    Then device A should be selected
    And the orientation match should be counted for device A

  Scenario: Normalize landscape orientation from lowercase
    Given a print job with orientation "landscape" in lowercase
    When the smart device finder processes the orientation
    Then the orientation should be normalized to "LandScape"

  Scenario: Select device with portrait orientation support
    Given a print job with orientation "Portrait"
    And device A with Layout capability "Portrait" enabled
    And device B with only Layout capability "LandScape" enabled
    When the smart device finder algorithm runs
    Then device A should be selected

  Scenario: Select device with specific paper size support
    Given a print job with paper size "A4"
    And device A with PaperSizes capability "A4" enabled
    And device B with only PaperSizes capability "Letter" enabled
    When the smart device finder algorithm runs
    Then device A should be selected
    And the paper size match should be counted for device A

  Scenario: Select device with multiple paper size options
    Given a print job with paper size "Legal"
    And device A with PaperSizes capabilities:
      | A4     | true  |
      | Letter | true  |
      | Legal  | true  |
    And device B with PaperSizes capabilities:
      | A4     | true  |
      | Letter | true  |
    When the smart device finder algorithm runs
    Then device A should be selected

  Scenario: Select device with highest cumulative match score
    Given a print job with the following specifications:
      | Color       | Color     |
      | Duplex      | true      |
      | PaperSize   | A4        |
      | Orientation | landscape |
    And device A matches 4 out of 4 criteria
    And device B matches 3 out of 4 criteria
    And device C matches 2 out of 4 criteria
    When the smart device finder algorithm runs
    Then device A should be selected
    And device A should have a match count of 4

  Scenario: Handle device with all capabilities enabled
    Given a print job with all standard requirements
    And device A with all capabilities enabled:
      | ColorEnabled      | true |
      | DuplexEnabled     | true |
      | LayoutEnabled     | true |
      | PaperSizesEnabled | true |
    When the smart device finder algorithm runs
    Then device A should have the maximum possible match count

  Scenario: Handle device with no matching capabilities
    Given a print job with the following specifications:
      | Color       | Color    |
      | Duplex      | true     |
      | PaperSize   | A4       |
      | Orientation | Portrait |
    And device A with all capabilities disabled
    When the smart device finder algorithm runs
    Then device A should have a match count of 0

  Scenario: Default to first device when all have zero matches
    Given a print job with standard specifications
    And multiple devices with zero matches
    When the smart device finder algorithm runs
    Then the first device should be selected by default

  Scenario: Handle tie-breaking when multiple devices have same match count
    Given a print job with standard specifications
    And device A with match count of 2
    And device B with match count of 2
    And device C with match count of 2
    When the smart device finder algorithm runs
    Then the device encountered first should be selected

  Scenario: Incremental match counting for each matching capability
    Given a print job with Color "Color", Duplex true, PaperSize "A4", Orientation "Portrait"
    And a device that supports all four capabilities
    When the smart device finder evaluates the device
    Then the match count should increment for each capability
    And the final match count should be 4

  Scenario: Case-insensitive color matching for grayscale
    Given a print job with color "grayscale" in lowercase
    And a device with Color capability "GrayScale" in mixed case
    When the smart device finder normalizes the color
    Then the color should be normalized to "GrayScale"
    And the match should be successful

  Scenario: Handle device with partial capability enablement
    Given a print job requiring color, duplex, A4, and landscape
    And device A with ColorEnabled true but DuplexEnabled false
    And device A with LayoutEnabled true and PaperSizesEnabled true
    When the smart device finder algorithm runs
    Then only enabled capabilities should contribute to match count
    And device A should have a match count of 3

  Scenario: Return device object with match metadata
    Given a print job with standard specifications
    And device A with name "HP LaserJet Pro"
    When the smart device finder algorithm runs
    Then the returned object should include the device details
    And the returned object should include the matches property
    And the matches property should reflect the calculated score
