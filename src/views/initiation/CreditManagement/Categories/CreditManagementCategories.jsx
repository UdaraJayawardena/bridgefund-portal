// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import {
	Checkbox, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
	Paper, IconButton, TextField, Grid, Fab, Dialog, DialogActions, DialogContent, Button, 
	Tabs, Tab, Typography} from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { clearTransactionsForInternalTypes, getAllBankTransactionsForCategoryPage, getAllBankTransactionsForSerchedValue,
	getBankAccountsByPeriod, setTabNameForChart } from 'store/initiation/actions/CreditRiskOverview.action';
import CategoryBlock from './CategoryBlock';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import { setHeaderDisplayMainData, setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import { getCustormerFirstStakeholderPersonName } from 'store/crm/actions/StakeholderOverview.action';
import { EURO } from 'lib/initiation/utility';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import SearchedTransactionBlock from './SearchedTransactionBlock';
import CheckTransactionOverview from '../CheckTransactions/CheckTransactionOverview';

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
class CreditManagementCategories extends Component {

	constructor(props) {
		super(props);
		
		this.state = {
			requestBlocks: [],
			isLoadingOutgoingBlock: false,
			isLoadingIncomingBlock: false,
			showSearchBar: false,
			seachValue: '',
			personName: '',
			isCheckBankTransactionPopUpOpen: false,

			incommingSearchedTransactions: [],
			outgoingSerchedTransactions: [],

			newSearchValue: '',
			isCategoryTypeMachineLearning: true,			
      tabIndex: '',
		};
		
	}

	componentDidMount() {		
		this.getCustormerFirstStakeholderPersonName(this.props.customer);
		this.setState({ tabIndex:this.props.tabValue, requestBlocks: this.props.selectedRequestBlocks && this.props.selectedRequestBlocks.length === 0 ? [] : this.props.selectedRequestBlocks }, () => this.getInitialdata());
	}

	getInitialdata = () => {
		const { requestBlocks, isCategoryTypeMachineLearning } = this.state;
		const categoryType = isCategoryTypeMachineLearning ? 'CATEGORY_TYPE_MACHINE_LEARNING' : 'CATEGORY_TYPE_RULES_ENGINE';

		if (requestBlocks.length > 0) {
			const period = this.getPeriodByTabId(this.props.tabValue);
			this.props.getAllBankTransactionsForCategoryPage(requestBlocks.map(acc => {
				return {
					"action": "GET",
					"ibanNumber": acc.iban,
					"startDate": acc.firstDate,
					"endDate": acc.lastDate,
					"period": period
				};
			}), 'categories', categoryType);
		}
		else {
			this.props.getAllBankTransactionsForCategoryPage([]);
		}
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
		this.setState({ requestBlocks: array }, () => this.getInitialdata());
	}

	removeElement = (block) => {
		const array = [...this.state.requestBlocks];
		const index = array.indexOf(block);
		if (index !== -1) {
			array.splice(index, 1);
			this.setState({ requestBlocks: array }, () => this.getInitialdata());
		}
	}

	checkForDefaultSelect = (iban) => {
		return this.props.selectedRequestBlocks.find(item => item.iban === iban) ? true : false;
	}

	// this function get customer first stakeholder person name as (initial name prifix surname)
	getCustormerFirstStakeholderPersonName = (customerDetails) => {

		let customerPersonName = '';
		if (customerDetails._id) {
			// customer available
			this.props.getCustormerFirstStakeholderPersonName(customerDetails._id)
				.then((response) => {

					customerPersonName = response;
					this.setState({ personName: customerPersonName });
				})
				.catch(() => {

					customerPersonName = '';
					this.setState({ personName: customerPersonName });
				});
		}
		this.setState({ personName: customerPersonName });
	}


	// search transactions
	searchTransactions = () => {
		const { requestBlocks } = this.state;
		if (this.state.seachValue && requestBlocks.length > 0) {
			const period = this.getPeriodByTabId(this.props.tabValue);
			// search values available so send serch request
			this.props.getAllBankTransactionsForSerchedValue(requestBlocks.map(acc => {
				return {
					"ibanNumber": acc.iban,
					"startDate": acc.firstDate,
					"endDate": acc.lastDate,
					"searchValue": this.state.seachValue,
					"period": period
				};
			})).then((response) => {
				this.setState({
					incommingSearchedTransactions: response.incommingSearchedTransactions,
					outgoingSerchedTransactions: response.outgoingSerchedTransactions,
					newSearchValue: this.state.seachValue
				});
			})
				.catch(() => {

					this.setState({
						incommingSearchedTransactions: [],
						outgoingSerchedTransactions: [],
						newSearchValue: this.state.seachValue
					});
				});

		} else {
			this.setState({ incommingSearchedTransactions: [], outgoingSerchedTransactions: [] });
		}
	}

	getSearchedTransactionsdata = () => {
		const { requestBlocks } = this.state;
		if (this.state.seachValue && requestBlocks.length > 0) {
			const period = this.getPeriodByTabId(this.props.tabValue);
			// search values available so send serch request
			this.props.getAllBankTransactionsForSerchedValue(requestBlocks.map(acc => {
				return {
					"ibanNumber": acc.iban,
					"startDate": acc.firstDate,
					"endDate": acc.lastDate,
					"searchValue": this.state.seachValue,
					"period": period
				};
			})).then((response) => {
				this.setState({
					incommingSearchedTransactions: response.incommingSearchedTransactions,
					outgoingSerchedTransactions: response.outgoingSerchedTransactions,

				}, () => this.getInitialdata());
			})
				.catch(() => {

					this.setState({
						incommingSearchedTransactions: [],
						outgoingSerchedTransactions: []
					}, () => this.getInitialdata());
				});

		} else {
			this.setState({ incommingSearchedTransactions: [], outgoingSerchedTransactions: [] }, () => this.getInitialdata());
		}
	}

	handleSearch = (e) => {
		if (e.key === 'Enter' && this.state.seachValue) {
			this.searchTransactions();
		}

	}

	handleChangeCategoryTypeSwitch = () => {
		this.setState((prevState) => ({ isCategoryTypeMachineLearning: !prevState.isCategoryTypeMachineLearning }), () => this.getInitialdata());
	}

	handleCheckCategoriesButtonClick = (status) => {
		// console.log('handleCheckCategoriesButtonClick');
		this.setState({ isCheckBankTransactionPopUpOpen: status });
	}

	handleTabIndexChangeAccountCategory = (e, value) => {
		let period_code ='';
		let tabValue = 0;
		let tabName = '';

		switch (value){
			case 0:
				period_code="1m";
				tabValue = 1;
				tabName = '1 Month';
				break;
			case 1:
				period_code="6m";
				tabValue = 6;
				tabName = '6 Months';
				break;
			case 2:
				period_code="1y";
				tabValue = 12;
				tabName = '1 Year';
				break;
			default:
				period_code="all";
				tabValue = -1;
				tabName = 'All';
				break;
		}
		const requestObj = {
			smeLoanRequestId: this.props.overviewData.contractId,
			riskAnalysisSequenceNumber: this.state.riskAnalysisSequenceNumber,
			period: period_code,
		};
		this.props.getBankAccountsByPeriod(requestObj);
		
		this.getTransactionData(tabValue);

    this.setState({tabIndex: value});

		this.setTabName(tabName, value);
	};

	setTabName = (tab, value) => {
		this.props.setTabNameForChart(tab, value);
	}

	getTransactionData = (period) => {
		const { requestBlocks, isCategoryTypeMachineLearning } = this.state;
		const categoryType = isCategoryTypeMachineLearning ? 'CATEGORY_TYPE_MACHINE_LEARNING' : 'CATEGORY_TYPE_RULES_ENGINE';
		
		if (requestBlocks.length > 0) {
			this.props.getAllBankTransactionsForCategoryPage(requestBlocks.map(acc => {
				return {
					"action": "GET",
					"ibanNumber": acc.iban,
					"startDate": acc.firstDate,
					"endDate": acc.lastDate,
					"period": period
				};
			}), 'categories', categoryType);
		}
		else {
			this.props.getAllBankTransactionsForCategoryPage([]);
		}
	}

	getPeriodByTabId = (value) => {
		let period = '';
		switch (value){
			case 0:
				period = 1;
				break;
			case 1:
				period = 6;
				break;
			case 2:
				period = 12;
				break;
			default:
				period = -1;
				break;				
		}
		return period;
	}

	render() {

		const { classes, bankAccounts, incomingTransactionData, outgoingTransactionData, } = this.props;
		const { isCategoryTypeMachineLearning, isCheckBankTransactionPopUpOpen } = this.state;

		return (
			<div >				
				{/* table section ===============================*/}
				<GridContainer >					
				  <GridItem item md={12}>
						<div className={classes.header} >			
							<Typography id="tableTitle" component="div" className={classes.tabHeaderLabel}>Accounts</Typography>
							<Tabs
								value={this.state.tabIndex}
								onChange={this.handleTabIndexChangeAccountCategory}
								variant="scrollable"
								scrollButtons="auto"
								classes={{
									indicator: classes.tabIndicator
								}}													
								style={{ float: 'right'}}
								>
								<Tab label='1 Month'  id='crd-acc-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
								<Tab label='6 Months' id='crd-acc-1' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
								<Tab label='1 Year'   id='crd-acc-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
								<Tab label='All' 	    id='crd-acc-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>								
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
										<TableCell align="right" className={classes.tableCell} style={{ width: "20%" }}>

									{(!this.state.showSearchBar) ?
										<IconButton aria-label="search" onClick={() => { this.setState({ showSearchBar: true }); }}>
											<SearchIcon />
										</IconButton>
										: false
									}
									{(this.state.showSearchBar) ?
										<>
											<Grid
												container
												direction="row"
												justifycontent="center"
												alignItems="center"
												spacing={0}
											>
												<Grid item >
													<TextField
														variant="outlined"
														id="standard-search"
														label="Search"
														type="search"
														size="small"
														value={this.state.seachValue}
														fullWidth
														// style={{marginLeft:"5px"}}
														onChange={(e) => { this.setState({ seachValue: e.target.value }); }}
														onKeyPress={(e) => { this.handleSearch(e); }}
													/>
												</Grid>
												<Grid item >
													<IconButton size="small" color="primary" aria-label="search" onClick={() => { this.searchTransactions(); }} disabled={!this.state.seachValue}>
														<SearchIcon />
													</IconButton>
												</Grid>
												<Grid item >
													<IconButton size="small" color="secondary" aria-label="close" onClick={() => {
														this.setState({
															showSearchBar: false,
															seachValue: '',
															incommingSearchedTransactions: [],
															outgoingSerchedTransactions: []
														});
													}}>
														<CloseIcon />
													</IconButton>
												</Grid>


											</Grid>
										</>





										:
										false
									}

								</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{bankAccounts && bankAccounts.length === 0 ?

										<TableRow>
											<TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={7}>
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
												
											</TableRow>
										)}
								</TableBody>
							</Table>
						</TableContainer>
					</GridItem>
				</GridContainer>
				{/* ======================= transaction blocks ========================== */}
				{(!this.state.showSearchBar) ?
					<GridContainer>
						{/* ======================= outgoing transaction block ========================== */}
						<GridItem xs={6} sm={6} lg={6}>
							<CategoryBlock dataList={outgoingTransactionData.transactionList}
								title="Outgoing Transactions"
								totalAmount={outgoingTransactionData.totalAmount}
								getInitialdata={this.getInitialdata}
								shouldShowCategoryTypeSwitch={true}
								isCategoryTypeMachineLearning={isCategoryTypeMachineLearning}
								changeCategoryType={this.handleChangeCategoryTypeSwitch} />
						</GridItem>
						{/* ======================= incoming transaction block ========================== */}
						<GridItem xs={6} sm={6} lg={6}>
							<CategoryBlock dataList={incomingTransactionData.transactionList}
								title="Incoming Transactions"
								totalAmount={incomingTransactionData.totalAmount}
								getInitialdata={this.getInitialdata}
								shouldShowCategoryTypeSwitch={false} />
						</GridItem>

					</GridContainer>
					:

					<GridContainer>
						<GridItem xs={6} sm={6} lg={6}>
							<SearchedTransactionBlock dataList={this.state.outgoingSerchedTransactions}
								title="Outgoing Transactions"
								totalAmount={outgoingTransactionData.totalAmount}
								newSearchValue={this.state.newSearchValue}
								getSearchedTransactionsdata={this.getSearchedTransactionsdata} />
						</GridItem>
						<GridItem xs={6} sm={6} lg={6}>
							<SearchedTransactionBlock dataList={this.state.incommingSearchedTransactions}
								title="Incoming Transactions"
								totalAmount={incomingTransactionData.totalAmount}
								newSearchValue={this.state.newSearchValue}
								getSearchedTransactionsdata={this.getSearchedTransactionsdata} />
						</GridItem>
					</GridContainer>
				}
				<Fab variant='extended' className={classes.checkCategoriesBtn} onClick={() => this.handleCheckCategoriesButtonClick(true)} >Check Categories</Fab>
				{/* ============ check transactions popup content =============== */}

				<Dialog
					open={isCheckBankTransactionPopUpOpen}
					onClose={() => this.handleCheckCategoriesButtonClick(false)}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
					fullWidth
					maxWidth={'lg'}
				>
					<DialogContent>
						<CheckTransactionOverview />
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.handleCheckCategoriesButtonClick(false)} autoFocus>
							close
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}

	componentWillUnmount() {
		this.props.clearTransactionsForInternalTypes();
	}
}

