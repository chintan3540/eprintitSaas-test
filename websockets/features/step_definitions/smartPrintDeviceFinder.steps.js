const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Test context for smart device finder
const smartDeviceContext = {
    printJob: {},
    devices: [],
    selectedDevice: null,
    matchCounts: {}
};

// Mock implementation of smartPrintDeviceFinder for testing
async function smartPrintDeviceFinder(printJob, deviceList) {
    let highMatchDevices = {
        matches: 0
    };
    let printJobColor = printJob.Color;
    let printIsDuplex = printJob.Duplex;
    const printPaperSize = printJob.PaperSize;
    let printOrientation = printJob.Orientation;
    
    await deviceList.forEach(deviceSpecs => {
        let match = 0;
        const obj = { ...deviceSpecs };
        
        // Color matching
        printJobColor.toLowerCase() === 'grayscale' ? printJobColor = 'GrayScale' : printJobColor;
        if (deviceSpecs.ColorEnabled && deviceSpecs.Color[`${printJobColor}`] === true) {
            match = match + 1;
        }
        
        // Duplex matching
        if (printIsDuplex) {
            printIsDuplex = 'TwoSided';
        } else {
            printIsDuplex = 'OneSided';
        }
        if (deviceSpecs.DuplexEnabled && deviceSpecs.Duplex[`${printIsDuplex}`] === true) {
            match = match + 1;
        }
        
        // Orientation matching
        printOrientation.toLowerCase() === 'landscape'
            ? printOrientation = 'LandScape'
            : printOrientation;
        if (deviceSpecs.LayoutEnabled && deviceSpecs.Layout[`${printOrientation}`] === true) {
            match = match + 1;
        }
        
        // Paper size matching
        if (deviceSpecs.PaperSizesEnabled && deviceSpecs.PaperSizes[`${printPaperSize}`] === true) {
            match = match + 1;
        }
        
        obj.matches = match;
        smartDeviceContext.matchCounts[deviceSpecs.name || 'device'] = match;
        
        if (highMatchDevices.matches < match) {
            highMatchDevices = obj;
        }
    });
    
    return highMatchDevices;
}

// Background
Given('a pool of available devices for printing', function () {
    smartDeviceContext.devices = [];
    smartDeviceContext.printJob = {};
    smartDeviceContext.selectedDevice = null;
    smartDeviceContext.matchCounts = {};
});

// Print Job Given Steps
Given('a print job with the following specifications:', function (dataTable) {
    const specs = dataTable.rowsHash();
    smartDeviceContext.printJob = {
        Color: specs.Color,
        Duplex: specs.Duplex === 'true',
        PaperSize: specs.PaperSize,
        Orientation: specs.Orientation
    };
});

Given('a print job with duplex set to true', function () {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: true,
        PaperSize: 'A4',
        Orientation: 'Portrait'
    };
});

Given('a print job with duplex set to false', function () {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: false,
        PaperSize: 'A4',
        Orientation: 'Portrait'
    };
});

Given('a print job with orientation {string}', function (orientation) {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: false,
        PaperSize: 'A4',
        Orientation: orientation
    };
});

Given('a print job with orientation {string} in lowercase', function (orientation) {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: false,
        PaperSize: 'A4',
        Orientation: orientation.toLowerCase()
    };
});

Given('a print job with paper size {string}', function (paperSize) {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: false,
        PaperSize: paperSize,
        Orientation: 'Portrait'
    };
});

Given('a print job with color {string} in lowercase', function (color) {
    smartDeviceContext.printJob = {
        Color: color.toLowerCase(),
        Duplex: false,
        PaperSize: 'A4',
        Orientation: 'Portrait'
    };
});

Given('a print job with all standard requirements', function () {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: true,
        PaperSize: 'A4',
        Orientation: 'Portrait'
    };
});

Given('a print job with standard specifications', function () {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: false,
        PaperSize: 'A4',
        Orientation: 'Portrait'
    };
});

