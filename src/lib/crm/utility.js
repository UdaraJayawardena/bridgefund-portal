import { ENVIRONMENT } from "constants/crm/config";
import { getEmptyAddressObject } from "constants/crm/Address";
import { getEmptyContactObject } from "constants/crm/Contacts";

/*********************
 * PRIVATE FUNCTIONS *
 *********************/

const desc = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

/**********************
 *  PUBLIC FUNCTIONS  *
 **********************/

export const EURO = (value) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);

export const percentage = (value) => new Intl.NumberFormat('nl-NL', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + "%";

export const encodeQueryData = (data) => {
  const ret = [];
  for (const d in data) {
    if (!data[d]) continue;
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
};

export const addQueryParams = (data) => {
  const ret = [];
  for (const d in data)
    ret.push(d + '=' + data[d]);
  return ret.join('&');
};

export const validateNumberInput = (evt) => {
  if (evt.which !== 8 && evt.which !== 0 && evt.which !== 46 && (evt.which < 48 || evt.which > 57)) {
    evt.preventDefault();
  }
};

export const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
};

export const getSorting = (order, orderBy) => {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
};

export const getEnv = () => {
  if (document.location.href.match(/(acceptance)/)) return ENVIRONMENT.ACCEPTANCE;
  else if (document.location.href.match(/(localhost)/)) return ENVIRONMENT.DEVELOPMENT;
  return 'production';
};

export const isNullOrEmpty = data => {
  if (typeof data === 'string') {
    if (data.trim() === '') return true;
  }

  if (data === undefined) return true;

  if (data === null) return true;

  if (data instanceof File) return false;

  if (typeof data === 'object' && Object.keys(data) && Object.keys(data).length === 0) return true;

  if (Array.isArray(data) && data.length === 0) return true;

  return false;
};

export const isMultipleOfTenThousand = amount => {
  if (amount % 10000 === 0) {
    return true;
  }
  return false;
};

export const isValidDate = (objectData) => {
  if (isNaN(objectData.getTime())) {
    return false;
  }
  return true;
};

export const updateQueryStringParameter = (uri, key, value) => {
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2");
  }
  return uri + separator + key + "=" + value;
};

export const createUrl = (baseUrl) => (path) => (baseUrl + path);

export const toFixed = (value, noOfDecimalPlaces = 2) => isNaN(Number(value)) ? 0 : Number((Number(value)).toFixed(noOfDecimalPlaces));

export const compareArrayOfObjects = (originalValues, arrayOfObjectsToCompare, keysToCompare, type) => {

  const updateValues = [];
  let insertedValues = [];
  const deletedValues = [];

  for (const originalValue of originalValues) {

    const updatedValue = arrayOfObjectsToCompare.find(value => value._id === originalValue._id);

    if (isNullOrEmpty(originalValue._id) && isNullOrEmpty(updatedValue && updatedValue._id)) continue;

    if (updatedValue === null || updatedValue === undefined) {
      deletedValues.push({ _id: originalValue._id });
      continue;
    }

    const objectToUpdate = compareObject(originalValue, updatedValue, keysToCompare);
    if (Object.keys(objectToUpdate).length > 0 && updatedValue._id) {
      objectToUpdate._id = updatedValue._id;
      updateValues.push(objectToUpdate);
      continue;
    }
  }

  insertedValues = arrayOfObjectsToCompare.filter(value => isNullOrEmpty(value._id));
  const newInsertedValues = [];
  if (type) originalValues = _getOriginalValuesByType(type, insertedValues);
  for (const iv of insertedValues) {
    if (isNullOrEmpty(originalValues.find(ov => JSON.stringify(ov) === JSON.stringify(iv)))) {
      newInsertedValues.push(iv);
    }
  }
  insertedValues = newInsertedValues;

  return {
    updateValues,
    insertedValues,
    deletedValues
  };
};

export const compareObject = (originalObject, changedObject, keysToCompare) => {

  const updatedValues = {};

  if (!keysToCompare) keysToCompare = Object.keys(originalObject);

  for (const key of keysToCompare) {
    if (JSON.stringify(changedObject[key]) !== JSON.stringify(originalObject[key])) updatedValues[key] = changedObject[key];
  }

  return updatedValues;
};

const _getOriginalValuesByType = (type, newValues = []) => {
  const originalValues = [];

  switch (type) {
    case 'address': {
      newValues.forEach(address => {
        if (address.type !== 'none') originalValues.push(getEmptyAddressObject(address.type));
      });
      break;
    }
    case 'contact': {
      newValues.forEach(contact => {
        originalValues.push(getEmptyContactObject(contact.type, contact.subType));
      });
      break;
    }
    default:
      break;
  }
  return originalValues;
};