CreditManagementCategories.propTypes = {
	classes: PropTypes.object.isRequired,
	setCustomerDetails: PropTypes.func,
	clearCustomerDetails: PropTypes.func,
	customer: PropTypes.object,
	overviewData: PropTypes.object,
	pricingParameter: PropTypes.object,
	getSmeLoanRequests: PropTypes.func,
	smeLoanRequests: PropTypes.array,
	getSmeLoanRequestDetails: PropTypes.func,
	getStandardLoanPricingParameter: PropTypes.func,
	getBankAccounts: PropTypes.func,
	bankAccounts: PropTypes.array,
	incomingTransactionData: PropTypes.object,
	outgoingTransactionData: PropTypes.object,
	clearTransactionsForInternalTypes: PropTypes.func,
	getBankAccountsByPeriod: PropTypes.func,
	tabValue: PropTypes.number,
	setTabNameForChart: PropTypes.func,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	smeLoanRequests: state.creditRiskOverview.smeLoanRequests,
	overviewData: state.lmglobal.overviewData,
	pricingParameter: state.creditRiskOverview.pricingParameter,
	bankAccounts: state.creditRiskOverview.bankAccounts,
	incomingTransactionData: state.creditRiskOverview.incomingTransactionData,
	outgoingTransactionData: state.creditRiskOverview.outgoingTransactionData,
	selectedRequestBlocks: state.creditRiskOverview.selectedRequestBlocks,
	selectedTabData: state.user.selectedTabData,
	tabValue: state.creditRiskOverview.tabValueForAccount
});

