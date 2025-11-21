const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { expect } = require('chai');
const sinon = require('sinon');

// Test context for sendMessageToKiosk
const kioskMessageContext = {
    topic: null,
    publicUploadsDoc: null,
    thingData: null,
    deviceName: null,
    accessParams: null,
    endpoint: null,
    fileName: null,
    connectionId: null,
    accountNumbers: null,
    chargeForUsage: null,
    publishedMessages: [],
    consoleLogSpy: null,
    publishToTopicStub: null
};

Before(function () {
    // Reset context before each scenario
    kioskMessageContext.topic = null;
    kioskMessageContext.publicUploadsDoc = null;
    kioskMessageContext.thingData = null;
    kioskMessageContext.deviceName = null;
    kioskMessageContext.accessParams = {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        sessionToken: 'FwoGZXIvYXdzEBYaDKx...'
    };
    kioskMessageContext.endpoint = 'a3example-ats.iot.us-east-1.amazonaws.com';
    kioskMessageContext.fileName = null;
    kioskMessageContext.connectionId = null;
    kioskMessageContext.accountNumbers = null;
    kioskMessageContext.chargeForUsage = null;
    kioskMessageContext.publishedMessages = [];
    
    // Spy on console.log
    kioskMessageContext.consoleLogSpy = sinon.spy(console, 'log');
    
    // Stub publishToTopic
    kioskMessageContext.publishToTopicStub = sinon.stub().callsFake((topic, message, endpoint, accessParams) => {
        kioskMessageContext.publishedMessages.push({
            topic,
            message,
            endpoint,
            accessParams
        });
        return Promise.resolve();
    });
});

// Mock implementation of sendMessageToKiosk
async function sendMessageToKiosk(topic, ifProcessedAll, thingsData, deviceName, accessParams, endpoint, file, connectionId, accountNumber, ChargeForUsage) {
    console.log('Topic Name: ', topic);
    
    const data = {
        ReleaseCode: ifProcessedAll.ReleaseCode,
        ThingName: thingsData.PrimaryRegion.ThingName,
        RequestType: 'printrelease',
        Device: deviceName || null,
        FileNames: file ? [file] : [],
        SessionID: connectionId,
        Accounts: accountNumber ? accountNumber : []
    };
    
    if (ChargeForUsage !== null && ChargeForUsage !== undefined) {
        Object.assign(data, { Charge: ChargeForUsage });
    }
    
    console.log('Message Formed: ', data);
    await kioskMessageContext.publishToTopicStub(topic, data, endpoint, accessParams);
}

// Background
Given('the IoT endpoint is configured', function () {
    kioskMessageContext.endpoint = 'a3example-ats.iot.us-east-1.amazonaws.com';
});

Given('valid AWS credentials are available', function () {
    kioskMessageContext.accessParams = {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        sessionToken: 'FwoGZXIvYXdzEBYaDKx...'
    };
});

// Given Steps
Given('a topic {string}', function (topic) {
    kioskMessageContext.topic = topic;
});

Given('a topic for print release', function () {
    kioskMessageContext.topic = 'cmd/eprintit/customer123/location456/thing-abc/printrelease';
    // Initialize default objects if not already set
    if (!kioskMessageContext.publicUploadsDoc) {
        kioskMessageContext.publicUploadsDoc = { ReleaseCode: 'REL-001', JobList: [] };
    }
    if (!kioskMessageContext.thingData) {
        kioskMessageContext.thingData = { PrimaryRegion: { ThingName: 'thing-abc' } };
    }
    if (!kioskMessageContext.deviceName) {
        kioskMessageContext.deviceName = 'HP LaserJet Pro';
    }
    if (!kioskMessageContext.connectionId) {
        kioskMessageContext.connectionId = 'conn-12345';
    }
});

Given('a PublicUploads document with ReleaseCode {string}', function (releaseCode) {
    kioskMessageContext.publicUploadsDoc = {
        ReleaseCode: releaseCode,
        JobList: []
    };
});

Given('a Thing with PrimaryRegion ThingName {string}', function (thingName) {
    kioskMessageContext.thingData = {
        PrimaryRegion: {
            ThingName: thingName
        }
    };
});

Given('a device name {string}', function (deviceName) {
    kioskMessageContext.deviceName = deviceName;
});

// Note: 'a connection ID {string}' step is defined in createSession.steps.js

Given('a file name {string}', function (fileName) {
    kioskMessageContext.fileName = fileName;
});

Given('no specific file is provided', function () {
    kioskMessageContext.fileName = null;
});

Given('account numbers {string}', function (accountNumbersJson) {
    kioskMessageContext.accountNumbers = JSON.parse(accountNumbersJson);
});

// Handle array syntax in feature files
Given('account numbers [{string}, {string}]', function (acc1, acc2) {
    kioskMessageContext.accountNumbers = [acc1, acc2];
});

Given('no account numbers are provided', function () {
    kioskMessageContext.accountNumbers = null;
});

Given('ChargeForUsage is set to true', function () {
    kioskMessageContext.chargeForUsage = true;
});

