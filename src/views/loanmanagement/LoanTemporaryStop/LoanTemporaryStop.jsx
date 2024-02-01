import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import converter from "number-to-words";
import styles from "assets/jss/material-dashboard-react/views/loanTemporaryStopStyle.jsx";
import {
  Dialog, DialogContent, FormControl, DialogTitle, DialogActions, InputLabel,
  MenuItem, Select, TextField
} from '@material-ui/core';

import LoadingOverlay from 'react-loading-overlay';

import CustomDateRange from 'components/loanmanagement/CustomDateRange/CustomDateRange.jsx';
import CustomFormatInput from 'components/loanmanagement/CustomFormatInput/CustomFormatInput.jsx';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import CardFooter from 'components/loanmanagement/Card/CardFooter.jsx';

import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import CustomSearch from "components/loanmanagement/CustomAutoSuggest/CustomAutoSuggest.jsx";
import Notifier from 'components/loanmanagement/Notification/Notifier.jsx';

import { displayNotification } from "store/loanmanagement/actions/Notifier";
import { selectLoan, clearSelectedLoan } from "store/loanmanagement/actions/SmeLoans";
import { clearSelectedCustomer } from "store/loanmanagement/actions/HeaderNavigation";
import {
  stopLoanTemporarily, switchLoanStopHistoryIsBusyStatus, clearLoanTemporaryLoanStopData,
  getLoanStopHistoryByLoanId, getLoanStopHistoryBySME, setLoanStopHistoryOrigin, cancelLoanStop, getTemporyLoanStopInterestAmountPerDay
} from "store/loanmanagement/actions/SmeLoanTemporaryLoanStop";
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { getPlatformParameters } from 'store/initiation/actions/PlatformParameters.action';
import Util from 'lib/loanmanagement/utility';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
const currency = Util.currencyConverter();

class LoanTemporaryStop extends Component {

  constructor(props) {
    super(props);

    this.state = {
      customerName: '',
      customerId: '',
      startDate: moment(this.props.configurations.simulations.systemDate).add(3, "days").format('YYYY-MM-DD'),
      endDate: moment(this.props.configurations.simulations.systemDate).add(13, "days").format('YYYY-MM-DD'),
      selectedContract: {},
      workingDateAfterTwoDays: null,
      interestAmountPerDay: 0,
      totalInterest: null,
      numberOfDays: 0,
      isOpenDateDiffConfirmationDialog: false,
      isOpenActiveLoanStopCountConfirmationDialog: false,
      isAbleToDoLoanStop: true,
      activeLoanStopCount: 0,
      isDayDiffDialogConfirmed: false,
      isActiveCountDialogConfirmed: false,
      decimalSeparator: ',',
      thousandSeparator: '.',
      contactDetails: ''
    };
  }

