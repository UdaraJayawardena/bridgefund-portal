import CommonConstants from "./commonData";

export const signingContract = {
  Yes: 'yes',
  No: 'no',
};

export const signingGuarantee = {
  Yes: 'yes',
  No: 'no',
};

export const role = {
  "CEO": 'CEO + Shareholder',
  "CFO": 'CFO + Shareholder',
  "Managing Director": 'Managing Director',
  "SHAREHOLDER": 'SHAREHOLDER',
  "Book Keeper": 'Book keeper'
};

export const emptyStakeholderObj = {
  "action": "create",
  "_id": undefined,
  "id": undefined,
  "customerId": undefined,
  "personId": undefined,
  "dataSource": CommonConstants.dataSource.CRM,
  "role": "",
  "signingContractIndicator": "",
  "signingGuaranteeIndicator": "",
  "sharePercentage": 0,
};

export const emptyStakeholderErrorMsgObj = {
  "role": null,
  "signingContractIndicator": null,
  "signingGuaranteeIndicator": null,
};


export const schemaKeysToCompare = ['role', 'signingContractIndicator', 'signingGuaranteeIndicator', 'sharePercentage', 'endDate'];

export default {
  signingContract,
  signingGuarantee,
  schemaKeysToCompare,
  role,
  emptyObj: emptyStakeholderObj,
  emptyErrorObj: emptyStakeholderErrorMsgObj,
};