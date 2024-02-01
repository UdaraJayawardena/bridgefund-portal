import React from "react";
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, MenuItem, FormControl, Select,
  TableContainer, Grid, CircularProgress
} from "@material-ui/core";
import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Utility from 'lib/loanmanagement/utility';

import { displayNotification } from 'store/initiation/actions/Notifier';
import { getLoansGivenOverviewData } from 'store/loanmanagement/actions/SmeLoans';
import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

import style from "assets/jss/material-dashboard-react/views/loansGivenOverviewStyles";
import monthsArray from './months';
import weeksArray from './weeks';

export const months = monthsArray;
export const weeks = weeksArray;

const CURRENCY = Utility.multiCurrencyConverter();
const PERCENTAGE = Utility.multiCurrencyPercentage;

class LoansGivenOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fixedNewBusinessLoans: [],
      fixedRetentionLoans: [],
      fixedRefinancedLoans: [],
      flexNewBusinessLoans: [],
      flexRetentionLoans: [],
      countries: [],
      fixedNewBusinessSubTotal: {},
      fixedRefinancedSubTotal: {},
      fixedRetentionSubTotal: {},
      flexNewBusinessSubTotal: {},
      flexRetentionSubTotal: {},
      fixedOverallTotals: {},
      flexOverallTotals: {},
      startDate: '2021-01-01',
      endDate: '2021-01-10',
      viewType: 'months',
      country: 'All',
      locale: 'nl-NL',
      currency: 'EUR',
      selectedMonth: parseInt(moment().format('MM')),
      selectedWeek: 1,
      selectedYear: moment().format('YYYY'),
      isLoading: false,
      headerDisplayCountry: ''
    };
  }

  componentDidMount() {
    this.getFieldNameValues();
    this.getOverviewData();
  };

  getFieldNameValues = () => {
    this.props.getFieldNameValues({fieldName: 'country'})
      .then((response) => {
        if (Array.isArray(response)) {
          if (response.length > 0) {
            const fieldNameValues = ['All'];
            const filteredCountries = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES')
                                    .map(fieldNameValue => fieldNameValue.fieldNameValue);
            fieldNameValues.push(...filteredCountries);
            this.setState({ countries: fieldNameValues });
          }
        }
      });
  };

  handleViewType(event) {
    this.setState({ viewType: event.target.value, selectedMonth: 1, selectedWeek: 1 });
  }

  handleFilterOptions(event) {
    if (this.state.viewType === 'months') {
      this.setState({ selectedMonth: event.target.value });
    } else if (this.state.viewType === 'weeks') {
      this.setState({ selectedWeek: event.target.value });
    }
  };

  handleYearSelection(year) {
    this.setState({ selectedYear: moment(year).format('YYYY') });
  };

  handleCountrySelection(event) {
    this.setState({ country: event.target.value });
  };

  getLocales = async (country) => {

    if (country === 'All') country = 'NL';
    this.props.getLocales({countryCode: country})
			.then(res => {
        if (!res || res.length === 0) {
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }
				this.setState({ 
          currency: res[0].currencyCode,
          locale: res[0].locale 
        });
			})
			.catch(err => { console.log('getLocales err ', err); });    
  }

  clearLoans() {
    this.setState({
      fixedNewBusinessLoans: [], fixedRetentionLoans: [], fixedRefinancedLoans: [], flexNewBusinessLoans: [], flexRetentionLoans: [],
      fixedNewBusinessSubTotal: {}, fixedRefinancedSubTotal: {}, fixedRetentionSubTotal: {}, flexNewBusinessSubTotal: {}, flexRetentionSubTotal: {},
      fixedOverallTotals: {}, flexOverallTotals: {}
    });
  }

  getOverviewData = () => {
    const { selectedMonth, selectedWeek, selectedYear, viewType, country } = this.state;
    let startDate = '';
    let endDate = '';

    if (viewType === 'weeks') {
      startDate = moment().year(+selectedYear).day('Monday').isoWeek(selectedWeek).format('YYYY-MM-DD');
      endDate = moment(startDate).add(6, 'days').format('YYYY-MM-DD');
    } else if (viewType === 'months') {
      startDate = moment(`${selectedYear}-${selectedMonth}`).startOf('month').format('YYYY-MM-DD');
      endDate = moment(`${selectedYear}-${selectedMonth}`).endOf('month').format('YYYY-MM-DD');
    }

    if (!startDate || !endDate) return this.props.displayNotification('Please select a date range!', 'warning');

    this.getLocales(country);
    this.setState({ isLoading: true, headerDisplayCountry: country });
    this.props.getLoansGivenOverviewData(startDate, endDate, country)
      .then(response => {
        this.clearLoans();
        if (response) {
          this.setState({
            fixedNewBusinessLoans: response.fixedLoans.newBusiness.loans,
            fixedRefinancedLoans: response.fixedLoans.refinanced.loans,
            fixedRetentionLoans: response.fixedLoans.retention.loans,
            flexNewBusinessLoans: response.flexLoans.newBusiness.loans,
            flexRetentionLoans: response.flexLoans.retention.loans,
            fixedNewBusinessSubTotal: response.fixedLoans.newBusiness.subTotal,
            fixedRefinancedSubTotal: response.fixedLoans.refinanced.subTotal,
            fixedRetentionSubTotal: response.fixedLoans.retention.subTotal,
            flexNewBusinessSubTotal: response.flexLoans.newBusiness.subTotal,
            flexRetentionSubTotal: response.flexLoans.retention.subTotal,
            fixedOverallTotals: response.fixedLoans.overallTotals,
            flexOverallTotals: response.flexLoans.overallTotals
          });
          this.props.displayNotification('Data retrieved successfully', 'success');
        };
        this.setState({ isLoading: false });
      });
  };


  render() {
    const { classes } = this.props;
    const { fixedNewBusinessLoans, fixedRefinancedLoans, fixedRetentionLoans, flexNewBusinessLoans,
      flexRetentionLoans, fixedNewBusinessSubTotal, fixedRefinancedSubTotal, fixedRetentionSubTotal,
      flexNewBusinessSubTotal, flexRetentionSubTotal, fixedOverallTotals, flexOverallTotals, countries,
      locale, currency } = this.state;
    return (
      <div>
        <Card>
          <CardHeader color='info'>
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item>
                <h4 className={classes.cardTitleWhite}>Loans Given Overview</h4>
              </Grid>
              <Grid item>
                <div>
                  <span className={classes.filterText} >Loans Given during </span>
                  <span>
                    <FormControl className={classes.filterItems} >
                      {/* <InputLabel htmlFor="selected-view-type">week/month</InputLabel> */}
                      <Select
                        value={this.state.viewType}
                        onChange={(e) => this.handleViewType(e)}
                        inputProps={{
                          name: 'selectedviewType',
                          id: 'selected-view-type',
                        }}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value='weeks'>Week</MenuItem>
                        <MenuItem value='months'>Month</MenuItem>
                      </Select>
                    </FormControl>
                  </span>
                  {
                    (this.state.viewType === 'months') ?
                      <span>
                        <FormControl className={classes.filterItems}>
                          {/* <InputLabel htmlFor="selectedMonth">Month</InputLabel> */}
                          <Select
                            value={this.state.selectedMonth}
                            onChange={(e) => this.handleFilterOptions(e)}
                            inputProps={{
                              name: 'selectedMonth',
                              id: 'selected-month',
                            }}
                            className={classes.selectEmpty}
                          >
                            {
                              months.map((monthObj, index) => (
                                <MenuItem key={index} value={monthObj.value}>{monthObj.name}</MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </span>
                      :
                      <span>
                        <FormControl className={classes.filterItemsWeek}>
                          {/* <InputLabel htmlFor="selected-week">Week</InputLabel> */}
                          <Select
                            value={this.state.selectedWeek}
                            onChange={(e) => this.handleFilterOptions(e)}
                            inputProps={{
                              name: 'selectedWeek',
                              id: 'selected-week',
                            }}
                            MenuProps={{ classes: { paper: classes.menuPaper } }}
                          >
                            {
                              weeks.map((monthObj, index) => (
                                <MenuItem key={index} value={monthObj.value}>{monthObj.name}</MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </span>
                  }
                  <span>
                    <FormControl className={classes.filterItems}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          views={["year"]}
                          inputProps={{
                            name: 'selectedYear',
                            id: 'selected-year',
                          }}
                          value={this.state.selectedYear}
                          onChange={(e) => this.handleYearSelection(e)}
                        />
                      </MuiPickersUtilsProvider>
                    </FormControl>
                  </span>
                  <span className={classes.filterText} > In </span>
                  <span>
                    <FormControl className={classes.filterItems} >
                      {/* <InputLabel htmlFor="selected-view-type">week/month</InputLabel> */}
                      <Select
                        value={this.state.country}
                        onChange={(e) => this.handleCountrySelection(e)}
                        inputProps={{
                          name: 'selectedCountry',
                          id: 'selected-country',
                        }}
                        className={classes.selectEmpty}
                      >
                        {countries.map((country, index) =>
                          <MenuItem key={index} value={country}>{country}</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </span>
                  <span>
                    <Button className={classes.filterButton} variant="contained" color="primary" onClick={this.getOverviewData}>VIEW {this.state.isLoading && <CircularProgress className={classes.buttonLoader} size={20} />}</Button>
                  </span>
                </div>
              </Grid>
            </Grid>
          </CardHeader>
          <CardBody>
            <h5 className={classes.header_center}>FIXED LOANS</h5>
            <>
              <TableContainer component={Paper} className={classes.tableContainer}>
                <h6 className={classes.sub_section_header}>NEW BUSINESS - {this.state.headerDisplayCountry}</h6>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.tableHeaderCellCenter}>Customer</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Contract</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Contract-date</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Payment-Date</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Amount to Customer</TableCell>
                      <TableCell className={classes.tableHeaderCell}>3rd Parties</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Refinanced Amount</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Principle Amount</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Total Margin</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Total Loan</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Duration</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Initial% Rate</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Interest% Rate</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Total% for loan</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>APR</TableCell>
                    </TableRow>
                  </TableHead>

                  {/* NEW BUSINESS */}
                  <TableBody>
                    {fixedNewBusinessLoans && fixedNewBusinessLoans.length !== 0 ?
                      Utility.stableSort(fixedNewBusinessLoans,
                        Utility.getSorting('asc', 'paymentDate')).map((row) => (
                          <TableRow key={row.contract}>
                            <TableCell className={classes.tableBodyCellCenter}>{row.customer}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.contract}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.startDate}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.paymentDate}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.amountToCustomer, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.numberOfThirdPartiesInvolved}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.refinanceAmount, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.principleAmount, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.totalMargin, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.totalLoan, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.duration}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.initialPercentageRate, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.interestPercentageRate, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.totalPercentageForLoan, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.aprPercentage, locale)}</TableCell>
                          </TableRow>
                        )) : <TableRow>
                        <TableCell align='center' colSpan={17}>
                          {'No Data to show'}
                        </TableCell>
                      </TableRow>}

                    {/* Calculate the total */}
                    {fixedNewBusinessLoans && fixedNewBusinessLoans.length !== 0 ?
                      <TableRow className={classes.height_50}>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.boldFontCenter}>Total</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedNewBusinessSubTotal ?
                          fixedNewBusinessSubTotal.totalAmountToCustomer : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedNewBusinessSubTotal ?
                          fixedNewBusinessSubTotal.totalRefinanceAmount : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedNewBusinessSubTotal ?
                          fixedNewBusinessSubTotal.totalPrincipleAmount : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedNewBusinessSubTotal ?
                          fixedNewBusinessSubTotal.totalTotalMargin : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedNewBusinessSubTotal ?
                          fixedNewBusinessSubTotal.totalTotalLoan : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedNewBusinessSubTotal.weightedAverageDuration ?
                          fixedNewBusinessSubTotal.weightedAverageDuration : 0}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedNewBusinessSubTotal.weightedAverageInitialPercentageRate ?
                          PERCENTAGE(fixedNewBusinessSubTotal.weightedAverageInitialPercentageRate, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedNewBusinessSubTotal.weightedAverageInterestPercentageRate ?
                          PERCENTAGE(fixedNewBusinessSubTotal.weightedAverageInterestPercentageRate, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedNewBusinessSubTotal.weightedAverageTotalPercentageForLoan ?
                          PERCENTAGE(fixedNewBusinessSubTotal.weightedAverageTotalPercentageForLoan, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedNewBusinessSubTotal.weightedAverageAprPercentage ?
                          PERCENTAGE(fixedNewBusinessSubTotal.weightedAverageAprPercentage, locale) : `${0} %`}</TableCell>
                      </TableRow>
                      : <TableRow></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* </> */}
              <TableContainer component={Paper} className={classes.tableContainer}>
                <h6 className={classes.sub_section_header}>RETENTION - {this.state.headerDisplayCountry}</h6>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.tableHeaderCellCenter}>Customer</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Contract</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Contract-date</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Payment-Date</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Amount to Customer</TableCell>
                      <TableCell className={classes.tableHeaderCell}>3rd Parties</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Refinanced Amount</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Principle Amount</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Total Margin</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Total Loan</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Duration</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Initial% Rate</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Interest% Rate</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Total% for loan</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>APR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fixedRetentionLoans && fixedRetentionLoans.length !== 0 ?
                      Utility.stableSort(fixedRetentionLoans,
                        Utility.getSorting('asc', 'paymentDate')).map((row) => (
                          <TableRow key={row.contract}>
                            <TableCell className={classes.tableBodyCellCenter}>{row.customer}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.contract}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.startDate}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.paymentDate}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.amountToCustomer, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.numberOfThirdPartiesInvolved}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.refinanceAmount, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.principleAmount, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.totalMargin, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.totalLoan, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.duration}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.initialPercentageRate, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.interestPercentageRate, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.totalPercentageForLoan, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.aprPercentage, locale)}</TableCell>
                          </TableRow>
                        )) : <TableRow>
                        <TableCell align='center' colSpan={17}>
                          {'No Data to show'}
                        </TableCell>
                      </TableRow>}
                    {/* Calculate the total */}
                    {fixedRetentionLoans && fixedRetentionLoans.length !== 0 ?
                      <TableRow className={classes.height_50}>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.boldFontCenter}>Total</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRetentionSubTotal ?
                          fixedRetentionSubTotal.totalAmountToCustomer : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRetentionSubTotal ?
                          fixedRetentionSubTotal.totalRefinanceAmount : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRetentionSubTotal ?
                          fixedRetentionSubTotal.totalPrincipleAmount : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRetentionSubTotal ?
                          fixedRetentionSubTotal.totalTotalMargin : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRetentionSubTotal ?
                          fixedRetentionSubTotal.totalTotalLoan : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRetentionSubTotal.weightedAverageDuration ?
                          fixedRetentionSubTotal.weightedAverageDuration : 0}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRetentionSubTotal.weightedAverageInitialPercentageRate ?
                          PERCENTAGE(fixedRetentionSubTotal.weightedAverageInitialPercentageRate, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRetentionSubTotal.weightedAverageInterestPercentageRate ?
                          PERCENTAGE(fixedRetentionSubTotal.weightedAverageInterestPercentageRate, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRetentionSubTotal.weightedAverageTotalPercentageForLoan ?
                          PERCENTAGE(fixedRetentionSubTotal.weightedAverageTotalPercentageForLoan, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRetentionSubTotal.weightedAverageAprPercentage ?
                          PERCENTAGE(fixedRetentionSubTotal.weightedAverageAprPercentage, locale) : `${0} %`}</TableCell>
                      </TableRow>
                      : <TableRow></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper} className={classes.tableContainer}>
                <h6 className={classes.sub_section_header}>REFINANCE - {this.state.headerDisplayCountry}</h6>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.tableHeaderCellCenter}>Customer</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Contract</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Contract-date</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Payment-Date</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Amount to Customer</TableCell>
                      <TableCell className={classes.tableHeaderCell}>3rd Parties</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Refinanced Amount</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Principle Amount</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Total Margin</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Total Loan</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Duration</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Initial% Rate</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Interest% Rate</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>Total% for loan</TableCell>
                      <TableCell className={classes.tableHeaderCellCenter}>APR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fixedRefinancedLoans && fixedRefinancedLoans.length !== 0 ?
                      Utility.stableSort(fixedRefinancedLoans,
                        Utility.getSorting('asc', 'paymentDate')).map((row) => (
                          <TableRow key={row.contract}>
                            <TableCell className={classes.tableBodyCellCenter}>{row.customer}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.contract}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.startDate}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.paymentDate}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.amountToCustomer, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.numberOfThirdPartiesInvolved}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.refinanceAmount, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.principleAmount, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.totalMargin, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.totalLoan, locale, currency)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{row.duration}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.initialPercentageRate, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.interestPercentageRate, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.totalPercentageForLoan, locale)}</TableCell>
                            <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.aprPercentage, locale)}</TableCell>
                          </TableRow>
                        )) : <TableRow>
                        <TableCell align='center' colSpan={17}>
                          {'No Data to show'}
                        </TableCell>
                      </TableRow>}

                    {/* Calculate the total */}
                    {fixedRefinancedLoans && fixedRefinancedLoans.length !== 0 ?
                      <TableRow className={classes.height_50}>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.boldFontCenter}>Total</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRefinancedSubTotal ?
                          fixedRefinancedSubTotal.totalAmountToCustomer : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRefinancedSubTotal ?
                          fixedRefinancedSubTotal.totalRefinanceAmount : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRefinancedSubTotal ?
                          fixedRefinancedSubTotal.totalPrincipleAmount : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRefinancedSubTotal ?
                          fixedRefinancedSubTotal.totalTotalMargin : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontRight}>{CURRENCY(fixedRefinancedSubTotal ?
                          fixedRefinancedSubTotal.totalTotalLoan : 0, locale, currency)}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRefinancedSubTotal.weightedAverageDuration ?
                          fixedRefinancedSubTotal.weightedAverageDuration : 0}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRefinancedSubTotal.weightedAverageInitialPercentageRate ?
                          PERCENTAGE(fixedRefinancedSubTotal.weightedAverageInitialPercentageRate, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRefinancedSubTotal.weightedAverageInterestPercentageRate ?
                          PERCENTAGE(fixedRefinancedSubTotal.weightedAverageInterestPercentageRate, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRefinancedSubTotal.weightedAverageTotalPercentageForLoan ?
                          PERCENTAGE(fixedRefinancedSubTotal.weightedAverageTotalPercentageForLoan, locale) : `${0} %`}</TableCell>
                        <TableCell className={classes.boldFontCenter}>{fixedRefinancedSubTotal.weightedAverageAprPercentage ?
                          PERCENTAGE(fixedRefinancedSubTotal.weightedAverageAprPercentage, locale) : `${0} %`}</TableCell>
                      </TableRow>
                      : <TableRow></TableRow>}
                    <TableRow className={classes.height_100}>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.boldFontCenter}>Overall Total</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(fixedOverallTotals ?
                        fixedOverallTotals.overallTotalAmountToCustomer : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(fixedOverallTotals ?
                        fixedOverallTotals.overallTotalRefinanceAmount : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(fixedOverallTotals ?
                        fixedOverallTotals.overallTotalPrincipleAmount : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(fixedOverallTotals ?
                        fixedOverallTotals.overallTotalTotalMargin : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(fixedOverallTotals ?
                        fixedOverallTotals.overallTotalTotalLoan : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{fixedOverallTotals.overallWeightedAverageDuration ?
                        fixedOverallTotals.overallWeightedAverageDuration : 0}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{fixedOverallTotals.overallWeightedAverageInitialPercentageRate ?
                        PERCENTAGE(fixedOverallTotals.overallWeightedAverageInitialPercentageRate, locale) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{fixedOverallTotals.overallWeightedAverageInitialPercentageRate ?
                        PERCENTAGE(fixedOverallTotals.overallWeightedAverageInitialPercentageRate, locale) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{fixedOverallTotals.overallWeightedAverageTotalPercentageForLoan ?
                        PERCENTAGE(fixedOverallTotals.overallWeightedAverageTotalPercentageForLoan, locale) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{fixedOverallTotals.overallWeightedAverageAprPercentage ?
                        PERCENTAGE(fixedOverallTotals.overallWeightedAverageAprPercentage, locale) : `${0} %`}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
            <h5 className={classes.header_center}>FLEX LOANS</h5>
            <TableContainer component={Paper} className={classes.tableContainer}>
              <h6 className={classes.sub_section_header}>NEW BUSINESS - {this.state.headerDisplayCountry}</h6>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCellCenter}>Customer</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Contract</TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableBodyCellRight}>Credit-Limit</TableCell>
                    <TableCell className={classes.tableBodyCellRight}>Withdrawal Amount</TableCell>
                    <TableCell className={classes.tableBodyCellRight}>Withdrawal Fee</TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Duration</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Withdrawal %</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Recurring %</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>APR</TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                  </TableRow>
                </TableHead>

                {/* NEW BUSINESS */}
                <TableBody>
                  {flexNewBusinessLoans && flexNewBusinessLoans.length !== 0 ?
                    flexNewBusinessLoans.map((row) => (
                      <TableRow key={row.contract}>
                        <TableCell className={classes.tableBodyCellCenter}>{row.customer}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{row.contract}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.creditLimit, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.withdrawalAmount, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.withdrawalFee, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{row.duration}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.withdrawalPercentage, locale)}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.recurringFeePercentage, locale)}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.aprPercentage, locale)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                      </TableRow>))
                    : <TableRow>
                      <TableCell align='center' colSpan={17}>
                        {'No Data to show'}
                      </TableCell>
                    </TableRow>}
                  {/* Calculate the total */}
                  {flexNewBusinessLoans && flexNewBusinessLoans.length !== 0 ?
                    <TableRow className={classes.height_50}>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.boldFontCenter}>TOTAL</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(flexNewBusinessSubTotal ?
                        flexNewBusinessSubTotal.totalCreditLimit : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(flexNewBusinessSubTotal ?
                        flexNewBusinessSubTotal.totalWithdrawalAmount : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(flexNewBusinessSubTotal ?
                        flexNewBusinessSubTotal.totalWithdrawalFee : 0, locale, currency)}</TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexNewBusinessSubTotal ?
                        flexNewBusinessSubTotal.weightedAverageDuration : 0}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexNewBusinessSubTotal.weightedAverageWithdrawalInterestPercentage ?
                        PERCENTAGE(flexNewBusinessSubTotal.weightedAverageWithdrawalInterestPercentage, locale) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexNewBusinessSubTotal.weightedAverageRecurringInterestPercentage ?
                        PERCENTAGE(flexNewBusinessSubTotal.weightedAverageRecurringInterestPercentage, locale) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexNewBusinessSubTotal.weightedAverageAprPercentage ?
                        PERCENTAGE(flexNewBusinessSubTotal.weightedAverageAprPercentage, locale) : `${0} %`}</TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                    </TableRow>
                    : <TableRow></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper} className={classes.tableContainer}>
              <h6 className={classes.sub_section_header}>RETENTION - {this.state.headerDisplayCountry}</h6>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCellCenter}>Customer</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Contract</TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableBodyCellRight}>Credit-Limit</TableCell>
                    <TableCell className={classes.tableBodyCellRight}>Withdrawal Amount</TableCell>
                    <TableCell className={classes.tableBodyCellRight}>Withdrawal Fee</TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Duration</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Withdrawal %</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>Recurring %</TableCell>
                    <TableCell className={classes.tableHeaderCellCenter}>APR</TableCell>
                    <TableCell className={classes.tableHeaderCell}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flexRetentionLoans && flexRetentionLoans.length !== 0 ?
                    flexRetentionLoans.map((row) => (
                      <TableRow key={row.contract}>
                        <TableCell className={classes.tableBodyCellCenter}>{row.customer}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{row.contract}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.creditLimit, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.withdrawalAmount, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCellRight}>{CURRENCY(row.withdrawalFee, locale, currency)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{row.duration}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.withdrawalPercentage, locale)}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.recurringFeePercentage, locale)}</TableCell>
                        <TableCell className={classes.tableBodyCellCenter}>{PERCENTAGE(row.aprPercentage, locale)}</TableCell>
                        <TableCell className={classes.tableBodyCell}></TableCell>
                      </TableRow>))
                    : <TableRow>
                      <TableCell align='center' colSpan={17}>
                        {'No Data to show'}
                      </TableCell>
                    </TableRow>}

                  {/* Calculate the total */}
                  {flexRetentionLoans && flexRetentionLoans.length !== 0 ?
                    <TableRow className={classes.height_50}>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.boldFontCenter}>TOTAL</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(flexRetentionSubTotal ?
                        flexRetentionSubTotal.totalCreditLimit : 0)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(flexRetentionSubTotal ?
                        flexRetentionSubTotal.totalWithdrawalAmount : 0)}</TableCell>
                      <TableCell className={classes.boldFontRight}>{CURRENCY(flexRetentionSubTotal ?
                        flexRetentionSubTotal.totalWithdrawalFee : 0)}</TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexRetentionSubTotal ?
                        flexRetentionSubTotal.weightedAverageDuration : 0}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexRetentionSubTotal.weightedAverageWithdrawalInterestPercentage ?
                        PERCENTAGE(flexRetentionSubTotal.weightedAverageWithdrawalInterestPercentage) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexRetentionSubTotal.weightedAverageRecurringInterestPercentage ?
                        PERCENTAGE(flexRetentionSubTotal.weightedAverageRecurringInterestPercentage) : `${0} %`}</TableCell>
                      <TableCell className={classes.boldFontCenter}>{flexRetentionSubTotal.weightedAverageAprPercentage ?
                        PERCENTAGE(flexRetentionSubTotal.weightedAverageAprPercentage) : `${0} %`}</TableCell>
                      <TableCell className={classes.tableBodyCell}></TableCell>
                    </TableRow>
                    : <TableRow></TableRow>}
                  <TableRow className={classes.height_100}>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                    <TableCell className={classes.boldFontCenter}></TableCell>
                    <TableCell className={classes.boldFontRight}>{CURRENCY(flexOverallTotals ?
                      flexOverallTotals.overallTotalCreditLimit : 0, locale, currency)}</TableCell>
                    <TableCell className={classes.boldFontRight}>{CURRENCY(flexOverallTotals ?
                      flexOverallTotals.overallTotalWithdrawalAmount : 0, locale, currency)}</TableCell>
                    <TableCell className={classes.boldFontRight}>{CURRENCY(flexOverallTotals ?
                      flexOverallTotals.overallTotalWithdrawalFee : 0, locale, currency)}</TableCell>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                    <TableCell className={classes.boldFontCenter}>{flexOverallTotals ?
                      flexOverallTotals.overallWeightedAverageDuration : 0}</TableCell>
                    <TableCell className={classes.boldFontCenter}>{flexOverallTotals.overallWeightedAverageWithdrawalInterestPercentage ?
                      PERCENTAGE(flexOverallTotals.overallWeightedAverageWithdrawalInterestPercentage, locale) : `${0} %`}</TableCell>
                    <TableCell className={classes.boldFontCenter}>{flexOverallTotals.overallWeightedAverageRecurringInterestPercentage ?
                      PERCENTAGE(flexOverallTotals.overallWeightedAverageRecurringInterestPercentage, locale) : `${0} %`}</TableCell>
                    <TableCell className={classes.boldFontCenter}>{flexOverallTotals.overallWeightedAverageAprPercentage ?
                      PERCENTAGE(flexOverallTotals.overallWeightedAverageAprPercentage, locale) : `${0} %`}</TableCell>
                    <TableCell className={classes.tableBodyCell}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardBody >
        </Card >
      </div >
    );
  }
}

LoansGivenOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  displayNotification: PropTypes.func,
  getLoansGivenOverviewData: PropTypes.func,
};

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
  getLoansGivenOverviewData: (startDate, endDate, country) => (dispatch(getLoansGivenOverviewData(startDate, endDate, country))),
  getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
  getLocales: (requestBody) => dispatch(getLocales(requestBody)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(style)(LoansGivenOverview));