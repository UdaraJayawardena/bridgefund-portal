import { ENVIRONMENT } from "constants/loanmanagement/config";

const desc = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getSortedSmeLoanTransactions = (list, order, orderBy) => {
  const stabilizedThis = list.map((el, index) => [el, index]);

  return stabilizedThis
    .sort((a, b) => {
      let cmpVal;

      if (orderBy === 'plannedDate') {
        let diff = new Date(b[0].plannedDate).getTime() - new Date(a[0].plannedDate).getTime();
        if (diff === 0) {
          diff = Number(b[0].id.split('TR')[1]) - Number(a[0].id.split('TR')[1]);
        }
        cmpVal = order === 'desc' ? diff : -diff;
      }
      else {
        cmpVal = getSorting(order, orderBy)(a[0], b[0]);
      }
      if (cmpVal !== 0) return cmpVal;

      return a[1] - b[1];
    })
    .map(el => el[0]);
};

/* EXPORT FUNCTIONS */

export const currencyConverter = () => (value) => {
  value = isNaN(Number(value)) ? 0 : Number(value);
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

export const percentage = (value) => {
  value = isNaN(Number(value)) ? 0 : Number(value);
  return new Intl.NumberFormat('nl-NL', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + "%";
};

export const multiCurrencyConverter = () => (value, locale = 'nl-NL', currency = 'EUR') => {
  value = isNaN(Number(value)) ? 0 : Number(value);
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

export const multiCurrencyPercentage = (value, locale = 'nl-NL') => {
  value = isNaN(Number(value)) ? 0 : Number(value);
  return new Intl.NumberFormat(locale, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + "%";
};

export const encodeQueryData = (data) => {
  const ret = [];
  for (const d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
};

export const addQueryParams = (data) => {
  const ret = [];
  for (const d in data)
    if (data[d] !== '')
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
  else if (document.location.href.match(/(localhost)/) || document.location.href.match(/(development)/)) return ENVIRONMENT.DEVELOPMENT;
  return 'production';
};

export const isNullOrEmpty = data => {
  if (typeof data === 'string') {
    if (data.trim() === '') return true;
  }

  if (data === undefined) return true;

  if (data === null) return true;

  if (typeof data === 'object' && Object.keys(data) && Object.keys(data).length === 0) return true;

  return false;
};

export const toFixed = (value, noOfDecimalPlaces = 2) => isNaN(Number(value)) ? 0 : Number((Number(value)).toFixed(noOfDecimalPlaces));

export const styleStrings = (value, type) => {
  if (!value || value === '') return '';

  if (type === 'firstUpper') value = value.substring(0, 1).toUpperCase() + value.substring(1, value.length);

  return value;
};

export const createUrl = (baseUrl) => (path) => (baseUrl + path);

export const preparePaymentRequest = (smeLoan, directDebits, latestWithdrawalOrder = null) => {

  const { outstandingNormalDirectDebits, missedNormalDirectDebits,
    outstandingSpecialDirectDebits, missedSpecialDirectDebits, specialDirectDebits, partialPayment, 
    outstandingAmountNormalDirectDebits } = getDirectDebitsCount(directDebits);

  const dailyAmountNormalDirectDebits = latestWithdrawalOrder ? latestWithdrawalOrder.newDirectDebitAmount : Number((smeLoan.totalLoanAmount / smeLoan.plannedNumberOfDirectDebit).toFixed(2));

  const dailyAmountSpecialDirectDebits = Number((smeLoan.totalCostAmount / specialDirectDebits).toFixed(2));

  const outstandingAmountSpecialDirectDebits = Number((missedSpecialDirectDebits * dailyAmountSpecialDirectDebits).toFixed(2));

  const totalOutstandingAmount = Number((outstandingAmountNormalDirectDebits + missedSpecialDirectDebits).toFixed(2));

  const paymentRequest = {

    principle: latestWithdrawalOrder ? latestWithdrawalOrder.outstandingAmount : smeLoan.principleAmount,

    outstandingNormalDirectDebits: outstandingNormalDirectDebits,

    missedNormalDirectDebits: missedNormalDirectDebits,

    amountNormalDirectDebits: isNaN(dailyAmountNormalDirectDebits) ? 0 : dailyAmountNormalDirectDebits,

    outstandingAmountNormalDirectDebits: isNaN(outstandingAmountNormalDirectDebits) ? 0 : outstandingAmountNormalDirectDebits,

    outstandingSpecialDirectDebits: outstandingSpecialDirectDebits,

    missedSpecialDirectDebits: missedSpecialDirectDebits,

    amountSpecialDirectDebits: isNaN(dailyAmountSpecialDirectDebits) ? 0 : dailyAmountSpecialDirectDebits,

    outstandingAmountSpecialDirectDebits: isNaN(outstandingAmountSpecialDirectDebits) ? 0 : outstandingAmountSpecialDirectDebits,

    totalOutstandingAmount: isNaN(totalOutstandingAmount) ? 0 : totalOutstandingAmount,

    partialPaymentAmount: partialPayment === 0 ? partialPayment : partialPayment * -1,

    tikkieDdNumber: missedNormalDirectDebits + missedSpecialDirectDebits,

    tikkieAmount: ((isNaN(totalOutstandingAmount) ? 0 : totalOutstandingAmount) + (partialPayment === 0 ? partialPayment : partialPayment * -1)).toFixed(2),

    tikkieDescription: '(Deel) Betaling Lening ' + smeLoan.contractId,

    contractId: smeLoan.contractId,
  };

  return paymentRequest;

};

export const createCustomersObject = (customerObject) => {
  if (!customerObject) return {};

  const newcustomerObject = customerObject.map(customer => {
    return createCustomerObject(customer);
  });

  return newcustomerObject;
};

export const createCustomerObject = (customer) => {

  const mailObj = customer.contacts ? customer.contacts.find(contact => contact.type === 'email' && contact.subType === 'work') : null;
  const phoneObj = customer.contacts ? customer.contacts.find(contact => contact.type === 'phone' && contact.subType === 'work') : null;

  const sbiDomains = [];

  if (customer.primarySbiCode) sbiDomains.push(customer.primarySbiCode);
  if (customer.otherSbiCode) sbiDomains.push(...customer.otherSbiCode);

  const address = customer.addresses && customer.addresses.length>0 ? customer.addresses[0] : {};

  return {
    ...customer,
    id: customer.vTigerAccountNumber,
    accountNo: customer.vTigerAccountNumber,
    company: customer.legalName,
    firstName: customer.stakeholders && customer.stakeholders.length > 0 ? customer.stakeholders[0].personId.givenName : '',
    lastName: customer.stakeholders && customer.stakeholders.length > 0 ? customer.stakeholders[0].personId.surname : '',
    email: mailObj ? mailObj.value : '',
    phone: phoneObj ? phoneObj.value : '',
    sbiDomains: sbiDomains,
    address: address.streetName,
    addressNumber: address.houseNumber,
    zipcode: address.postalCode,
    city: address.cityName,
    cocnumber: customer.cocId
  };
};

//try to get from back end #DD looping
const getDirectDebitsCount = (directDebits) => {

  let outstandingNormalDirectDebitsCount = 0;
  let missedNormalDirectDebitsCount = 0;
  let outstandingSpecialDirectDebitsCount = 0;
  let missedSpecialDirectDebitsSum = 0;
  let specialDirectDebitsCount = 0;
  let outstandingNormalDirectDebits = 0;
  let outstandingSpecialDirectDebits = 0;
  let partialPayment = 0;
  let outstandingAmountNormalDirectDebitsSum = 0;

  for (const directDebit of directDebits) {
    if (directDebit.type === 'normal-dd') {

      if (directDebit.status === 'open') {

        outstandingNormalDirectDebitsCount++;

        outstandingNormalDirectDebits += directDebit.amount;

      } else if (directDebit.status === 'failed' || directDebit.status === 'frequently-failed'
        || directDebit.status === 'rejected' || directDebit.status === 'frequently-rejected') {

        missedNormalDirectDebitsCount++;

        outstandingAmountNormalDirectDebitsSum += directDebit.amount;
      }

    } else if (directDebit.type === 'special-dd') {

      specialDirectDebitsCount++;

      if (directDebit.status === 'open') {

        outstandingSpecialDirectDebitsCount++;

        outstandingSpecialDirectDebits += directDebit.amount;

      } else if (directDebit.status === 'failed' || directDebit.status === 'frequently-failed'
        || directDebit.status === 'rejected' || directDebit.status === 'frequently-rejected') {

          missedSpecialDirectDebitsSum += directDebit.amount;
      }
    } else if (directDebit.type === 'partial-payment' || directDebit.type === 'partial-payment-refund'){

      partialPayment += directDebit.amount;
    }
  }

  return {
    outstandingNormalDirectDebits: outstandingNormalDirectDebitsCount,

    missedNormalDirectDebits: missedNormalDirectDebitsCount,

    outstandingSpecialDirectDebits: outstandingSpecialDirectDebitsCount,

    missedSpecialDirectDebits: missedSpecialDirectDebitsSum,

    specialDirectDebits: specialDirectDebitsCount,

    outstandingNormalDirectDebitsAmount: outstandingNormalDirectDebits,

    outstandingSpecialDirectDebitsAmount: outstandingSpecialDirectDebits,

    partialPayment: partialPayment,

    outstandingAmountNormalDirectDebits: outstandingAmountNormalDirectDebitsSum
  };
};

export const showMessage = (data) => {
  let str='';
  if(data.messages){
    data.messages.forEach(element => {
      str+=element+"\r\n";
    });
  }
  return str;
};

export const numberFormatDutchToEnglish = (value) => {
  if (value && value !== '') {
    value = value.match(/[(\d)+(\.|\,)+]+/g)[0].toString();
    value = value.replace(',', '.');
  }
  return value;
}

export default {
  currencyConverter,
  multiCurrencyConverter,
  percentage,
  multiCurrencyPercentage,
  encodeQueryData,
  addQueryParams,
  validateNumberInput,
  stableSort,
  getSorting,
  getEnv,
  isNullOrEmpty,
  toFixed,
  getSortedSmeLoanTransactions,
  styleStrings,
  preparePaymentRequest,
  createCustomersObject,
  createCustomerObject,
  showMessage,
  numberFormatDutchToEnglish
};
