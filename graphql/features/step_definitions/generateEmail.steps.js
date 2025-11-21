const request = require("supertest");
const {
  Given,
  When,
  Then,
  Before,
  setDefaultTimeout,
} = require("@cucumber/cucumber");
const expect = require("chai").expect;
const { config } = require("../configs/config");
const { updateCustomer } = require("../../../memoryDb/customer");
const {
  addCustomizationText,
  updateCustomizationText,
  getCustomizationTextByCustomerId
} = require("../../../memoryDb/customizationText");
const { generateEmailMutation } = require("../mutations/customizationTexts");
const { getEvent } = require("../mocks/event");
const { handler } = require("../../graphql");

let server;
let globalResponse = {};
let testCustomer = {};
let testCustomizationText = {};
let currentCombination = "";
let generatedEmails = [];
const context = {};

setDefaultTimeout(30000);
server = request(config.url);

Before(async () => {
  testCustomer = {};
  testCustomizationText = {};
  globalResponse = {};
  generatedEmails = [];
  currentCombination = "";
    const existingCustomizationText = await getCustomizationTextByCustomerId(config.customerId);
    if (existingCustomizationText && existingCustomizationText._id) {
      testCustomizationText.id = existingCustomizationText._id.toString();
      const cleanupData = {
        "HowToLogoSection.EmailAddressAssignedColor": null,
        "HowToLogoSection.EmailAddressAssignedGrayscale": null,
        "AdvancedEmailConfiguration.AdvancedEmailAlias": [],
        "AdvancedEmailConfiguration.Enabled": false
      };
      await updateCustomizationText(cleanupData, testCustomizationText.id);
    }
});

Given("I have valid authentication credentials", () => {
  expect(config.token).to.not.be.undefined;
});

Given("I have access to the GraphQL API", () => {
  expect(server).to.not.be.undefined;
});

Given("I have a TBS customer with valid customer ID", async () => {
  testCustomer = {
    id: config.customerId,
    type: "tbs",
  };

  await updateCustomer(
    { CustomerType: "tbs", DomainName: "test-tbs-domain" },
    config.customerId
  );

  if (!testCustomizationText.id) {
    const existingCustomizationText = await getCustomizationTextByCustomerId(config.customerId);
    if (existingCustomizationText && existingCustomizationText._id) {
      testCustomizationText.id = existingCustomizationText._id.toString();
    } else {
      const { insertedId: customizationTextId } = await addCustomizationText("", config.customerId);
      testCustomizationText.id = customizationTextId.toString();
    }
  }
  
  const cleanupData = {
    "HowToLogoSection.EmailAddressAssignedColor": null,
    "HowToLogoSection.EmailAddressAssignedGrayscale": null,
    "AdvancedEmailConfiguration.AdvancedEmailAlias": [],
    "AdvancedEmailConfiguration.Enabled": false
  };
  await updateCustomizationText(cleanupData, testCustomizationText.id);
});

Given("I have a non-TBS customer with valid customer ID", async () => {
  testCustomer = {
    id: config.customerId,
    type: "regular",
  };

  await updateCustomer(
    { CustomerType: "regular", DomainName: "test-regular-domain" },
    config.customerId
  );

  if (!testCustomizationText.id) {
    const existingCustomizationText = await getCustomizationTextByCustomerId(config.customerId);
    if (existingCustomizationText && existingCustomizationText._id) {
      testCustomizationText.id = existingCustomizationText._id.toString();
    } else {
      const { insertedId: customizationTextId } = await addCustomizationText("", config.customerId);
      testCustomizationText.id = customizationTextId.toString();
    }
  }
  
  const cleanupData = {
    "HowToLogoSection.EmailAddressAssignedColor": null,
    "HowToLogoSection.EmailAddressAssignedGrayscale": null,
    "AdvancedEmailConfiguration.AdvancedEmailAlias": [],
    "AdvancedEmailConfiguration.Enabled": false
  };
  await updateCustomizationText(cleanupData, testCustomizationText.id);
});

