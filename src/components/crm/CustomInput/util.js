export const matchInputTypeToPattern = (type, value) => {

  if (type === 'postalCode') {
    value = value.toString().toUpperCase();
  }

  return value;
};

export const formatInput = (type, value) => {

  if (type === 'CamelCase') {
    value = value.toLowerCase().replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  if (type === 'UpperCase') {
    value = value.toUpperCase();
  }

  if (type === 'FirstCap') {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  return value;
};

export default {
  matchInputTypeToPattern,
  formatInput,
};