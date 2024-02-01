/* eslint-disable no-nested-ternary */
import React, { Component } from "react";
import qs from "querystring";
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/multipleLoanOverviewStyle.jsx";
import {
  Button,
  FormControl, FormLabel, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import CustomSearch from 'components/loanmanagement/CustomAutoSuggest/CustomAutoSuggest.jsx';

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";

import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';

import Notifier from 'components/loanmanagement/Notification/Notifier';

import { requestMultipleOverviewData } from "store/loanmanagement/actions/Reports";

// import ALLDATA from "./LoanData.json";

import Utility from 'lib/loanmanagement/utility';
import history from "./../../../history";
import { getLastHistoryRunDate, getSimulationDate } from "store/loanmanagement/actions/Configuration.action";
import { displayNotification } from "store/loanmanagement/actions/Notifier";
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { selectLoan } from 'store/loanmanagement/actions/SmeLoans';
import { clearHeaderDisplaySubData, clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';
import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

const CURRENCY = Utility.multiCurrencyConverter();

const remainingDurationKeys = {
  XLTE3: '<= 3 month',
  XGT3XLTE6: '> 3 month but <= 6 month',
  XGT6XLTE9: '> 6 month but <= 9 month',
  XGT9: '> 9 month',
};
const remainingLoanSizeKeys = {
  XLT15k: '< 15.000',
  XGTE15kXLT30k: '>= 15.000 but < 30.000',
  XGTE30kXLT50k: '>= 30.000 but < 50.000',
  XGTE50kXLT75k: '>= 50.000 but < 75.000',
  XGTE75k: '>= 75.0000',
};
const riskCategory = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G' };
const provisionCategory = { NORMAL: 'Normal', EXTENDED: 'Extended', SEVERE: 'Severe', TAILORED: 'Tailored' };

let totalOutstandingPrinciple = 0;
let totalOutstandingMargin = 0;
let totalOutstandingOtherCosts = 0;
let totalOverdue = 0;
let totalOfTotalOutstanding = 0;
let totalCreditLimit = 0;

function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  return uri + separator + key + "=" + value;
}
class MultipleLoanOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSBI: null,
      selectedCountry: 'ALL',
      selectedSmeLoanType: '',
      remainingDuration: '',
      remainingLoanSize: '',
      selectedRiskCategory: '',
      selectedProvisionCategory: '',
      loanOverviewDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
      height: 'auto',
      order: 'asc',
      orderBy: 'totalOverdueAmount',
      isLoadingComponent: true,
      countries: [],
      locale: 'nl-NL',
      currencyCode: "EUR"
    };
  }

  handleProps() {
    if (this.props.origin !== 'ADMIN') {
      this.setState({ height: '15vw' });
    }
    switch (this.props.filterType) {
      case 'SBI_NAME':
        this.setState({ selectedSBI: this.props.filterValue });
        this.setState({ loanOverviewDate: moment(this.props.overviewDate).format('YYYY-MM-DD') });
        // this.setState({ startDate: moment(this.props.overviewDate).add(-1, 'years').format('YYYY-MM-DD') });
        break;
      case 'REMAINING_DURATION':
        this.setState({ remainingDuration: this.props.filterValue });
        this.setState({ loanOverviewDate: moment(this.props.overviewDate).format('YYYY-MM-DD') });
        // this.setState({ startDate: moment(this.props.overviewDate).add(-1, 'years').format('YYYY-MM-DD') });
        break;
      case 'REMAINING_LOAN_SIZE':
        this.setState({ remainingLoanSize: this.props.filterValue });
        this.setState({ loanOverviewDate: moment(this.props.overviewDate).format('YYYY-MM-DD') });
        // this.setState({ startDate: moment(this.props.overviewDate).add(-1, 'years').format('YYYY-MM-DD') });
        break;
      case 'RISK_CATEGORY':
        this.setState({ selectedRiskCategory: this.props.filterValue });
        this.setState({ loanOverviewDate: moment(this.props.overviewDate).format('YYYY-MM-DD') });
        // this.setState({ startDate: moment(this.props.overviewDate).add(-1, 'years').format('YYYY-MM-DD') });
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    // console.log("this.state.loanOverviewDate ", this.state.loanOverviewDate);
    // console.log("this.props.systemDate ", this.props.systemDate);
    const { origin, location, country } = this.props;
    // console.log('mlo ', { origin, location });

    if (origin !== 'ADMIN') {
      this.handleProps();// to set state from props values
    }

    if (origin === 'ADMIN') {

      if (location) { // if there is a value in date param
        const params = qs.parse(location.search.slice(1));
        if (params && params.date && moment(params.date).isValid()) {
          this.setState({
            loanOverviewDate: params.date,
          },
            () => this.getReportData());
        }
        else {

          this.props.getLastHistoryRunDate()
            .then(response => {
              this.setState({
                loanOverviewDate: moment(response).format('YYYY-MM-DD'),
              }, () => this.getReportData());
            })
            .catch((err) => {
              console.log('err ', err);
              this.props.displayNotification('Get Last History Date Error', 'error');
            });
        }
      }
      else {

        this.props.getLastHistoryRunDate()
          .then(response => {
            this.setState({
              loanOverviewDate: moment(response).format('YYYY-MM-DD'),
            }, () => this.getReportData());
          })
          .catch((err) => {
            console.log('err ', err);
            this.props.displayNotification('Get Last History Date Error', 'error');
          });
      }

    }
    if (this.filteredData) { this.setState({ isLoadingComponent: false }); }
    this.getFieldNameValues();
    
    if(this.props.locale && this.props.currency) {
     this.setState({
      locale: this.props.locale,
      currencyCode: this.props.currency
    });
    }
    if(this.props.loanLatePayments && country !== 'All' ) {
     this.setState({
      selectedCountry: this.props.loanLatePayments[0].country,
      currencyCode: this.props.loanLatePayments[0].currency
     });
    }
  }


  getFieldNameValues = () => {

    const requestObjs = [{
      fieldName: 'country'
    }];

    for (let i = 0; i < requestObjs.length; i++) {
      this.props.getFieldNameValues(requestObjs[i])
        .then((response) => {
          if (Array.isArray(response)) {
            if (response.length > 0) {
              const fieldNameValues = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES')
                .map(fieldNameValue => fieldNameValue.fieldNameValue);
              if (requestObjs[i].fieldName == 'country') this.setState({ countries: fieldNameValues });
            }
          }

        });
    }
  }

  getLocales = async () => {
    const country  = this.state.selectedCountry=='ALL'?'NL':this.state.selectedCountry;
  
    this.props.getLocales({ countryCode: country })
      .then(res => {
        if (!res || res.length == 0) {
          return this.props.displayNotification('Invalid Country', 'warning');
        }
      
        this.setState({
          locale: res[0].locale,
          currencyCode: res[0].currencyCode
        });
      })
      .catch(err => { console.log('getLocales err ', err); });

  }

  handleDatePickers = event => {
    const value = moment(event.target.value).format('YYYY-MM-DD');
    if (moment(value).isValid()) {
      this.setState({ [event.target.name]: value });
      if (event.target.name === 'loanOverviewDate') {
        // this.setState({ startDate: moment(value).add(-1, 'years').format('YYYY-MM-DD') });
        this.getReportData(null, value);
        const URL = updateQueryStringParameter(document.location.href, 'date', value);
        window.history.pushState({ path: URL }, '', URL);
      }
    }
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeCountry = event => {
    this.setState({ selectedCountry: event.target.value }, function () {
      this.getReportData();
      this.getLocales();
    });
  };

  handleRequestSort = (property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  onSearchResult = value => {
    this.setState({ selectedSBI: value });
    this.getReportData(value);
  };

  getReportData = (SBI = null, overviewDate = null) => {
    const sbiCode = SBI !== null ? SBI.sbiCode : this.state.selectedSBI ? this.state.selectedSBI.sbiCode : '';
    const date = overviewDate !== null ? overviewDate : moment(this.state.loanOverviewDate).format('YYYY-MM-DD');
    const country = this.state.selectedCountry;

    this.props.requestMultipleOverviewData(sbiCode, date, country);
  }

  get filteredData() {
    // let loans = JSON.parse(JSON.stringify(ALLDATA))
    let loans = this.props.loanOverViewData;
    if (this.props.origin === "LOAN_LATE") {
      // console.log('props in model ', this.props.loanLatePayments)
      loans = this.props.loanLatePayments;
    }
    totalOutstandingPrinciple = 0;
    totalOutstandingMargin = 0;
    totalOutstandingOtherCosts = 0;
    totalOfTotalOutstanding = 0;
    totalOverdue = 0;
    totalCreditLimit = 0;

    // SBI SELECTED
    if (this.props.origin !== 'ADMIN' && this.props.filterType === "SBI_NAME" && this.state.selectedSBI) {
      if (this.state.selectedSBI.sbiCode) {
        loans = loans.filter(loan => loan.sbiFilters.includes(this.state.selectedSBI.sbiCode));
      } else {
        loans = loans.filter(loan => loan.sbiFilters.length === 0);
      }
    }

    // REMAINING DURATION
    switch (this.state.remainingDuration) {
      case remainingDurationKeys.XLTE3:
        loans = loans.filter(loan => loan.remainingDuration <= 3);
        break;
      case remainingDurationKeys.XGT3XLTE6:
        loans = loans.filter(loan => loan.remainingDuration > 3 && loan.remainingDuration <= 6);
        break;
      case remainingDurationKeys.XGT6XLTE9:
        loans = loans.filter(loan => loan.remainingDuration > 6 && loan.remainingDuration <= 9);
        break;
      case remainingDurationKeys.XGT9:
        loans = loans.filter(loan => loan.remainingDuration > 9);
        break;
      default:
        break;
    }

    // SME LOAN TYPE
    if (this.state.selectedSmeLoanType) {
      loans = loans.filter(loan => loan.smeLoanType === this.state.selectedSmeLoanType);
    }

    // REMAINING LOAN SIZE
    switch (this.state.remainingLoanSize) {
      case remainingLoanSizeKeys.XLT15k:
        loans = loans.filter(loan => loan.overallOutstandingTotalAmount < 15000);
        break;
      case remainingLoanSizeKeys.XGTE15kXLT30k:
        loans = loans.filter(loan => loan.overallOutstandingTotalAmount >= 15000 && loan.overallOutstandingTotalAmount < 30000);
        break;
      case remainingLoanSizeKeys.XGT6XLTE9:
        loans = loans.filter(loan => loan.overallOutstandingTotalAmount >= 30000 && loan.overallOutstandingTotalAmount < 50000);
        break;
      case remainingLoanSizeKeys.XGTE50kXLT75k:
        loans = loans.filter(loan => loan.overallOutstandingTotalAmount >= 50000 && loan.overallOutstandingTotalAmount < 75000);
        break;
      case remainingLoanSizeKeys.XGTE75k:
        loans = loans.filter(loan => loan.overallOutstandingTotalAmount >= 75000);
        break;
      default:
        break;
    }

    // RIST CATEGORY
    if (this.state.selectedRiskCategory) {
      loans = loans.filter(loan => loan.riskCategory === this.state.selectedRiskCategory);
    }

    // PROVISION CATEGORY
    if (this.state.selectedProvisionCategory) {
      loans = loans.filter(loan => loan.provisionCategory === this.state.selectedProvisionCategory);
    }

    for (const loan of loans) {
      totalOutstandingPrinciple += loan.outstandingPrincipleAmount;
      totalOutstandingMargin += loan.outstandingTotalMarginAmount;
      totalOutstandingOtherCosts += loan.outstandingOtherCostsAmount;
      totalOfTotalOutstanding += loan.overallOutstandingTotalAmount;
      totalOverdue += loan.overallTotalOverdueAmount;
      totalCreditLimit += loan.creditLimitAmount;
    }

    return loans;
  }

  redirectToSLO = (contractId) => {
    this.props.clearSelectedCustomer();
    this.props.selectLoan({contractId});
    this.props.setNavigationInDashboards('SingleLoanOverview')
    .then(res => {
      if (res) {
        history.push(res);
        }
    });
  }

  getLinkOrButttonForLoan = (loan) => {
    const { isDashboardContent } = this.props;
    return isDashboardContent ?
      <Button size="small" color="primary" onClick={() => this.redirectToSLO(loan.smeLoanNumber)}>{loan.smeLoanNumber}</Button>
      :
      <Link to={`/user/${loan.smeLoanType === 'fixed-loan' ? 'singleLoanOverview' : 'flexLoanOverview'}/${loan.smeLoanNumber}`} //OtherRoutes
          onClick={() => console.log('Heading to /')}>
        {loan.smeLoanNumber}
      </Link>;
  }

  render() {

    // console.log("props in render ----> ", this.props);
    // console.log("state in render ----> ", this.state);
    // console.log("this.props.systemDate ", this.props.systemDate);

    const {
      classes,
    } = this.props;

    const { locale, currencyCode } = this.state;

  let maxCellWidth = 0;

  this.filteredData.forEach((item) => {
    const cellText = item.smeLegalName;
    const cellWidth = cellText.length;
    if(cellWidth > maxCellWidth){
      maxCellWidth = cellWidth;
    }
  });

    if (this.state.isLoadingComponent) {
      return <h4>Loading....</h4>;
    }
    else if (this.props.isSpreadRiskOverview) {
      return (
        <div>
          <Notifier />
          <>
          <TableContainer component={Paper} className={classes.tableContainer}>
          {/* <Paper className={classes.tableContainer} style={{ height: this.state.height }}> */}
            <Table>
              <TableHead>
                <TableRow>
                 <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'smeLegalName'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'smeLegalName')}
                    >
                      Organization Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'smeLegalId'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'smeLegalId')}
                    >
                      Organization ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'smeLoanNumber'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'smeLoanNumber')}
                    >
                      Loan ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'smeLoanType'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'smeLoanType')}
                    >
                      Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'status'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'beginDate'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'beginDate')}
                    >
                      Begin Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={this.state.orderBy === 'maturityDate'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'maturityDate')}
                    >
                      Maturity/Revision Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'creditLimitAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'creditLimitAmount')}
                    >
                      Credit Limit
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'outstandingPrincipleAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'outstandingPrincipleAmount')}
                    >
                      Outstanding Principal
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'outstandingTotalMarginAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'outstandingTotalMarginAmount')}
                    >
                      Outstanding Margin
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'outstandingOtherCostsAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'outstandingOtherCostsAmount')}
                    >
                      Outstanding Other Cost
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'overallOutstandingTotalAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'overallOutstandingTotalAmount')}
                    >
                      Total Outstanding
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'totalOverdueAmount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'totalOverdueAmount')}
                    >
                      Overdue
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                      active={this.state.orderBy === 'overduePercentage'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={this.handleRequestSort.bind(this, 'overduePercentage')}
                    >
                      Overdue %
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  Utility.stableSort(this.filteredData, Utility.getSorting(this.state.order, this.state.orderBy))
                  .map((loan, index) => (
                      <TableRow key={index}>
                        <TableCell className={classes.tableBodyCell}  style={{width: `${maxCellWidth}%`}}>
                          {loan.smeLegalName}
                        </TableCell>
                        <TableCell className={classes.tableBodyCell} >
                          {loan.smeLegalId}
                        </TableCell>
                        <TableCell className={classes.tableBodyCell} style={{ width: '8%' }}>
                          {/* <Link to={`/user/${loan.smeLoanType === 'fixed-loan' ? 'singleLoanOverview' : 'flexLoanOverview'}/${loan.smeLoanNumber}`} >
                            {loan.smeLoanNumber}
                          </Link> */}
                            {this.getLinkOrButttonForLoan(loan)}
                          </TableCell>
                          <TableCell className={classes.tableBodyCell}>
                            {loan.smeLoanType}
                          </TableCell>
                          <TableCell className={classes.tableBodyCell} style={{ width: '10%' }}>
                            {loan.status}
                          </TableCell>
                          <TableCell className={classes.tableBodyCell} style={{ width: '8%' }}>
                            {moment(loan.beginDate).format('YYYY-MM-DD')}
                          </TableCell>
                          <TableCell className={classes.tableBodyCell}>
                            {moment(loan.maturityDate).format('YYYY-MM-DD')}
                          </TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.creditLimitAmount, locale, currencyCode)}</TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.outstandingPrincipleAmount, locale, currencyCode)}</TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.outstandingTotalMarginAmount, locale, currencyCode)}</TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.outstandingOtherCostsAmount, locale, currencyCode)}</TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                          <TableCell className={classes.tableBodyCellNumber}>{(loan.overallTotalOverduePercentage.toFixed(2))} %</TableCell>
                        </TableRow>
                      ))
                  }
                  {/* Calculate the total */}
                  <TableRow>
                    <TableCell className={classes.tableHeaderCell} colSpan={6}>Total</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalCreditLimit, locale, currencyCode)}</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOutstandingPrinciple, locale, currencyCode)}</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOutstandingMargin, locale, currencyCode)}</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOutstandingOtherCosts, locale, currencyCode)}</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOfTotalOutstanding, locale, currencyCode)}</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOverdue, locale, currencyCode)}</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
          {/* </Paper> */}
        </div>
      );
    }
    return (
      <div>
        <Notifier />
        <Card>
          <CardHeader color="info">
            <GridContainer>
              <GridItem >
                <h4 className={classes.cardTitleWhite}>Multiple Loan Overview
                  {this.state.selectedSBI ? ' - ' + this.state.selectedSBI.sbiName : null}
                </h4>
              </GridItem>
              {this.props.origin === 'ADMIN' ?
                <GridItem >
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <KeyboardDatePicker
                      disableToolbar
                      id="loan-late-payment-overview-date"
                      name="selectedDate"
                      autoOk
                      variant="inline"
                      label="Overview Date "
                      format="DD-MM-YYYY"
                      value={this.state.loanOverviewDate}
                      InputAdornmentProps={{ position: "start" }}
                      onChange={date => this.handleDatePickers({ target: { value: date, name: 'loanOverviewDate' } })}
                      inputVariant="outlined"
                    />
                  </MuiPickersUtilsProvider>
                </GridItem> :
                false
              }
            </GridContainer>
          </CardHeader>
          <CardBody>
            {
              this.props.origin === 'ADMIN' ?
                (
                  <div>
                    <GridContainer>
                 
                      <GridItem>
                      <GridContainer>
                          {/* country */}
                          <GridItem xs={12}>
                            <FormControl className={classes.formControl} >
                              <InputLabel htmlFor="country">Country</InputLabel>
                              <Select
                                value={this.state.selectedCountry}
                                onChange={this.handleChangeCountry}
                                inputProps={{
                                  name: 'selectedCountry',
                                  id: 'country',
                                }}
                                className={classes.selectEmpty}
                              >
                                <MenuItem value="ALL">
                                  <em>All</em>
                                </MenuItem>
                                {
                                  Object.keys(this.state.countries).map(key => (
                                    <MenuItem key={key} value={this.state.countries[key]}>{this.state.countries[key]}</MenuItem>
                                  ))
                                }
                              </Select>
                            </FormControl>
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          {/* Loan Type selection */}
                          <GridItem xs={12}>
                            <FormControl className={classes.formControl}>
                              <InputLabel htmlFor="loan-type">Loan Type</InputLabel>
                              <Select
                                value={this.state.selectedSmeLoanType}
                                onChange={this.handleChange}
                                inputProps={{
                                  name: 'selectedSmeLoanType',
                                  id: 'loan-type',
                                }}
                                className={classes.selectEmpty}
                              >
                                <MenuItem value="">
                                  <em>All</em>
                                </MenuItem>
                                <MenuItem value={'fixed-loan'}>{'fixed-loan'}</MenuItem>
                                <MenuItem value={'flex-loan'}>{'flex-loan'}</MenuItem>
                              </Select>
                            </FormControl>
                          </GridItem>
                        </GridContainer>

                        <GridContainer>
                          <GridItem xs={12}>&nbsp;</GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12}>&nbsp;</GridItem>
                        </GridContainer>
                      </GridItem>

                      <GridItem>
                        <GridContainer>
                          {/* SBI Search */}
                          <GridItem xs={12} >
                            <FormControl style={{ marginTop: 3 }}
                            >
                              <FormLabel style={{ fontSize: 12 }}>SBI Name Search</FormLabel>
                              <CustomSearch
                                id="sbi-search"
                                name="SBISearch"
                                label="Search SBI"
                                entity="sbiParents"
                                sugg_field="sbiName"
                                onResult={this.onSearchResult.bind(this)}
                              />
                            </FormControl>
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          {/* Risk Category */}
                          <GridItem xs={12}>
                            <FormControl className={classes.formControl} disabled={this.props.filterType !== 'RISK_CATEGORY' ? false : true}>
                              <InputLabel htmlFor="risk-category">Risk Category</InputLabel>
                              <Select
                                value={this.state.selectedRiskCategory}
                                onChange={this.handleChange}
                                inputProps={{
                                  name: 'selectedRiskCategory',
                                  id: 'risk-category',
                                }}
                                className={classes.selectEmpty}
                              >
                                <MenuItem value="">
                                  <em>All</em>
                                </MenuItem>
                                {
                                  Object.keys(riskCategory).map(key => (
                                    <MenuItem key={key} value={riskCategory[key]}>{riskCategory[key]}</MenuItem>
                                  ))
                                }
                              </Select>
                            </FormControl>
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          {/* Provision Category */}
                          <GridItem xs={12}>
                            <FormControl className={classes.formControl}>
                              <InputLabel htmlFor="provision-category">Provision Category</InputLabel>
                              <Select
                                value={this.state.selectedProvisionCategory}
                                onChange={this.handleChange}
                                inputProps={{
                                  name: 'selectedProvisionCategory',
                                  id: 'provision-category',
                                }}
                                className={classes.selectEmpty}
                              >
                                <MenuItem value="">
                                  <em>All</em>
                                </MenuItem>
                                {
                                  Object.keys(provisionCategory).map(key => (
                                    <MenuItem key={key} value={provisionCategory[key]}>{provisionCategory[key]}</MenuItem>
                                  ))
                                }
                              </Select>
                            </FormControl>
                          </GridItem>
                        </GridContainer>
                      </GridItem>

                      <GridItem>
                        <GridContainer>
                          <GridItem xs={12}>&nbsp;</GridItem>
                        </GridContainer>
                        <GridContainer>
                          {/* Remaining Duration */}
                          <GridItem xs={12} style={{ marginTop: '23px' }}>
                            <FormControl className={classes.formControl} disabled={this.props.filterType !== 'REMAINING_DURATION' ? false : true}>
                              <InputLabel htmlFor="remaining-duration">Remaining Duration</InputLabel>
                              <Select
                                value={this.state.remainingDuration}
                                onChange={this.handleChange}
                                inputProps={{
                                  name: 'remainingDuration',
                                  id: 'remaining-duration',
                                }}
                                className={classes.selectEmpty}
                              >
                                <MenuItem value="">
                                  <em>All</em>
                                </MenuItem>
                                <MenuItem value={remainingDurationKeys.XLTE3}>{'≤ 3 months'}</MenuItem>
                                <MenuItem value={remainingDurationKeys.XGT3XLTE6}>{'>3 but ≤ 6 months'}</MenuItem>
                                <MenuItem value={remainingDurationKeys.XGT6XLTE9}>{'>6 but ≤ 9 months'}</MenuItem>
                                <MenuItem value={remainingDurationKeys.XGT9}>{'> 9 months'}</MenuItem>
                              </Select>
                            </FormControl>
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          {/* Remaining Loan Size */}
                          <GridItem xs={12}>
                            <FormControl className={classes.formControl} disabled={this.props.filterType !== 'REMAINING_LOAN_SIZE' ? false : true}>
                              <InputLabel htmlFor="remaining-loan-size">Remaining Loan Size</InputLabel>
                              <Select
                                value={this.state.remainingLoanSize}
                                onChange={this.handleChange}
                                inputProps={{
                                  name: 'remainingLoanSize',
                                  id: 'remaining-loan-size',
                                }}
                                className={classes.selectEmpty}
                              >
                                <MenuItem value="">
                                  <em>All</em>
                                </MenuItem>
                                <MenuItem value={remainingLoanSizeKeys.XLT15k}>{'< €15.000'}</MenuItem>
                                <MenuItem value={remainingLoanSizeKeys.XGTE15kXLT30k}>{'≥ €15.000 but < 30.000'}</MenuItem>
                                <MenuItem value={remainingLoanSizeKeys.XGTE30kXLT50k}>{'≥ €30.000 but < 50.000'}</MenuItem>
                                <MenuItem value={remainingLoanSizeKeys.XGTE50kXLT75k}>{'≥ €50.000 but < 75.000'}</MenuItem>
                                <MenuItem value={remainingLoanSizeKeys.XGTE75k}>{'≥ €75.000'}</MenuItem>
                              </Select>
                            </FormControl>
                          </GridItem>
                        </GridContainer>
                      </GridItem>
                    </GridContainer>

                  </div>
                )
                :
                false
            }
            <>
            {/* <Paper className={classes.tableContainer} style={{ height: this.state.height }}> */}
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'smeLegalName'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'smeLegalName')}
                      >
                        Organization Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'smeLegalId'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'smeLegalId')}
                      >
                        Organization ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'smeLoanNumber'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'smeLoanNumber')}
                      >
                        Loan ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'smeLoanType'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'smeLoanType')}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'status'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'beginDate'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'beginDate')}
                      >
                        Begin Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'maturityDate'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'maturityDate')}
                      >
                        Maturity/Revision Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                    <TableSortLabel
                        active={this.state.orderBy === 'creditLimitAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'creditLimitAmount')}
                      >
                        Credit Limit
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                      <TableSortLabel
                        active={this.state.orderBy === 'outstandingPrincipleAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'outstandingPrincipleAmount')}
                      >
                        Outstanding Principal
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                      <TableSortLabel
                        active={this.state.orderBy === 'outstandingTotalMarginAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'outstandingTotalMarginAmount')}
                      >
                        Outstanding Margin
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                      <TableSortLabel
                        active={this.state.orderBy === 'outstandingOtherCostsAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'outstandingOtherCostsAmount')}
                      >
                        Outstanding Other Cost
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                      <TableSortLabel
                        active={this.state.orderBy === 'overallOutstandingTotalAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'overallOutstandingTotalAmount')}
                      >
                        Total Outstanding
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                      <TableSortLabel
                        active={this.state.orderBy === 'totalOverdueAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'totalOverdueAmount')}
                      >
                        Overdue
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>
                      <TableSortLabel
                        active={this.state.orderBy === 'overduePercentage'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'overduePercentage')}
                      >
                        Overdue %
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    Utility.stableSort(this.filteredData, Utility.getSorting(this.state.order, this.state.orderBy))
                    .map((loan, index) => (
                        <TableRow key={index}>
                          <TableCell className={classes.tableBodyCell} style={{ width: `${maxCellWidth}%` }}>
                            {loan.smeLegalName}
                          </TableCell>
                          <TableCell className={classes.tableBodyCell}>
                            {loan.smeLegalId}
                          </TableCell>
                          <TableCell className={classes.tableBodyCell} style={{ width: '8%' }}>
                            {/* <Link to={`/user/${loan.smeLoanType === 'fixed-loan' ? 'singleLoanOverview' : 'flexLoanOverview'}/${loan.smeLoanNumber}`} >
                              {loan.smeLoanNumber}
                            </Link> */}
                              {this.getLinkOrButttonForLoan(loan)}
                            </TableCell>
                            <TableCell className={classes.tableBodyCell}>
                              {loan.smeLoanType}
                            </TableCell>
                            <TableCell className={classes.tableBodyCell} style={{ width: '10%' }}>
                              {loan.status}
                            </TableCell>
                            <TableCell className={classes.tableBodyCell} style={{ width: '8%' }}>
                              {moment(loan.beginDate).format('DD-MM-YYYY')}
                            </TableCell>
                            <TableCell className={classes.tableBodyCell}>
                              {moment(loan.maturityDate).format('DD-MM-YYYY')}
                            </TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.creditLimitAmount, locale, currencyCode)}</TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.outstandingPrincipleAmount, locale, currencyCode)}</TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.outstandingTotalMarginAmount, locale, currencyCode)}</TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.outstandingOtherCostsAmount, locale, currencyCode)}</TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{CURRENCY(loan.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                            <TableCell className={classes.tableBodyCellNumber}>{(loan.overallTotalOverduePercentage.toFixed(2))} %</TableCell>
                          </TableRow>
                        ))
                    }
                    {/* Calculate the total */}
                    <TableRow>
                      <TableCell className={classes.tableHeaderCell} colSpan={6}>Total</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalCreditLimit, locale, currencyCode)}</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOutstandingPrinciple, locale, currencyCode)}</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOutstandingMargin, locale, currencyCode)}</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOutstandingOtherCosts, locale, currencyCode)}</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOfTotalOutstanding, locale, currencyCode)}</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}>{CURRENCY(totalOverdue, locale, currencyCode)}</TableCell>
                      <TableCell className={classes.tableHeaderCellNumber}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {/* </Paper> */}
            </>
          </CardBody>
        </Card>
      </div>
    );
  }
}

