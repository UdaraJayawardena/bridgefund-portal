import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/multipleLoanOverviewStyle.jsx";
import {
 FormControl, InputLabel, MenuItem, Paper, Select
} from '@material-ui/core';
import qs from "querystring";

import CustomTabs from 'components/loanmanagement/CustomTabs/CustomTabs';

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";

import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';

import Notifier from 'components/loanmanagement/Notification/Notifier';

import { requestMultipleOverviewData, processMultipleLoanOverviewData } from "store/loanmanagement/actions/Reports";

// import ALLDATA from "./LoanData.json";

// import SpreadRiskTable from './SpreadRiskTable';
import SpreadRiskExpandList from './SpreadRiskExpandList';
// import MultipleLoanOverview from '../MultipleLoanOverview/MultipleLoanOverview';

import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { clearHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';

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
const riskCategoryKeys = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G' };

function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }

  return uri + separator + key + "=" + value;

}

class SpreadRiskOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loanOverviewDate: moment(this.props.systemDate).add(-1, 'days').format('YYYY-MM-DD'),
      countries: [],
      selectedCountry: 'ALL',
      locale: 'nl-NL',
      selectedCurrency: 'EUR'
    };
  }

  componentDidMount() {
    this.props.clearHeaderDisplaySubData();
    const params = this.props.location ? qs.parse(this.props.location.search.slice(1)) : null;// DashboardTabConcept
    const date = params && params.date ? params.date : moment(this.props.systemDate).add(-1, 'days').format('YYYY-MM-DD');// DashboardTabConcept
    this.setState({ loanOverviewDate: date });
    this.props.requestMultipleOverviewData(null, date, this.state.selectedCountry);
    this.getFieldNameValues();
  }

  componentWillUnmount() {
    this.props.processMultipleLoanOverviewData([]);
  }

  getFieldNameValues = () => {

   this.props.getFieldNameValues({fieldName: 'country'})
   .then((response) => {
      if (Array.isArray(response)) {
       if (response.length > 0) {
        const fieldNameValues = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES')
        .map(fieldNameValue => fieldNameValue.fieldNameValue);
        this.setState({ countries: fieldNameValues });
       }
      }
   });
 }

 getLocales = async (country) => {
  this.props.getLocales({countryCode: country==='ALL'? 'NL' : country})
  .then(res => {
   this.setState({ 
    locale: res[0].locale,
    selectedCurrency: res[0].currencyCode
   });
  })
  .catch(err => { console.log('getLocales err ', err); });
 }

  handleDatePickers = date => {
    const value = moment(date).format('YYYY-MM-DD');
    if (moment(value).isValid()) {
      this.setState({ loanOverviewDate: value });
      this.props.requestMultipleOverviewData(null, value, this.state.selectedCountry);
    }
    const URL = updateQueryStringParameter(document.location.href, 'date', value);
    window.history.pushState({ path: URL }, '', URL);
  }

  handleCountrySelect = (e) => {

   const country = e.target.value;
   this.getLocales(country);

   this.setState({ selectedCountry: country }, function () {
    this.props.requestMultipleOverviewData(null, this.state.loanOverviewDate, this.state.selectedCountry);    
   });
  }

  // ==========================================================================================================================================

  getOutstandingLoanTotal = loans => {
    return loans.reduce((a, cv) => { return a + cv.overallOutstandingTotalAmount; }, 0);
  }
  getOverdueTotal = loans => {
    return loans.reduce((a, cv) => { return a + cv.overallTotalOverdueAmount; }, 0);
  }
  getPercentagePortfolio = (outstandingLoan, totalOutstanding) => {
    return totalOutstanding !== 0 ? outstandingLoan / totalOutstanding * 100 : 0;
  }
  getAveragePercentageOverdue = (length, percentageOverdueTotal) => length === 0 ? 0 : percentageOverdueTotal / length;

  getPercentageOverdueTotal = (loans) => loans.reduce((a, cv) => { return a + cv.overduePercentage; }, 0);

  calValues = (filteredLoans, totalOutstanding, totalOverdue, name, sbiCode = '') => {
    const outstandingLoan = this.getOutstandingLoanTotal(filteredLoans);
    const percentagePortfolio = this.getPercentagePortfolio(outstandingLoan, totalOutstanding);
    const overdue = this.getOverdueTotal(filteredLoans);
    const percentageOverdueTotal = this.getPercentageOverdueTotal(filteredLoans);
    const percentageOverdue = this.getAveragePercentageOverdue(filteredLoans.length, percentageOverdueTotal);
    const obj = {
      name: name,
      outstandingLoan: outstandingLoan,
      percentagePortfolio: percentagePortfolio,
      noOfLoans: filteredLoans.length,
      overdue: overdue,
      percentageOverdue: percentageOverdue,
      sbiCode: sbiCode
    };
    return obj;
  }

  groupWithSBI = (loans, totalOutstanding, totalOverdue) => {
    const sbiGroupedLoans = [];
    const sbiDomains = [];

    for (const loan of loans) {
      if (loan.sbiDomains.length > 0) {
        sbiDomains.push(...loan.sbiDomains.map(code => { let newCode; if (code.length > 1) { newCode = code[0] + code[1]; } else { newCode = code[0]; } return newCode; }));
      }
    }
    const sbiParentCodes = [...new Set(sbiDomains)];

    for (const sbiCode of sbiParentCodes) {
      const name = this.props.sbiParents.find(sbi => sbi.sbiCode === sbiCode) ? this.props.sbiParents.find(sbi => sbi.sbiCode === sbiCode).sbiName : '';
      const filteredLoans = loans.filter(loan => loan.sbiFilters.includes(sbiCode));
      sbiGroupedLoans.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, name, sbiCode));
    }

    const filteredLoans = loans.filter(loan => loan.sbiDomains.length === 0);
    sbiGroupedLoans.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, 'UNKNOWN'));

    let newTotalOutstanding = 0;
    for (const sbiGroupedLoan of sbiGroupedLoans) {
      newTotalOutstanding += sbiGroupedLoan.outstandingLoan;
    }

    for (let i = 0; i < sbiGroupedLoans.length; i++) {
      sbiGroupedLoans[i].percentagePortfolio = this.getPercentagePortfolio(sbiGroupedLoans[i].outstandingLoan, newTotalOutstanding);
    }

    console.log('spreadRisk sbiGroupedLoans check empty name obj ', sbiGroupedLoans);
    return sbiGroupedLoans;
  }

  get tableData() {
    const loans = this.props.loanOverViewData;
    // let loans = JSON.parse(JSON.stringify(ALLDATA))
    let totalOutstanding = 0;
    let totalOverdue = 0;

    let sbiGroupedLoans = [];
    const remainingLoanDuration = [];
    const remainingLoanSize = [];
    const riskCategory = [];

    for (const loan of loans) {
      totalOutstanding += loan.overallOutstandingTotalAmount;
      totalOverdue += loan.overallTotalOverdueAmount;
    }

    // SBI NAME
    sbiGroupedLoans = this.groupWithSBI(loans, totalOutstanding, totalOverdue);

    // REMAINING DURATION
    let filteredLoans = loans.filter(loan => loan.remainingDuration <= 3);
    remainingLoanDuration.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingDurationKeys.XLTE3));

    filteredLoans = loans.filter(loan => loan.remainingDuration > 3 && loan.remainingDuration <= 6);
    remainingLoanDuration.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingDurationKeys.XGT3XLTE6));

    filteredLoans = loans.filter(loan => loan.remainingDuration > 6 && loan.remainingDuration <= 9);
    remainingLoanDuration.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingDurationKeys.XGT6XLTE9));

    filteredLoans = loans.filter(loan => loan.remainingDuration > 9);
    remainingLoanDuration.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingDurationKeys.XGT9));

    // REMAINING LOAN SIZE
    filteredLoans = loans.filter(loan => loan.remainingLoanSize < 15000);
    remainingLoanSize.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingLoanSizeKeys.XLT15k));

    filteredLoans = loans.filter(loan => loan.remainingLoanSize >= 15000 && loan.remainingLoanSize < 30000);
    remainingLoanSize.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingLoanSizeKeys.XGTE15kXLT30k));

    filteredLoans = loans.filter(loan => loan.remainingLoanSize >= 30000 && loan.remainingLoanSize < 50000);
    remainingLoanSize.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingLoanSizeKeys.XGTE30kXLT50k));

    filteredLoans = loans.filter(loan => loan.remainingLoanSize >= 50000 && loan.remainingLoanSize < 75000);
    remainingLoanSize.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingLoanSizeKeys.XGTE50kXLT75k));

    filteredLoans = loans.filter(loan => loan.remainingLoanSize >= 75000);
    remainingLoanSize.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, remainingLoanSizeKeys.XGTE75k));

    // RISK CATEGORY
    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.A);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.A));

    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.B);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.B));

    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.C);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.C));

    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.D);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.D));

    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.E);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.E));

    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.F);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.F));

    filteredLoans = loans.filter(loan => loan.riskCategory === riskCategoryKeys.G);
    riskCategory.push(this.calValues(filteredLoans, totalOutstanding, totalOverdue, riskCategoryKeys.G));

    return {
      sbiGroupedLoans: sbiGroupedLoans,
      remainingLoanDuration: remainingLoanDuration,
      remainingLoanSize: remainingLoanSize,
      riskCategory: riskCategory,
    };
  }


  // ==========================================================================================================================================

  render() {

    const { classes } = this.props;
    const { countries } = this.state;

    const SBIGroup = this.tableData.sbiGroupedLoans;
    const remainingLoanSizeGroup = this.tableData.remainingLoanSize;
    const remainingLoanDurationGroup = this.tableData.remainingLoanDuration;
    const riskGroup = this.tableData.riskCategory;

    return (
      <div>
        <Notifier />
        <Card>
          <CardHeader color="info">
            <h4 className={classes.cardTitleWhite}>Spreadrisk outstanding loan portfolio per {this.state.loanOverviewDate} </h4>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={2} md={2}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    id="loan-overview-date"
                    name="loanOverviewDate"
                    autoOk
                    variant="inline"
                    inputVariant="outlined"
                    label="Overview Date"
                    format="DD-MM-YYYY"
                    value={this.state.loanOverviewDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={date => this.handleDatePickers(date)}
                  />
                </MuiPickersUtilsProvider>
              </GridItem>
              <GridItem xs={12} sm={2} md={2}>
                <FormControl variant="outlined" style={{ minWidth: 200 }}>
                  <InputLabel id="select-country-label">Country</InputLabel>
                  <Select
                    labelId="select-country-label"
                    id="select-country"
                    value={this.state.selectedCountry}
                    name="selectedCountry"
                    onChange={this.handleCountrySelect}
                    label="Country"
                   >
                  <MenuItem value="ALL">
                    <em>All</em>
                  </MenuItem>
                  {countries?.map((country, index) =>
                    <MenuItem key={index} value={country}>{country}</MenuItem>
                  )}
                  </Select>
                </FormControl>
              </GridItem>
            </GridContainer>
            {/* Content below will be shown after receiving the data */}
            <CustomTabs
              title="Spreadrisk outstanding loan portfolio By: "
              headerColor="primary"
              tabs={[
                {
                  tabName: 'SBI Name',
                  tabContent: (
                    <Paper
                      style={{
                        height: [].length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'auto'
                      }}
                    >
                      <SpreadRiskExpandList tableData={SBIGroup}
                        filterType='SBI_NAME'
                        overviewDate={this.state.loanOverviewDate}
                        locale={this.state.locale}
                        currency={this.state.selectedCurrency} />
                    </Paper>
                  )
                },
                {
                  tabName: 'Remaining Duration',
                  tabContent: (
                    <Paper
                      style={{
                        height: [].length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'auto'
                      }}
                    >
                      <SpreadRiskExpandList tableData={remainingLoanDurationGroup}
                        filterType='REMAINING_DURATION'
                        overviewDate={this.state.loanOverviewDate} 
                        locale={this.state.locale}
                        currency={this.state.selectedCurrency} />
                    </Paper>
                  )
                },
                {
                  tabName: 'Remaining Loan Size',
                  tabContent: (
                    <Paper
                      style={{
                        height: [].length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'auto'
                      }}
                    >
                      <SpreadRiskExpandList tableData={remainingLoanSizeGroup}
                        filterType='REMAINING_LOAN_SIZE'
                        overviewDate={this.state.loanOverviewDate}
                        locale={this.state.locale}
                        currency={this.state.selectedCurrency} />
                    </Paper>
                  )
                },
                {
                  tabName: 'Risk Category',
                  tabContent: (
                    <Paper
                      style={{
                        height: [].length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'auto'
                      }}
                    >
                      <SpreadRiskExpandList tableData={riskGroup}
                        filterType='RISK_CATEGORY'
                        overviewDate={this.state.loanOverviewDate}
                        locale={this.state.locale}
                        currency={this.state.selectedCurrency} />
                    </Paper>
                  )
                }
              ]}
            />
          </CardBody>
        </Card>
      </div >
    );
  }
}

SpreadRiskOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,

  sbiParents: PropTypes.array,
  loanOverViewData: PropTypes.array.isRequired,

  requestMultipleOverviewData: PropTypes.func.isRequired,
  processMultipleLoanOverviewData: PropTypes.func.isRequired,
  systemDate: PropTypes.string,
  clearHeaderDisplaySubData: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    loanOverViewData: state.reports.multipleLoanOverviewData,
    sbiParents: state.sbi.SbiParentList,
    systemDate: state.configurations.simulations.systemDate,
    getFieldNameValues: PropTypes.func,
    country: PropTypes.string,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    requestMultipleOverviewData: (SBI_Code, date, country) => {
      dispatch(requestMultipleOverviewData(SBI_Code, date, country));
    },
    processMultipleLoanOverviewData: data => {
      dispatch(processMultipleLoanOverviewData(data));
    },
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
    getLocales: (requestBody) => dispatch(getLocales(requestBody))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SpreadRiskOverview));
