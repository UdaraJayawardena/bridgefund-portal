// @ts-nocheck
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import { Grid, Paper, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Loader from 'components/loanmanagement/CustomLoader/Loader.jsx';
import FlexStatusOverview from './FlexLoanComponents/FlexStatusOverview';
import FixedStatusOverview from './FixedLoanComponents/FIxedStatusOverview';
import FinancialAndEarningOverview from './FlexLoanComponents/FinancialAndEarningOverview';
import FeesAndOtherDataOverview from './FlexLoanComponents/FeesAndOtherDataOverview';
import FlexLoanButtonSection from './FlexLoanComponents/FlexLoanButtonSection';
import FixedLoanButtonSection from './FixedLoanComponents/FixedLoanButtonSection';
import AmountOverview from './FixedLoanComponents/AmountOverview';
import InterestAndFinanceOverview from './FixedLoanComponents/InterestAndFinanceOverview';
import DDOverview from './FixedLoanComponents/DDOverview';
import customStyles from 'assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle';

import { getSmeLoanHistoriesByContractId, clearSmeLoanHistories } from "store/loanmanagement/actions/SmeLoanHistory";
import { getSingleLoanOverviewData, clearSelectedLoan, clearCalculatedDataOfLoanTransactions, requestSmeLoans, getSmeLoansByQuery, selectLoan } from "store/loanmanagement/actions/SmeLoans";
import { changeCustomerDetails, clearHeaderDisplayMainData, clearHeaderDisplaySubData,
         clearSelectedCustomer ,setHeaderDisplayMainData, setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import Notifier from 'components/initiation/Notification/Notifier';
import { setDashbordNavigationStatus, setNavigationInDashboards } from 'store/initiation/actions/login';
import { getLocales } from 'store/initiation/actions/Configuration.action';
import CustomSearch from 'components/crm/CustomInput/CustomSearch';
import { getCustomerListPerPage } from 'store/crm/actions/Customer.action';


const LOAN_TYPES = {
    FLEX_LOAN: 'flex-loan',
    FIXED_LOAN: 'fixed-loan'
};

class IntegratedSingleLoanOverview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contractIdValue: '',
            contractIdInputValue: '',
            contractIdList: [],
            companyNameValue: '',
            isLoadingLoanData: true,
            locale: '',
            symbol: '',
            thousandSeparator: '',
            decimalSeparator: ''
        };
    }
    componentDidMount() {
        // to check url contract-id existance ==> fill data for contract-id and customer-details
        const { match, isDashboardContent, lmContractSysId, customerDetails } = this.props;
        const params = match ? match.params : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept
        const contractId = params && params.contractId ? params.contractId : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept
        //if contractId in url or store
        if (contractId && customerDetails.company) {
            this.setState({
                contractIdValue: contractId,
                contractIdInputValue: contractId,
                companyNameValue: customerDetails.company,
                companyNameInputValue: customerDetails.company,
            });
            this.setContractIdData(contractId);
            this.props.setHeaderDisplaySubData(` - ${customerDetails.company} - ${contractId}`);
            return;
        }

        //if contractId in url or store
        if (contractId && !customerDetails.company) {
            this.setState({
                contractIdValue: contractId,
                contractIdInputValue: contractId,
            });
            this.setContractIdData(contractId);
            return;
        }

        //set all contracts related to customer
        if (customerDetails.accountNo && !contractId) {
            this.clearContract(customerDetails.accountNo);
            this.setState({
                companyNameValue: customerDetails.company,
                companyNameInputValue: customerDetails.company,
            });
            this.props.setHeaderDisplaySubData(` - ${customerDetails.company}`);
            return;
        }

        // if no customer or contract-id ==> set all contract-ids we got in system
        if (!customerDetails.accountNo && !contractId) {
            this.clearCustomer();
            return;
        }
    }

    componentDidUpdate(prevProps) {
        window.onpopstate = (e) => {
            this.props.setDashbordNavigationStatus(true);
        };

        const { lmContractSysId, isDashboardContent } = this.props;
        const params = this.props.match ? this.props.match.params : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept

        const preContractId = prevProps.match ? prevProps.match.params.contractId : (prevProps.isDashboardContent ? prevProps.lmContractSysId : null);// DashboardTabConcept

        const contractId = params && params.contractId ? params.contractId : (isDashboardContent ? lmContractSysId : null);// DashboardTabConcept
        
        if (preContractId && contractId && preContractId !== contractId) {

            this.setState({ contractIdValue: contractId, contractIdInputValue: contractId },
                () => this.setContractIdData(contractId));
        }
        if (preContractId === '' && contractId && preContractId !== contractId) {

            this.setState({ contractIdValue: contractId, contractIdInputValue: contractId },
                () => this.setContractIdData(contractId));
        }
    }

    setLoading = (status) => {
        this.setState({ isLoadingLoanData: status });
    }

    setContractIdData = (contractId) => {
        // this.props.setHeaderDisplayMainData();
        const { customerDetails } = this.props;
        this.props.setHeaderDisplaySubData(customerDetails.company ? ` - ${customerDetails.company} - ${contractId}` : '');
        this.setLoading(true);
        // this.props.getCalculatedDataOfLoanTransactions(contractId);// need to add same func by type checking
        // this.props.getFlexLoanOverviewData(contractId);// need to add same func by type checking
        this.props.getLoanDetails(contractId);
        this.props.getSmeLoanHistoriesByContractId(contractId);
        this.getLocales();
        if (customerDetails.accountNo) {
            this.setState({
                companyNameValue: customerDetails.company,
                companyNameInputValue: customerDetails.company,
            });
            //check is there any customer selected already in store
            this.props.getLoanDetails(contractId);//also set smeDetails in store
            this.setLoading(false);
            this.props.setHeaderDisplaySubData(` - ${customerDetails.company} - ${contractId}`);
            return;
        }
        this.props.getLoanDetails(contractId)//also set smeDetails in store
            .then(res => {//need to set contract and customer data in store
                this.setState({//set legalName of current contract holder
                    companyNameValue: res.sme.company,
                    companyNameInputValue: res.sme.company,
                });
                
                // this.props.setHeaderDisplayMainData(res.sme.company);
                this.props.setHeaderDisplaySubData(` - ${res.sme.company} - ${contractId}`);

                this.props.requestSmeLoans(res.sme.accountNo)
                    .then(res => {// set current customer all loans to drop down
                        this.setState({ contractIdList: res.map(loan => loan.contractId) });
                        this.setLoading(false);
                    })
                    .catch(e => {
                        console.log('error in requestSmeLoans ', e);
                        this.setLoading(false);
                    });
            })
            .catch(e => {
                console.log('error in getLoanDetails ', e);
                this.setLoading(false);
            });
        return;


    }

    clearCustomer = () => {//set all customers and set all loans
        this.setLoading(true);
        //header data clearing
        // this.props.setHeaderDisplayMainData('Single-Loan');
        this.props.clearHeaderDisplaySubData();

        this.props.getSmeLoansByQuery({}, ['contractId'])
            .then(res => {
                this.setState({
                    contractIdList: res.map(contract => contract.contractId),
                    companyNameValue: '',
                    companyNameInputValue: '',
                    contractIdValue: '',
                    contractIdInputValue: '',
                }, () => {
                    this.props.clearSelectedLoan();
                    this.props.clearSelectedCustomer();
                    this.setLoading(false);
                });
                //need to clear customer and loan data in store
            })
            .catch(e => {
                console.log('error in getSmeLoansByQuery ', e);
                this.setLoading(false);
            });
    }

    clearContract = (accountNo = null) => {//only if clear the contract field // set all contracts related to current customer        
        const { customerDetails } = this.props;
        this.setLoading(true);
        //need to set contract data if customer got only one contract
        const customerId = accountNo ? accountNo : customerDetails.accountNo;


        if (customerId) {
            const legalNameHeader = customerDetails.company;
            if (legalNameHeader)
                this.props.setHeaderDisplaySubData(` - ${legalNameHeader}`);

            this.props.requestSmeLoans(customerId)
                .then(res => {
                    if (res.length === 1) {
                        const singleContractId = res[0].contractId;// the only one contract current customer got
                        this.props.displayNotification('Customer has only one contract', 'success');
                        this.setState({
                            contractIdList: res.map(loan => loan.contractId),
                            contractIdValue: singleContractId,
                            contractIdInputValue: singleContractId,
                        }, () => this.setContractIdData(singleContractId));
                    }
                    else {
                        this.setState({
                            contractIdList: res.map(loan => loan.contractId),
                            contractIdValue: '',
                            contractIdInputValue: '',
                        }, () => {
                            this.props.clearSelectedLoan();
                        });
                    }
                    this.setLoading(false);
                })
                .catch(e => {
                    console.log('error in requestSmeLoans ', e);
                    this.setLoading(false);
                });
        }
        else {
            this.props.clearHeaderDisplaySubData();
            this.setState({
                contractIdValue: '',
                contractIdInputValue: '',
            }, () => {
                this.props.clearSelectedLoan();
            });
            this.setLoading(false);
        }
    }

    get handleGetCustomerListPerPage() {
        return getCustomerListPerPage(1, 1, { legalName: this.state.companyNameValue });
    }

    handleCustomerSelection = (customer) => {
        if (!customer) {
            //set all contracts and all customers
            this.clearCustomer();
            return;
        }

        this.handleGetCustomerListPerPage()
        .then((res) => {
          const { customersList } = res;
          if (customersList && customersList.length > 0) {
            const selectedCustomer = customersList[0];
            this.props.setHeaderDisplaySubData(` - ${customer.legalName}`);
            this.props.changeCustomerDetails(selectedCustomer);
            this.clearContract(selectedCustomer.id);
          }
        });
    }

    handleContractSelection = () => {
        const { contractIdInputValue } = this.state;
        this.setContractIdData(contractIdInputValue);
    }

    getLocales = async () => {
        const { loan } = this.props;

        if (loan.country && loan.currency) {
            this.props.getLocales({countryCode: loan.country, currencyCode: loan.currency})
                .then(res => {
            if (!res || res.length === 0) {
              return this.props.displayNotification('Country and currency doesnt fit', 'warning');
            }
            this.setState({ 
                locale: res[0].locale,
                decimalSeparator: res[0].decimalSeparator,
                symbol: res[0].currencySymbol,
                thousandSeparator: res[0].thousandSeparator, 
            });
            })
            .catch(err => { console.log('getLocales err ', err); });
        }    
      }


    render() {

        const { classes, loan, overview, calculatedDataOfLoanTransactions, customerDetails,
            isDashboardContent, selectedDashboardItems, setNavigationInDashboards, selectLoan } = this.props;
        const { companyNameValue, contractIdValue, contractIdInputValue, contractIdList, isLoadingLoanData, locale, symbol, decimalSeparator, thousandSeparator } = this.state;
        const overviewDataForLoan = loan.type === LOAN_TYPES.FLEX_LOAN ? overview : calculatedDataOfLoanTransactions;
   
        return (
            <div>
                {isDashboardContent?false:<Notifier />}
                <Loader open={isLoadingLoanData} />
                <Grid container >
                    <Grid item xs={6}>
                        <Paper className={classes.topPaper} variant="outlined">
                            <Grid container spacing={3} className={classes.boxMargin} >
                                <Grid item xs={5}>
                                    <CustomSearch
                                        id='company-name-search'
                                        label='Company Name *'
                                        placeholder='Dream Beers B.V.'
                                        changeToFormatType='FirstCap'
                                        name='legalName'
                                        asyncSearchType='customer'
                                        value={companyNameValue}
                                        onChange={(event, newInputValue) => {
                                            if (!newInputValue || newInputValue === '') {
                                                this.setState({ companyNameValue: '' });
                                                this.handleCustomerSelection(null);
                                                return;
                                            }
                                            this.setState({ companyNameValue: newInputValue });
                                        }}
                                        onSearchResult={(newValue) => {
                                            if (newValue) {
                                                this.setState({ companyNameValue: newValue.legalName },
                                                    () => this.handleCustomerSelection(newValue));
                                            }
                                            else {
                                                this.handleCustomerSelection(null);
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Autocomplete
                                        size="small"
                                        ListboxProps={{
                                            className: classes.autoSuggestListStyle,
                                            shrink: true,
                                        }}
                                        value={contractIdValue}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                this.setState({ contractIdValue: newValue },
                                                    () => this.handleContractSelection());
                                            }
                                            else {
                                                const curentCustomerObj = this.props.customerDetails;
                                                this.clearContract(curentCustomerObj ? curentCustomerObj.id : null);
                                            }
                                        }}
                                        inputValue={contractIdInputValue}
                                        onInputChange={(event, newInputValue) => {
                                            this.setState({ contractIdInputValue: newInputValue });
                                        }}
                                        id="contract-id"
                                        options={contractIdList}
                                        disabled={companyNameValue && contractIdList && contractIdList.length === 1}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Contract-Id *" variant="outlined"
                                                InputLabelProps={{
                                                    className: classes.autoSuggestTextLabelStyle,
                                                }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    className: classes.autoSuggestTextStyle,
                                                }} />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        id="type"
                                        label="Loan-Type"
                                        name="loanType"
                                        value={loan.type || ''}
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            className: classes.autoSuggestTextStyle,
                                            readOnly: true,
                                        }}
                                        InputLabelProps={{
                                            className: classes.autoSuggestTextLabelStyle,
                                            shrink: true
                                        }}
                                    />

                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={loan.type === LOAN_TYPES.FLEX_LOAN ? 6 : 4}>
                        {/* top right box */}
                        {!isLoadingLoanData && contractIdValue && <Paper className={classes.topPaper} variant="outlined">
                            <Grid container spacing={3} className={classes.boxMargin}>
                                {loan.type === LOAN_TYPES.FLEX_LOAN ?
                                    <FlexStatusOverview loanData={loan} /> :
                                    <FixedStatusOverview loanData={loan} />
                                }
                            </Grid>
                        </Paper>}
                    </Grid>
                </Grid>
                <Grid container >
                    <Grid item xs={6}>
                        {/* bottom left box */}
                        {!isLoadingLoanData && contractIdValue && <Paper className={classes.bottomPaper} variant="outlined">
                            <Grid container spacing={3} className={classes.boxMargin}>
                                {loan.type === LOAN_TYPES.FLEX_LOAN ?
                                    <FinancialAndEarningOverview loanData={loan} overviewData={overviewDataForLoan} locale={locale} /> :
                                    <AmountOverview  loanData={loan} overviewData={overviewDataForLoan} locale={locale} />
                                }
                            </Grid>
                        </Paper>}
                    </Grid>

                    <Grid item xs={4}>
                        {/* bottom right box */}
                        {!isLoadingLoanData && contractIdValue && loan.type === LOAN_TYPES.FLEX_LOAN &&
                            <Paper className={classes.bottomPaper} variant="outlined">
                                <Grid container spacing={3} className={classes.boxMargin}>
                                    <FeesAndOtherDataOverview loanData={loan} overviewData={overviewDataForLoan} locale={locale}/>
                                </Grid>
                            </Paper>}

                        {!isLoadingLoanData && contractIdValue && loan.type === LOAN_TYPES.FIXED_LOAN &&
                            <React.Fragment>
                                <Paper className={classes.bottomPaper} variant="outlined">
                                    <Grid container spacing={3} className={classes.boxMargin}>
                                        <InterestAndFinanceOverview
                                            loanData={loan}
                                            overviewData={overviewDataForLoan}
                                            isDashboardContent={isDashboardContent}
                                            refreshLoanData={this.setContractIdData}
                                            selectedDashboardItems={selectedDashboardItems}
                                            setNavigationInDashboards={setNavigationInDashboards}
                                            selectLoan={selectLoan}
                                            locale={locale}
                                        />
                                    </Grid>
                                </Paper>

                                <Paper className={classes.ddPaper} variant="outlined">
                                    <Grid container spacing={3} className={classes.boxMargin}>
                                        <DDOverview loanData={loan} overviewData={overviewDataForLoan} locale={locale}/>
                                    </Grid>
                                </Paper>

                            </React.Fragment>}

                    </Grid>
                </Grid>
                {/* <Grid container> */}
                <Grid item xs={12}>
                    {!isLoadingLoanData && contractIdValue && <Paper className={classes.bottomPaper} variant="outlined">
                        <Grid container spacing={3} className={classes.boxMargin}>
                            {loan.type === LOAN_TYPES.FLEX_LOAN ?
                                <FlexLoanButtonSection loanData={loan} overviewData={overviewDataForLoan} refreshLoanData={this.setContractIdData} smeDetails={customerDetails} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator} /> :
                                <FixedLoanButtonSection loanData={loan} overviewData={overviewDataForLoan} refreshLoanData={this.setContractIdData} locale={locale} symbol={symbol} decimalSeparator={decimalSeparator} thousandSeparator={thousandSeparator} /* smeDetails={customerDetails} */ />
                            }

                        </Grid>
                    </Paper>}

                </Grid>
            </div>
        );
    }
}

