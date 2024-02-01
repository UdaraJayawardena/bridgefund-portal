import CommonConstants from "./commonData";

export const isDirectCustomer = {
  YES: 'yes',
  NO: 'no'
};

export const CustomerLegalForm = {
  // PRIVATE: 'private',
  BV: 'bv',
  EENMANSZAAK: 'eenmanszaak',
  VOF: 'vof',
  MAATSCHAP: 'maatschap',
  STAK: 'stak'
};

export const emptyCustomerObj = {
  "action": "create",
  "_id": undefined,
  "id": undefined,
  "status": CommonConstants.status.ACTIVE,
  "vTigerAccountNumber": "",
  "dataSource": CommonConstants.dataSource.CRM,
  "legalForm": "",
  "legalName": "",
  "cocId": "",
  "registrationDate": null,
  "customerIndicator": isDirectCustomer.YES,
  "primarySbiCode": "",
  "otherSbiCode": [''],
  "companyTradeNames": [],
  "latestNameChange": null,
  "latestChangeInChamberOfCommerce": null,
  "kindOfChangeInChamberOfCommerce": "",
  "language": CommonConstants.languages.Dutch,
  "primaryCustomerSuccessManager": "",
  "googleString": "",
  "createdAt": null,
  "updatedAt": null
};

export const emptyCustomerErrorMsgObj = {
  "legalForm": null,
  "legalName": null,
  "cocId": null,
  "registrationDate": null,
  "primarySbiCode": null,
  "otherSbiCode": null,
  "language": null,
  "primaryCustomerSuccessManager": null,
  "addresses": null,
  "contacts": null
};

export const customerSchemaKeysToCompare = ['status', 'vTigerAccountNumber', 'dataSource', 'legalForm', 'legalName', 'cocId',
  'registrationDate', 'customerIndicator', 'primarySbiCode', 'otherSbiCode', 'companyTradeNames', 'latestNameChange', 'latestChangeInChamberOfCommerce',
  'kindOfChangeInChamberOfCommerce', 'language', 'primaryCustomerSuccessManager', 'googleString'];

export default {
  emptyObj: emptyCustomerObj,
  isDirectCustomer,
  schemaKeysToCompare: customerSchemaKeysToCompare,
  LegalForm: CustomerLegalForm,
  emptyErrorObj: emptyCustomerErrorMsgObj,
};