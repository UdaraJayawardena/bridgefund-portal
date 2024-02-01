import Constants from './commonData';
export const cddInfoStatus = Constants.status;

export const emptyCddInfoObj = {
  _id: undefined,
  id: undefined,
  date: null,
  document: null,
  status: Constants.status.ACTIVE,
  customerId: undefined,
  personId: undefined,
};

export const cddInfoSchemaKeysToCompare = ['status', 'date', 'document'];

export default {
  emptyObj: emptyCddInfoObj,
  status: cddInfoStatus,
  schemaKeysToCompare: cddInfoSchemaKeysToCompare,
};