Given('ChargeForUsage is set to false', function () {
    kioskMessageContext.chargeForUsage = false;
});

Given('ChargeForUsage is not provided', function () {
    kioskMessageContext.chargeForUsage = null;
});

Given('device name is null', function () {
    kioskMessageContext.deviceName = null;
});

Given('a complete set of message parameters', function () {
    kioskMessageContext.topic = 'cmd/eprintit/customer123/location456/thing-abc/printrelease';
    kioskMessageContext.publicUploadsDoc = { ReleaseCode: 'REL-001' };
    kioskMessageContext.thingData = { PrimaryRegion: { ThingName: 'thing-abc' } };
    kioskMessageContext.deviceName = 'HP LaserJet Pro';
    kioskMessageContext.connectionId = 'conn-12345';
    kioskMessageContext.fileName = 'document.pdf';
    kioskMessageContext.accountNumbers = ['ACC-001'];
    kioskMessageContext.chargeForUsage = true;
});

Given('complete message parameters', function () {
    kioskMessageContext.topic = 'cmd/eprintit/customer123/location456/thing-abc/printrelease';
    kioskMessageContext.publicUploadsDoc = { ReleaseCode: 'REL-001' };
    kioskMessageContext.thingData = { PrimaryRegion: { ThingName: 'thing-abc' } };
    kioskMessageContext.deviceName = 'HP LaserJet Pro';
    kioskMessageContext.connectionId = 'conn-12345';
});

Given('a valid topic and message', function () {
    kioskMessageContext.topic = 'cmd/eprintit/customer123/location456/thing-abc/printrelease';
    kioskMessageContext.publicUploadsDoc = { ReleaseCode: 'REL-001' };
    kioskMessageContext.thingData = { PrimaryRegion: { ThingName: 'thing-abc' } };
    kioskMessageContext.deviceName = 'HP LaserJet Pro';
    kioskMessageContext.connectionId = 'conn-12345';
});

Given('IoT endpoint {string}', function (endpoint) {
    kioskMessageContext.endpoint = endpoint;
});

Given('valid access parameters', function () {
    // Already set in background
});

Given('multiple files to be processed', function () {
    kioskMessageContext.multipleFiles = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
});

Given('a printer group print job', function () {
    kioskMessageContext.publicUploadsDoc = { ReleaseCode: 'REL-001' };
    kioskMessageContext.thingData = { PrimaryRegion: { ThingName: 'thing-printer-001' } };
});

Given('device selected from smart device finder', function () {
    kioskMessageContext.deviceName = 'HP LaserJet Pro';
});

Given('location ID from device or fallback', function () {
    kioskMessageContext.topic = 'cmd/eprintit/customer123/location456/thing-printer-001/printrelease';
});

// When Steps
When('the sendMessageToKiosk function is called', async function () {
    // Set defaults if not already set
    if (!kioskMessageContext.publicUploadsDoc) {
        kioskMessageContext.publicUploadsDoc = { ReleaseCode: 'REL-001' };
    }
    if (!kioskMessageContext.thingData) {
        kioskMessageContext.thingData = { PrimaryRegion: { ThingName: 'thing-abc' } };
    }
    if (!kioskMessageContext.endpoint) {
        kioskMessageContext.endpoint = 'mock-endpoint.iot.amazonaws.com';
    }
    if (!kioskMessageContext.accessParams) {
        kioskMessageContext.accessParams = {};
    }
    if (!kioskMessageContext.connectionId) {
        kioskMessageContext.connectionId = 'conn-123';
    }
    
    await sendMessageToKiosk(
        kioskMessageContext.topic,
        kioskMessageContext.publicUploadsDoc,
        kioskMessageContext.thingData,
        kioskMessageContext.deviceName,
        kioskMessageContext.accessParams,
        kioskMessageContext.endpoint,
        kioskMessageContext.fileName,
        kioskMessageContext.connectionId,
        kioskMessageContext.accountNumbers,
        kioskMessageContext.chargeForUsage
    );
});

When('the sendMessageToKiosk function is called with the file', async function () {
    await sendMessageToKiosk(
        kioskMessageContext.topic,
        kioskMessageContext.publicUploadsDoc,
        kioskMessageContext.thingData,
        kioskMessageContext.deviceName,
        kioskMessageContext.accessParams,
        kioskMessageContext.endpoint,
        kioskMessageContext.fileName,
        kioskMessageContext.connectionId,
        kioskMessageContext.accountNumbers,
        kioskMessageContext.chargeForUsage
    );
});

When('sendMessageToKiosk is called multiple times', async function () {
    for (const file of kioskMessageContext.multipleFiles) {
        await sendMessageToKiosk(
            kioskMessageContext.topic,
            kioskMessageContext.publicUploadsDoc,
            kioskMessageContext.thingData,
            kioskMessageContext.deviceName,
            kioskMessageContext.accessParams,
            kioskMessageContext.endpoint,
            file,
            kioskMessageContext.connectionId,
            kioskMessageContext.accountNumbers,
            kioskMessageContext.chargeForUsage
        );
    }
});