  componentDidMount() {

    this.setState({decimalSeparator: this.props.decimalSeparator , thousandSeparator: this.props.thousandSeparator});
    const _state = {};
    if (this.props.selectedLoan && this.props.selectedLoan._id) {
      _state.selectedContract = this.props.selectedLoan;

      this.props.getLoanStopHistoryByLoanId(this.props.selectedLoan._id.toString())
        .then((result) => {

          _state.activeLoanStopCount = result.length > 0 ?
            result.filter(loanStop => loanStop.status === 'ACTIVE').length : 0;

          return this.props.getNextWorkingDate(moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD'), 3);
        })
        .then(result => {

          _state.workingDateAfterTwoDays = result;
          _state.startDate = result;
        })
        .finally(() => {

          this.setState(_state);
          if (this.isAbleToDoLoanStop) {
            this.setValuesForTemporaryLoanStopDrawyer();
            this.setState({
              isAbleToDoLoanStop: true
            });
          } else {
            this.setState({
              isAbleToDoLoanStop: false
            });
          }
        });

        this.getPlatformParameters(this.props.selectedLoan.country);
    }
  }

  setValuesForTemporaryLoanStopDrawyer = () => {
    const contractId = this.props.selectedLoan ? this.props.selectedLoan.contractId : this.state.selectedContract.contractId;
    const initialCostAmount = this.props.selectedLoan ?
      this.props.selectedLoan.initialCostAmount : this.state.selectedContract.initialCostAmount;

    const loanInterestAmount = this.props.selectedLoan ?
      this.props.selectedLoan.interestAmount : this.state.selectedContract.interestAmount;

    const startDate = moment(this.state.startDate).format('YYYY-MM-DD');
    const endDate = moment(this.state.endDate).format('YYYY-MM-DD');

    const plannedNumberOfDirectDebit = this.props.selectedLoan ?
      this.props.selectedLoan.plannedNumberOfDirectDebit : this.state.selectedContract.plannedNumberOfDirectDebit;

    this.props.getTemporyLoanStopInterestAmountPerDay(contractId, startDate, endDate, initialCostAmount,
      loanInterestAmount, plannedNumberOfDirectDebit)
      .then(result => {
        this.setState({
          // eslint-disable-next-line no-nested-ternary
          interestAmountPerDay: result ? (result.interestPerDay ? result.interestPerDay.toFixed(2) : 0) : 0,
          totalInterest: result ? (result.totalInterest ? result.totalInterest.toFixed(2) : 0) : null,
          numberOfDays: result ? result.numberOfdays : 0,
        });
      });
  }

  componentWillUnmount() {
    this.props.clearLoanTemporaryLoanStopData();
    this.props.setLoanStopHistoryOrigin('');
    if (this.props.origin !== 'CONTRACTS') {
      this.props.clearSelectedLoan();
      this.props.clearSelectedCustomer();
    }
  }

  handleDatePicker = e => {
    if (moment(e.target.value).isValid())
      this.setState({
        [e.target.name]: moment(e.target.value).format('YYYY-MM-DD'),
        isDayDiffDialogConfirmed: false
      }, function () {
        this.setValuesForTemporaryLoanStopDrawyer();
      });
  }

  handleChange = (event) => {
    let value = null;
    if (event.target.name === 'selectedContract') {
      value = this.props.loans.find(loan => loan.contractId === event.target.value);
      value = Util.isNullOrEmpty(value) ? {} : value;
    } else {
      value = event.target.value;
    }
    this.setState({ [event.target.name]: value }, function () {
      if (event.target.name === 'selectedContract') {
        this.props.selectLoan(value);
        if (this.isAbleToDoLoanStop) this.setValuesForTemporaryLoanStopDrawyer();
      }
    });
  };

  handleInterestPerDayInput = (val, name) => {
    const totalInterest = this.state.numberOfDays * val;
    // console.log('totalInterest ', totalInterest);
    this.setState({
      [name]: val,
      totalInterest: totalInterest
    });
  };

  handleDateDiffDialogLaunch = (status) => {
    this.setState({ isOpenDateDiffConfirmationDialog: status });
  }

  handleActiveLoanStopCountDialogLaunch = (status) => {
    this.setState({ isOpenActiveLoanStopCountConfirmationDialog: status });
  }

  handleDialogConfimation = (dialogType) => {

    console.log('dialogType ', dialogType);
    if (dialogType === 'dayDiffDialog') {
      this.setState({ isDayDiffDialogConfirmed: true }, () => { this.handleStopLoanTemporarily(); });
      this.handleDateDiffDialogLaunch(false);
    } else {
      this.setState({ isActiveCountDialogConfirmed: true }, () => { this.handleStopLoanTemporarily(); });
      this.handleActiveLoanStopCountDialogLaunch(false);
    }
    // this.props.stopLoanTemporarily(this.state.selectedContract, this.state.startDate,
    //   this.state.endDate, this.state.interestAmountPerDay, this.state.totalInterest, this.state.numberOfDays, this.props.customer);
    // this.props.switchLoanStopHistoryIsBusyStatus();

  }

  onSearchResult = customer => {
    this.setState({ customerId: customer.id, customerName: customer.company, selectedContract: {} });
    this.props.getLoanStopHistoryBySME(customer.id);
  };

  handleStopLoanTemporarily = () => {

    const { startDate, endDate, workingDateAfterTwoDays, numberOfDays, isDayDiffDialogConfirmed,
      activeLoanStopCount, isActiveCountDialogConfirmed, selectedContract, interestAmountPerDay,
      totalInterest, contactDetails } = this.state;

    const { symbol } = this.props;  

    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      this.props.displayNotification('Start Date or End Date is invalid !', 'warning');
    }
    else if (moment(startDate).isBefore(moment(workingDateAfterTwoDays).format('YYYY-MM-DD'))) {
      this.props.displayNotification('The start date should be at least 2 working days from today !', 'warning');
    }
    else if (moment(endDate).isSameOrBefore(moment(startDate))) {
      this.props.displayNotification('The end date cannot be before start date!', 'warning');
    }
    else if (numberOfDays > 10 && !isDayDiffDialogConfirmed) {
      this.handleDateDiffDialogLaunch(true);
    }

    else if (activeLoanStopCount >= 2 && !isActiveCountDialogConfirmed) {
      this.handleActiveLoanStopCountDialogLaunch(true);
    }

    else if (moment(selectedContract.maturityDate).isSameOrBefore(this.props.configurations.simulations.systemDate)) {
      this.props.displayNotification('This loan already pass tha maturity date!', 'warning');
    }
    else {
      // interestPerDay, totalInterest, numberOfdays, sme 
      const stopCountStatus = activeLoanStopCount >= 2 ? true : false;
      const temporyLoanStopCount = converter.toWordsOrdinal(activeLoanStopCount + 1);
      const loanStopData = {
        loan: selectedContract,
        interestPerDay: interestAmountPerDay,
        numberOfdays: numberOfDays,
        startDate,
        endDate,
        totalInterest :Number(totalInterest),
        stopCountStatus,
        temporyLoanStopCount,
        symbol : symbol ? symbol : '€',
        contactDetails: contactDetails
      };
      this.props.stopLoanTemporarily(loanStopData);
      this.props.switchLoanStopHistoryIsBusyStatus();
      this.setState({ isDayDiffDialogConfirmed: false, isActiveCountDialogConfirmed: false });
    }

  }

