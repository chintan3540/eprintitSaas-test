Feature: Send Message to Kiosk
  As the ePRINTit system
  I want to send properly formatted messages to IoT kiosk devices
  So that print jobs can be executed on the target devices

  Background:
    Given the IoT endpoint is configured
    And valid AWS credentials are available

  Scenario: Send basic message to kiosk with required fields
    Given a topic "cmd/eprintit/customer123/location456/thing-abc/printrelease"
    And a PublicUploads document with ReleaseCode "REL-001"
    And a Thing with PrimaryRegion ThingName "thing-abc"
    And a device name "HP LaserJet Pro"
    And a connection ID "conn-12345"
    When the sendMessageToKiosk function is called
    Then a message should be published to the topic
    And the message should include ReleaseCode "REL-001"
    And the message should include ThingName "thing-abc"
    And the message should include RequestType "printrelease"
    And the message should include Device "HP LaserJet Pro"
    And the message should include SessionID "conn-12345"

  Scenario: Send message with single file
    Given a topic for print release
    And a file name "document1.pdf"
    When the sendMessageToKiosk function is called with the file
    Then the message FileNames should be an array with "document1.pdf"

  Scenario: Send message without specific file
    Given a topic for print release
    And no specific file is provided
    When the sendMessageToKiosk function is called
    Then the message FileNames should be an empty array

  Scenario: Send message with account numbers
    Given a topic for print release
    And account numbers ["ACC-001", "ACC-002"]
    When the sendMessageToKiosk function is called
    Then the message should include Accounts with the account numbers

  Scenario: Send message without account numbers
    Given a topic for print release
    And no account numbers are provided
    When the sendMessageToKiosk function is called
    Then the message Accounts should be an empty array

  Scenario: Send message with ChargeForUsage enabled
    Given a topic for print release
    And ChargeForUsage is set to true
    When the sendMessageToKiosk function is called
    Then the message should include Charge set to true

  Scenario: Send message with ChargeForUsage disabled
    Given a topic for print release
    And ChargeForUsage is set to false
    When the sendMessageToKiosk function is called
    Then the message should include Charge set to false

  Scenario: Send message without ChargeForUsage parameter
    Given a topic for print release
    And ChargeForUsage is not provided
    When the sendMessageToKiosk function is called
    Then the message should not include a Charge field

  Scenario: Send message with null device name
    Given a topic for print release
    And device name is null
    When the sendMessageToKiosk function is called
    Then the message Device field should be null

  Scenario: Verify message structure matches expected format
    Given a complete set of message parameters
    When the sendMessageToKiosk function is called
    Then the message should have all required fields
    And the message should be valid JSON
    And the message RequestType should always be "printrelease"

  Scenario: Log topic name before sending message
    Given a topic "cmd/eprintit/customer123/location456/thing-abc/printrelease"
    When the sendMessageToKiosk function is called
    Then the topic name should be logged to console

  Scenario: Log formed message before publishing
    Given complete message parameters
    When the sendMessageToKiosk function is called
    Then the formed message should be logged to console
    And the log should include the complete message object

  Scenario: Publish message to IoT endpoint
    Given a valid topic and message
    And IoT endpoint "a3example-ats.iot.us-east-1.amazonaws.com"
    And valid access parameters
    When the sendMessageToKiosk function is called
    Then publishToTopic should be called with correct parameters
    And publishToTopic should receive the topic as first parameter
    And publishToTopic should receive the message as second parameter
    And publishToTopic should receive the endpoint as third parameter
    And publishToTopic should receive the access params as fourth parameter

  Scenario: Handle complex file names with special characters
    Given a topic for print release
    And a file name "My Document (Final) - v2.1.pdf"
    When the sendMessageToKiosk function is called with the file
    Then the message should include the file name with special characters preserved

  Scenario: Handle multiple concurrent messages to same kiosk
    Given a topic for print release
    And multiple files to be processed
    When sendMessageToKiosk is called multiple times
    Then each message should be published independently
    And each message should have unique file references

  Scenario: Message includes all printer group context
    Given a printer group print job
    And device selected from smart device finder
    And location ID from device or fallback
    When the sendMessageToKiosk function is called
    Then the message should reflect the device context
    And the topic should include the correct location ID
