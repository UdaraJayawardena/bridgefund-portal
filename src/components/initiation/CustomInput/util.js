export const matchInputTypeToPattern = (type, value) => {

  if (type === 'postalCode') {
    value = value.toString().toUpperCase();
  }

  return value;
};

export const formatInput = (type, value) => {

  if (type === 'CamelCase') {
    value = value.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }

  if (type === 'DashSeperated') {
    value = value.replace(/\s+/g, '-').toLowerCase();
  }
  if (type === 'UpperCaseWithNoSpace') {
    value = value.replace(/\s/g, "").toUpperCase();
  }

  return value;
};

export default {
  matchInputTypeToPattern,
  formatInput,
};