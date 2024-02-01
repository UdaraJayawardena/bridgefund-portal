
  export const LoanTypes = [
    'loan',
    'current-account-credit',
    'payments_overdue',
    'lease-contract',
    'tax-payment-overdue',
    'mortgage',
    'supplier-credit',
    'other-loans',
    'debt-collector',
    'collection-agency',
    'other-payments-overdue',
    'personal-relationship',
    'government-payment-arrangement'
  ];
  
  export const TypeOfObject = [
    'company-car',
    'wood-working-machines',
    'construction-machines',
    'graphic-industry-machinery',
    'packaging-machines',
    'audio-visual-equipment',
    'hardware',
    'catering-equipment',
    'other-machinery-or-equipment'
  ];
  
  export const CollateralIndicator = [
    'yes',
    'no',
  ];
  export const BankruptIndicator = {
    "yes": "yes",
    "no": "no",
  };

  // export const BankruptIndicator = [
  //   'yes',
  //   'no',
  // ];

  export const PartyNames = [
   'ABN',
    'RABO',
    'ING',
    'SNS',
    'KNAB',
    'FLORYN',
    'SWISSFUND',
    'Personal-Relation-Friend',
    'Belastingdienst',
    'Other'
  ];

  export default {
    LoanTypes,
    TypeOfObject,
    CollateralIndicator,
    PartyNames,
  };