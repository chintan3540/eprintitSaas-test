@createSession
Feature: Create WebSocket Session for Print Release
  As a user of the ePRINTit system
  I want to create a session for printing documents
  So that I can release print jobs to connected devices

  Background:
    Given the database connection is established
    And valid AWS IoT credentials are available

  Scenario: Create session with missing required parameters
    Given a connection ID "conn-12345"
    And a request body without "releaseCode"
    When the createSession function is called
    Then the response status code should be 400

  Scenario: Create session with missing customerId
    Given a connection ID "conn-12345"
    And a request body with the following data:
      | releaseCode | requestType  |
      | REL-001     | printrelease |
    But the request body is missing "customerId"
    When the createSession function is called
    Then the response status code should be 400

  Scenario: Create session with missing requestType
    Given a connection ID "conn-12345"
    And a request body with the following data:
      | releaseCode | customerId                |
      | REL-001     | 507f1f77bcf86cd799439011 |
    But the request body is missing "requestType"
    When the createSession function is called
    Then the response status code should be 400

  Scenario: Successfully create session for standard tier with device
    Given a connection ID "conn-12345"
    And a standard tier customer with ID "507f1f77bcf86cd799439011"
    And a device with ID "607f1f77bcf86cd799439022"
    And a location with ID "707f1f77bcf86cd799439033"
    And a request body with the following data:
      | releaseCode | requestType  | customerId                | deviceId                  | locationId                | tier     |
      | REL-001     | printrelease | 507f1f77bcf86cd799439011 | 607f1f77bcf86cd799439022 | 707f1f77bcf86cd799439033 | standard |
    And the device exists in the database
    And the device has a Thing configured
    When the createSession function is called
    Then the response status code should be 200
    And a message should be published to the IoT topic
    And a ThingSessions record should be created in the database
    And the ThingSessions record should have an ExpireRecord timestamp

  Scenario: Successfully create session for isolated/premium tier
    Given a connection ID "conn-12345"
    And a premium tier customer with domain "customer-domain.com"
    And a request body with the following data:
      | releaseCode | requestType  | customerId                | locationId                | tier    | domainName            |
      | REL-002     | printrelease | 507f1f77bcf86cd799439011 | 707f1f77bcf86cd799439033 | premium | customer-domain.com  |
    And an isolated database is configured for the domain
    When the createSession function is called
    Then the isolated database should be used
    And the response status code should be 200

  Scenario: Create session with explicit charge flag set to true
    Given a connection ID "conn-12345"
    And a request body with charge flag set to true
    And a device with ID "607f1f77bcf86cd799439022"
    When the createSession function is called
    Then the message published should include "Charge: true"
    And the response status code should be 200

  Scenario: Create session with explicit charge flag set to false
    Given a connection ID "conn-12345"
    And a request body with charge flag set to false
    And a device with ID "607f1f77bcf86cd799439022"
    When the createSession function is called
    Then the message published should include "Charge: false"
    And the response status code should be 200

  Scenario: Create session using ChargeForUsage from JobList when Charge not provided
    Given a connection ID "conn-12345"
    And a customer with ID "507f1f77bcf86cd799439011" has ChargeForUsage set to true
    And the request body does not include a Charge flag
    When the createSession function is called
    Then the charge value should be inherited from ChargeForUsage
    And the response status code should be 200

  Scenario: Create session without device but with thingName
    Given a connection ID "conn-12345"
    And a request body without deviceId
    And the request body includes thingName "thing-abc-123"
    When the createSession function is called
    Then the session should use the provided thingName
    And the response status code should be 200

  Scenario: Create session without device and without thingName fails
    Given a connection ID "conn-12345"
    And a request body without deviceId
    And the request body without thingName
    When the createSession function is called
    Then an error message "Thing not configured" should be sent
    And the response status code should be 200

  Scenario: Create session with file names
    Given a connection ID "conn-12345"
    And a request body with the following file names:
      | document1.pdf |
      | document2.pdf |
      | report.docx   |
    When the createSession function is called
    Then the message should include the file names
    And the ThingSessions record should store the file names
    And the response status code should be 200

  Scenario: Create session with account numbers
    Given a connection ID "conn-12345"
    And a request body with the following account numbers:
      | ACC-001 |
      | ACC-002 |
    When the createSession function is called
    Then the message should include the account numbers
    And the ThingSessions record should store the account numbers
    And the response status code should be 200

  Scenario: Create TTL index on PublicUploads collection
    Given a connection ID "conn-12345"
    And a valid request body for creating a session
    When the createSession function is called
    Then an index should be created on PublicUploads collection with field "ExpireRecord"
    And the index should have expireAfterSeconds set to 1800
    And the response status code should be 200

  Scenario: Successfully create session with printer group
    Given a connection ID "conn-12345"
    And a request body with groupId "807f1f77bcf86cd799439044"
    And a request body with printerGroupId "907f1f77bcf86cd799439055"
    And the group exists with PrinterGroups configured
    And the printer group is enabled
    And the printer group has assigned devices
    When the createSession function is called
    Then messages should be sent to all devices in the printer group
    And the response status code should be 200

  Scenario: Create session with printer group that is not enabled
    Given a connection ID "conn-12345"
    And a request body with groupId "807f1f77bcf86cd799439044"
    And a request body with printerGroupId "907f1f77bcf86cd799439055"
    And the group exists but the printer group is not enabled
    When the createSession function is called
    Then no messages should be sent to devices
    And the response status code should be 200

  Scenario: Create session with printer group that doesn't exist
    Given a connection ID "conn-12345"
    And a request body with groupId "807f1f77bcf86cd799439044"
    And a request body with printerGroupId "907f1f77bcf86cd799439055"
    And the group does not have PrinterGroups defined
    When the createSession function is called
    Then an error message "Printer Groups not defined" should be sent
    And the response status code should be 200

  Scenario: Smart print device selection based on color capability
    Given a connection ID "conn-12345"
    And a printer group with multiple devices
    And a print job with color requirement "Color"
    And device A supports color printing
    And device B does not support color printing
    When the createSession function processes the printer group
    Then device A should be selected for the print job

  Scenario: Smart print device selection based on duplex capability
    Given a connection ID "conn-12345"
    And a printer group with multiple devices
    And a print job with duplex requirement set to true
    And device A supports duplex printing
    And device B does not support duplex printing
    When the createSession function processes the printer group
    Then device A should be selected for the print job

  Scenario: Smart print device selection based on paper size
    Given a connection ID "conn-12345"
    And a printer group with multiple devices
    And a print job with paper size "A4"
    And device A supports paper size "A4"
    And device B only supports paper size "Letter"
    When the createSession function processes the printer group
    Then device A should be selected for the print job

  Scenario: Smart print device selection based on orientation
    Given a connection ID "conn-12345"
    And a printer group with multiple devices
    And a print job with orientation "landscape"
    And device A supports landscape orientation
    And device B only supports portrait orientation
    When the createSession function processes the printer group
    Then device A should be selected for the print job

  Scenario: Smart print device selection with highest match count
    Given a connection ID "conn-12345"
    And a printer group with three devices
    And a print job with color, duplex, A4 paper, and landscape orientation
    And device A matches 4 out of 4 requirements
    And device B matches 2 out of 4 requirements
    And device C matches 3 out of 4 requirements
    When the createSession function processes the printer group
    Then device A should be selected as it has the highest match count

  Scenario: Process multiple files in printer group with file filtering
    Given a connection ID "conn-12345"
    And a printer group session request
    And a PublicUploads document with 5 files in JobList
    And the request specifies 2 specific file names
    When the createSession function processes the printer group
    Then only the 2 specified files should be processed
    And messages should be sent only for those 2 files

  Scenario: Handle location ID fallback in printer group
    Given a connection ID "conn-12345"
    And a printer group session request
    And a device with no LocationID configured
    And the request body includes locationId "707f1f77bcf86cd799439033"
    When the createSession function processes the printer group
    Then the fallback locationId from request should be used in the topic
    And the response status code should be 200

  Scenario: IoT topic construction for standard device
    Given a connection ID "conn-12345"
    And customerId "507f1f77bcf86cd799439011"
    And locationId "707f1f77bcf86cd799439033"
    And thingName "thing-abc-123"
    And requestType "printrelease"
    When the createSession function is called
    Then the IoT topic should be "cmd/eprintit/507f1f77bcf86cd799439011/707f1f77bcf86cd799439033/thing-abc-123/printrelease"

  Scenario: Store session metadata in ThingSessions collection
    Given a connection ID "conn-12345"
    And a complete request body for creating a session
    When the createSession function is called
    Then the ThingSessions record should include SessionID
    And the ThingSessions record should include Topic
    And the ThingSessions record should include CustomerID
    And the ThingSessions record should include LocationID
    And the ThingSessions record should include ThingName
    And the ThingSessions record should include RequestType
    And the ThingSessions record should include CreatedAt timestamp
    And the ThingSessions record should include ExpireRecord timestamp
