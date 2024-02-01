/* eslint-disable no-useless-escape */
const REGS = {
  phone: /^(\+31)[1-9]([0-9])([0-9])([0-9])\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]$/g,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  postlCode_pattern: /^(\d{0,4})([A-Z]{0,2})$/g,
  postlCode: /^(\d{4})([A-Z]{2})$/g,
  sbiCode: /^.{1,6}$/,
};

export const dataValidation_regularExpressions = {
  phone: REGS.phone,
  email: REGS.email,
  postlCode_pattern: REGS.postlCode_pattern,
  postlCode: REGS.postlCode,
  sbiCode: REGS.sbiCode,
};

export const dataPatterns = {
  date: {
    display: 'dd-MM-yyyy',
    server: 'yyyy-MM-dd',
    moment: 'DD-MM-YYYY',
  }
};

export const dataSource = {
  CRM: 'crm',
  VTIGER: 'v-tiger',
  DATA_PROVIDER: 'data-provider'
};

export const Countries = {
  Netherlands: 'Netherlands',
  // England: 'England',
  // 'Sri Lanka': 'Sri Lanka',
};

export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'in-active',
};

export const Languages = {
  English: 'english',
  Dutch: 'dutch'
};

export const DocumentFieldNames = {
  CddInfo: 'cddInfo',
  PersonIdentity: 'personIdentity',
  PersonPartnerIdentity: 'personPartnerIdentity'
};

export default {
  dataValidation_regularExpressions,
  dataPatterns,
  dataSource,
  countries: Countries,
  status: Status,
  languages: Languages,
  DocumentFieldNames,
};