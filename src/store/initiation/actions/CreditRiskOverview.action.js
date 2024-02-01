import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';
// import { displayNotification } from './Notifier';
import { clearBankTransactionsForGivenFilters, getBankTransactionsForGivenFilters } from './BankTransactions.action';
import {
	GET_SME_LOAN_REQUEST_DETAILS, CLEAR_SME_LOAN_REQUEST_DETAILS, GET_PRICING_PARAMETER,
	CLEAR_PRICING_PARAMETER, CLEAR_BANK_ACCOUNTS, GET_BANK_ACCOUNTS, SET_TRANSACTIONS_FOR_CATEGORIES, SET_REQUEST_BLOCKS_GLOBALLY, SET_TRANSACTIONS_FOR_INTERNAL_TYPES, CLEAR_TRANSACTIONS_FOR_INTERNAL_TYPES,
	SET_TAB_NAME_FOR_CHART } from 'store/initiation/constants/CreditRiskOverview';
import { displayNotification } from './Notifier';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const searchRequestId = (searchOptions) => async dispatch => {

	try {

		const request = {
			url: INITIATION_GATEWAY_URL('/search-sme-loan-requests?') + encodeQueryData(searchOptions)
		};

		const response = await httpService.get(request, dispatch);

		return response;

	} catch (error) {
		console.error('searchRequestId ', error);
		throw Error('searchRequestId Error Occured!');
	}
};

