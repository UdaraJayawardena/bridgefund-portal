export const smeLoanStatus = {
  OUTSTANDING: 'outstanding',
  LOAN_IN_BACKLOG: 'loan-in-backlog',
  LOAN_NORMALLY_SETTLED: 'loan-normally-settled',
  LOAN_EARLY_REDEEMED: 'loan-early-redeemed',
  LOAN_REFINANCED: 'loan-refinanced',
  LOAN_IN_DEFAULT: 'loan-in-default',
  DEFAULT_SETTLED: 'default-settled'
};

export const smeLoanType = {
  FIXED: 'fixed-loan',
  FLEX: 'flex-loan'
};

export const isRefinanced = {
  YES: 'yes',
  NO: 'NO'
};

export const riskCategory = {
  A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G'
};

export const frequency = {
  DAILY: 'daily', MONTHLY: 'monthly', WEEKLY: 'weekly'
};

export const vTigerValue = {
  'Daily Schedule': frequency.DAILY,
  'Weekly Schedule': frequency.WEEKLY,
  'Monthly Schedule': frequency.MONTHLY,
  'New Business': smeLoanType.FIXED,
  'Retention': smeLoanType.FLEX,
};

export const smeLoanTerminateStatus = {
  'Early Redemption': smeLoanStatus.LOAN_EARLY_REDEEMED,
  'Default': smeLoanStatus.DEFAULT_SETTLED
};

const plannedDD = {
  [frequency.DAILY]: [0, 22, 44, 65, 87, 109, 130, 152, 174, 195, 217, 239, 260, 282, 303, 325, 346, 368, 390, 412, 433, 455, 477, 498, 520],
  [frequency.WEEKLY]: [0, 4, 8, 13, 18, 22, 26, 30, 35, 39, 44, 48, 52, 56, 61, 65, 69, 74, 78, 82, 86, 91, 95, 100, 104],
  [frequency.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
};

export const getPlannedDDCount = (DDfrequency, durantionInMonths) => {
  if (DDfrequency === '' || durantionInMonths === '') return 0;
  return plannedDD[DDfrequency][durantionInMonths];
};

export const getDurationInMonths = (DDfrequency, plannedNumberOfDD) => {
  let monthIndex = 0;
  if (DDfrequency === '' || plannedNumberOfDD === '') return 0;
  const indexOfPNDDAt = plannedDD[DDfrequency].indexOf(plannedNumberOfDD);
  if (indexOfPNDDAt !== -1) monthIndex = indexOfPNDDAt;

  return plannedDD[frequency.MONTHLY][monthIndex];
};

export const getActualMonth = (DDfrequency, termNumber) => {
  let monthIndex = 0;
  if (DDfrequency === '' || termNumber === '') return 0;
  const indexOfPNDDAt = plannedDD[DDfrequency].findIndex((el) => el > termNumber);
  if (indexOfPNDDAt !== -1) monthIndex = indexOfPNDDAt;

  return plannedDD[frequency.MONTHLY][monthIndex];
};