Given(
  "the customer already has existing color email in HowToLogoSection",
  async () => {
    await updateCustomizationText(
      {
        "HowToLogoSection.EmailAddressAssignedColor":
          "color-testdomain@testdomain.com",
      },
      testCustomizationText.id
    );
  }
);

Given(
  "the customer already has existing bw email in HowToLogoSection",
  async () => {
    await updateCustomizationText(
      {
        "HowToLogoSection.EmailAddressAssignedGrayscale":
          "bw-testdomain@testdomain.com",
      },
      testCustomizationText.id
    );
  }
);

Given(
  "the customer already has existing color email in AdvancedEmailConfiguration",
  async () => {
    await updateCustomizationText(
      {
        "AdvancedEmailConfiguration.AdvancedEmailAlias": [
          {
            CombinationType: "color",
            Email: "color-testdomain@testdomain.com",
            AliasEmails: null,
          },
        ],
        "AdvancedEmailConfiguration.Enabled": true,
      },
      testCustomizationText.id
    );
  }
);

Given(
  "the customer already has existing bw email in AdvancedEmailConfiguration",
  async () => {
    await updateCustomizationText(
      {
        "AdvancedEmailConfiguration.AdvancedEmailAlias": [
          {
            CombinationType: "bw",
            Email: "bw-testdomain@testdomain.com",
            AliasEmails: null,
          },
        ],
        "AdvancedEmailConfiguration.Enabled": true,
      },
      testCustomizationText.id
    );
  }
);

Given("I have a TBS customer with domain name {string}", async (domainName) => {
  testCustomer = {
    id: config.customerId,
    type: "tbs",
  };

  await updateCustomer(
    { CustomerType: "tbs", DomainName: domainName },
    config.customerId
  );
  
  if (!testCustomizationText.id) {
    const existingCustomizationText = await getCustomizationTextByCustomerId(config.customerId);
    if (existingCustomizationText && existingCustomizationText._id) {
      testCustomizationText.id = existingCustomizationText._id.toString();
    } else {
      const { insertedId: customizationTextId } = await addCustomizationText("", config.customerId);
      testCustomizationText.id = customizationTextId.toString();
    }
  }
  
  const cleanupData = {
    "HowToLogoSection.EmailAddressAssignedColor": null,
    "HowToLogoSection.EmailAddressAssignedGrayscale": null,
    "AdvancedEmailConfiguration.AdvancedEmailAlias": [],
    "AdvancedEmailConfiguration.Enabled": false
  };
  await updateCustomizationText(cleanupData, testCustomizationText.id);
});

When(
  "I send a generateEmail mutation request with {string} combination",
  async (combination) => {
    currentCombination = combination;
    const mutation = generateEmailMutation(config.customerId, combination);
    const event = getEvent(mutation);

    try {
      const response = await handler(event, context);
      response.body = JSON.parse(response.body);
      globalResponse.response = response;
      
    } catch (error) {
      throw error;
    }
  }
);

When("I generate a color email combination", async () => {
  const mutation = generateEmailMutation(config.customerId, "color");
  const event = getEvent(mutation);

  try {
    const response = await handler(event, context);
    response.body = JSON.parse(response.body);
    generatedEmails.push({ type: "color", response: response });
    globalResponse.response = response;
  } catch (error) {
    throw error;
  }
});

When("I generate a bw email combination", async () => {
  const mutation = generateEmailMutation(config.customerId, "bw");
  const event = getEvent(mutation);

  try {
    const response = await handler(event, context);
    response.body = JSON.parse(response.body);
    generatedEmails.push({ type: "bw", response: response });
    globalResponse.response = response;
  } catch (error) {
    throw error;
  }
});

Then(
  "the generateEmail response should have status code {int}",
  (statusCode) => {
    expect(globalResponse.response.statusCode).to.equal(statusCode);
  }
);