IntegratedSingleLoanOverview.propTypes = {
    classes: PropTypes.object,
    customerDetails: PropTypes.object,
    lmContractSysId: PropTypes.string,
    isDashboardContent: PropTypes.bool,
    match: PropTypes.object,
    loan: PropTypes.object,
    smeLoanHistories: PropTypes.array,
    directdebits: PropTypes.array,
    showTemporaryLoanStop: PropTypes.bool,
    showGeneratePaymentRequestDrayer: PropTypes.bool,
    startLoanAction: PropTypes.func,
    showGeneratePaymentRequest: PropTypes.func,
    changeMandateToEmandate: PropTypes.func,
    showHideTemporaryLoanStop: PropTypes.func,
    getLoanDetails: PropTypes.func,
    getSmeLoanHistoriesByContractId: PropTypes.func,
    setNavigationInDashboards: PropTypes.func,
    clearSelectedCustomer: PropTypes.func,
    clearSelectedLoan: PropTypes.func,
    clearSmeLoanHistories: PropTypes.func,
    clearDirectDebits: PropTypes.func,
    clearSmeEmailNotifications: PropTypes.func,
    displayNotification: PropTypes.func,
    activeMandateByCustomer: PropTypes.object,
    overview: PropTypes.object,
    clearCalculatedDataOfLoanTransactions: PropTypes.func,
    // getCalculatedDataOfLoanTransactions: PropTypes.func,
    calculatedDataOfLoanTransactions: PropTypes.object,
    isOpenLoanCancelModel: PropTypes.bool,
    cancelLoan: PropTypes.func,
    showCancelSmeLoanModal: PropTypes.func,
    generateTransactionOverview: PropTypes.func,
    configurations: PropTypes.object,
    requestSmeLoans: PropTypes.func,
    getSmeLoansByQuery: PropTypes.func,
    changeCustomerDetails: PropTypes.func,
    setHeaderDisplayMainData: PropTypes.func,
    setHeaderDisplaySubData: PropTypes.func,
    clearHeaderDisplayMainData: PropTypes.func,
    clearHeaderDisplaySubData: PropTypes.func,
    selectedDashboardItems: PropTypes.array,
    setDashbordNavigationStatus: PropTypes.func,
    selectLoan: PropTypes.func.isRequired,
    getLocales: PropTypes.func,
};