MultipleLoanOverview.defaultProps = {
  origin: 'ADMIN'
};

MultipleLoanOverview.propTypes = {
  SBI: PropTypes.object,
  classes: PropTypes.object,
  location: PropTypes.object,
  filterValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  filterType: PropTypes.string,
  overviewDate: PropTypes.string,
  origin: PropTypes.string,
  country: PropTypes.string,
  isSpreadRiskOverview: PropTypes.bool,
  loanOverViewData: PropTypes.array,
  loanLatePayments: PropTypes.array,
  toggleDrawer: PropTypes.func,
  requestMultipleOverviewData: PropTypes.func.isRequired,
  systemDate: PropTypes.string,
  getLastHistoryRunDate: PropTypes.func,
  getSimulationDate: PropTypes.func,
  displayNotification: PropTypes.func,
  isDashboardContent: PropTypes.bool,
  selectedDashboardItems: PropTypes.array,
  setNavigationInDashboards: PropTypes.func,
  selectLoan: PropTypes.func, 
  clearSelectedCustomer: PropTypes.func.isRequired,
  clearHeaderDisplaySubData: PropTypes.func,
  locale: PropTypes.string,
  currency: PropTypes.string
};

const mapStateToProps = state => {
  return {
    loanOverViewData: state.reports.multipleLoanOverviewData,
    systemDate: state.configurations.simulations.systemDate,
    isDashboardContent: state.user.isDashboardContent,
    selectedDashboardItems: state.user.selectedDashboardItems,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    requestMultipleOverviewData: (SBI_Code, date, country) => {
      dispatch(requestMultipleOverviewData(SBI_Code, date, country));
    },
    getLastHistoryRunDate: () => (
      dispatch(getLastHistoryRunDate())
    ),
    getSimulationDate: () => (
      dispatch(getSimulationDate())
    ),
    displayNotification: (message, type) => (
      dispatch(displayNotification(message, type))
    ),
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    selectLoan: (loan) => {
      dispatch(selectLoan(loan));
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MultipleLoanOverview));