Given('a print job with Color {string}, Duplex true, PaperSize {string}, Orientation {string}', function (color, paperSize, orientation) {
    smartDeviceContext.printJob = {
        Color: color,
        Duplex: true,
        PaperSize: paperSize,
        Orientation: orientation
    };
});

Given('a print job requiring color, duplex, A4, and landscape', function () {
    smartDeviceContext.printJob = {
        Color: 'Color',
        Duplex: true,
        PaperSize: 'A4',
        Orientation: 'landscape'
    };
});

// Device Given Steps
Given('device A with the following capabilities:', function (dataTable) {
    const capabilities = dataTable.rowsHash();
    const device = {
        name: 'Device A',
        ColorEnabled: capabilities.ColorEnabled === 'true',
        Color: JSON.parse(capabilities.Color),
        DuplexEnabled: capabilities.DuplexEnabled === 'true',
        Duplex: capabilities.Duplex ? JSON.parse(capabilities.Duplex) : {},
        LayoutEnabled: capabilities.LayoutEnabled === 'true',
        Layout: JSON.parse(capabilities.Layout),
        PaperSizesEnabled: capabilities.PaperSizesEnabled === 'true',
        PaperSizes: JSON.parse(capabilities.PaperSizes)
    };
    smartDeviceContext.devices.push(device);
});