  handleCancelLoanStop = loanStopHistory => {
    const smeId = this.state.customerId === '' ? this.props.customer.id : this.state.customerId;
    this.props.cancelLoanStop(loanStopHistory, smeId);
    this.props.switchLoanStopHistoryIsBusyStatus();
  }

  get filterdLoanStopHistory() {
    let loanStopHistory = this.props.loanStopHistory;
    if (this.state.selectedContract && this.state.selectedContract._id) {
      loanStopHistory = loanStopHistory.filter(data => data.loanId.toString() === this.state.selectedContract._id.toString());
    }
    return loanStopHistory;
  }

  get isAbleToDoLoanStop() {

    const isAble =
      this.state.selectedContract &&
      this.state.selectedContract.type === 'fixed-loan' &&
      (
        this.state.selectedContract.maturityDate &&
        moment(this.state.selectedContract.maturityDate).isAfter(this.props.configurations.simulations.systemDate)
      ) &&
      this.state.selectedContract.directDebitFrequency === 'daily' &&
      (
        this.state.selectedContract.status === 'outstanding' ||
        this.state.selectedContract.status === 'loan-in-backlog'
      );

    if (!isAble) {

      let reasonUnable = 'Unknown';

      if (this.filterdLoanStopHistory.length > 0) {
        reasonUnable = 'This loan already has a loan stop.';
      } else if (moment(this.state.selectedContract.maturityDate).isSameOrBefore(this.props.configurations.simulations.systemDate)) {
        reasonUnable = 'Maturity date for this loan has already passed';
      } else if (this.state.selectedContract.directDebitFrequency !== 'daily') {
        reasonUnable = 'Loan stops can only be made for loans with daily direct debit frequency';
      } else if (!(this.state.selectedContract.status === 'outstanding' ||
        this.state.selectedContract.status === 'loan-in-backlog')) {
        reasonUnable = `Unable to create loan stop for loans with status ${this.state.selectedContract.status}`;
      } else if (this.state.selectedContract.type !== 'fixed-loan') {
        reasonUnable = 'Loan stops can only be made for fixed loans';
      }

      this.setState({ reasonUnable });
    }

    return isAble;
  }

  handleCustomInputChange = (name, value) => {

    this.setState({ [name]: value });
  };

  getPlatformParameters = (data) => {
    const searchQuery = {country : data}
    this.props.getPlatformParameters(searchQuery)
      .then(result => {
        if(result && result[0].contactDetails){
          this.setState({
            contactDetails : result[0].contactDetails
          });
        }
      })
      .catch(() => {
          this.props.displayNotification('Error occured in get platform parameters!', 'error');
      });
  }

