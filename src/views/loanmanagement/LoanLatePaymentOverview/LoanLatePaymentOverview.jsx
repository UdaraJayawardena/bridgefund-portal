import React, { Fragment } from 'react';
import qs from "querystring";
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import Util from 'lib/loanmanagement/utility';
import { getAllLoanLatePaymentOverviews } from 'store/loanmanagement/actions/LoanLatePaymentOverview';
import { getPreviousWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { Table, TableBody, TableCell, TableHead, TableRow, CardActionArea, Typography, Drawer, Grid, Box, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import withStyles from '@material-ui/core/styles/withStyles';
import MultipleLoanOverview from '../MultipleLoanOverview/MultipleLoanOverview';
import Notifier from 'components/loanmanagement/Notification/Notifier';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { selectLoan } from 'store/loanmanagement/actions/SmeLoans';
import history from "./../../../history";
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { clearHeaderDisplaySubData, clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';
import { getFieldNameValues, getLocales} from "store/initiation/actions/Configuration.action";


// const currency = Util.currencyConverter();
const CURRENCY = Util.multiCurrencyConverter();
const styles = {
  tableRowStyle: {
    padding: "4px 56px 0px 24px"
  },
  tableCell: {
    padding: "5px 5px 2px 5px"
  },
  cardHeaderStyle: {
    padding: "5px 20px 5px 20px"
  },
  cardBodyStyle: {
    padding: "0.2rem 19px"
  },
  cardStyle: {
    marginBottom: "0px"
  }
};

function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  return uri + separator + key + "=" + value;
}

class LoanLatePaymentOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDate: moment(this.props.systemDate).format('YYYY-MM-DD'),
      showMultipleLoanOverview: false,
      selectedLoanItems: [],
      selectedFrequency: '',
      countries: [],
	     selectedCountry: 'All',
      locale: 'nl-NL',
      selectedCurrency: 'EUR'
      // redirectToSingleLoanOverviewLoanId: null
    };
  }

  componentDidMount() {

    // this.setState({ redirectToSingleLoanOverviewLoanId: null })
    const params = this.props.location ? qs.parse(this.props.location.search.slice(1)) : null;

    if (params && params.date) {

      this.setState({ selectedDate: params.date }, () => {
        this.props.getAllLoanLatePaymentOverviews(params.date, this.state.selectedFrequency, this.state.selectedCountry);
      });
    } else {

      const currentDate = moment(this.props.systemDate).add(-1, 'days');
      let defaultDate;

      this.props.getPreviousWorkingDate(currentDate, 1)
        .then(result => {

          defaultDate = result;
        }).then(() => {

          this.setState({
            selectedDate: moment(defaultDate).format('YYYY-MM-DD')
          }, () => {

            this.props.getAllLoanLatePaymentOverviews(defaultDate, this.state.selectedFrequency, this.state.selectedCountry);
          });
        });
    }
    this.getFieldNameValues();
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
             if (requestObjs[i].fieldName === 'country') this.setState({ countries: fieldNameValues });
           }
         }

       });
   }
 }

 getLocales = async (country) => {

  this.props.getLocales({countryCode: country==='All'? 'NL' : country})
 .then(res => {
     this.setState({ 
      locale: res[0].locale,
      selectedCurrency: res[0].currencyCode
      });
 })
 .catch(err => { console.log('getLocales err ', err); });    
}

  setColor(stage, category) {
    if (category === 1 && (stage === 1 || stage === 2 || stage === 3)) {
      return "danger";
    } if ((category === 1 && (stage === 4 || stage === 5)) || (category === 2 && (stage === 1 || stage === 2 || stage === 3))) {
      return "warning";
    } if ((category === 2 && (stage === 4 || stage === 5)) || (category === 3 && (stage === 1 || stage === 2 || stage === 3))) {
      return "liteYellow";
    } if ((category === 3 && (stage === 4 || stage === 5)) || (category === 4 && (stage === 1 || stage === 2 || stage === 3))) {
      return "liteGreen";
    } if (category === 4 && (stage === 4 || stage === 5)) {
      return "success";
    } if (category === 5) {
      return "success";
    }

  }

  handleSelectedDate = (date) => {

    const value = moment(date).format('YYYY-MM-DD');
    if (moment(value).isValid()) {
      this.setState({ selectedDate: value }, function () {
        this.props.getAllLoanLatePaymentOverviews(this.state.selectedDate, this.state.selectedFrequency, this.state.selectedCountry);
      });
    }
    const URL = updateQueryStringParameter(document.location.href, 'date', value);
    window.history.pushState({ path: URL }, '', URL);
  }

  handleFrequencySelect = (e) => {
    this.setState({ selectedFrequency: e.target.value }, function () {
      this.props.getAllLoanLatePaymentOverviews(this.state.selectedDate, this.state.selectedFrequency, this.state.selectedCountry);
    });
  }

  handleCountrySelect = (e) => {
   const country = e.target.value;
   this.getLocales(country);
   this.setState({ selectedCountry: country }, function () {
     this.props.getAllLoanLatePaymentOverviews(this.state.selectedDate, this.state.selectedFrequency, this.state.selectedCountry);
   });
 }

  popUpDrawyer(loan) {
    const { selectedDashboardItems, isDashboardContent } = this.props;



    if (loan.loanItemList.length === 0) {
      return;
    }
    if (loan.loanItemList.length === 1) {
      // this.props.history.push(`/user/singleLoanOverview/1234`);
      if (isDashboardContent) {
        const contractId = loan.loanItemList[0].smeLoanNumber;
        this.props.clearSelectedCustomer();
        this.props.selectLoan({contractId});
         this.props.setNavigationInDashboards('SingleLoanOverview')
      .then(res => {
        if (res) {
          history.push(res);
          }
      });
      }
      else {
        this.props.history.push(`/user/singleLoanOverview/${loan.loanItemList[0].smeLoanNumber}`);
        return;
      }
    }
    this.setState({ selectedLoanItems: loan.loanItemList });
    this.setState({ showMultipleLoanOverview: true });

  }

  getColumnHeaderNames = () => {
    const { selectedFrequency } = this.state;

    if (selectedFrequency === '') {
      return {
        firstColumn: 'Missed > 60%',
        secondColumn: 'Missed > 30%',
        thirdColumn: 'Category - 3',
        fourthColumn: 'Category - 4',
        fifthColumn: 'Category - 5',
      };
    }

    if (selectedFrequency === 'daily') {
      return {
        firstColumn: 'Missed > 60%',
        secondColumn: 'Missed > 30%',
        thirdColumn: 'Missed >= 10 dd',
        fourthColumn: 'Missed >= 5 dd',
        fifthColumn: 'Missed < 5 dd',
      };
    }
    //for daily or monthly frequency
    return {
      firstColumn: 'Missed > 60%',
      secondColumn: 'Missed > 30%',
      thirdColumn: 'Missed >= 3 dd',
      fourthColumn: 'Missed = 2 dd',
      fifthColumn: 'Missed = 1 dd',
    };

  }

  render() {
    const { loanLatePayments, totalOverallOriginalLoanValue,
      totalOverallTotalOutstanding,
      totalOverallTotalOverdue, } = this.props;
      const { countries } = this.state;

    return (
      <div>
        <div>
          <Notifier />
          <CardHeader style={{ marginBottom: '10px', marginTop: '10px' }} color="info" >
            <Typography variant="h5" color='inherit'>
              Loan Late Payment Overview
            </Typography>
          </CardHeader>
          <CardHeader style={{ marginBottom: '10px', marginTop: '10px', }}  >
            <Grid container spacing={2}>
              <Grid item>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    id="loan-late-payment-overview-date"
                    name="selectedDate"
                    autoOk
                    variant="inline"
                    label="Overview Date "
                    inputVariant="outlined"
                    format="DD-MM-YYYY"
                    value={this.state.selectedDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={date => this.handleSelectedDate(date)}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              {/* filter by country */}              
              <Grid item>
                <FormControl variant="outlined" style={{ minWidth: 120 }}>
                  <InputLabel id="select-country-label">Country</InputLabel>
                  <Select
                    labelId="select-country-label"
                    id="select-country"
                    value={this.state.selectedCountry}
                    name="selectedCountry"
                    onChange={this.handleCountrySelect}
                    label="Country"
                  >
                    <MenuItem value="All">
                      <em>All</em>
                    </MenuItem>
                    {countries?.map((country, index) =>
                     <MenuItem key={index} value={country}>{country}</MenuItem>
                   )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl variant="outlined" style={{ minWidth: 120 }}>
                  <InputLabel id="select-frequency-label">Frequency</InputLabel>
                  <Select
                    labelId="select-frequency-label"
                    id="select-frequency"
                    value={this.state.selectedFrequency}
                    name="selectedFrequency"
                    onChange={this.handleFrequencySelect}
                    label="Frequency"
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    <MenuItem value={'daily'}>Daily</MenuItem>
                    <MenuItem value={'weekly'}>Weekly</MenuItem>
                    <MenuItem value={'monthly'}>Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* table header-01 items (3 Overall values)*/}
            <Grid container>
              <Grid item xs={4}>
                <Box p={1} m={1} style={{ backgroundColor: 'transparent' }}>
                  <Typography variant="body1" gutterBottom>
                    {'Overall Original Loan Value '}&nbsp;&nbsp;
                    {/* {currency(totalOverallOriginalLoanValue)} */}
                    {CURRENCY(totalOverallOriginalLoanValue, this.state.locale, this.state.selectedCurrency)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box p={1} m={1} style={{ backgroundColor: 'transparent' }}>
                  <Typography variant="body1" gutterBottom>
                    {'Overall Total Outstanding '}&nbsp;&nbsp;
                    {/* {currency(totalOverallTotalOutstanding)} */}
                    {CURRENCY(totalOverallTotalOutstanding, this.state.locale, this.state.selectedCurrency)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box p={1} m={1} style={{ backgroundColor: 'transparent' }}>
                  <Typography variant="body1" gutterBottom>
                    {'Overall Total Overdue '}&nbsp;&nbsp;
                    {/* {currency(totalOverallTotalOverdue)} */}
                    {CURRENCY(totalOverallTotalOverdue, this.state.locale, this.state.selectedCurrency)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardHeader>

          {/* table of Loan-Late-Payments*/}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={styles.tableCell}>
                  &nbsp;
                </TableCell>
                <TableCell style={styles.tableCell} align="center">{this.getColumnHeaderNames().firstColumn}</TableCell>
                <TableCell style={styles.tableCell} align="center">{this.getColumnHeaderNames().secondColumn}</TableCell>
                <TableCell style={styles.tableCell} align="center">{this.getColumnHeaderNames().thirdColumn}</TableCell>
                <TableCell style={styles.tableCell} align="center">{this.getColumnHeaderNames().fourthColumn}</TableCell>
                <TableCell style={styles.tableCell} align="center">{this.getColumnHeaderNames().fifthColumn}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody >
              {loanLatePayments.length === 0 ?
                <TableRow style={{ textAlign: 'center' }}>
                  <TableCell style={{ textAlign: 'center' }}>
                    No data to show on the selected date
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
                :
                <Fragment>
                  <TableRow>
                    <TableCell style={styles.tableCell}>
                      <Card style={styles.cardStyle}>
                        <CardActionArea>
                          <CardHeader style={styles.cardHeaderStyle} color="info">Stage 1</CardHeader>
                          <CardBody style={styles.cardBodyStyle}>
                            <Typography align='left'>Total Loan Value</Typography>
                            <Typography align='left'>Total Outstanding</Typography>
                            <Typography align='left'>Total Overdue</Typography>
                          </CardBody>
                        </CardActionArea>
                      </Card>
                    </TableCell>
                    {loanLatePayments.map((loan, index) =>
                      (loan.stage === 1) ?
                        <TableCell key={index} style={styles.tableCell}>
                          <Card style={styles.cardStyle}>
                            <CardActionArea onClick={() => this.popUpDrawyer(loan)}>
                              <CardHeader style={styles.cardHeaderStyle} color={this.setColor(loan.stage, loan.repaymentCategory)}>No of loans {loan.loanItemList.length}</CardHeader>
                              <CardBody style={styles.cardBodyStyle}>
                                {/* <Typography align='right'>{currency(loan.overallTotalLoanAmountOfBlock)}</Typography>
                                <Typography align='right'>{currency(loan.overallOutstandingTotalAmountOfBlock)}</Typography>
                                <Typography align='right'>{currency(loan.overallTotalOverdueAmountOfBlock)}</Typography> */}
                                <Typography align='right'>{CURRENCY(loan.overallTotalLoanAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallOutstandingTotalAmountOfBlock,this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallTotalOverdueAmountOfBlock,this.state.locale, this.state.selectedCurrency)}</Typography>
                              </CardBody>
                            </CardActionArea>
                          </Card>
                        </TableCell>
                        :
                        null
                    )
                    }
                  </TableRow>
                  <TableRow>
                    <TableCell style={styles.tableCell}>
                      <Card style={styles.cardStyle}>
                        <CardActionArea>
                          <CardHeader style={styles.cardHeaderStyle} color="info">Stage 2</CardHeader>
                          <CardBody style={styles.cardBodyStyle}>
                            <Typography align='left'>Total Loan Value</Typography>
                            <Typography align='left'>Total Outstanding</Typography>
                            <Typography align='left'>Total Overdue</Typography>
                          </CardBody>
                        </CardActionArea>
                      </Card>
                    </TableCell>
                    {loanLatePayments.map((loan, index) =>
                      (loan.stage === 2) ?
                        <TableCell key={index} style={styles.tableCell}>
                          <Card style={styles.cardStyle}>
                            <CardActionArea onClick={() => this.popUpDrawyer(loan)}>
                              <CardHeader style={styles.cardHeaderStyle} color={this.setColor(loan.stage, loan.repaymentCategory)}>No of loans {loan.loanItemList.length}</CardHeader>
                              <CardBody style={styles.cardBodyStyle}>
                                <Typography align='right'>{CURRENCY(loan.overallTotalLoanAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallOutstandingTotalAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallTotalOverdueAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                              </CardBody>
                            </CardActionArea>
                          </Card>
                        </TableCell>
                        :
                        null
                    )
                    }
                  </TableRow>
                  <TableRow>
                    <TableCell style={styles.tableCell}>
                      <Card style={styles.cardStyle}>
                        <CardActionArea>
                          <CardHeader style={styles.cardHeaderStyle} color="info">Stage 3</CardHeader>
                          <CardBody style={styles.cardBodyStyle}>
                            <Typography align='left'>Total Loan Value</Typography>
                            <Typography align='left'>Total Outstanding</Typography>
                            <Typography align='left'>Total Overdue</Typography>
                          </CardBody>
                        </CardActionArea>
                      </Card>
                    </TableCell>
                    {loanLatePayments.map((loan, index) =>
                      (loan.stage === 3) ?
                        <TableCell key={index} style={styles.tableCell}>
                          <Card style={styles.cardStyle}>
                            <CardActionArea onClick={() => this.popUpDrawyer(loan)}>
                              <CardHeader style={styles.cardHeaderStyle} color={this.setColor(loan.stage, loan.repaymentCategory)}>No of loans {loan.loanItemList.length}</CardHeader>
                              <CardBody style={styles.cardBodyStyle}>
                                <Typography align='right'>{CURRENCY(loan.overallTotalLoanAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallOutstandingTotalAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallTotalOverdueAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                              </CardBody>
                            </CardActionArea>
                          </Card>
                        </TableCell>
                        :
                        null
                    )
                    }
                  </TableRow>
                  <TableRow>
                    <TableCell style={styles.tableCell}>
                      <Card style={styles.cardStyle}>
                        <CardActionArea>
                          <CardHeader style={styles.cardHeaderStyle} color="info">Stage 4</CardHeader>
                          <CardBody style={styles.cardBodyStyle}>
                            <Typography align='left'>Total Loan Value</Typography>
                            <Typography align='left'>Total Outstanding</Typography>
                            <Typography align='left'>Total Overdue</Typography>
                          </CardBody>
                        </CardActionArea>
                      </Card>
                    </TableCell>
                    {loanLatePayments.map((loan, index) =>
                      (loan.stage === 4) ?
                        <TableCell key={index} style={styles.tableCell}>
                          <Card style={styles.cardStyle}>
                            <CardActionArea onClick={() => this.popUpDrawyer(loan)}>
                              <CardHeader style={styles.cardHeaderStyle} color={this.setColor(loan.stage, loan.repaymentCategory)}>No of loans {loan.loanItemList.length}</CardHeader>
                              <CardBody style={styles.cardBodyStyle}>
                                <Typography align='right'>{CURRENCY(loan.overallTotalLoanAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallOutstandingTotalAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallTotalOverdueAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                              </CardBody>
                            </CardActionArea>
                          </Card>
                        </TableCell>
                        :
                        null
                    )
                    }
                  </TableRow>
                  <TableRow>
                    <TableCell style={styles.tableCell}>
                      <Card style={styles.cardStyle}>
                        <CardActionArea>
                          <CardHeader style={styles.cardHeaderStyle} color="info">Stage 5</CardHeader>
                          <CardBody style={styles.cardBodyStyle}>
                            <Typography align='left'>Total Loan Value</Typography>
                            <Typography align='left'>Total Outstanding</Typography>
                            <Typography align='left'>Total Overdue</Typography>
                          </CardBody>
                        </CardActionArea>
                      </Card>
                    </TableCell>
                    {loanLatePayments.map((loan, index) =>
                      (loan.stage === 5) ?
                        <TableCell key={index} style={styles.tableCell}>
                          <Card style={styles.cardStyle}>
                            <CardActionArea onClick={() => this.popUpDrawyer(loan)}>
                              <CardHeader style={styles.cardHeaderStyle} color={this.setColor(loan.stage, loan.repaymentCategory)}>No of loans {loan.loanItemList.length}</CardHeader>
                              <CardBody style={styles.cardBodyStyle}>
                                <Typography align='right'>{CURRENCY(loan.overallTotalLoanAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallOutstandingTotalAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                                <Typography align='right'>{CURRENCY(loan.overallTotalOverdueAmountOfBlock, this.state.locale, this.state.selectedCurrency)}</Typography>
                              </CardBody>
                            </CardActionArea>
                          </Card>
                        </TableCell>
                        :
                        null
                    )
                    }
                  </TableRow>

                </Fragment>
              }
            </TableBody>
          </Table>
        </div>
        <Drawer
          anchor="bottom"
          open={this.state.showMultipleLoanOverview}
          onClose={() => { this.setState({ showMultipleLoanOverview: !this.state.showMultipleLoanOverview }); }}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <MultipleLoanOverview
              loanLatePayments={this.state.selectedLoanItems}
              toggleDrawer={() => { this.setState({ showMultipleLoanOverview: !this.state.showMultipleLoanOverview }); }}
              origin='LOAN_LATE'
              overviewDate={this.props.overviewDate}
              country= {this.state.selectedCountry}
            />
          </div>
        </Drawer>
      </div>);
  }
}
LoanLatePaymentOverview.propTypes = {
  loanLatePayments: PropTypes.array,
  totalOverallOriginalLoanValue: PropTypes.number,
  totalOverallTotalOutstanding: PropTypes.number,
  totalOverallTotalOverdue: PropTypes.number,
  getAllLoanLatePaymentOverviews: PropTypes.func,
  getPreviousWorkingDate: PropTypes.func,
  location: PropTypes.object,
  overviewDate: PropTypes.string,
  history: PropTypes.object,
  systemDate: PropTypes.string,
  isDashboardContent: PropTypes.bool,
  selectedDashboardItems: PropTypes.array,
  selectLoan: PropTypes.func.isRequired,
  setLMContractMongoId: PropTypes.func,
  setNavigationInDashboards: PropTypes.func
};

const mapStateToProps = state => {
  return {
    loanLatePayments: state.loanlatepaymentoverview.loanLatePayments,
    totalOverallOriginalLoanValue: state.loanlatepaymentoverview.totalOverallOriginalLoanValue,
    totalOverallTotalOutstanding: state.loanlatepaymentoverview.totalOverallTotalOutstanding,
    totalOverallTotalOverdue: state.loanlatepaymentoverview.totalOverallTotalOverdue,
    systemDate: state.configurations.simulations.systemDate,
    isDashboardContent: state.user.isDashboardContent,
    selectedDashboardItems: state.user.selectedDashboardItems,
    clearSelectedCustomer: PropTypes.func.isRequired,
    getFieldNameValues: PropTypes.func,
    country: PropTypes.string,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAllLoanLatePaymentOverviews: (date, frequency, country) => {
      dispatch(getAllLoanLatePaymentOverviews(date, frequency, country));
    },
    getPreviousWorkingDate: (startDay, numberOfDays) => {
      return dispatch(getPreviousWorkingDate(startDay, numberOfDays));
    },
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
)(withStyles(styles)(LoanLatePaymentOverview));