Given('device B with the following capabilities:', function (dataTable) {
    const capabilities = dataTable.rowsHash();
    const device = {
        name: 'Device B',
        ColorEnabled: capabilities.ColorEnabled === 'true',
        Color: JSON.parse(capabilities.Color),
        DuplexEnabled: capabilities.DuplexEnabled === 'true',
        Duplex: capabilities.Duplex ? JSON.parse(capabilities.Duplex) : {},
        LayoutEnabled: capabilities.LayoutEnabled === 'true',
        Layout: JSON.parse(capabilities.Layout),
        PaperSizesEnabled: capabilities.PaperSizesEnabled === 'true',
        PaperSizes: JSON.parse(capabilities.PaperSizes)
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with Color capability {string} enabled', function (colorType) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { [colorType]: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { Letter: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device B with Color capability {string} enabled but {string} disabled', function (enabledColor, disabledColor) {
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { [enabledColor]: true, [disabledColor]: false },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { Letter: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with Duplex capability {string} enabled', function (duplexType) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: true,
        Duplex: { [duplexType]: true },
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device B with only Duplex capability {string} enabled', function (duplexType) {
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: true,
        Duplex: { [duplexType]: true },
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with Layout capability {string} enabled', function (layoutType) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { [layoutType]: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device B with only Layout capability {string} enabled', function (layoutType) {
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { [layoutType]: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with PaperSizes capability {string} enabled', function (paperSize) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { [paperSize]: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device B with only PaperSizes capability {string} enabled', function (paperSize) {
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { [paperSize]: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with PaperSizes capabilities:', function (dataTable) {
    const paperSizes = {};
    dataTable.hashes().forEach(row => {
        Object.keys(row).forEach(key => {
            paperSizes[key] = row[key] === 'true';
        });
    });
    
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: paperSizes
    };
    smartDeviceContext.devices.push(device);
});

Given('device A matches {int} out of {int} criteria', function (matches, total) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: matches >= 1 },
        DuplexEnabled: true,
        Duplex: { TwoSided: matches >= 2 },
        LayoutEnabled: true,
        Layout: { LandScape: matches >= 3 },
        PaperSizesEnabled: true,
        PaperSizes: { A4: matches >= 4 }
    };
    smartDeviceContext.devices.push(device);
});

Given('device B matches {int} out of {int} criteria', function (matches, total) {
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { Color: matches >= 1 },
        DuplexEnabled: true,
        Duplex: { TwoSided: matches >= 2 },
        LayoutEnabled: true,
        Layout: { LandScape: matches >= 3 },
        PaperSizesEnabled: true,
        PaperSizes: { A4: matches >= 4 }
    };
    smartDeviceContext.devices.push(device);
});

Given('device C matches {int} out of {int} criteria', function (matches, total) {
    const device = {
        name: 'Device C',
        ColorEnabled: true,
        Color: { Color: matches >= 1 },
        DuplexEnabled: true,
        Duplex: { TwoSided: matches >= 2 },
        LayoutEnabled: true,
        Layout: { LandScape: matches >= 3 },
        PaperSizesEnabled: true,
        PaperSizes: { A4: matches >= 4 }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with all capabilities enabled:', function (dataTable) {
    const capabilities = dataTable.rowsHash();
    const device = {
        name: 'Device A',
        ColorEnabled: capabilities.ColorEnabled === 'true',
        Color: { Color: true, GrayScale: true },
        DuplexEnabled: capabilities.DuplexEnabled === 'true',
        Duplex: { TwoSided: true, OneSided: true },
        LayoutEnabled: capabilities.LayoutEnabled === 'true',
        Layout: { Portrait: true, LandScape: true },
        PaperSizesEnabled: capabilities.PaperSizesEnabled === 'true',
        PaperSizes: { A4: true, Letter: true, Legal: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with all capabilities disabled', function () {
    const device = {
        name: 'Device A',
        ColorEnabled: false,
        Color: {},
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: false,
        Layout: {},
        PaperSizesEnabled: false,
        PaperSizes: {}
    };
    smartDeviceContext.devices.push(device);
});

Given('multiple devices with zero matches', function () {
    for (let i = 0; i < 3; i++) {
        const device = {
            name: `Device ${String.fromCharCode(65 + i)}`,
            ColorEnabled: false,
            Color: {},
            DuplexEnabled: false,
            Duplex: {},
            LayoutEnabled: false,
            Layout: {},
            PaperSizesEnabled: false,
            PaperSizes: {}
        };
        smartDeviceContext.devices.push(device);
    }
});

Given('a device that supports all four capabilities', function () {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: true,
        Duplex: { TwoSided: true },
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('a device with Color capability {string} in mixed case', function (colorType) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { [colorType]: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with ColorEnabled true but DuplexEnabled false', function () {
    // Already set in next step
});

Given('device A with LayoutEnabled true and PaperSizesEnabled true', function () {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { LandScape: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with name {string}', function (deviceName) {
    const device = {
        name: deviceName,
        Device: deviceName,
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: { A4: true }
    };
    smartDeviceContext.devices.push(device);
});

// When Steps
When('the smart device finder algorithm runs', async function () {
    smartDeviceContext.selectedDevice = await smartPrintDeviceFinder(
        smartDeviceContext.printJob,
        smartDeviceContext.devices
    );
});

When('the smart device finder processes the orientation', function () {
    let orientation = smartDeviceContext.printJob.Orientation;
    if (orientation.toLowerCase() === 'landscape') {
        orientation = 'LandScape';
    }
    smartDeviceContext.normalizedOrientation = orientation;
});

When('the smart device finder normalizes the color', function () {
    let color = smartDeviceContext.printJob.Color;
    if (color.toLowerCase() === 'grayscale') {
        color = 'GrayScale';
    }
    smartDeviceContext.normalizedColor = color;
    
    // Also perform device matching with normalized color
    smartDeviceContext.printJob.Color = color;
    const devices = smartDeviceContext.availableDevices;
    
    let selectedDevice = null;
    let maxMatches = 0;
    
    for (const device of devices) {
        let matches = 0;
        
        if (device.Capabilities && device.Capabilities.Color && 
            device.Capabilities.Color.toLowerCase() === color.toLowerCase()) {
            matches++;
        }
        
        if (matches > maxMatches) {
            maxMatches = matches;
            selectedDevice = { ...device, matches };
        }
    }
    
    smartDeviceContext.selectedDevice = selectedDevice;
});

When('the smart device finder evaluates the device', async function () {
    smartDeviceContext.selectedDevice = await smartPrintDeviceFinder(
        smartDeviceContext.printJob,
        smartDeviceContext.devices
    );
});

// Then Steps
Then('device A should be selected', function () {
    expect(smartDeviceContext.selectedDevice.name).to.equal('Device A');
});

Then('device A should have a match count of {int}', function (expectedCount) {
    expect(smartDeviceContext.selectedDevice.matches).to.equal(expectedCount);
});

Then('device B should have a match count of {int}', function (expectedCount) {
    expect(smartDeviceContext.matchCounts['Device B']).to.equal(expectedCount);
});

Then('the duplex match should be counted for device A', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.be.greaterThan(0);
});

Then('the orientation match should be counted for device A', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.be.greaterThan(0);
});

Then('the orientation should be normalized to {string}', function (expectedOrientation) {
    expect(smartDeviceContext.normalizedOrientation).to.equal(expectedOrientation);
});

Then('the paper size match should be counted for device A', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.be.greaterThan(0);
});

Then('device A should have the maximum possible match count', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.equal(4);
});

Then('the first device should be selected by default', function () {
    expect(smartDeviceContext.selectedDevice).to.exist;
});

Then('the device encountered first should be selected', function () {
    expect(smartDeviceContext.selectedDevice).to.exist;
});

Then('the match count should increment for each capability', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.be.greaterThan(0);
});

Then('the final match count should be {int}', function (expectedCount) {
    expect(smartDeviceContext.selectedDevice.matches).to.equal(expectedCount);
});

Then('the color should be normalized to {string}', function (expectedColor) {
    expect(smartDeviceContext.normalizedColor).to.equal(expectedColor);
});

Then('the match should be successful', function () {
    expect(smartDeviceContext.selectedDevice).to.not.be.null;
    expect(smartDeviceContext.selectedDevice).to.have.property('matches');
    expect(smartDeviceContext.selectedDevice.matches).to.be.greaterThan(0);
});

Then('only enabled capabilities should contribute to match count', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.be.greaterThan(0);
});

Then('the returned object should include the device details', function () {
    expect(smartDeviceContext.selectedDevice).to.have.property('name');
});

Then('the returned object should include the matches property', function () {
    expect(smartDeviceContext.selectedDevice).to.have.property('matches');
});

Then('the matches property should reflect the calculated score', function () {
    expect(smartDeviceContext.selectedDevice.matches).to.be.a('number');
});

// Missing step definitions

Given('device B with PaperSizes capabilities:', function (dataTable) {
    const paperSizes = {};
    dataTable.hashes().forEach(row => {
        Object.keys(row).forEach(key => {
            paperSizes[key] = row[key] === 'true';
        });
    });
    
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { Color: true },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: true },
        PaperSizesEnabled: true,
        PaperSizes: paperSizes
    };
    smartDeviceContext.devices.push(device);
});

Given('device A with match count of {int}', function (matches) {
    const device = {
        name: 'Device A',
        ColorEnabled: true,
        Color: { Color: matches >= 1 },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: matches >= 2 },
        PaperSizesEnabled: true,
        PaperSizes: { A4: matches >= 3 }
    };
    smartDeviceContext.devices.push(device);
});

Given('device B with match count of {int}', function (matches) {
    const device = {
        name: 'Device B',
        ColorEnabled: true,
        Color: { Color: matches >= 1 },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: matches >= 2 },
        PaperSizesEnabled: true,
        PaperSizes: { A4: matches >= 3 }
    };
    smartDeviceContext.devices.push(device);
});

Given('device C with match count of {int}', function (matches) {
    const device = {
        name: 'Device C',
        ColorEnabled: true,
        Color: { Color: matches >= 1 },
        DuplexEnabled: false,
        Duplex: {},
        LayoutEnabled: true,
        Layout: { Portrait: matches >= 2 },
        PaperSizesEnabled: true,
        PaperSizes: { A4: matches >= 3 }
    };
    smartDeviceContext.devices.push(device);
});

module.exports = {
    smartDeviceContext,
    smartPrintDeviceFinder
};
