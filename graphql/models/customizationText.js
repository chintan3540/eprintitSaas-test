const Promise = require('bluebird')
const { getObjectId: ObjectId } = require('../helpers/objectIdConverter')
const {
  CustomizationTexts: CustomizationTextsCollection,
} = require("./collections");

// CustomizationText Model
const CustomizationTexts = {}

CustomizationTexts.getCustomizationTextsInformation = ({
  status, pattern, sort, pageNumber, limit, sortKey,
  customerIds, collection
}) => {
  return new Promise((resolve, reject) => {
    const condition = { IsDeleted: false }
    sort = sort === 'dsc' ? -1 : 1
    sortKey = sortKey || 'CustomerName'
    const skips = limit * (pageNumber - 1)
    if (customerIds && customerIds.length > 0) {
      customerIds = customerIds.map(custId => {
        return ObjectId.createFromHexString(custId)
      })
      Object.assign(condition, { CustomerID: { $in: customerIds } })
    }
    if (pattern) {
      Object.assign(condition, {
        $or: [
          { CustomerID: new RegExp(pattern, 'i') },
          { PageTitle: new RegExp(pattern, 'i') },
          { CustomerName: new RegExp(pattern, 'i') },
          { Subject: new RegExp(pattern, 'i') },
          { Address: new RegExp(pattern, 'i') },
          { SupportedFileFormat: new RegExp(pattern, 'i') },
          { Currency: new RegExp(pattern, 'i') },
          { MaxFileSize: new RegExp(pattern, 'i') },
          { Languages: new RegExp(pattern, 'i') }
        ]
      })
    }
    if (status) {
      status = status === 'true'
      Object.assign(condition, { Enabled: status })
    }
    Promise.props({
      customizationText: collection.find(condition)
        .sort({ [sortKey]: sort })
        .skip(skips)
        .limit(limit).toArray(),
      total: collection.find(condition).toArray()
    }).then(results => {
      resolve(results)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

CustomizationTexts.updateHowToLogoEmail = async (
  db,
  customerId,
  combination,
  email
) => {
  const emailField =
    combination === "color"
      ? "HowToLogoSection.EmailAddressAssignedColor"
      : "HowToLogoSection.EmailAddressAssignedGrayscale";
  
  await db
    .collection(CustomizationTextsCollection)
    .updateOne(
      { CustomerID: ObjectId.createFromHexString(customerId) },
      { $set: { [emailField]: email } }
    );
};

CustomizationTexts.updateAdvancedEmailConfiguration = async (
  db,
  customerId,
  obj
) => {
  const customizationText = await db
    .collection(CustomizationTextsCollection)
    .findOne({ CustomerID: ObjectId.createFromHexString(customerId) });
  if (
    customizationText?.AdvancedEmailConfiguration?.AdvancedEmailAlias &&
    customizationText.AdvancedEmailConfiguration.AdvancedEmailAlias.length > 0
  ) {
    await db
      .collection(CustomizationTextsCollection)
      .updateOne(
        { CustomerID: ObjectId.createFromHexString(customerId) },
        {
          $push: { "AdvancedEmailConfiguration.AdvancedEmailAlias": obj },
          $set: { "AdvancedEmailConfiguration.Enabled": true },
        }
      );
  } else {
    await db
      .collection(CustomizationTextsCollection)
      .updateOne(
        { CustomerID: ObjectId.createFromHexString(customerId) },
        {
          $set: {
            "AdvancedEmailConfiguration.AdvancedEmailAlias": [obj],
            "AdvancedEmailConfiguration.Enabled": true,
          },
        }
      );
  }
};

// Export Customers model
module.exports = CustomizationTexts