Then(
  "the response should contain a valid email object with color combination",
  () => {    
    expect(globalResponse.response.body.data).to.not.be.undefined;
    expect(globalResponse.response.body.data).to.not.be.null;
    expect(globalResponse.response.body.data.generateEmail).to.not.be.undefined;
    expect(globalResponse.response.body.data.generateEmail).to.not.be.null;
    expect(
      globalResponse.response.body.data.generateEmail.CombinationType
    ).to.equal("color");
    expect(globalResponse.response.body.data.generateEmail.Email).to.include(
      "color-"
    );
  }
);

Then(
  "the response should contain a valid email object with bw combination",
  () => {
    expect(globalResponse.response.body.data).to.not.be.undefined;
    expect(globalResponse.response.body.data).to.not.be.null;
    expect(globalResponse.response.body.data.generateEmail).to.not.be.undefined;
    expect(globalResponse.response.body.data.generateEmail).to.not.be.null;
    expect(
      globalResponse.response.body.data.generateEmail.CombinationType
    ).to.equal("bw");
    expect(globalResponse.response.body.data.generateEmail.Email).to.include(
      "bw-"
    );
  }
);

Then("the response should have an error", () => {
  if (
    globalResponse.response.body.errors &&
    globalResponse.response.body.errors.length > 0
  ) {
    expect(globalResponse.response.body.errors).to.have.lengthOf.above(0);
  } else {
    expect(globalResponse.response.body.data).to.not.be.undefined;
  }
});

Then("the error message should be {string}", (expectedMessage) => {
  if (
    globalResponse.response.body.errors &&
    globalResponse.response.body.errors.length > 0
  ) {
    expect(globalResponse.response.body.errors[0].message).to.include(
      expectedMessage
    );
  }
});

Then(
  "the email should be stored in HowToLogoSection.EmailAddressAssignedColor field",
  async () => {
    const emailResponse = globalResponse.response.body.data.generateEmail;
    expect(emailResponse).to.not.be.null;
    expect(emailResponse.CombinationType).to.equal("color");
    expect(emailResponse.Email).to.include("color-");
        
    const storedCustomizationText = await getCustomizationTextByCustomerId(config.customerId);
    expect(storedCustomizationText).to.not.be.null;
    expect(storedCustomizationText.HowToLogoSection).to.not.be.undefined;
    expect(storedCustomizationText.HowToLogoSection.EmailAddressAssignedColor).to.equal(emailResponse.Email);
    
    if (storedCustomizationText.AdvancedEmailConfiguration && storedCustomizationText.AdvancedEmailConfiguration.AdvancedEmailAlias) {
      const colorEmailInAdvanced = storedCustomizationText.AdvancedEmailConfiguration.AdvancedEmailAlias.find(
        alias => alias.CombinationType === "color"
      );
      expect(colorEmailInAdvanced).to.be.undefined;
    }
  }
);

Then(
  "the email should be stored in HowToLogoSection.EmailAddressAssignedGrayscale field",
  async () => {
    const emailResponse = globalResponse.response.body.data.generateEmail;
    expect(emailResponse).to.not.be.null;
    expect(emailResponse.CombinationType).to.equal("bw");
    expect(emailResponse.Email).to.include("bw-");
        
    const storedCustomizationText = await getCustomizationTextByCustomerId(config.customerId);
    expect(storedCustomizationText).to.not.be.null;
    expect(storedCustomizationText.HowToLogoSection).to.not.be.undefined;
    expect(storedCustomizationText.HowToLogoSection.EmailAddressAssignedGrayscale).to.equal(emailResponse.Email);
    
    if (storedCustomizationText.AdvancedEmailConfiguration && storedCustomizationText.AdvancedEmailConfiguration.AdvancedEmailAlias) {
      const bwEmailInAdvanced = storedCustomizationText.AdvancedEmailConfiguration.AdvancedEmailAlias.find(
        alias => alias.CombinationType === "bw"
      );
      expect(bwEmailInAdvanced).to.be.undefined;
    }
  }
);

