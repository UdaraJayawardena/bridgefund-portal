/* eslint-disable import/no-anonymous-default-export */
import {
	GET_CUSTOMER,
	// CLEAR_CUSTOMER,
	GET_SME_LOAN_REQUESTS,
	CLEAR_SME_LOAN_REQUESTS,
	// CLEAR_SME_LOAN_REQUEST_DETAILS,
	// GET_SME_LOAN_REQUEST_DETAILS,
	GET_PRICING_PARAMETER,
	CLEAR_PRICING_PARAMETER,
	GET_BANK_ACCOUNTS,
	CLEAR_BANK_ACCOUNTS,
	SET_TRANSACTIONS_FOR_CATEGORIES,
	SET_REQUEST_BLOCKS_GLOBALLY,
	SET_TRANSACTIONS_FOR_INTERNAL_TYPES,
	CLEAR_TRANSACTIONS_FOR_INTERNAL_TYPES,
	SET_TAB_NAME_FOR_CHART
} from "../constants/CreditRiskOverview.js";

const defaultState = {
	// customerDetails: {}, // moved to global store configurations
	smeLoanRequests: [],
	// overviewData: {},// moved to global store configurations
	pricingParameter: {},
	bankAccounts: [],
	incomingTransactionData: {
		transactionList: [],
		totalAmount: 0
	},
	outgoingTransactionData: {
		transactionList: [],
		totalAmount: 0
	},
	selectedRequestBlocks: [],
};

export default (state = defaultState, action) => {
	// console.log("action.payload ", action.payload);
	switch (action.type) {

		// case GET_CUSTOMER:
		// 	return {
		// 		...state,
		// 		customerDetails: action.payload,
		// 	};

		// case CLEAR_CUSTOMER:
		// 	return {
		// 		...state,
		// 		customerDetails: {},
		// 	};

		case GET_SME_LOAN_REQUESTS:
			return {
				...state,
				smeLoanRequests: [...new Set(action.payload.map(req => req.contractId))],
			};

		case CLEAR_SME_LOAN_REQUESTS:
			return {
				...state,
				smeLoanRequests: [],
			};

		// case GET_SME_LOAN_REQUEST_DETAILS:
		// 	return {
		// 		...state,
		// 		overviewData: action.payload,
		// 	};

		// case CLEAR_SME_LOAN_REQUEST_DETAILS:
		// 	return {
		// 		...state,
		// 		overviewData: {},
		// 	};

		case GET_PRICING_PARAMETER:
			return {
				...state,
				pricingParameter: action.payload
			};

		case CLEAR_PRICING_PARAMETER:
			return {
				...state,
				pricingParameter: {},
			};

		case GET_BANK_ACCOUNTS:
			return {
				...state,
				bankAccounts: action.payload
			};

		case CLEAR_BANK_ACCOUNTS:
			return {
				...state,
				bankAccounts: [],
			};

		case SET_TRANSACTIONS_FOR_CATEGORIES:
			return {
				...state,
				incomingTransactionData: action.incomingTransactionData,
				outgoingTransactionData: action.outgoingTransactionData,
			};

		case SET_REQUEST_BLOCKS_GLOBALLY:
			return {
				...state,
				selectedRequestBlocks: action.payload,
			};

		case SET_TRANSACTIONS_FOR_INTERNAL_TYPES:
			return {
				...state,
				incomingTransactionData: action.incomingTransactionData,
				outgoingTransactionData: action.outgoingTransactionData,
			};

		case CLEAR_TRANSACTIONS_FOR_INTERNAL_TYPES:
			return {
				...state,
				incomingTransactionData: {
					transactionList: [],
					totalAmount: 0
				},
				outgoingTransactionData: {
					transactionList: [],
					totalAmount: 0
				},
			};
		
		case SET_TAB_NAME_FOR_CHART:
			return {
				...state,
				tabNameForChart: action.tab,
				tabValueForAccount: action.tabValue
			};
		default:
			return state;
	}
};