const mapStateToProps = state => {
    return {
        customerDetails: state.lmglobal.customerDetails,
        lmContractSysId: state.lmglobal.selectedLoan.contractId,
        isDashboardContent: state.user.isDashboardContent,
        loan: state.lmglobal.selectedLoan,
        showTemporaryLoanStop: state.loanStopHistory.showTemporaryLoanStop,
        smeLoanHistories: state.smeLoanHistory.smeloanhistories,
        directdebits: state.smeLoanTransaction.directdebits,
        activeMandateByCustomer: state.mandates.activeMandateByCustomer,
        calculatedDataOfLoanTransactions: state.lmglobal.calculatedDataOfLoanTransactions,
        configurations: state.configurations,
        overview: state.lmglobal.flexLoanOverview,
        selectedDashboardItems: state.user.selectedDashboardItems,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLoanDetails: (contractId) => dispatch(getSingleLoanOverviewData(contractId)),
        clearSelectedLoan: () => dispatch(clearSelectedLoan()),
        requestSmeLoans: (contractId) => dispatch(requestSmeLoans(contractId)),
        changeCustomerDetails: (data) => dispatch(changeCustomerDetails(data)),
        //   setLoanStopHistoryOrigin: (origin) =>        //     dispatch(setLoanStopHistoryOrigin(origin))        //   ,
        getSmeLoanHistoriesByContractId: (contractId) => dispatch(getSmeLoanHistoriesByContractId(contractId)),
        clearSmeLoanHistories: () => dispatch(clearSmeLoanHistories()),
        // getCalculatedDataOfLoanTransactions: (contractId) => dispatch(getCalculatedDataOfLoanTransactions(contractId)),
        clearCalculatedDataOfLoanTransactions: () => dispatch(clearCalculatedDataOfLoanTransactions()),
        getSmeLoansByQuery: (condition, fields) => dispatch(getSmeLoansByQuery(condition, fields)),
        setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),// dashboard Items change
        setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
        clearHeaderDisplayMainData: () => dispatch(clearHeaderDisplayMainData()),
        clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
        displayNotification: (message, type) => dispatch(displayNotification(message, type)),
        setDashbordNavigationStatus: (status) => dispatch(setDashbordNavigationStatus(status)),
        setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),// change Dashbort navigation 
        selectLoan: (loan) => dispatch(selectLoan(loan)),
        clearSelectedCustomer: () => dispatch(clearSelectedCustomer()),
        getLocales: (requestBody) => dispatch(getLocales(requestBody)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(customStyles)(IntegratedSingleLoanOverview));