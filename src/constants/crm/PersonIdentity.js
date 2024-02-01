import Constants from './commonData';
export const personIdentityStatus = Constants.status;

export const emptyIdentityObj = {
  _id: undefined,
  id: undefined,
  document: null,
  status: Constants.status.ACTIVE,
  personId: undefined,
  type: '',
};

export const identitySchemaKeysToCompare = ['status', 'date', 'document'];

export default {
  emptyObj: emptyIdentityObj,
  status: personIdentityStatus,
  schemaKeysToCompare: identitySchemaKeysToCompare,
};