import Constants from './commonData';

export const emailTypeConst = {
  Private: 'private',
  Work: 'work'
};

export const phoneTypeConst = {
  Private: 'private',
  Work: 'work'
};

export const ContactType = {
  EMAIL: 'email',
  PHONE: 'phone',
  SOCIAL: 'social'
};

export const ContactSubType = {
  WORK: 'work',
  PRIVATE: 'private',
  WEBSITE: 'website',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram'
};

export const EmptyContactObject = {
  _id: undefined,
  id: undefined,
  customerId: undefined,
  personId: undefined,
  status: Constants.status.ACTIVE,
  type: ContactType.PHONE,
  subType: '',
  value: '',
  startDate: null,
  endDate: null,
  createdAt: null,
  updatedAt: null
};

export const getEmptyContactObject = (type, subType = '') => ({ ...EmptyContactObject, type: type, subType: subType });

export const InitialEmptyContactArray = [
  getEmptyContactObject(ContactType.EMAIL),
  getEmptyContactObject(ContactType.PHONE),
  getEmptyContactObject(ContactType.SOCIAL, ContactSubType.TWITTER),
  getEmptyContactObject(ContactType.SOCIAL, ContactSubType.FACEBOOK),
  getEmptyContactObject(ContactType.SOCIAL, ContactSubType.LINKEDIN),
  getEmptyContactObject(ContactType.SOCIAL, ContactSubType.WEBSITE),
];

export const ContactSchemaKeysToCompare = ['status', 'type', 'subType', 'value', 'startDate', 'endDate'];

export default {
  type: ContactType,
  subTypes: ContactSubType,
  emptyObj: EmptyContactObject,
  initialEmptyArray: InitialEmptyContactArray,
  schemaKeysToCompare: ContactSchemaKeysToCompare,
  getEmptyContactObject,
};