export const getSmeLoanRequestDetails = (queryObj) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-sme-loan-request-details?') + encodeQueryData(queryObj),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: GET_SME_LOAN_REQUEST_DETAILS, payload: response[0] });
		return response[0];

	} catch (error) {

		console.error('getSmeLoanRequestDetails err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getStandardLoanPricingParameter = (queryObj) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-standard-loan-pricing-parameter?') + encodeQueryData(queryObj),
	};

	try {
		const response = await httpService.get(request, dispatch);
		dispatch({ type: GET_PRICING_PARAMETER, payload: response });
		return response;

	} catch (error) {

		console.error('getStandardLoanPricingParameter err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getBankAccounts = (queryObj) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-bank-accounts-for-crd?') + encodeQueryData(queryObj),
	};
	try {
		const response = await httpService.get(request, dispatch);
		const sequenceNoList = [...new Set(response.map(block => block.risk_analysis_sequence_number).sort())];
		const maxSequenceNo = Math.max(...sequenceNoList);

		dispatch({ type: GET_BANK_ACCOUNTS, payload: ('risk_analysis_sequence_number' in queryObj) ? response : response.filter(block => block.risk_analysis_sequence_number === maxSequenceNo) });
		return ('risk_analysis_sequence_number' in queryObj) ? response : response.filter(block => block.risk_analysis_sequence_number === maxSequenceNo);

	} catch (error) {

		console.error('getBankAccounts err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getBankAccountsByPeriod = (queryObj) => async dispatch => {
	const request = {
		url: INITIATION_GATEWAY_URL('/get-bank-accounts-for-crd-by-period?') + encodeQueryData(queryObj),
	};
	try {
		const response = await httpService.get(request, dispatch);
		const sequenceNoList = [...new Set(response.map(block => block.risk_analysis_sequence_number).sort())];
		const maxSequenceNo = Math.max(...sequenceNoList);

		dispatch({ type: GET_BANK_ACCOUNTS, payload: ('risk_analysis_sequence_number' in queryObj) ? response : response.filter(block => block.risk_analysis_sequence_number === maxSequenceNo) });
		return ('risk_analysis_sequence_number' in queryObj) ? response : response.filter(block => block.risk_analysis_sequence_number === maxSequenceNo);

	} catch (error) {

		console.error('getBankAccountsByPeriod err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};
export const getBankAccountsDailyPositions = (queryObj) => async dispatch => {
	// console.log('queryObj in action ', queryObj);

	const request = {
		url: INITIATION_GATEWAY_URL('/get-bank-account-daily-positions?') + encodeQueryData(queryObj),
	};

	try {
		const response = await httpService.get(request, dispatch);
		// console.log('response in action ', response);
		return response;

	} catch (error) {

		console.error('getBankAccountsDailyPositions err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getAllBankTransactionsForCategoryPage = (accDataList, origin = 'categories', categoryType = 'CATEGORY_TYPE_MACHINE_LEARNING') => async dispatch => {

	const allTransactions = [];

	if (!accDataList || accDataList.length === 0) {
		dispatch({
			type: origin === 'categories' ? SET_TRANSACTIONS_FOR_CATEGORIES : SET_TRANSACTIONS_FOR_INTERNAL_TYPES,
			incomingTransactionData: {
				transactionList: [],
				totalAmount: 0
			},
			outgoingTransactionData: {
				transactionList: [],
				totalAmount: 0
			},
		});
		return [];
	}

	try {

		for (let i = 0; i < accDataList.length; i++) {
			const accData = accDataList[i];
			const transactions = await dispatch(getBankTransactionsForGivenFilters(accData));
			allTransactions.push(...transactions);
		}

		dispatch({
			type: origin === 'categories' ? SET_TRANSACTIONS_FOR_CATEGORIES : SET_TRANSACTIONS_FOR_INTERNAL_TYPES,
			incomingTransactionData: origin === 'categories' ?
				getMappedTransactionListForCategories(allTransactions.filter(trans => trans.category === 'INCOME'), categoryType)
				: getMappedTransactionListForInternalTypes(allTransactions.filter(trans => trans.category === 'INCOME')),
			outgoingTransactionData: origin === 'categories' ?
				getMappedTransactionListForCategories(allTransactions.filter(trans => trans.category === 'EXPENSES'), categoryType)
				: getMappedTransactionListForInternalTypes(allTransactions.filter(trans => trans.category === 'EXPENSES')),
		});

		dispatch(clearBankTransactionsForGivenFilters());

		return getMappedTransactionListForCategories(allTransactions);

	} catch (error) {
		console.error('getAllBankTransactionsForCategoryPage err', error);
		throw Error('Unexpected error occured! Please try again.');
	}

};

export const getAllBankTransactionsForSerchedValue = (accDataList) => async dispatch => {

	const allTransactions = [];
	if (!accDataList || accDataList.length === 0) {
		return {
			incommingSearchedTransactions: [],
			outgoingSerchedTransactions: []
		};
	}

	try {

		for (let i = 0; i < accDataList.length; i++) {
			const accData = accDataList[i];
			const request = {
				url: INITIATION_GATEWAY_URL('/get-searched-bank-transactions-for-credit-management-dashboard?') + encodeQueryData(accData),
			};
			const transactions = await httpService.get(request, dispatch);
			allTransactions.push(...transactions);
		}
		
		const incommingSearchedTransactions = allTransactions.filter(trans => trans.category === 'INCOME');
		const outgoingSerchedTransactions = allTransactions.filter(trans => trans.category === 'EXPENSES');

		return {
			incommingSearchedTransactions,
			outgoingSerchedTransactions
		};

	} catch (error) {
		throw Error('Unexpected error occured! Please try again.');
	}

};

export const getProcessDefinitionsSequenceFlow = (queryObj) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-process-definitions-sequence-flow?') + encodeQueryData(queryObj),
	};

	try {
		const response = await httpService.get(request, dispatch);
		return response;

	} catch (error) {

		console.error('getProcessDefinitionsSequenceFlow err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const changeProcessStepBackwardOrForward = (requestBody) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/change-workflow-status'),
		body: requestBody
	};

	try {
		return httpService.post(request, dispatch)
			.then((response) => {
				return response;
			})
			.catch((error) => error);

	} catch (error) {
		console.error('changeProcessStepBackwardOrForward err', error);
		throw Error('Unexpected error occured! Please try again.');
	}

};

export const getCreditManagementChartData = (requestBody) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-bank-account-daily-positions-for-charts'),
		body: requestBody
	};

	try {
		const response = await httpService.post(request, dispatch);
		return response;
	} catch (error) {
		console.error('getCreditManagementChartData', error);
		throw Error('Unexpected error occured! Please try again.');
	}

};

export const getCheckBankTransactionOverviewData = (requestData) => async dispatch => {
	const request = {
		url: INITIATION_GATEWAY_URL('/get-check-bank-transaction-overview-data'),
		body: requestData
	};

	try {
		const response = await httpService.post(request, dispatch);
		return response;
	} catch (error) {
		console.error('getCheckBankTransactionOverviewData', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const setRequestBlocksGlobally = (blockList) => {
	return {
		type: SET_REQUEST_BLOCKS_GLOBALLY,
		payload: blockList
	};
};

export const clearSmeLoanRequestDetails = () => {
	return {
		type: CLEAR_SME_LOAN_REQUEST_DETAILS
	};
};

export const clearStandardLoanPricingParameter = () => {
	return {
		type: CLEAR_PRICING_PARAMETER
	};
};

export const clearBankAccounts = () => {
	return {
		type: CLEAR_BANK_ACCOUNTS
	};
};

export const clearTransactionsForInternalTypes = () => {
	return {
		type: CLEAR_TRANSACTIONS_FOR_INTERNAL_TYPES
	};
};

export const getCreditRiskParameterList = (queryObj) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/get-credit-risk-parameter-list?') + encodeQueryData(queryObj),
	};

	try {
		const response = await httpService.get(request, dispatch);
		return response;

	} catch (error) {

		console.error('getCreditRiskParameterList err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

const getMappedTransactionListForCategories = (transactionList, categoryType) => {

	const overallTotalAmount = transactionList.reduce((total, transaction) => {
		return total + transaction.amount;
	}, 0);

	const subCategorizedTransactions = [];

	for (let j = 0; j < transactionList.length; j++) {
		const transaction = transactionList[j];

		const selectedIndex = subCategorizedTransactions.findIndex(ele => {
			if (categoryType === 'CATEGORY_TYPE_MACHINE_LEARNING') return ele.subCategory === transaction.sub_category;
			return ele.subCategory === transaction.sub_category_rules_engine;
		});
		if (selectedIndex > -1) {
			const element = subCategorizedTransactions[selectedIndex];
			element.totalAmount += transaction.amount;
			element.totalPercentage += overallTotalAmount !== 0 ? (transaction.amount * 100) / overallTotalAmount : 0;
			element.noOfTransactions += 1;
			element.transactions.push(transaction);
			subCategorizedTransactions[selectedIndex] = element;
		}
		else {
			subCategorizedTransactions.push({
				subCategory: categoryType === 'CATEGORY_TYPE_MACHINE_LEARNING' ? transaction.sub_category : transaction.sub_category_rules_engine,
				totalAmount: transaction.amount,
				totalPercentage: overallTotalAmount > 0 ? (transaction.amount * 100) / overallTotalAmount : 0,
				noOfTransactions: 1,
				transactions: [transaction]
			});
		}
	}

	// console.log("subCategorizedTransactions ", subCategorizedTransactions);
	return {
		transactionList: subCategorizedTransactions.map(subCategorizedTransaction => {
			const obj = { ...subCategorizedTransaction, absoluteTotal: Math.abs(subCategorizedTransaction.totalAmount), detailedCategories: getMappedDetailedCategorizedTransactionList(subCategorizedTransaction.transactions, categoryType) };
			delete obj.transactions;
			return obj;
		}),
		totalAmount: overallTotalAmount
	};

};

const getMappedDetailedCategorizedTransactionList = (transactionList, categoryType) => {

	const overallTotalSubCategoryAmount = transactionList.reduce((total, transaction) => {
		return total + transaction.amount;
	}, 0);

	const detailedCategorizedTransactions = [];

	for (let j = 0; j < transactionList.length; j++) {
		const transaction = transactionList[j];

		const selectedIndex = detailedCategorizedTransactions.findIndex(ele => {
			if (categoryType === 'CATEGORY_TYPE_MACHINE_LEARNING') return ele.detailedCategory === transaction.detailed_category;
			return ele.detailedCategory === transaction.detailed_category_rules_engine;
		});
		if (selectedIndex > -1) {
			const element = detailedCategorizedTransactions[selectedIndex];
			element.totalAmount += transaction.amount;
			element.totalPercentage += overallTotalSubCategoryAmount !== 0 ? (transaction.amount * 100) / overallTotalSubCategoryAmount : 0;
			element.noOfTransactions += 1;
			element.transactions.push(transaction);
			detailedCategorizedTransactions[selectedIndex] = element;
		}
		else {
			detailedCategorizedTransactions.push({
				detailedCategory: categoryType === 'CATEGORY_TYPE_MACHINE_LEARNING' ? transaction.detailed_category : transaction.detailed_category_rules_engine,
				subCategory: transaction.sub_category,
				totalAmount: transaction.amount,
				totalPercentage: overallTotalSubCategoryAmount > 0 ? (transaction.amount * 100) / overallTotalSubCategoryAmount : 0,
				noOfTransactions: 1,
				transactions: [transaction]
			});
		}
	}

	// return detailedCategorizedTransactions;
	return detailedCategorizedTransactions.map(detailedCategorizedTransaction => {
		const obj = { ...detailedCategorizedTransaction, absoluteTotal: Math.abs(detailedCategorizedTransaction.totalAmount), IBANNRs: getMappedIBANNRTransactionList(detailedCategorizedTransaction.transactions) };
		delete obj.transactions;
		return obj;
	});

};

const getMappedIBANNRTransactionList = (transactionList) => {

	const overallTotalIBANNRAmount = transactionList.reduce((total, transaction) => {
		return total + transaction.amount;
	}, 0);

	const IBANNRTransactions = [];

	for (let j = 0; j < transactionList.length; j++) {
		const transaction = transactionList[j];

		const selectedIndex = IBANNRTransactions.findIndex(ele => ele.IBANNR === transaction.counterparty_iban_number /* && ele.counterPartyName === transaction.counterparty_name */);
		if (selectedIndex > -1) {
			const element = IBANNRTransactions[selectedIndex];
			element.totalAmount += transaction.amount;
			element.counterPartyNames = updateCounterPartyList(element.counterPartyNames, transaction.counterparty_name);///
			element.totalPercentage += overallTotalIBANNRAmount !== 0 ? (transaction.amount * 100) / overallTotalIBANNRAmount : 0;
			element.noOfTransactions += 1;
			element.transactions.push(transaction);
			IBANNRTransactions[selectedIndex] = element;
		}
		else {
			IBANNRTransactions.push({
				IBANNR: transaction.counterparty_iban_number,
				totalAmount: transaction.amount,
				detailedCategory: transaction.detailed_category,
				subCategory: transaction.sub_category,
				counterPartyName: transaction.counterparty_name,
				counterPartyNames: addNewCounterPartyList(transaction.counterparty_name),
				totalPercentage: overallTotalIBANNRAmount > 0 ? (transaction.amount * 100) / overallTotalIBANNRAmount : 0,
				noOfTransactions: 1,
				transactions: [transaction]
			});
		}
	}

	return getFinalIbanNumberMappedList(IBANNRTransactions);

};

const getMappedTransactionListForInternalTypes = (transactionList) => {

	const overallTotalAmount = transactionList.reduce((total, transaction) => {
		return total + transaction.amount;
	}, 0);

	const internalTypesCategorizedTransactions = [];

	for (let j = 0; j < transactionList.length; j++) {
		const transaction = transactionList[j];

		const selectedIndex = internalTypesCategorizedTransactions.findIndex(ele => ele.internalTransactionType === transaction.internal_transaction_type);
		if (selectedIndex > -1) {
			const element = internalTypesCategorizedTransactions[selectedIndex];
			element.totalAmount += transaction.amount;
			element.totalPercentage += overallTotalAmount !== 0 ? (transaction.amount * 100) / overallTotalAmount : 0;
			element.noOfTransactions += 1;
			element.transactions.push(transaction);
			internalTypesCategorizedTransactions[selectedIndex] = element;
		}
		else {
			internalTypesCategorizedTransactions.push({
				internalTransactionType: transaction.internal_transaction_type,
				totalAmount: transaction.amount,
				totalPercentage: overallTotalAmount > 0 ? (transaction.amount * 100) / overallTotalAmount : 0,
				noOfTransactions: 1,
				transactions: [transaction]
			});
		}
	}

	// console.log("internalTypesCategorizedTransactions ", internalTypesCategorizedTransactions);
	return {
		transactionList: internalTypesCategorizedTransactions,
		totalAmount: overallTotalAmount
	};

};


const addNewCounterPartyList = (cp) => {
	return [{ counterPartyName: cp, count: 1 }];
};

const updateCounterPartyList = (currentCounterPartyList, newcp) => {
	const finalCPLIst = currentCounterPartyList;
	const foundElementIndex = currentCounterPartyList.findIndex(ele => ele.counterPartyName === newcp);

	if (foundElementIndex >= 0)
		finalCPLIst[foundElementIndex].count += 1;
	else
		finalCPLIst.push({ counterPartyName: newcp, count: 1 });

	return finalCPLIst;
};

const getFinalIbanNumberMappedList = (dataList) => {
	return dataList.map(element => {
		if (element.counterPartyNames && element.counterPartyNames.length > 1) {
			return {
				...element,
				counterPartyName: getSortedCounterPartyName(element.counterPartyNames)
			};
		}
		return element;
	});
};

const getSortedCounterPartyName = (counterPartyNames) => {
	const sortedByCountList = counterPartyNames.sort((a, b) => b.count - a.count);
	const mappedToCountValues = sortedByCountList.map(el => el.count);
	const mappedToNameValues = sortedByCountList.map(el => el.counterPartyName);
	const isSameAllElements = mappedToCountValues.every(v => v === mappedToCountValues[0]);

	if (isSameAllElements) return mappedToNameValues.sort()[0];
	return sortedByCountList[0].counterPartyName;
};

export const setTabNameForChart = (tabName, tabValue) => {
	return {
		type: SET_TAB_NAME_FOR_CHART,
		tab: tabName,
		tabValue: tabValue
	 };
};

export const requestModelPredictionData = (contractId) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/request-model-prediction?') + `contractId=${contractId} `
	};

	try {
		const response = await httpService.get(request, dispatch);
		return response;

	} catch (error) {
		console.error('requestModelPredictionData err', error);
		throw Error('Unexpected error occured! Please try again.');
	}
};

export const getPSD2DailyUpdates = (customerId) => async dispatch => {

	const request = {
		url: INITIATION_GATEWAY_URL('/start-instance-by-key'),
		body: {
			"businessKey":"daily_update_psd2_data_single_customer_"+ Date.now(),
			"key": "daily-update-psd2-data-for-single-customer-simulation",
			"variables" :{
				"inputCustomerId": {
					"value": customerId,
					"type": "String"
				}
			},
			"tenantId":"LI"
		}
	};

	try {
		const response = await httpService.post(request, dispatch);
		return response;

	} catch (error) {
		console.error('getPSD2DailyUpdates err', error);
		dispatch(displayNotification('Unexpected error occured! Please try again.', 'error'));
		throw Error('Unexpected error occured! Please try again.');
	}
};