  render() {
    const { loans, classes, origin , symbol } = this.props;
    const { decimalSeparator , thousandSeparator } = this.state;
    const selectedLoan = this.state.selectedContract;
    const stopCountInWords = converter.toWordsOrdinal(this.state.activeLoanStopCount + 1);
    // console.log('state in rednder ', this.state);
    return (
      <div>
        {
          origin === '' ? (<Notifier key="temp-loan-stop-notifier" />) : false
        }
        <Card id="temp-loan-stop-card">
          <CardHeader color="rose">
            <h4>Temporary Loan Stop {selectedLoan.contractId ? ("- " + selectedLoan.contractId) : ""}</h4>
          </CardHeader>
          <LoadingOverlay
            id="loader-overlay"
            active={this.props.isBusy}
            spinner
            text='Registering all payments...'>
            <CardBody id="temp-loan-stop-card-body">
              {/* Filters */}
              <GridContainer>
                {
                  origin === '' ?
                    (
                      <GridItem xs={12} sm={6} md={3}>
                        {/* Check if from the admin panel. if so show the custom searc */}
                        <div style={{ marginTop: '20px' }}>
                          <CustomSearch
                            id="sme-search"
                            name="SMESearch"
                            label="Search SME"
                            entity="customers"
                            sugg_field="legalName"
                            onResult={this.onSearchResult.bind(this)}
                          />
                        </div>
                      </GridItem>
                    )
                    :
                    false
                }
                {
                  origin !== 'CONTRACTS' ?
                    (
                      <GridItem xs={12} sm={6} md={3}>
                        <FormControl className={classes.formControl}>
                          <InputLabel htmlFor="contract-filter">Contract</InputLabel>
                          <Select
                            value={this.state.selectedContract.contractId ? this.state.selectedContract.contractId : ''}
                            onChange={this.handleChange}
                            inputProps={{
                              name: 'selectedContract',
                              id: 'contract-filter',
                            }}
                            className={classes.selectEmpty}
                          >
                            <MenuItem value="">
                              <em>All</em>
                            </MenuItem>
                            {loans.map((loan, i) =>
                              <MenuItem id={i + '-' + loan.contractId} key={i} value={loan.contractId}>{loan.contractId}</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </GridItem>
                    )
                    :
                    false
                }
              </GridContainer>
              {/* Display after a loan is selected */}
              {
                this.state.isAbleToDoLoanStop ?
                  (
                    <React.Fragment>
                      <GridContainer>
                        {/* Loan Stop Start Date and End Date */}
                        <GridItem xs={12} sm={6} md={3}>
                          <CustomDateRange
                            id="date-range-select"
                            title="Start date / End date"
                            startDateValue={this.state.startDate}
                            endDateValue={this.state.endDate}
                            onChange={this.handleDatePicker}
                          />
                        </GridItem>
                        <GridItem>
                          <MultiCurrencyCustomFormatInput
                            type="text"
                            id="interestAmountPerDay"
                            name="interestAmountPerDay"
                            labelText="Interest Amount Per Day"
                            numberformat={this.state.interestAmountPerDay}
                            className={classes.amountInput}
                            symbol={symbol}
                            decimalSeparator={decimalSeparator}
                            thousandSeparator={thousandSeparator}
                            changeValue={(val) => this.handleCustomInputChange('interestAmountPerDay', val)}
                        />
                        </GridItem>
                        <GridItem>
                          <MultiCurrencyCustomFormatInput
                            type="text"
                            id="total-interest"
                            name="total-interest"
                            labelText="Total Interest"
                            numberformat={this.state.totalInterest}
                            className={classes.amountInput}
                            symbol={symbol}
                            decimalSeparator={decimalSeparator}
                            thousandSeparator={thousandSeparator}
                            readOnly
                        />
                        </GridItem>
                      </GridContainer>
                      <GridContainer>
                        <GridItem xs={12} sm={6} md={3}>
                          <Button id="temp-loan-stop-confirm-button" color="info" size="sm" onClick={this.handleStopLoanTemporarily}
                          > Confirm </Button>
                          <Button id="temp-loan-stop-cancel-button" color="danger" size="sm" onClick={this.props.toggleDrawer}>Cancel</Button>
                        </GridItem>
                      </GridContainer>
                    </React.Fragment>

                  )
                  :
                  <Dialog
                    id="temp-loan-stop-unable-alert-drawer"
                    open={true}
                    onClose={this.props.toggleDrawer}
                    aria-labelledby="alert-dialog-loanstop-not-allowed"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-loanstop-not-allowed">
                      {"Unable to create loan stop. "}
                    </DialogTitle>
                    <DialogContent id="unable-reason">
                      {this.state.reasonUnable}
                    </DialogContent>
                    <DialogActions>
                      <Button id="temp-loan-stop-unable-alert-ok-button" onClick={this.props.toggleDrawer} color="info" autoFocus>
                        Okay
                        </Button>
                    </DialogActions>
                  </Dialog>

              }
            </CardBody>
            <CardFooter>
            </CardFooter>
          </LoadingOverlay>
        </Card>

        {/* confirmation dialog if endDate-startDate > 10days */}

        <Dialog
          id="date-dif-confirm-dialog"
          open={this.state.isOpenDateDiffConfirmationDialog}
          onClose={() => this.handleDateDiffDialogLaunch(false)}
          aria-labelledby="alert-dialog-date-confirmation"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-date-confirmation">{"Are you sure the end date is correct; more than 10 days!"}</DialogTitle>
          <DialogActions>
            <Button id="date-dif-confirm-dialog-cancel-button" onClick={() => this.handleDateDiffDialogLaunch(false)} color="danger">
              Cancel
          </Button>
            <Button id="date-dif-confirm-dialog-ok-button" onClick={() => this.handleDialogConfimation('dayDiffDialog')} color="info" autoFocus>
              Okay
          </Button>
          </DialogActions>
        </Dialog>

        {/* confirmation dialog if active loan-stop-count > 2 */}

        <Dialog
          id="active-stop-count-confirm-dialog"
          open={this.state.isOpenActiveLoanStopCountConfirmationDialog}
          onClose={() => this.handleActiveLoanStopCountDialogLaunch(false)}
          aria-labelledby="alert-dialog-active-stop-count-confirmation"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-active-stop-count-confirmation">
            {"The " + stopCountInWords + " temporary loan stop is requested for this SME Loan; Are you sure you want to submit this temporary loan stop?"}
          </DialogTitle>
          <DialogActions>
            <Button id="active-stop-count-confirm-dialog-cancel-button" onClick={() => this.handleActiveLoanStopCountDialogLaunch(false)} color="danger">
              No
          </Button>
            <Button id="active-stop-count-confirm-dialog-ok-button" onClick={() => this.handleDialogConfimation('activeCountDialog')} color="info" autoFocus>
              Yes
          </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

LoanTemporaryStop.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedLoan: PropTypes.object,
  customer: PropTypes.object.isRequired,
  loans: PropTypes.array.isRequired,
  loanStopHistory: PropTypes.array.isRequired,
  origin: PropTypes.string,
  isBusy: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func,
  selectLoan: PropTypes.func.isRequired,
  cancelLoanStop: PropTypes.func.isRequired,
  clearSelectedLoan: PropTypes.func.isRequired,
  getNextWorkingDate: PropTypes.func.isRequired,
  stopLoanTemporarily: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  getLoanStopHistoryBySME: PropTypes.func.isRequired,
  setLoanStopHistoryOrigin: PropTypes.func.isRequired,
  getLoanStopHistoryByLoanId: PropTypes.func.isRequired,
  clearLoanTemporaryLoanStopData: PropTypes.func.isRequired,
  switchLoanStopHistoryIsBusyStatus: PropTypes.func.isRequired,
  getTemporyLoanStopInterestAmountPerDay: PropTypes.func.isRequired,
  configurations: PropTypes.object.isRequired,
  getPlatformParameters: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    loans: state.lmglobal.smeLoans,
    selectedLoan: state.lmglobal.selectedLoan,
    loanStopHistory: state.loanStopHistory.loanStopHistoryData,
    origin: state.loanStopHistory.origin,
    isBusy: state.loanStopHistory.isBusy,
    customer: state.lmglobal.customerDetails,
    configurations: state.configurations,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getLoanStopHistoryByLoanId: loanId => {
      return dispatch(getLoanStopHistoryByLoanId(loanId));
    },
    displayNotification: (msg, type) => {
      dispatch(displayNotification(msg, type));
    },
    stopLoanTemporarily: (loanStopData) => {
      dispatch(stopLoanTemporarily(loanStopData));
    },
    cancelLoanStop: (loanStopHistory, smeId) => {
      dispatch(cancelLoanStop(loanStopHistory, smeId));
    },
    selectLoan: loan => {
      dispatch(selectLoan(loan));
    },
    clearSelectedLoan: () => {
      dispatch(clearSelectedLoan());
    },
    getLoanStopHistoryBySME: SME_Id => {
      dispatch(getLoanStopHistoryBySME(SME_Id));
    },
    clearLoanTemporaryLoanStopData: () => {
      dispatch(clearLoanTemporaryLoanStopData());
    },
    setLoanStopHistoryOrigin: origin => {
      dispatch(setLoanStopHistoryOrigin(origin));
    },
    switchLoanStopHistoryIsBusyStatus: () => {
      dispatch(switchLoanStopHistoryIsBusyStatus());
    },
    getNextWorkingDate: (startDate, numberOfDays) => {
      return dispatch(getNextWorkingDate(startDate, numberOfDays));
    },
    getTemporyLoanStopInterestAmountPerDay: (contractId, startDate, endDate, initialCostAmount, loanInterestAmount,
      plannedNumberOfDirectDebit) => {

      return dispatch(getTemporyLoanStopInterestAmountPerDay(contractId, startDate, endDate, initialCostAmount,
        loanInterestAmount, plannedNumberOfDirectDebit));
    },
    clearSelectedCustomer: () => (dispatch(clearSelectedCustomer())),
    getPlatformParameters: (requestQuery) => dispatch(getPlatformParameters(requestQuery)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LoanTemporaryStop));