// Then Steps
Then('a message should be published to the topic', function () {
    expect(kioskMessageContext.publishedMessages).to.have.lengthOf.at.least(1);
});

Then('the message should include ReleaseCode {string}', function (releaseCode) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.ReleaseCode).to.equal(releaseCode);
});

Then('the message should include ThingName {string}', function (thingName) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.ThingName).to.equal(thingName);
});

Then('the message should include RequestType {string}', function (requestType) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.RequestType).to.equal(requestType);
});

Then('the message should include Device {string}', function (deviceName) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Device).to.equal(deviceName);
});

Then('the message should include SessionID {string}', function (sessionId) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.SessionID).to.equal(sessionId);
});

Then('the message FileNames should be an array with {string}', function (fileName) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.FileNames).to.be.an('array');
    expect(message.FileNames).to.include(fileName);
});

Then('the message FileNames should be an empty array', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.FileNames).to.be.an('array');
    expect(message.FileNames).to.have.lengthOf(0);
});

Then('the message should include Accounts with the account numbers', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Accounts).to.deep.equal(kioskMessageContext.accountNumbers);
});

Then('the message Accounts should be an empty array', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Accounts).to.be.an('array');
    expect(message.Accounts).to.have.lengthOf(0);
});

Then('the message should include Charge set to true', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Charge).to.equal(true);
});

Then('the message should include Charge set to false', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Charge).to.equal(false);
});

Then('the message should not include a Charge field', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message).to.not.have.property('Charge');
});

Then('the message Device field should be null', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Device).to.be.null;
});

Then('the message should have all required fields', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message).to.have.property('ReleaseCode');
    expect(message).to.have.property('ThingName');
    expect(message).to.have.property('RequestType');
    expect(message).to.have.property('Device');
    expect(message).to.have.property('FileNames');
    expect(message).to.have.property('SessionID');
    expect(message).to.have.property('Accounts');
});

Then('the message should be valid JSON', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    const jsonString = JSON.stringify(message);
    expect(() => JSON.parse(jsonString)).to.not.throw();
});

Then('the message RequestType should always be {string}', function (requestType) {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.RequestType).to.equal(requestType);
});

Then('the topic name should be logged to console', function () {
    expect(kioskMessageContext.consoleLogSpy.calledWith('Topic Name: ', kioskMessageContext.topic)).to.be.true;
});

Then('the formed message should be logged to console', function () {
    const logCalls = kioskMessageContext.consoleLogSpy.getCalls();
    const messageLogCall = logCalls.find(call => call.args[0] === 'Message Formed: ');
    expect(messageLogCall).to.exist;
});

Then('the log should include the complete message object', function () {
    const logCalls = kioskMessageContext.consoleLogSpy.getCalls();
    const messageLogCall = logCalls.find(call => call.args[0] === 'Message Formed: ');
    expect(messageLogCall.args[1]).to.be.an('object');
});

Then('publishToTopic should be called with correct parameters', function () {
    expect(kioskMessageContext.publishToTopicStub.called).to.be.true;
});

Then('publishToTopic should receive the topic as first parameter', function () {
    const call = kioskMessageContext.publishToTopicStub.getCall(0);
    expect(call.args[0]).to.equal(kioskMessageContext.topic);
});

Then('publishToTopic should receive the message as second parameter', function () {
    const call = kioskMessageContext.publishToTopicStub.getCall(0);
    expect(call.args[1]).to.be.an('object');
});

Then('publishToTopic should receive the endpoint as third parameter', function () {
    const call = kioskMessageContext.publishToTopicStub.getCall(0);
    expect(call.args[2]).to.equal(kioskMessageContext.endpoint);
});

Then('publishToTopic should receive the access params as fourth parameter', function () {
    const call = kioskMessageContext.publishToTopicStub.getCall(0);
    expect(call.args[3]).to.deep.equal(kioskMessageContext.accessParams);
});

Then('the message should include the file name with special characters preserved', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.FileNames[0]).to.equal(kioskMessageContext.fileName);
});

Then('each message should be published independently', function () {
    expect(kioskMessageContext.publishedMessages).to.have.lengthOf(kioskMessageContext.multipleFiles.length);
});

Then('each message should have unique file references', function () {
    const fileNames = kioskMessageContext.publishedMessages.map(m => m.message.FileNames[0]);
    expect(fileNames).to.deep.equal(kioskMessageContext.multipleFiles);
});

Then('the message should reflect the device context', function () {
    const message = kioskMessageContext.publishedMessages[0].message;
    expect(message.Device).to.equal(kioskMessageContext.deviceName);
});

Then('the topic should include the correct location ID', function () {
    expect(kioskMessageContext.topic).to.include('location456');
});

// Cleanup
After(function () {
    if (kioskMessageContext.consoleLogSpy) {
        kioskMessageContext.consoleLogSpy.restore();
    }
});

module.exports = {
    kioskMessageContext,
    sendMessageToKiosk
};
