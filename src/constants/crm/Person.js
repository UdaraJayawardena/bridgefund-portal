import CommonConstants from "./commonData";

export const gender = {
  Male: 'male',
  Female: 'female',
};

export const idTypes = {
  Passport: 'passport',
  DrivingLicense: 'driving-license',
  ResidencePermit: 'residence-permit'
};

export const prefix = {
  "van": 'van',
  "de": 'de',
  "den": 'den',
  "van de": 'van de',
  "van den": 'van den',
  "van der": 'van der',
  "van ter": 'van ter',
  "van het": 'van het',
  "ten": 'ten',
  "ter": 'ter',
  "te": 'te',
  "der": 'der',
  "op den": 'op den',
  "voor In": 'voor in',
  "voor den": 'voor den',
  "uitden": 'uit den',
  "uit het": 'uit het'
};

export const emptyPersonObj = {
  "action": "create",
  "_id": undefined,
  "id": undefined,
  "birthDate": null,
  "birthDatePartner": null,
  "cityOfBirth": "",
  "cityOfBirthPartner": "",
  "contractName": "",
  "contractNamePartner": "",
  "dataSource": CommonConstants.dataSource.CRM,
  "emailPartner": "",
  "gender": '',
  "givenName": "",
  "idPartner": {
    // 'fieldName': '',
    'fileName': '',
    'size': 0,
    'type': '',
    'dataUrl': '',
  },
  "initials": "",
  "namePrefix": '',
  "phonePartner": "",
  "status": CommonConstants.status.ACTIVE,
  "surname": "",
  "genderPartner": "",
  "christianName": "",
};

export const emptyPersonErrorMsgObj = {
  "givenName": null,
  "surname": null,
  "addresses": null,
  "contacts": null,
};


export const schemaKeysToCompare = ['gender', 'initials', 'givenName', 'namePrefix', 'surname', 'birthDatePartner', 'cityOfBirth', 'idPartner',
  'genderPartner', 'birthDatePartner', 'birthDate', 'phonePartner', 'emailPartner', 'cityOfBirthPartner', 'contractNamePartner', 'christianName'];

export default {
  gender,
  idTypes,
  schemaKeysToCompare,
  prefix,
  emptyObj: emptyPersonObj,
  emptyErrorObj: emptyPersonErrorMsgObj,
};