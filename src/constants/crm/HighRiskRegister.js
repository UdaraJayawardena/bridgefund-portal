export const HighRiskRegSource = {
  "N/A": 'n.a.',
  "SYSTEM - BRIDGEFUND": 'system-bridgefund',
  "INSOLVATION - REGISTER": 'insolvation-register',
  "GOOGLE - SEARCH": 'google-search'
};

export const HighRiskRegIndicator = {
  "N/A": 'n.a.',
  HIGH: 'high',
  SERIOUS: 'serious'
};

export const EmptyHighRiskRegObj = {
  "action": "create",
  "_id": undefined,
  "id": undefined,
  "date": null,
  "customerId": undefined,
  "personId": undefined,
  "source": 'n.a.',
  "indicator": 'n.a.',
  "createdAt": null,
  "updatedAt": null
};

export const HighRiskRegSchemaKeysToCompare = ['date', 'customerId', 'personId', 'source', 'indicator'];

export default {
  emptyObj: EmptyHighRiskRegObj,
  indicator: HighRiskRegIndicator,
  source: HighRiskRegSource,
  schemaKeysToCompare: HighRiskRegSchemaKeysToCompare,
};