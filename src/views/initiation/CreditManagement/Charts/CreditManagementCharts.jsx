import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import { Button, Checkbox, Dialog, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, 
	TableHead, TableRow, TextField, Tabs, Tab, Typography} from '@material-ui/core';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';

import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';
import Autocomplete from "@material-ui/lab/Autocomplete";
import ChartBoxContainer from './ChartBoxContainerNew';
import CustomSearch from 'components/initiation/CustomInput/CustomSearch';
import LoadingOverlay from 'react-loading-overlay';
import CloseIcon from '@material-ui/icons/Close';
import { clearCustomerDetails, getSmeLoanRequests, clearSmeLoanRequests, getCustomerDetails, searchCustomer } from 'store/initiation/actions/BankAccount.action';

import { getSmeLoanRequestDetails, getStandardLoanPricingParameter, clearBankAccounts, getBankAccounts, getBankAccountsByPeriod, clearSmeLoanRequestDetails, setRequestBlocksGlobally, setTabNameForChart, requestModelPredictionData } from 'store/initiation/actions/CreditRiskOverview.action';
import { getPlannedDDCount } from "constants/initiation/sme-loan";
import { EURO, numberFormatDutchToEnglish, numberFormating } from 'lib/initiation/utility';
import { displayNotification } from 'store/initiation/actions/Notifier';
import dashboardStyle from 'assets/jss/bridgefundPortal/views/crmChartsStyle';
import { clearHeaderDisplaySubData, setHeaderDisplayMainData, setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation'; // dashboard Items change
import ChangeWorkflowStatusPopUp from './ChangeWorkflowStatusPopUp';
import GetPsdDailyUpdatesPopup from './GetPsdDailyUpdatesPopup';
import { getCustomerAddressContact, setImportedLoanRequestContractId } from 'store/crm/actions/SmeOverview.action';

const Frequency = {
	"Daily": "daily",
	"Weekly": "weekly",
	"Monthly": "monthly"
};

const LoanTypes = {
	"fixed-loan": "fixed-loan",
	"flex-loan": "flex-loan",
};

const ProcessUpdateTypes = {
	BACKWARD: 'BACKWARD',
	FORWARD: 'FORWARD',
};

//Default tab selection values
const DefaultAccountTabIndex = 2;
const DefaultAccountTabName  = '1 Year';
const DefaultAccountPeriod   = '1y';

const getParameterByName = (name, url = window.location.href) => {
	// eslint-disable-next-line no-useless-escape
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const convertStringArrayToObject = (array) => {
	// const array = ["1", "2", "3"];
	// ["1","2","3"]==> {"1":"1","2":"2","3":"3",}
	if (array.filter(function (el) {
		return el != null;
	}).length === 0) return [];

	return array.reduce(
		(obj, item) => ({
			...obj,
			[item]: item
		}),
		{}
	);
};

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-force-tabpanel-${index}`}
			aria-labelledby={`scrollable-force-tab-${index}`}
			{...other}
			style={{ paddingTop: 10 }}
		>
			{value === index && children}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

class CreditManagementCharts extends Component {

	constructor(props) {
		super(props);

		this.state = {
			legalName: this.props.customer.legalName,
			legalNameInput: this.props.customer.legalName,
			requestIdValue: this.props.overviewData ? this.props.overviewData.contractId : '',
			requestIdInputValue: '',
			shouldDisableCustomerSelect: false,
			allCustomers: [],
			compOverviewData: {
				desiredDirectDebitFrequency: 'weekly',
				desiredPrincipleAmount: 0,
				desiredDurationInMonths: 0,
				initialFee: 0,
				riskSurcharge: 0,
				desiredDirectDebitAmount: 0,
				loanType: '',
			},
			requestBlocks: [],
			isOpenChangeWorkflowStatusDialog: false,
			workflowData: {},
			riskAnalysisSequenceNumber: '',
			riskAnalysisSequenceNumberList: [],
			isLoadingOverviewData: false,
			tabIndex: DefaultAccountTabIndex,
			singlePrediction: {},
			isOpenGetPSD2Dialog: false,
		};
	}

	componentDidMount() {
		
		const { selectedMyTaskContractId ,importedLoanRequestContractId , dashbordNavigationStatus } = this.props;
		const requestId = getParameterByName('contractId');
	
		if (this.props.customer.legalName && Object.keys(this.props.overviewData).length === 0) {
			//customer is available but no contractData in store
			this.props.getSmeLoanRequests({ customerId: this.props.customer.id })
				.then(res => {
					if (res.length === 1) {

						this.setState({
							requestIdValue: res[0].contractId,
							requestIdInputValue: res[0].contractId
						}, () => this.getOverviewData(res[0].contractId, false));
						this.props.setHeaderDisplaySubData(` - ${this.props.customer.legalName} - ${res[0].contractId}`);// dashboard Items change
					}
				})
				.catch(err => console.log('error in getSmeLoanRequests ', err));
		}


		if (requestId ) {
			///get requestSelection Data
			this.setState({
				requestIdValue: requestId,
				requestIdInputValue: requestId
			}, () => this.getRequestDataById(requestId));
			//request block data

		}


		if (Object.keys(this.props.overviewData).length > 0) {
			
			this.props.setHeaderDisplaySubData(` - ${this.props.customer.legalName} - ${this.props.overviewData.contractId}`);
			if (selectedMyTaskContractId !== undefined) {
				this.setState({ requestIdValue: selectedMyTaskContractId, requestIdInputValue: selectedMyTaskContractId }, () => this.getOverviewData(selectedMyTaskContractId, true));
			}
			if(importedLoanRequestContractId !== ''){
				this.props.getSmeLoanRequests({ customerId: this.props.customer.id })
				.then(res => {
					// console.log('res ', res);
					if (res.length === 1) {
						if(res[0].contractId === importedLoanRequestContractId){
							this.setState({
								requestIdValue: importedLoanRequestContractId,
								requestIdInputValue: importedLoanRequestContractId
							}, () => this.getOverviewData(importedLoanRequestContractId , false));
							this.props.setHeaderDisplaySubData(` - ${this.props.customer.legalName} - ${res[0].contractId}`);// dashboard Items change
						}else{
							this.props.getSmeLoanRequests({ customerId: this.props.customer.id })
							.then(res => {
								// console.log('res ', res);
								if (res.length === 1) {
			
									this.setState({
										requestIdValue: res[0].contractId,
										requestIdInputValue: res[0].contractId
									}, () => this.getOverviewData(res[0].contractId, false));
									this.props.setHeaderDisplaySubData(` - ${this.props.customer.legalName} - ${res[0].contractId}`);// dashboard Items change
								}
							})
							.catch(err => console.log('error in getSmeLoanRequests ', err));
						}						
					}
				})
				.catch(err => console.log('error in getSmeLoanRequests ', err));
			}
			this.setState({
				compOverviewData: this.props.overviewData,
			}, () => this.setPercetageCalculations());
		}
		this.setAllCustomers();
		// this.setAllRequests();

		this.setState({ requestBlocks: this.props.selectedRequestBlocks && this.props.selectedRequestBlocks.length === 0 ? [] : this.props.selectedRequestBlocks });
		// this.props.setHeaderDisplayMainData('Charts'); // dashboard Items change
		
		this.loadDefaultTab();

	}
	
	loadDefaultTab = () => {

		this.setState({ tabIndex: DefaultAccountTabIndex });

		const requestObj = {

			smeLoanRequestId: this.props.overviewData.contractId,

			riskAnalysisSequenceNumber: this.state.riskAnalysisSequenceNumber,

			period: DefaultAccountPeriod,
			
		};

		this.props.getBankAccountsByPeriod(requestObj);

		const tabName = DefaultAccountTabName;

		this.setTabName(tabName);	

	}
	
	setAllCustomers = () => {
		this.props.searchCustomer(null, null, null, null, 'i')
			.then(res => {
				// console.log('res ', res);
				this.setState({ allCustomers: res });
			})
			.catch(err => console.log("err in get all customers ", err));
	}

	getrequestBlockForSelectedRequest = (requestId) => {
		this.setState({ isLoadingOverviewData: true , requestBlocks: [] });
		this.requestModelPredictionData(requestId);
		this.props.getBankAccounts({ smeLoanRequestId: requestId })
			.then(res => {
				this.setState({ isLoadingOverviewData: false });
				const sequenceNoList = [...new Set(res.map(block => block.risk_analysis_sequence_number).sort())];
				const maxSequenceNo = Math.max(...sequenceNoList);
				const highBlocks = res.filter(block => block.highestTurnoverIndicator);

				this.setState({
					requestBlocks: highBlocks,
					riskAnalysisSequenceNumberList: convertStringArrayToObject(sequenceNoList),
					riskAnalysisSequenceNumber: maxSequenceNo,
				}, () => this.props.setRequestBlocksGlobally(highBlocks));
			})
			.catch(err => {
				console.log(err);
				this.setState({ isLoadingOverviewData: false });
			});
	}

	setInitialState = (origin) => {

		const customerId = this.state.compOverviewData.customerId;
		const _state = {
			legalName: origin === 'CUSTOMER' ? '' : this.state.legalName,
			legalNameInput: origin === 'CUSTOMER' ? '' : this.state.legalName,
			requestIdValue: '',
			requestIdInputValue: '',
			shouldDisableCustomerSelect: false,
			compOverviewData: {
				desiredDirectDebitFrequency: 'weekly',
				desiredPrincipleAmount: 0,
				desiredDurationInMonths: 0,
				initialFee: 0,
				riskSurcharge: 0,
				desiredDirectDebitAmount: 0,
				loanType: '',
			},
			requestBlocks: [],
			isOpenChangeWorkflowStatusDialog: false,
			workflowData: {},
			riskAnalysisSequenceNumber: '',
			riskAnalysisSequenceNumberList: [],
		};

		this.setState({ ..._state }, () => {
			if (origin === 'CUSTOMER') {
				this.props.clearCustomerDetails();
				// this.props.getSmeLoanRequests(null);
				this.props.clearBankAccounts();
				this.props.clearSmeLoanRequestDetails();
				this.props.setRequestBlocksGlobally([]);
				this.props.clearHeaderDisplaySubData();// dashboard Items change
			}
			if (origin === 'REQUEST_ID') {
				this.props.clearBankAccounts();
				this.props.getSmeLoanRequests({ customerId });
				this.props.clearSmeLoanRequestDetails();
				this.props.setRequestBlocksGlobally([]);
				this.props.setHeaderDisplaySubData(` - ${this.props.customer.legalName}`);// dashboard Items change
			}
		});
	}

	handleCustomerSearchResult = (result) => {
		if (result && typeof result !== 'string') {
			// this.props.getSmeLoanRequests(null);
			this.props.clearBankAccounts();
			this.props.clearSmeLoanRequestDetails();
			this.props.setRequestBlocksGlobally([]);
			this.props.clearHeaderDisplaySubData();
			this.setState({ requestBlocks: [] });
			this.props.getCustomerAddressContact(result.id, result.legalName);
			this.props.setHeaderDisplaySubData(` - ${result.legalName}`);// dashboard Items change
			this.setState({
				requestIdValue: '',
				requestIdInputValue: '',// to clear if there any selected request-ids
			});
		}
		this.getSmeLoanRequestsForCustomer(result);
	};

	getSmeLoanRequestsForCustomer = (customer) => {
		this.props.getSmeLoanRequests({ customerId: customer.id })
			.then(res => {
				// console.log('res ', res);
				if (res.length === 1) {
					this.setState({
						requestIdValue: res[0].contractId,
						requestIdInputValue: res[0].contractId
					}, () => this.getOverviewData(res[0].contractId, false));
					this.props.setHeaderDisplaySubData(` - ${customer.legalName} - ${res[0].contractId}`);// dashboard Items change
				}
			})
			.catch(err => console.log('error in getSmeLoanRequests ', err));
	}

	//DD-Amount (desiredDirectDebitAmount) calculation function 
	dDAmountCalculation = (desiredAmount = null) => {

		const compOverviewData = this.state.compOverviewData;
		const {
			desiredDurationInMonths,
			desiredPrincipleAmount,
			initialFee,
			riskSurcharge,
			desiredDirectDebitFrequency
		} = compOverviewData;

		if (!desiredAmount) desiredAmount = desiredPrincipleAmount;

		const totalLoanAmount = Number(desiredAmount) + ((Number(initialFee) + Number(riskSurcharge)) / 100) * desiredDurationInMonths * Number(desiredAmount);
		// console.log(`${desiredAmount} + ((${Number(initialFee)} + ${Number(riskSurcharge)}) / 100) * ${desiredDurationInMonths} * ${desiredAmount}/${getPlannedDDCount(this.getFrequencyString(desiredDirectDebitFrequency), desiredDurationInMonths)}`);
		const finalValue = (totalLoanAmount / getPlannedDDCount(this.getFrequencyString(desiredDirectDebitFrequency), desiredDurationInMonths)).toFixed(2);
		if (compOverviewData.loanType === 'fixed-loan')
			return finalValue;
		return desiredAmount;
	}

	getFrequencyString = (frequency) => {
		if (!frequency) return 'daily';
		if (frequency.charAt(0).toUpperCase() === 'D') return 'daily';
		if (frequency.charAt(0).toUpperCase() === 'W') return 'weekly';
		if (frequency.charAt(0).toUpperCase() === 'M') return 'monthly';
	}
	//Desired-Amount (desiredPrincipleAmount) calculation function
	desiredAmountCalculation = (dDAmount) => {

		const compOverviewData = this.state.compOverviewData;
		const {
			desiredDurationInMonths,
			initialFee,
			riskSurcharge,
			desiredDirectDebitFrequency
		} = compOverviewData;

		const calculatedTotalLoanAmount = dDAmount * getPlannedDDCount(this.getFrequencyString(desiredDirectDebitFrequency), desiredDurationInMonths);
		const calculatedTotalInterest = ((Number(initialFee) + Number(riskSurcharge)) / 100) * desiredDurationInMonths;
		return (calculatedTotalLoanAmount / (1 + calculatedTotalInterest)).toFixed(2);

	}

	getRequestDataById = (contractId) => {
		const requestObj = {
			contractId,
			// status: 'outstanding',
		};
		this.setState({ isLoadingOverviewData: true });
		this.props.getSmeLoanRequestDetails(requestObj)
			.then(res => {

				if (!res) {
					this.setState({ isLoadingOverviewData: false });
					return this.props.displayNotification('No Details Exists for Request', 'warning');
				}

				this.setState({ compOverviewData: res });
				this.props.getCustomerDetails({ customerId: res.customerId }) //get the details of customer of selected request
					.then(res => {
						this.setState({ isLoadingOverviewData: false });
						if (res && res.customer) {
							// console.log('res ', res.customer);
							this.getSmeLoanRequestsForCustomer(res.customer); //to get all the requests for selected customer
							this.setState({
								legalName: res.customer.legalName,
								legalNameInput: res.customer.legalName,
								shouldDisableCustomerSelect: true
							}, () => {
								this.props.getCustomerAddressContact(res.customer.id, res.customer.legalName);
							});
							this.props.setHeaderDisplaySubData(` - ${res.customer.legalName} - ${contractId}`);// dashboard Items change

						}
						else {
							// this.props.display
							this.props.displayNotification('No Customer Exists for Request', 'warning');
						}
					})
					.catch(err => {
						this.setState({ isLoadingOverviewData: false });
						console.log(err);
					});

				this.getrequestBlockForSelectedRequest(contractId);

				this.props.getStandardLoanPricingParameter({
					loanType: res.loanType,
					amount: res.desiredPrincipleAmount
				})
					.then((res) => {
						// console.log('res ', res);
						this.setPercetageCalculations(res);
						// this.props.getCustomerAddressContact(res);
					});
			})
			.catch(err => console.log(err));
	}


	getOverviewData = (contractId, shouldCaculateWithNewPPValues) => {
		// const loanType
		
		if (this.props.customer.id) {
			
			const requestObj = {
				contractId,
				// status: 'outstanding',
				customerId: this.props.customer.id
			};
			
			this.setState({ isLoadingOverviewData: true });
			this.props.getSmeLoanRequestDetails(requestObj)
				.then(res => {
					this.setState({ isLoadingOverviewData: false });
					if (!res)
						return this.props.displayNotification('No Details Exists for Request', 'warning');
					if (!shouldCaculateWithNewPPValues) {
						this.setState({ compOverviewData: res });
						this.props.setHeaderDisplaySubData(` - ${this.props.customer.legalName} - ${res.contractId}`);// dashboard Items change
					}

					this.props.getStandardLoanPricingParameter({
						loanType: shouldCaculateWithNewPPValues ? this.state.compOverviewData.loanType : res.loanType,
						amount: shouldCaculateWithNewPPValues ? this.state.compOverviewData.desiredPrincipleAmount : res.desiredPrincipleAmount
					})
						.then((res) => {
							// set values to percentages
							this.setPercetageCalculations(res);
						})
						.then(() => {
							if (shouldCaculateWithNewPPValues) {
								this.handleDesiredAmountChange(this.state.compOverviewData.desiredPrincipleAmount);
							}
						});	
				})
				.catch(err => {
					console.log(err);
					this.setState({ isLoadingOverviewData: false });
				});
		} else {

			this.getRequestDataById(contractId);

		}

		this.getrequestBlockForSelectedRequest(contractId);
	}

	setPercetageCalculations = (pp = null) => {

		const { overviewData, } = this.props;
		const { loanPurposeRisk } = overviewData;
		const { compOverviewData } = this.state;

		const pricingParameter = pp ? pp : this.props.pricingParameter;

		if (compOverviewData && compOverviewData.loanType === 'flex-loan') {
			this.setState({
				compOverviewData: {
					...compOverviewData,
					initialFee: "0",
					riskSurcharge: "0",
					desiredDirectDebitAmount: compOverviewData.desiredPrincipleAmount//percentages assumed to be 0 so then value is same
				}
			});
			return;
		}

		if (pricingParameter) {
			if (loanPurposeRisk === 'low') {
				this.setState({
					compOverviewData: {
						...compOverviewData,
						initialFee: pricingParameter.lowRiskInitialFeePercentage,
						riskSurcharge: pricingParameter.lowRiskSurchargePercentage,
					}
				});
				return;
			}
			if (loanPurposeRisk === 'medium') {
				this.setState({
					compOverviewData: {
						...compOverviewData,
						initialFee: pricingParameter.mediumRiskInitialFeePercentage,
						riskSurcharge: pricingParameter.mediumRiskSurchargePercentage,
					}
				});
				return;
			}
			if (loanPurposeRisk === 'high') {
				this.setState({
					compOverviewData: {
						...compOverviewData,
						initialFee: pricingParameter.highRiskInitialFeePercentage,
						riskSurcharge: pricingParameter.highRiskSurchargePercentage,
					}
				});
				return;
			}
		}

		this.setState({
			compOverviewData: {
				...compOverviewData,
				initialFee: 1,
				riskSurcharge: 2,
			}
		});

		return;
	}

	getRequestDateAndTime = () => {
		if (this.state.compOverviewData.statusHistory) {

			const statusHistory = this.state.compOverviewData.statusHistory;
			const historyObj = statusHistory.find(history => history.status === 'received-from-customer');

			if (historyObj)
				return {
					requestDate: moment(historyObj.createdAt).format('DD-MM-YYYY'),
					// requestTime: moment(historyObj.createdAt),
					requestTime: moment(historyObj.createdAt).format('HH:mm:ss')
				};
			return {
				requestDate: moment().format('DD-MM-YYYY'),
				requestTime: moment().format('HH:mm:ss'),
			};

		}

		return {
			requestDate: moment().format('DD-MM-YYYY'),
			requestTime: moment().format('HH:mm:ss'),
		};

	}

	isErrorRequestTime = (time) => {

		time = moment(time, 'HH:mm:ss');

		const beforeTime1 = moment('00:00:00', 'HH:mm:ss');
		const afterTime1 = moment('06:00:00', 'HH:mm:ss');
		const beforeTime2 = moment('23:00:00', 'HH:mm:ss');
		const afterTime2 = moment('24:00:00', 'HH:mm:ss');

		return time.isBetween(beforeTime1, afterTime1) ||
			time.isBetween(beforeTime2, afterTime2);
	}

	handleDurationChange = (e) => {
		const { compOverviewData } = this.state;
		this.setState({
			compOverviewData: {
				...compOverviewData,
				desiredDurationInMonths: e.target.value,
			}
		}, () => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredDirectDebitAmount: this.dDAmountCalculation() } }); });
	}

	handleBlockTableChange = (e, block) => {
		if (e.target.checked)
			this.addElement(block);
		else
			this.removeElement(block);
	}

	addElement = (block) => {
		const array = [...this.state.requestBlocks];
		array.push(block);
		this.setState({ requestBlocks: array }, () => this.props.setRequestBlocksGlobally(array));

	}

	removeElement = (block) => {
		const array = [...this.state.requestBlocks];
		const index = array.indexOf(block);
		if (index !== -1) {
			array.splice(index, 1);
			this.setState({ requestBlocks: array }, () => this.props.setRequestBlocksGlobally(array));
		}
	}

	handleDesiredAmountChange = (value) => {
		const { compOverviewData } = this.state;
		// console.log('handleDesiredAmountChange ');

		if (compOverviewData.loanType) {

			this.props.getStandardLoanPricingParameter({
				loanType: compOverviewData.loanType,
				amount: Number(value)
			})
				.then((res) => {
					// console.log('res ', res);
					this.setPercetageCalculations(res);
				})
				.then(() => this.setState({
					compOverviewData: {
						...this.state.compOverviewData,
						desiredPrincipleAmount: Number(value),
						// desiredDirectDebitAmount: this.dDAmountCalculation(Number(value))
					}
				}, () => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredDirectDebitAmount: this.dDAmountCalculation() } }); }))
				.catch(err => console.log(err));

		}
		else {
			this.setState({
				compOverviewData: {
					...compOverviewData,
					desiredPrincipleAmount: Number(value),
					// desiredDirectDebitAmount: this.dDAmountCalculation(Number(value))
				}
			}, () => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredDirectDebitAmount: this.dDAmountCalculation() } }); });
		}
	}

	handleDdAmountChange = (value) => {
		const { compOverviewData } = this.state;
		this.setState({
			compOverviewData: {
				...compOverviewData,
				desiredDirectDebitAmount: Number(value),
			}
		}, (v = value) => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredPrincipleAmount: this.desiredAmountCalculation(Number(v)) } }); });
	}

	checkForDefaultSelect = (iban) => {
		return this.props.selectedRequestBlocks.find(item => item.iban === iban) ? true : false;
	}

	handleChangeWorkflowStatusDialog = () => {
		this.setState({ isOpenChangeWorkflowStatusDialog: !this.state.isOpenChangeWorkflowStatusDialog });
	}

	setWorkflowStatusChangeData = () => {
		const workflowData = {
			process: 'Loan-Initiation',
			processId: this.state.requestIdValue,
			selectedTaskIdList: ["receive-bank-file-info"],// TODO need to change ths list
			statusChangeType: ProcessUpdateTypes.BACKWARD,// Back To or Forward To
			selectedTask: 'receive-bank-file-info',// TODO id of 'Waiting-for-MT940/PSD2-info' 
			tenantId: 'LI',
		};

		if (!this.state.requestIdValue) {
			this.props.displayNotification('No Request Id Selected !', 'warning');
			return;
		}
		this.setState({ workflowData }, () => this.handleChangeWorkflowStatusDialog());
	}

	handleSequenceNumberChange = () => {
		const { requestIdValue, riskAnalysisSequenceNumber } = this.state;
		this.props.getBankAccounts({
			smeLoanRequestId: requestIdValue,
			riskAnalysisSequenceNumber: riskAnalysisSequenceNumber
		})
			.then(res => {
				const highBlocks = res.filter(block => block.highestTurnoverIndicator);
				this.setState({
					requestBlocks: highBlocks,
				}, () => this.props.setRequestBlocksGlobally(highBlocks));
			})
			.catch(err => console.log(err));
	}

	onSearch = (name, value) => {
		this.setState({
			requestIdValue: value,
			requestIdInputValue: value
		});
		if (name === 'contractId' && value === '') {
			// set all requestIds for selected customer 
			this.setInitialState('REQUEST_ID');
		};
	};

	handleOnContractSearchResult = (result) => {
		if (result && typeof result !== 'string') {
			this.getRequestDataById(result.requestId);	
			this.setState({ tabIndex: DefaultAccountTabIndex });		
		}
	}

	handleTabIndexChangeAccount = (e, value) => {
		let period_code ='';
		let tabName = '';
		switch (value){
			case 0:
				period_code="1m";
				tabName = '1 Month';
				break;
			case 1:
				period_code="6m";
				tabName = '6 Months';
				break;
			case 2:
				period_code="1y";
				tabName = '1 Year';
				break;
			default:
				period_code="all";
				tabName = 'All';
				break;
		}
		const requestObj = {
			smeLoanRequestId: this.props.overviewData.contractId,
			riskAnalysisSequenceNumber: this.state.riskAnalysisSequenceNumber,
			period: period_code,
		};
		this.props.getBankAccountsByPeriod(requestObj);
		
		this.setState({ tabIndex: value });

		this.setTabName(tabName, value);
	};

	setTabName = (tab, value) => {
		this.props.setTabNameForChart(tab, value);
	}

	// requesting model prediction data for selected contractId
	requestModelPredictionData = (contractId) => {
		if(contractId !== ''){
			this.props.requestModelPredictionData(contractId)
				.then(result => {
					this.setState({ singlePrediction: result });
				}).catch(err => console.log(err));
			
		}
		
	}
	openGetPSD2DailyUpdatesPopUp = ()=>{
		if (!this.state.requestIdValue) {
			this.props.displayNotification('No Request Id Selected !', 'warning');
			return;
		}else{
			this.setState({
				isOpenGetPSD2Dialog : !this.state.isOpenGetPSD2Dialog
			})
		}
		
		
	}

	render() {

		const { classes, smeLoanRequests, bankAccounts, customer } = this.props;
		const { compOverviewData, requestBlocks, allCustomers, shouldDisableCustomerSelect, isLoadingOverviewData,
			isOpenChangeWorkflowStatusDialog, workflowData, riskAnalysisSequenceNumber, riskAnalysisSequenceNumberList, singlePrediction,
			isOpenGetPSD2Dialog } = this.state;

		//console.log('in render legalName ', this.state.legalName);
		return (
			<div className={classes.container}>
				{/* first row ====================================*/}
				<LoadingOverlay
					// @ts-ignore
					id="loader-overlay"
					active={isLoadingOverviewData}
					// spinner
					text='Loading Request Data...'>
					<Paper variant="outlined" className={classes.inputContainer}>
						<Grid className={classes.flexContainer}>
							<Grid item className={classes.smallBox}>
								{shouldDisableCustomerSelect ?
									<TextField
										InputLabelProps={{
											className: classes.autoSuggestTextLabelStyle,
											shrink: true,
										}}
										className={classes.itemStyles}
										id="customer-search-close-box"
										label="Customer *"
										value={this.state.legalName || ""}
										variant="outlined"
										fullWidth
										InputProps={{
											readOnly:true,
											className: classes.autoSuggestTextStyle,
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="clear-customer"
														onClick={() => this.setInitialState("CUSTOMER")}
														edge="end"
														size="small"
													>
														{<CloseIcon fontSize="small" />}
													</IconButton>
												</InputAdornment>
											)
										}}
									/>
									:
									<Autocomplete
										size="small"
										className={classes.itemStyles}
										ListboxProps={{
											className: classes.autoSuggestListStyle,
											shrink: true,
										}}

										value={this.state.legalName}
										onChange={(event, newValue) => {
											if (newValue) {
												this.setState({ legalName: newValue });
												this.handleCustomerSearchResult(allCustomers.find(c => c.legalName === newValue));
											}
											else {
												this.setInitialState('CUSTOMER');
											}
										}}

										onInputChange={(event, newInputValue) => {
											this.setState({ legalNameInput: newInputValue });
										}}

										id='customer-search'
										options={allCustomers.map(c => c.legalName)}
										renderInput={(params) => (
											<TextField {...params} label={'Customer *'} variant="outlined"
												InputLabelProps={{
													className: classes.autoSuggestTextLabelStyle,
												}}
												InputProps={{
													...params.InputProps,
													className: classes.autoSuggestTextStyle,
												}} />
										)}
									/>}

							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox
									type='dropdown'
									id='loan-type'
									label='Loan Type'
									name='loanType'
									value={compOverviewData.loanType}
									onChange={(name, value) => {
										this.setState({
											compOverviewData: {
												...compOverviewData,
												loanType: value,
											}
										}, () => this.getOverviewData(this.state.requestIdValue, true));
									}}
									dropDownValues={Object.keys(LoanTypes).map(key => { return { key: key, value: LoanTypes[key] }; })}
									isNoneInDropDownList={false}
								/>

							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox
									type='dropdown'
									id='frequency'
									label='Frequency'
									name='desiredDirectDebitFrequency'
									value={this.getFrequencyString(compOverviewData.desiredDirectDebitFrequency)}
									onChange={(name, value) => {
										this.setState({
											compOverviewData: {
												...compOverviewData,
												desiredDirectDebitFrequency: value,
											}
										}, () => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredDirectDebitAmount: this.dDAmountCalculation() } }); });
									}}
									dropDownValues={Object.keys(Frequency).map(key => { return { key: key, value: Frequency[key] }; })}
									isNoneInDropDownList={false}
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<CurrencyTextField
									className={classes.itemStyles}
									inputProps={{
										className: classes.currencyInputBox,
										// shrink: true
									}}
									InputLabelProps={{
										className: classes.currencyLabel,
										// style: {
										// 	fontSize: '11px',
										// 	fontFamily: 'Source Sans Pro',
										// },
										shrink: true
									}}
									id='desired-amount'
									label='Desired Amount'
									name='desiredPrincipleAmount'
									value={compOverviewData.desiredPrincipleAmount}
									onChange={(event, value) => this.handleDesiredAmountChange(value)}
									variant="outlined"
									fullWidth
									currencySymbol="€"
									decimalCharacter=","
									digitGroupSeparator="."

								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox
									id='platform'
									label='Platform'
									name='platform'
									value={compOverviewData.platform || ''}
									readOnly
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								&nbsp;
							</Grid>
						</Grid>
						{/* second row ======================================*/}
						<Grid className={classes.flexContainer}>
							<Grid item className={classes.smallBox}>
								{this.state.legalName ?
									<Autocomplete
										size="small"
										className={classes.itemStyles}
										ListboxProps={{
											className: classes.autoSuggestListStyle,
											shrink: true,
										}}
										value={this.state.requestIdValue}

										onChange={(event, newValue) => {
											if (newValue) {
												this.setState({ requestIdValue: newValue });
												this.getOverviewData(newValue, false);
											} else {
												this.setInitialState('REQUEST_ID');
											}
										}}
										inputValue={this.state.requestIdInputValue}
										onInputChange={(event, newInputValue) => {
											this.setState({ requestIdInputValue: newInputValue });
										}}
										id="request-id"
										options={smeLoanRequests}
										renderInput={(params) => (
											<TextField {...params} label="Request-Id" variant="outlined"
												InputLabelProps={{
													className: classes.autoSuggestTextLabelStyle,
												}}
												InputProps={{
													...params.InputProps,
													className: classes.autoSuggestTextStyle,
												}}
											/>
										)}
									/> :
									<CustomSearch
										label="Request-Id"
										asyncSearchType="requestId_risk_dashboard"
										name="requestId"
										value={this.state.requestIdValue}
										onChange={this.onSearch}
										onSearchResult={this.handleOnContractSearchResult}
										SearchOptions={{
											regexOption: 'i'
										}}
									/>}
							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox

									id='request-type'
									label='Request Type'
									name='requestType'
									value={compOverviewData.requestType || ''}
									readOnly
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<TextField
									InputProps={{
										className: classes.autoSuggestTextStyle,
										// shrink: true
									}}
									InputLabelProps={{
										className: classes.autoSuggestTextLabelStyle,
										shrink: true
									}}
									className={classes.itemStyles}
									id='duration'
									label='Duration'
									name='desiredDurationInMonths'
									value={compOverviewData.desiredDurationInMonths}//todo
									onChange={this.handleDurationChange}
									type="number"
									variant="outlined"
									fullWidth
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								&nbsp;
							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox
									id='status'
									label='Status'
									name='status'
									value={compOverviewData.status || ''}
									readOnly
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								&nbsp;
							</Grid>
						</Grid>
						{/* third row ===================================*/}
						<Grid className={classes.flexContainer}>
							<Grid item className={classes.smallBox}>
								{/* &nbsp; */}
								<CustomInputBox
									type='dropdown'
									id='risk-analysis-sequence-number'
									label='Sequence Number'
									name='riskAnalysisSequenceNumber'
									value={riskAnalysisSequenceNumber}
									onChange={(name, value) => {
										this.setState({ riskAnalysisSequenceNumber: value },
											() => this.handleSequenceNumberChange());
									}}
									dropDownValues={Object.keys(riskAnalysisSequenceNumberList).map(key => { return { key: key, value: riskAnalysisSequenceNumberList[key] }; })}
									// dropDownValues={Object.keys({ "0": "0", "1": "1" }).map(key => { return { key: key, value: { "0": "0", "1": "1" }[key] }; })}
									isNoneInDropDownList={false}
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox
									id='purpose'
									label='Purpose'
									name='purpose'
									value={compOverviewData.purposeIndicator || ''}
									readOnly
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<TextField
									// className= {classes.itemStyles}
									id='initial-fee'
									label='Initial Fee %'
									name='initialFee'
									variant='outlined'
									fullWidth={true}
									value={numberFormating(compOverviewData.initialFee)}
									className={classes.itemStyles}
									InputProps={{
										className: classes.autoSuggestTextStyle,
										endAdornment: <InputAdornment position="end">%</InputAdornment>,
									}}
									InputLabelProps={{
										className: classes.autoSuggestTextLabelStyle,
										shrink: true
									}}
									onChange={(e) => {
										this.setState({
											compOverviewData: {
												...compOverviewData,
												initialFee: numberFormatDutchToEnglish(e.target.value),
											}
										}, () => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredDirectDebitAmount: this.dDAmountCalculation() } }); });
									}}
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								&nbsp;
							</Grid>
							<Grid item className={classes.smallBox}>
								<CustomInputBox
									id="request-date"
									name="requestDate"
									label="Request Date"
									value={this.getRequestDateAndTime().requestDate}
									readOnly
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<Button
									style={{ marginTop: '25px',width: '80%' }}
									variant='contained'
									className={classes.addIconButton}
									onClick={this.openGetPSD2DailyUpdatesPopUp}
								>Get PSD2 daily updates</Button>
							</Grid>
						</Grid>
						{/* forth row =====================================*/}
						<Grid className={classes.flexContainer}>
							<Grid item className={classes.smallBox}>
								<TextField
									id='credit_scorecard'
									label='Credit Scorecard'
									name='credit_scorecard'
									variant='outlined'
									fullWidth={true}
									value={numberFormating(singlePrediction.probability_score ? singlePrediction.probability_score : '')}
									className={classes.itemStyles}
									InputProps={{
										className: classes.autoSuggestTextStyle,
										endAdornment: <InputAdornment position="end">%</InputAdornment>,
										readOnly: true
									}}
									InputLabelProps={{
										className: classes.autoSuggestTextLabelStyle,
										shrink: true
									}}
								/>
							</Grid>
							{/* <Grid item className={classes.smallBox}>
							<CustomInputBox
								id='riskCategory'
								label='Risk Category'
								name='riskCategory'
								value={compOverviewData.loanPurposeRisk || ''}
								readOnly
							/>
						</Grid> */}
							<Grid item className={classes.smallBox}>
								&nbsp;
							</Grid>
							<Grid item className={classes.smallBox}>
								<TextField
									id='risk-surcharge'
									label='Risk Surcharge %'
									name='riskSurcharge'
									variant='outlined'
									fullWidth={true}
									value={numberFormating(compOverviewData.riskSurcharge)}
									className={classes.itemStyles}
									InputProps={{
										className: classes.autoSuggestTextStyle,
										endAdornment: <InputAdornment position="end">%</InputAdornment>,
									}}
									InputLabelProps={{
										className: classes.autoSuggestTextLabelStyle,
										shrink: true
									}}
									onChange={(e) => {
										this.setState({
											compOverviewData: {
												...compOverviewData,
												riskSurcharge: numberFormatDutchToEnglish(e.target.value),
											}
										}, () => { this.setState({ compOverviewData: { ...this.state.compOverviewData, desiredDirectDebitAmount: this.dDAmountCalculation() } }); });
									}}
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<CurrencyTextField
									className={classes.itemStyles}
									inputProps={{
										className: classes.currencyInputBox,
										// shrink: true
									}}
									InputLabelProps={{
										className: classes.currencyLabel,
										shrink: true
									}}
									id='dd-amount'
									label='DD Amount'
									name='desiredDirectDebitAmount'
									value={compOverviewData.desiredDirectDebitAmount}
									onChange={(event, value) => this.handleDdAmountChange(value)}
									variant="outlined"
									fullWidth
									currencySymbol="€"
									decimalCharacter=","
									digitGroupSeparator="."
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<TextField
									InputProps={{
										className: classes.autoSuggestTextStyle,
										readOnly: true
									}}
									InputLabelProps={{
										className: classes.autoSuggestTextLabelStyle,
										shrink: true,
									}}
									className={classes.itemStyles}
									id="request-time"
									label="Request Time"
									name="requestTime"
									value={this.getRequestDateAndTime().requestTime}
									variant="outlined"
									fullWidth
									error={this.isErrorRequestTime(this.getRequestDateAndTime().requestTime)}
								/>
							</Grid>
							<Grid item className={classes.smallBox}>
								<Button
									style={{ marginTop: '25px',width: '80%' }}
									variant='contained'
									className={classes.addIconButton}
									onClick={this.setWorkflowStatusChangeData}
								>Ask For Additional Information</Button>
							</Grid>
						</Grid>
					</Paper>
				</LoadingOverlay>
				{/* table section ===============================*/}
				
				<GridContainer>				
					<GridItem item md={12}>
						<div className={classes.header} >
						<Typography id="tableTitle" component="div" className={classes.tabHeaderLabel}>Accounts</Typography>
							<Tabs
								value={this.state.tabIndex}
								onChange={this.handleTabIndexChangeAccount}
								variant="scrollable"
								scrollButtons="auto"
								//classes={{ indicator: classes.tabsFormat }}		
								classes={{
									indicator: classes.tabIndicator
								}}													
								style={{ float: 'right'}}
								>
								<Tab label='1 Month'  id='crd-tab-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
								<Tab label='6 Months' id='crd-tab-1' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
								<Tab label='1 Year'   id='crd-tab-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
								<Tab label='All' 	    id='crd-tab-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>								
							</Tabs>										
						</div>

						<TableContainer component={Paper} className={classes.tableContainer}>
							<Table className={classes.table} aria-label="simple table">
								<TableHead className={classes.tableHeadColor}>
									<TableRow >
										<TableCell className={classes.tableCell}>&nbsp;</TableCell>
										<TableCell className={classes.tableCell} align="left">IBAN</TableCell>
										<TableCell className={classes.tableCell} align="left">Currency</TableCell>
										<TableCell className={classes.tableCell} align="left">Account-Type</TableCell>
										<TableCell className={classes.tableCell} align="left">Revenue</TableCell>
										<TableCell className={classes.tableCell} align="left">First-Date</TableCell>
										<TableCell className={classes.tableCell} align="left">Last-Date</TableCell>
										{/* <TableCell className={classes.tableCell} align="left">Initial-Loan-Request-Start-Date</TableCell>
										<TableCell className={classes.tableCell} align="left">Initial-Loan-Request-End-Date</TableCell> */}
									</TableRow>
								</TableHead>
								<TableBody>
									{bankAccounts && bankAccounts.length === 0 ?

										<TableRow>
											<TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={7}>{/*need to update colSpan={7} if we add last 2 cells*/}
												{'No Accounts to show'}
											</TableCell>
										</TableRow>

										:

										bankAccounts && bankAccounts.map((acc, index) =>
											<TableRow key={index} >
												<TableCell className={classes.tableCell}>
													<Checkbox
														checked={this.checkForDefaultSelect(acc.iban)}
														onChange={(e) => this.handleBlockTableChange(e, acc)}
														color="default"
														inputProps={{ 'aria-label': 'checkbox with default color' }}
													/>
												</TableCell>
												<TableCell className={classes.tableCell} align="left">{acc.iban}</TableCell>
												<TableCell className={classes.tableCell} align="left">{acc.currency}</TableCell>
												<TableCell className={classes.tableCell} align="left">{acc.accountType}</TableCell>
												<TableCell className={classes.tableCell} align="left">{EURO(acc.turnOver)}</TableCell>
												<TableCell className={classes.tableCell} align="left">{moment(acc.firstDate).format('DD-MM-YYYY')}</TableCell>
												<TableCell className={classes.tableCell} align="left">{moment(acc.lastDate).format('DD-MM-YYYY')}</TableCell>
												{/* <TableCell className={classes.tableCell} align="left">{moment(acc.initialLoanRequestStartDate).format('DD-MM-YYYY')}</TableCell>
												<TableCell className={classes.tableCell} align="left">{moment(acc.initialLoanRequestEndDate).format('DD-MM-YYYY')}</TableCell> */}
											</TableRow>
										)}
								</TableBody>
							</Table>
						</TableContainer>
					</GridItem>
				
				</GridContainer>
				{/* charts section =============================*/}
				{
				requestBlocks && requestBlocks.length > 0 && 
					<ChartBoxContainer requestId={this.state.requestIdValue} requestBlocks={requestBlocks} ibanNumberList={requestBlocks.map(el => el.iban)} ddAmount={Number(compOverviewData.desiredDirectDebitAmount)} />
				}
				{/* ==================== change workflow status dialog stuff =============== */}

				< Dialog
					open={isOpenChangeWorkflowStatusDialog}
					onClose={this.handleChangeWorkflowStatusDialog}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
					fullWidth
				>
					<ChangeWorkflowStatusPopUp workflowData={workflowData} handleChangeWorkflowStatusDialog={this.handleChangeWorkflowStatusDialog} />
				</Dialog >

                < Dialog
					open={isOpenGetPSD2Dialog}
					onClose={this.openGetPSD2DailyUpdatesPopUp}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
					fullWidth
				>
					<GetPsdDailyUpdatesPopup handleChangeGetPSD2DailyUpdatesDialog={this.openGetPSD2DailyUpdatesPopUp} customerId={customer.id} />
				</Dialog >
			</div>
		);
	}
}

CreditManagementCharts.propTypes = {
	classes: PropTypes.object.isRequired,
	getCustomerAddressContact: PropTypes.func,
	clearCustomerDetails: PropTypes.func,
	clearSmeLoanRequests: PropTypes.func,
	clearBankAccounts: PropTypes.func,
	clearSmeLoanRequestDetails: PropTypes.func,
	customer: PropTypes.object,
	overviewData: PropTypes.object,
	pricingParameter: PropTypes.object,
	getSmeLoanRequests: PropTypes.func,
	smeLoanRequests: PropTypes.array,
	getSmeLoanRequestDetails: PropTypes.func,
	getStandardLoanPricingParameter: PropTypes.func,
	getBankAccounts: PropTypes.func,
	bankAccounts: PropTypes.array,
	searchCustomer: PropTypes.func,
	displayNotification: PropTypes.func.isRequired,
	setRequestBlocksGlobally: PropTypes.func,
	setHeaderDisplayMainData: PropTypes.func,// dashboard Items change
	clearHeaderDisplaySubData: PropTypes.func,// dashboard Items change
	setHeaderDisplaySubData: PropTypes.func,// dashboard Items change
	dashbordNavigationStatus: PropTypes.bool,
	importedLoanRequestContractId:  PropTypes.string,
	setImportedLoanRequestContractId: PropTypes.func, 
	getBankAccountsByPeriod: PropTypes.func,
	setTabNameForChart: PropTypes.func,
	requestModelPredictionData: PropTypes.func

};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	smeLoanRequests: state.creditRiskOverview.smeLoanRequests,
	overviewData: state.lmglobal.overviewData,
	importedLoanRequestContractId: state.lmglobal.importedLoanRequestContractId,
	pricingParameter: state.creditRiskOverview.pricingParameter,
	bankAccounts: state.creditRiskOverview.bankAccounts,
	selectedRequestBlocks: state.creditRiskOverview.selectedRequestBlocks,
	selectedMyTaskContractId: state.processDashboard.selectedMyTaskContractId,
	dashbordNavigationStatus: state.user.dashbordNavigationStatus
});

const mapDispatchToProps = (dispatch) => ({
	getCustomerAddressContact: (customerId, legalName) => dispatch(getCustomerAddressContact(customerId, legalName)),
	clearCustomerDetails: () => dispatch(clearCustomerDetails()),
	clearSmeLoanRequests: () => dispatch(clearSmeLoanRequests()),
	clearBankAccounts: () => dispatch(clearBankAccounts()),
	clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails()),
	getSmeLoanRequests: (requestQuery) => dispatch(getSmeLoanRequests(requestQuery)),
	getSmeLoanRequestDetails: (requestQuery) => dispatch(getSmeLoanRequestDetails(requestQuery)),
	getStandardLoanPricingParameter: (requestQuery) => dispatch(getStandardLoanPricingParameter(requestQuery)),
	getBankAccounts: (requestQuery) => dispatch(getBankAccounts(requestQuery)),
	searchCustomer: (key, value, criteria, customerId, options) => dispatch(searchCustomer(key, value, criteria, customerId, options)),
	displayNotification: (message, type) => dispatch(displayNotification(message, type)),
	getCustomerDetails: (requestQuery) => dispatch(getCustomerDetails(requestQuery)),
	setRequestBlocksGlobally: (requestBlocksList) => dispatch(setRequestBlocksGlobally(requestBlocksList)),
	setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),// dashboard Items change
	setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),// dashboard Items change
	clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),// dashboard Items change
	setImportedLoanRequestContractId: (id) => dispatch(setImportedLoanRequestContractId(id)),
	getBankAccountsByPeriod: (requestQuery) => dispatch(getBankAccountsByPeriod(requestQuery)),
	setTabNameForChart: (tabName, tabValue) => dispatch(setTabNameForChart(tabName, tabValue)),
	requestModelPredictionData: (contractId) => dispatch(requestModelPredictionData(contractId))

});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(CreditManagementCharts));