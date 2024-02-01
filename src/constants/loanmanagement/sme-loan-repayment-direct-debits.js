export const DDstatus = {
  OPEN: 'open',
  SENT_TO_BANK: 'sent-to-bank',
  PAID: 'paid',
  FAILED: 'failed',
  FREQUENTLY_FAILED: 'frequently-failed',
  REJECTED: 'rejected',
  FREQUENTLY_REJECTED: 'frequently-rejected',
  MANDATE_WITHDRAWN: 'mandate-withdrawn',
  NOT_APPLICABLE_ANYMORE: 'not-applicable-anymore',
  PAUSED: 'paused',
  MANUALLY_SETTLED: 'manually-settled',
};

export const DDtype = {
  NORMAL: 'normal-dd',
  SPECIAL: 'special-dd',
  PAY_OUT: 'pay-out',
  INITIAL_FEE: 'initial-fee',
  INTEREST_FEE: 'interest-fee',
  RECURRING_FEE: 'recurring-fee',
  OTHER_COST_FEE: 'other-cost-fee',
  WITHDRAWAL_FEE: 'withdrawal-fee',
  CLOSING_PAYMENT: 'closing-payment',
  REFINANCE_PAYMENT: 'refinance-payment',
  DISCOUNT_PAYMENT: 'discount-payment',
  TIKKIE: 'tikkie',
  PARTIAL_PAYMENT: 'partial-payment',
  PARTIAL_PAYMENT_REFUND: 'partial-payment-refund',
  PROFIT: 'profit',
  CLAIM: 'claim',
  INTEREST_PENALTY: 'interest-penalty'
};

export const getLatestPaidDD = (smeLoanTrasactions) => {
  if (smeLoanTrasactions.length == 0) return null;

  const history = historyList => historyList[historyList.length - 1]; //historyList.find(history => history.status === 'paid' ); 

  const paidNormalDD = smeLoanTrasactions.filter(function (st) {
    return st.type == 'normal-dd' && st.status == 'paid';
  }).sort(function (a, b) {
    const aHistory = history(a.statusHistory);
    const bHistory = history(b.statusHistory);
    return new Date(aHistory.createdAt).getTime() - new Date(bHistory.createdAt).getTime();
  });

  if (paidNormalDD.length == 0) return null;

  return paidNormalDD[paidNormalDD.length - 1];
};

export const getCountOfPaidNormalDD = (smeLoanTrasactions) => {

  if (smeLoanTrasactions.length == 0) return 0;

  const paidNormalDD = smeLoanTrasactions.filter(function (st) {
    return st.type == 'normal-dd' && st.status == 'paid';
  });

  if (paidNormalDD.length == 0) return 0;

  return paidNormalDD.length;
};