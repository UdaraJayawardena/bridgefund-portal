import CommonConstants from "./commonData";

export const AddressTypeConst = {
  Physical: 'physical',
  Postal: 'postal-code'
};

export const addressSchemaKeysToCompare = ['status', 'type', 'streetName', 'houseNumber', 'houseNumberAddition', 'postalCode', 'cityName', 'country'];


export const EmptyAddressObject = {
  "_id": undefined,
  "id": undefined,
  "dataSource": CommonConstants.dataSource.CRM,
  "type": '',
  "streetName": "",
  "houseNumber": "",
  "houseNumberAddition": "",
  "postalCode": "",
  "cityName": "",
  "country": CommonConstants.countries.Netherlands,
  "personId": undefined,
  "customerId": undefined
};


export const getEmptyAddressObject = (type) => ({
  "_id": undefined,
  "id": undefined,
  "dataSource": CommonConstants.dataSource.CRM,
  "type": type,
  "streetName": "",
  "houseNumber": "",
  "houseNumberAddition": "",
  "postalCode": "",
  "cityName": "",
  "country": CommonConstants.countries.Netherlands,
  "personId": undefined,
  "customerId": undefined
});

export default {
  type: AddressTypeConst,
  emptyObj: EmptyAddressObject,
  schemaKeysToCompare: addressSchemaKeysToCompare,
  getEmptyAddressObject,
};