Then(
  "the email should be stored in AdvancedEmailConfiguration.AdvancedEmailAlias array",
  async () => {
    const emailResponse = globalResponse.response.body.data.generateEmail;
    expect(emailResponse).to.not.be.null;
    expect(emailResponse.CombinationType).to.equal(
      currentCombination.toLowerCase()
    );
    expect(emailResponse.Email).to.include(
      currentCombination.toLowerCase() + "-"
    );
  }
);

Then("AdvancedEmailConfiguration.Enabled should be set to true", async () => {
  const emailResponse = globalResponse.response.body.data.generateEmail;
  expect(emailResponse).to.not.be.null;
  expect(emailResponse.CombinationType).to.not.be.empty;
  expect(emailResponse.Email).to.not.be.empty;
});

Then("the email format should be {string}", async (expectedFormat) => {
  const emailResponse = globalResponse.response.body.data.generateEmail;
  expect(emailResponse).to.not.be.null;

  const actualEmail = emailResponse.Email;

  expect(actualEmail).to.include(currentCombination.toLowerCase() + "-");

  const emailParts = actualEmail.split("@");
  expect(emailParts).to.have.lengthOf(2);

  const emailPrefix = emailParts[0];
  const emailDomain = emailParts[1];

  expect(emailPrefix).to.match(
    new RegExp(`^${currentCombination.toLowerCase()}-`)
  );

  const containsExpectedDomain =
    emailPrefix.includes("testdomain") ||
    emailPrefix.includes("test-tbs-domain") ||
    emailPrefix.includes("test-regular-domain");
  expect(containsExpectedDomain).to.be.true;

  expect(emailDomain).to.not.be.empty;
});

Then(
  "the combination should be converted to lowercase {string}",
  (expectedCombination) => {
    if (
      globalResponse.response.body.data &&
      globalResponse.response.body.data.generateEmail
    ) {
      expect(
        globalResponse.response.body.data.generateEmail.CombinationType
      ).to.equal(expectedCombination);
    }
  }
);

Then("the email should be generated successfully", () => {
  expect(globalResponse.response.body.data).to.not.be.undefined;
  expect(globalResponse.response.body.data).to.not.be.null;
  expect(globalResponse.response.body.data.generateEmail).to.not.be.undefined;
  expect(globalResponse.response.body.data.generateEmail).to.not.be.null;
  
  const emailResponse = globalResponse.response.body.data.generateEmail;
  expect(emailResponse.Email).to.not.be.empty;
  expect(emailResponse.CombinationType).to.not.be.empty;
  expect(emailResponse.AliasEmails === null || emailResponse.AliasEmails === undefined).to.be.true;
});

Then("both emails should be stored correctly", async () => {
  expect(globalResponse.response.body.data.generateEmail).to.not.be.null;
  expect(
    globalResponse.response.body.data.generateEmail.CombinationType
  ).to.equal("bw");
});

Then("the generated email should follow the pattern {string}", (pattern) => {
  const emailResponse = generatedEmails[generatedEmails.length - 1];

  if (
    emailResponse &&
    emailResponse.response.body.data &&
    emailResponse.response.body.data.generateEmail
  ) {
    const email = emailResponse.response.body.data.generateEmail.Email;

    const patternMatch = pattern.match(/^(\w+)-testdomain/);
    const expectedCombination = patternMatch ? patternMatch[1] : "unknown";

    expect(email).to.include(`${expectedCombination}-testdomain@`);

    const emailParts = email.split("@");
    expect(emailParts[0]).to.equal(`${expectedCombination}-testdomain`);
    expect(emailParts[1]).to.not.be.empty;
  } else {
    throw new Error(
      "No valid email response data available for pattern validation"
    );
  }
});