const mapDispatchToProps = (dispatch) => ({
	// setCustomerDetails: (requestQuery) => dispatch(setCustomerDetails(requestQuery)),
	getAllBankTransactionsForCategoryPage: (dataList, origin, categoryType) => dispatch(getAllBankTransactionsForCategoryPage(dataList, origin, categoryType)),
	getAllBankTransactionsForSerchedValue: (dataList) => dispatch(getAllBankTransactionsForSerchedValue(dataList)),
	getCustormerFirstStakeholderPersonName: (customer_id) => dispatch(getCustormerFirstStakeholderPersonName(customer_id)),
	clearTransactionsForInternalTypes: () => dispatch(clearTransactionsForInternalTypes()),
	// getSmeLoanRequestDetails: (requestQuery) => dispatch(getSmeLoanRequestDetails(requestQuery)),
	// getStandardLoanPricingParameter: (requestQuery) => dispatch(getStandardLoanPricingParameter(requestQuery)),
	// getBankAccounts: (requestQuery) => dispatch(getBankAccounts(requestQuery)),
	setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),// dashboard Items change
	setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),// dashboard Items change
	getBankAccountsByPeriod: (requestQuery) => dispatch(getBankAccountsByPeriod(requestQuery)),
	setTabNameForChart: (tabName, tabValue) => dispatch(setTabNameForChart(tabName, tabValue)),

});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(CreditManagementCategories));