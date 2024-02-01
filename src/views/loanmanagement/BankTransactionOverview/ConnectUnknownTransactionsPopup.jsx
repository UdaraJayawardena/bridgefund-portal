import React from 'react';
import moment from 'moment';
import clx from 'classnames';
import { cloneDeep } from "lodash";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import Styles from 'assets/jss/material-dashboard-react/views/ConnectUnknownTransactionsViewStyles';

import { Card, Table, TableHead, TableCell, TableBody, TableRow, Button, Paper, TableSortLabel, Checkbox, Tooltip, FormControl, Select, MenuItem } from '@material-ui/core';
import { Clear } from '@material-ui/icons';

import CardBody from 'components/loanmanagement/Card/CardBody';
import GridItem from 'components/loanmanagement/Grid/GridItem';
import Loader from 'components/loanmanagement/CustomLoader/Loader';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import CustomSearch from 'components/loanmanagement/CustomAutoSuggest/CustomAutoSuggest';
import StatusHistoryPopup from 'components/loanmanagement/PopupComponents/StatusHistoryPopup';
// import ConfirmationDialog from 'components/ConfirmationDialog/ConfirmationDialog';

import { displayNotification } from 'store/loanmanagement/actions/Notifier';
// import { saveBankTransactionStatus } from 'store/actions/BankTransactions';
import { clearSelectedCustomer } from 'store/loanmanagement/actions/HeaderNavigation';
import { requestSmeByIbanNumber, clearSelectedSme } from 'store/loanmanagement/actions/Smes';
import { getFlexLoanLatestWithdrawalOrder, getSmeFlexLoanFees } from 'store/loanmanagement/actions/FlexLoan.action';
import { clearDirectDebits, connectUnknownSmeLoanTransaction, settleUnknownAsPatialPayment, getSmeLoanTransactions } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { getLatestSmeLoanBySmeIdAndStatus, getSmeLoanFeesAndTransactions, clearCalculatedDataOfLoanTransactions, clearLoans, getSmeLoansByQuery } from 'store/loanmanagement/actions/SmeLoans';
import { getLocales } from 'store/initiation/actions/Configuration.action';

import util, { isNullOrEmpty } from 'lib/loanmanagement/utility';
import { smeLoanStatus, smeLoanType } from 'constants/loanmanagement/sme-loan';
import { BTStatus } from 'constants/loanmanagement/bank-transaction';
import { DDstatus, DDtype } from 'constants/loanmanagement/sme-loan-repayment-direct-debits';

const PERCENTAGE = util.percentage;
const TOFIXED = util.toFixed;
const currency = util.multiCurrencyConverter();

class FalseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Ignorable Error';
  }
}

class ConnectUnknownTransactionView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sme: null,
      smeLoan: null,
      smeLoans: [],
      smeLoanTransactions: [],
      smeLoanData: null,
      totalConnectedAmount: 0,
      totalAmountToBeConnected: 0,
      isLoading: false,
      isChangeStatus: false,
      smeLoanWithdrawalOrder: null,

      order: 'asc',
      orderBy: ''
    };
  }

  componentDidMount () {
    const _state = {};

    this.setState({ isLoading: true });
    Promise.resolve(this.props.bankTransaction?.counterpartyIbanNumber)
      .then((iban) => {
        if (!iban) throw new FalseError('IBAN not available');
        return this.props.requestSmeByIban(iban);
      })
      .then((sme) => {
        if (!sme) throw new FalseError('SME not available!');
        return this.handleSmeChange(sme);
      })
      .then(response => {
        Object.assign(_state, response);
        if (!_state.smeLoan && _state.smeLoans.length === 0) {
          this.props.displayNotification('No Loans available with status "outstanding" or "in-revision" or "revision-disapproved" or "loan-early-redeemd" or "loan-in-default" or "loan-refinanced for this SME', 'error');
          throw new FalseError('No Loans Avaialable!');
        }
        else if (_state.smeLoans.length > 1) throw new FalseError('Multiple Loans Selected!');
        return this.handleSmeLoanChange(_state.smeLoan); //  if a single loan comes selected
      })
      .then(response => {
        Object.assign(_state, response);
      })
      .catch((err) => {
        if (err instanceof FalseError) return;
        console.error('componentDidMount', err);
      })
      .finally(() => {
        _state.isLoading = false;
        this.setState(_state);
      });
  }

  componentWillUnmount () {
    this.resetState();
  }

  specialSortForTransactions = (initialSortedTransactions, params) => {

   if(this.state.orderBy){
    return util.stableSort(initialSortedTransactions, params);
   }

   const ascendingStatusList = ['failed', 'rejected', 'frequently-rejected', 'frequently-failed'];
   
   const ascendingList = initialSortedTransactions.filter((trans) => ( ascendingStatusList.includes(trans.status) )).sort((a, b) => Date.parse(a.plannedDate)-Date.parse(b.plannedDate));
   const descendingList = initialSortedTransactions.filter(trans => trans.status === 'open' ).sort((a, b) => Date.parse(b.plannedDate)-Date.parse(a.plannedDate));
   let sortedArray = ascendingList.concat(descendingList);

   if(initialSortedTransactions.length !== sortedArray.length){
     const otherStatusList = initialSortedTransactions.filter((trans) => ( !ascendingStatusList.includes(trans.status) && trans.status !== 'open' ));
     sortedArray = sortedArray.concat(otherStatusList);
   }

    return sortedArray;
  }

  /**
   * This will clear the local and redux states
   */
  resetState = () => {

    this.props.clearLoans();
    this.props.clearSmeLoanFees();
    this.props.clearSelectedSme();
    this.props.clearSelectedCustomer();
    this.props.clearDirectDebits();
    this.setState({
      sme: null,
      smeLoan: null,
      smeLoanTransactions: [],
      smeLoanData: null,
      totalConnectedAmount: 0,
      totalAmountToBeConnected: 0,
    });
  }

  /**
   * This will handle the sorting of the table by setting the column and the order.
   * using this will loose the default sort
   * @param {String} property - name of the column need to be sorted
   */
  handleRequestSort = (property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  /**
   * This will handle the manual connects on sme loan transactions
   * @param {String} id - sme loan transaction id of the selected transaction from the list
   */
  handleCheckbox = (id) => (e) => {
    // const { connectTransactionType } = this.props;
    const isChecked = e.target.checked;
    const smeLoanTransactions = cloneDeep(this.state.smeLoanTransactions);
    const index = smeLoanTransactions.findIndex(tr => tr.id === id);
    if (index === -1) return;

    if (/* connectTransactionType === 'connect-to-dd' &&  */this.newPartialPaymentAmount < smeLoanTransactions[index].amount && isChecked) {
      console.log(
        'Total Connected amount:', this.state.totalConnectedAmount, '\n',
        'Remaininig amount:', this.newPartialPaymentAmount, '\n',
        'Selected amount:', smeLoanTransactions[index].amount);
      this.props.displayNotification('Not enough balance to pay the selected transaction', 'warning');
      return;
    }
    // else if (connectTransactionType === 'connect-to-transaction' && this.state.totalAmountToBeConnected !== smeLoanTransactions[index].amount && isChecked) {
    //   console.log(
    //     'Total Connected amount:', this.state.totalConnectedAmount, '\n',
    //     'Remaininig amount:', this.newPartialPaymentAmount, '\n',
    //     'Total amount to be connected:', this.state.totalAmountToBeConnected, '\n',
    //     'Selected amount:', smeLoanTransactions[index].amount);
    //   this.props.displayNotification('bank-transaction amount not equal to selected transaction amounts; please select the right transactions', 'warning');
    //   return;
    // }
    smeLoanTransactions[index].connected = isChecked;
    const totalConnectedAmount = isChecked ? TOFIXED(this.state.totalConnectedAmount + smeLoanTransactions[index].amount) : TOFIXED(this.state.totalConnectedAmount - smeLoanTransactions[index].amount);
    this.setState({ smeLoanTransactions, totalConnectedAmount: totalConnectedAmount });
  };

  onSearchResult = sme => {
    const _state = {};
    sme = sme === '' ? null : sme;

    if (!sme) return this.resetState();

    this.setState({ isLoading: true });
    Promise.resolve(this.state.sme)
      .then(previousSme => {
        if (previousSme?.id === sme?.id) throw new FalseError('Same SME!');
        return this.handleSmeChange(sme);
      })
      .then(response => {
        Object.assign(_state, response);
        if (!_state.smeLoan && _state.smeLoans.length === 0) {
          this.props.displayNotification('No Loans available with status "outstanding" or "in-revision" or "revision-disapproved" or "loan-early-redeemd" or "loan-in-default" or "loan-refinanced for this SME', 'error');
          throw new FalseError('No Loans Avaialable!');
        }
        else if (_state.smeLoans.length > 1) throw new FalseError('Multiple Loans Selected!');
        return this.handleSmeLoanChange(_state.smeLoan); //  if a single loan comes selected
      })
      .then(response => {
        Object.assign(_state, response);
      })
      .catch((error) => {
        if (error instanceof FalseError) return;
        console.error('onSearchResult', error);
      })
      .finally(() => {
        _state.isLoading = false;
        this.setState(_state);
      });
  };

  /**
   * Retrieves the SmeLoan or Sme Loans to the selected SME.
   * @param {Object} sme - a valid SME object.
   * @returns an object with all informations needed in the state.
   */
  handleSmeChange = sme => {
    const _state = {
      sme,
      smeLoan: null,
      smeLoans: [],
    };

    return new Promise((resolve) => {
      // Promise.all([
      //   this.props.getLatestSmeLoan(sme.id, smeLoanStatus.OUTSTANDING),
      //   this.props.getLatestSmeLoan(sme.id, smeLoanStatus.LOAN_EARLY_REDEEMED),
      //   this.props.getLatestSmeLoan(sme.id, smeLoanStatus.LOAN_IN_DEFAULT),
      //   this.props.getLatestSmeLoan(sme.id, smeLoanStatus.LOAN_REFINANCED)
      // ])
      this.props.getSmeLoansByQuery({
        smeId: sme.id, status: {
          $in: [
            smeLoanStatus.OUTSTANDING,
            smeLoanStatus.LOAN_EARLY_REDEEMED,
            smeLoanStatus.LOAN_IN_DEFAULT,
            smeLoanStatus.LOAN_REFINANCED,
            smeLoanStatus.IN_REVISION,
            smeLoanStatus.REVISION_DISAPPROVED,
          ]
        }
      })
        .then(response => {
          // const outstandingLoan = response[0];
          // const earlyRedeemedLoan = response[1];
          // const loanInDefault = response[2];
          // const loanRefinaced = response[3];

          // const smeLoans = [];
          // if (!isNullOrEmpty(outstandingLoan)) smeLoans.push(outstandingLoan);
          // if (!isNullOrEmpty(earlyRedeemedLoan)) smeLoans.push(earlyRedeemedLoan);
          // if (!isNullOrEmpty(loanInDefault)) smeLoans.push(loanInDefault);
          // if (!isNullOrEmpty(loanRefinaced)) smeLoans.push(loanRefinaced);

          // if (!outstandingLoan && !earlyRedeemedLoan && !loanInDefault && !loanRefinaced) throw Error('No Loans available with status "outstanding" or "loan-early-redeemd" or "loan-in-default" or "loan-refinanced" for this SME');
          // else if (smeLoans.length > 1) {
          //   _state.smeLoans = smeLoans;
          // }
          // else if (earlyRedeemedLoan && earlyRedeemedLoan._id) {
          //   _state.smeLoan = earlyRedeemedLoan;
          // }
          // else if (outstandingLoan && outstandingLoan._id) {
          //   _state.smeLoan = outstandingLoan;
          // }
          // else if (loanRefinaced && loanRefinaced._id) {
          //   _state.smeLoan = loanRefinaced;
          // }
          // else {
          //   _state.smeLoan = loanInDefault;
          // }

          if (response && response.length === 0) throw Error('No Loans available with status "outstanding" or "in-revision" or "revision-disapproved" or "loan-early-redeemd" or "loan-in-default" or "loan-refinanced" for this SME');
          else if (response.length === 1) _state.smeLoan = response[0];
          else _state.smeLoans = response;
        })
        .catch((error) => {
          console.error('handleSmeChange unhandle error: ', error);
        })
        .finally(() => {
          resolve(_state);
        });
    });
  };

  /**
   * Retrieves the SmeLoan and SmeLoanTransactions along with the calculated amounts when the smeloan is provided.
   * @param {Object} smeLoan - a valid sme Loan object.
   * @returns an object with sme loan related informations needed in the state.
   */
  handleSmeLoanChange = (smeLoan) => {
    const _state = {
      smeLoan,
      smeLoanTransactions: [],
      smeLoanData: null,
      totalConnectedAmount: 0,
      totalAmountToBeConnected: 0,
      smeLoanWithdrawalOrder: null,
    };

    const { connectTransactionType } = this.props;

    return new Promise((resolve) => {

      const requests = [
      ];
      if (smeLoan.type === smeLoanType.FIXED) {
        requests.push(this.props.getSmeLoanFeesAndTransactions(smeLoan.contractId));
      } else {
        requests.push(this.props.getSmeLoanTransactions({ contractId: smeLoan.contractId }));
        requests.push(this.props.getSmeFlexLoanFees(smeLoan.contractId));
        requests.push(this.props.getFlexLoanLatestWithdrawalOrder(smeLoan.contractId));
      }

      Promise.all(requests)
        .then(response => {
          if (smeLoan.type === smeLoanType.FIXED) {
            const smeLoanTransactionsAndFees = response[0];

            const filteredSmeLoanTransactions = this.initialSortAndFilterDirectDebits(smeLoanTransactionsAndFees.transactions);
            const totalAmountToBeConnected = connectTransactionType === 'connect-to-dd' ?
              TOFIXED(Math.abs(this.props.bankTransaction.amount) + TOFIXED(smeLoanTransactionsAndFees.overview?.partialPaymentAmount)) :
              TOFIXED(this.props.bankTransaction.amount);
            const { smeLoanTransactions, totalConnectedAmount } = this.autoConnectTransactions(filteredSmeLoanTransactions, totalAmountToBeConnected);

            _state.smeLoanData = {
              principleAmount: smeLoan.principleAmount,
              ...smeLoanTransactionsAndFees.overview
            };
            _state.smeLoanTransactions = smeLoanTransactions;
            _state.totalConnectedAmount = totalConnectedAmount;
            _state.totalAmountToBeConnected = totalAmountToBeConnected;
          } else {
            const transactions = response[0];
            const smeLoanTransactionFees = response[1].overview;
            const withdrawalOrder = response[2];

            const filteredSmeLoanTransactions = this.initialSortAndFilterDirectDebits(transactions);
            const totalAmountToBeConnected = connectTransactionType === 'connect-to-dd' ?
              TOFIXED(Math.abs(this.props.bankTransaction.amount) + TOFIXED(smeLoanTransactionFees.partialOutstandingAmount)) :
              TOFIXED(this.props.bankTransaction.amount);
            const { smeLoanTransactions, totalConnectedAmount } = this.autoConnectTransactions(filteredSmeLoanTransactions, totalAmountToBeConnected);

            _state.smeLoanData = {
              principleAmount: smeLoan.principleAmount,
              outstandingPrincipleAmount: smeLoanTransactionFees.loanOutstandingAmount * -1,
              interestAmount: smeLoan.interestAmount,
              outstandingInterestAmount: null,
              initialCostAmount: smeLoan.initialCostAmount,
              outstandingInitialFee: null,
              recurringCostAmount: smeLoan.recurringCostAmount,
              outstandingRecurringFee: null,
              otherCostsAmount: smeLoanTransactions.reduce((a, cv) => {
                let total = a;
                if (cv.type === DDtype.OTHER_COST_FEE || cv.type === DDtype.INTEREST_PENALTY || cv.type === DDtype.CLAIM || cv.type === DDtype.OTHER_COST_FEE) {
                  total += cv.amount;
                }
                return total;
              }, 0),
              outstandingOtherCostAmount: smeLoanTransactionFees.otherCostOutstandingAmount,
              otherCostOverdueAmount: smeLoanTransactionFees.otherCostOverdueAmount,
              overallOutstandingTotalAmount: smeLoanTransactionFees.overallTotalOutstandingAmount * -1,
              overallTotalOverdueAmount: smeLoanTransactionFees.overallTotalOverdueAmount,
              overallTotalOverduePercentage: smeLoanTransactionFees.overallTotalOverdueAmount / smeLoanTransactions.filter(tr => tr.type === DDtype.NORMAL || tr.type === DDtype.SPECIAL).length,
              partialPaymentAmount: smeLoanTransactionFees.partialOutstandingAmount,
            };
            _state.smeLoanTransactions = smeLoanTransactions;
            _state.totalConnectedAmount = totalConnectedAmount;
            _state.totalAmountToBeConnected = totalAmountToBeConnected;
            _state.smeLoanWithdrawalOrder = withdrawalOrder;
          }

          if(smeLoan) getLocales(smeLoan);   

        })
        .catch((error) => {
          if (!_state.smeLoan) return this.props.displayNotification('No Loans available with status "outstanding" or "in-revision" or "revision-disapproved" or "loan-early-redeemd" or "loan-in-default" or "loan-refinanced" for this SME', 'error');
          else if (!_state.smeLoanTransactions) return this.props.displayNotification('Couldn\'t get sme loan transactions and sme loan amounts', 'error');
          console.error('handleSmeChange unhandle error: ', error);
        })
        .finally(() => {
          resolve(_state);
        });
    });
  }

  handleContractDropDown = (contractId) => {
    const { smeLoans } = this.state;

    const contract = smeLoans.find(loan => loan.contractId === contractId);
    this.handleSmeLoanChange(contract)
      .then(response => {
        this.setState(response);
        this.getLocales(smeLoans);
      });
  };

  /**
   * Filter out the connectable sme loan transactions and sort accordingly as soon as the smeLoanTransactions are received.
   * @param {Array} smeLoanTransactions - All smeLoanTransactions belogs to the selected SME Loan.
   * @returns sorted and filtered array of smeLoanTransactions 
   */
  initialSortAndFilterDirectDebits = (smeLoanTransactions) => {

    let filterdTransactions = [];
    let failedTransactions = [];
    let openTransactions = [];
    let notPaidTransactions = [];
    let payOutTransactions = [];
    let withdrawalCostTransactions = [];

    for (const smeLoanTransaction of smeLoanTransactions) {

      if (this.props.connectTransactionType === 'connect-to-dd') {

        if (
          smeLoanTransaction.type !== DDtype.NORMAL &&
          smeLoanTransaction.type !== DDtype.SPECIAL
        ) continue;

        if (
          smeLoanTransaction.status === DDstatus.FREQUENTLY_FAILED ||
          smeLoanTransaction.status === DDstatus.FREQUENTLY_REJECTED
        ) {
          failedTransactions.push(smeLoanTransaction);
        }
        else if (smeLoanTransaction.status === DDstatus.OPEN) {
          openTransactions.push(smeLoanTransaction);
        } else if (
          smeLoanTransaction.status !== DDstatus.PAID &&
          smeLoanTransaction.status !== DDstatus.SENT_TO_BANK
        ) {
          notPaidTransactions.push(smeLoanTransaction);
        }
      }
      else { /* this.props.connectTransactionType === 'connect-to-transaction' */
        if (
          smeLoanTransaction.smeLoanType === smeLoanType.FIXED &&
          smeLoanTransaction.type !== DDtype.NORMAL &&
          smeLoanTransaction.type !== DDtype.SPECIAL &&
          smeLoanTransaction.status !== DDstatus.PAID
        ) {
          notPaidTransactions.push(smeLoanTransaction);
        }
        else if (
          smeLoanTransaction.smeLoanType === smeLoanType.FLEX &&
          smeLoanTransaction.type === DDtype.PAY_OUT &&
          smeLoanTransaction.statusHistory[smeLoanTransaction.statusHistory.length - 1].status === DDstatus.PAID &&
          isNullOrEmpty(smeLoanTransaction.statusHistory[smeLoanTransaction.statusHistory.length - 1].referenceId)
        ) {
          payOutTransactions.push(smeLoanTransaction);
        }
        else if (
          smeLoanTransaction.smeLoanType === smeLoanType.FLEX &&
          smeLoanTransaction.type === DDtype.NORMAL &&
          smeLoanTransaction.status === DDstatus.PAID &&
          smeLoanTransaction.statusHistory[smeLoanTransaction.statusHistory.length - 1].status === DDstatus.PAID &&
          isNullOrEmpty(smeLoanTransaction.statusHistory[smeLoanTransaction.statusHistory.length - 1].referenceId)
        ) {
          withdrawalCostTransactions.push(smeLoanTransaction);
        }
      }
    }

    failedTransactions = failedTransactions
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());

    openTransactions = openTransactions
      .sort((a, b) => new Date(b.termNumber).getTime() - new Date(a.termNumber).getTime());

    notPaidTransactions = notPaidTransactions
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());

    payOutTransactions = payOutTransactions
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());

    withdrawalCostTransactions = withdrawalCostTransactions
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());


    filterdTransactions = filterdTransactions.concat(failedTransactions,
      openTransactions, notPaidTransactions, payOutTransactions,
      withdrawalCostTransactions);

    return filterdTransactions;
  };

  /**
   * Marks the smeLoanTransactions as connectable if possible (conneted = true) else add the field connted as false. 
   * Also find the current totalConnectedAmount
   * @param {Array} smeLoanTransactions - All Connectable Sme Loan Transactions
   * @param {Number} totalAmountToConnect - BankTransaction.amount + PartialPayment of the selected sme Loan
   * @returns {Object} {smeLoanTransactions, totalConnectedAmount}
   */
  autoConnectTransactions = (smeLoanTransactions, totalAmountToConnect) => {

    // const { connectTransactionType } = this.props;
    let totalConnectedAmount = 0;

    smeLoanTransactions = smeLoanTransactions.map(tr => {

      if (/* connectTransactionType === 'connect-to-dd' && */ totalAmountToConnect >= tr.amount) {
        tr.connected = true;
        totalAmountToConnect = TOFIXED(totalAmountToConnect - tr.amount);
        totalConnectedAmount = TOFIXED(totalConnectedAmount + tr.amount);
        // }
        // else if (connectTransactionType === 'connect-to-transaction' && totalAmountToConnect === tr.amount) {
        //   tr.connected = true;
        //   totalAmountToConnect = TOFIXED(totalAmountToConnect - tr.amount);
        //   totalConnectedAmount = TOFIXED(totalConnectedAmount + tr.amount);
      } else {
        tr.connected = false;
      }

      return tr;
    });

    return { smeLoanTransactions, totalConnectedAmount };
  };

  /**
   * Finds the latest connected bank statement of the smeLoanTransaction from the statusHistory
   * @param {Array} history - StatusHistory of the smeLoanTransaction.
   * @returns the particular status history object which has the final bank statement information
   */
  getLatestStatement = (history = []) => {
    return history.reverse().find(sh => !util.isNullOrEmpty(sh.reason));
  };

  /**
   * This will confirm all connected transactions and proccess the unknown bank transaction
   */
  connectSelectedTransactions = () => {

    /* This line should never be executed. line of code added as it is in the specs */
    if (this.state.totalAmountToBeConnected < this.state.totalConnectedAmount) return this.props.displayNotification('Number of selected rows is too big for Total Amount available', 'warning');

    // checking weather the loan and the trasactions has same currency type
    if(this.state.smeLoan && 
      this.state.smeLoan.currency !== this.props.bankTransaction.currency) return this.props.displayNotification('Currency of Bank-Transaction is different from SME-Loan currency, connect is not possible!', 'error');
      
    if (
      this.props.connectTransactionType === 'connect-to-transaction' &&
      this.state.totalConnectedAmount !== this.state.totalAmountToBeConnected
    ) {
      return this.props.displayNotification('bank-transaction amount not equal to selected transaction amounts; please select the right transactions', 'warning');
    }

    this.setState({ isLoading: true });

    const smeLoanTransactionMongoIds = [];
    for (const smeLoanTransaction of this.state.smeLoanTransactions) {
      if (smeLoanTransaction.connected === false) continue;
      smeLoanTransactionMongoIds.push(smeLoanTransaction._id);
    }

    const connectData = {
      smeLoanTransactionMongoIds,
      contractId: this.state.smeLoan.contractId,
      status: 'paid',
      statement: this.props.bankTransaction.statementNumber,
      transactionDate: this.props.bankTransaction.transactionDate,
      btID: this.props.bankTransaction._id,
      partialTransaction: this.createPartialPaymentRecord()
    };

    this.props.connectUnknownSmeLoanTransaction(connectData)
      .then(() => {
        this.props.displayNotification('Bank transaction successfully connected with direct debits', 'success');
        this.props.onClose();
        this.props.refreshBTOverview(null, BTStatus.UNKNOWN, null);
      })
      .catch((error) => {
        console.error('connectSelectedTransactions', error);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  /**
   * Creates the partial paymenr or the partial payment refund transactions as needed
   */
  createPartialPaymentRecord = () => {
    const partialPaymentDiff = this.state.totalConnectedAmount === 0 ?
      this.props.bankTransaction.amount :
      this.newPartialPaymentAmount - this.state.smeLoanData.partialPaymentAmount;
    const today = this.props.simulations.systemDate || moment().format('YYYY-MM-DD');

    if (partialPaymentDiff === 0) return null;

    const transactionType = partialPaymentDiff < 0 ? DDtype.PARTIAL_PAYMENT_REFUND : DDtype.PARTIAL_PAYMENT;
    const transactionDescription = partialPaymentDiff < 0 ?
      'reduction in partial-payment-amount because of match with direct-debits' :
      'growth in partial-payment-amount that could not be matched to direct-debits';

    const transaction = {
      loanId: this.state.smeLoan._id,
      contractId: this.state.smeLoan.contractId,
      smeLoanType: smeLoanType.FIXED,
      plannedDate: today,
      transactionDate: this.props.bankTransaction.transactionDate,
      amount: partialPaymentDiff,
      status: DDstatus.PAID,
      statusHistory: [{ status: DDstatus.MANUALLY_SETTLED, plannedDate: today, referenceId: this.props.bankTransaction._id, createdAt: today }],
      glIndicator: 'N',
      type: transactionType,
      description: transactionDescription,
      externalReferenceId: this.props.bankTransaction._id,
      country: this.state.smeLoan.country ? this.state.smeLoan.country : 'NL',
      currency: this.state.smeLoan.currency ? this.state.smeLoan.currency : 'EUR'
    };

    return transaction;
  };

  /**
   * Creates a partial payment transaction and process the unknown bank transaction
   */
  addPartialPayment = () => {
    
    if(this.state.smeLoan && 
      this.state.smeLoan.currency !== this.props.bankTransaction.currency) return this.props.displayNotification('Currency of Bank-Transaction is different from SME-Loan currency, connect is not possible!', 'error');
    
    this.setState({ isLoading: true });
    this.props.settleAsPatialPayment(this.createPartialPaymentRecord(), this.props.bankTransaction._id)
      .then(() => {
        this.props.displayNotification('Bank transaction successfully processed as a partial payment', 'success');
        this.props.onClose();
        this.props.refreshBTOverview(null, BTStatus.UNKNOWN, null);
        return;
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  /**
   * Changes the bank transaction status as manually-settled
   */
  // confirmChangeStatus = () => {
  //   this.setState({ isLoading: true });
  //   this.props.setManuallySettled(this.props.bankTransaction._id, BTStatus.MANUALLY_SETTLED)
  //     .finally(() => {
  //       this.setState({ isChangeStatus: false, isLoading: false });
  //       this.props.onClose();
  //       this.props.refreshBTOverview(null, BTStatus.UNKNOWN, null);
  //     });
  // };

  /**
   * Calculate the remaining amount after connecting. Also called as the new partial payment amount
   */
  get newPartialPaymentAmount () {
    return TOFIXED(this.state.totalAmountToBeConnected - this.state.totalConnectedAmount);
  }

  get warning () {
    let warning = null;
    if (!this.state.sme) warning = 'Please Select a SME!';
    else if (this.state.smeLoans.length > 1 && !this.state.smeLoan?._id) warning = 'Please Select an SME Loan';
    else if (!this.state.smeLoan?._id) warning = 'No Loans available with status "outstanding" or "in-revision" or "revision-disapproved" or "loan-early-redeemd" or "loan-in-default" or "loan-refinanced" for this SME!';
    else if (this.state.smeLoanTransactions.length === 0) warning = 'SME Loan transactions not found!';
    else if (this.state.totalConnectedAmount > this.state.totalAmountToBeConnected) warning = `Amounts doesn't match! connected: ${currency(this.state.totalConnectedAmount, this.state.locale ? this.state.locale : 'nl-NL', this.state.smeLoan?.currency ? this.state.smeLoan.currency : 'EUR')}`;
    else warning = '';
    return warning;
  }

  getLocales = (smeLoan) => {
    
    if (smeLoan.country && smeLoan.currency) {
        this.props.getLocales({countryCode: smeLoan.country, currencyCode: smeLoan.currency})
            .then(res => {
        if (!res || res.length == 0) {             
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }
        this.setState({ 
            locale: res[0].locale
        });
        })
        .catch(err => { console.log('getLocales err ', err); });
    }    
  }

  render () {
    const { classes, bankTransaction, connectTransactionType } = this.props;
    const { smeLoanData, smeLoan, smeLoans, smeLoanTransactions, totalConnectedAmount, locale } = this.state;

    return (<div>
      <Loader open={this.state.isLoading} />
      <Card>
        <CardBody>

          {/* SME Selection & SME Loan Details */}
          <GridContainer className={classes.loanDetailsContainer}>

            {/* Selected SME & Loan Data */}
            <GridItem>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className={clx(classes.noBorder)}>Contract Id</TableCell>
                    <TableCell className={clx(classes.noBorder)}>
                      {smeLoans.length > 1 ?
                        <FormControl className={classes.formControl} style={{ width: '100%', minWidth: 100 }}>
                          <Select
                            id='contract-id-select-box'
                            value={(smeLoan && smeLoan.contractId) || ''}
                            onChange={(e) => this.handleContractDropDown(e.target.value)}
                            inputProps={{
                              name: 'contractId',
                              id: 'contract-id',
                            }}
                            className={classes.selectEmpty}
                          >
                            {/* <MenuItem key="001" value="" disabled>Select SME Loan</MenuItem> */}
                            {
                              smeLoans.map((loan) => (
                                // @ts-ignore
                                <MenuItem key={loan._id} value={loan.contractId}>{loan.contractId}</MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                        :
                        smeLoan?.contractId
                      }
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.noBorder)}>SME</TableCell>
                    <TableCell className={clx(classes.noBorder)}>{(
                      <CustomSearch
                        id="sme-search"
                        name="SMESearch"
                        label={this.state.sme?.company || "Search SME"}
                        entity="customers"
                        sugg_field="legalName"
                        onResult={this.onSearchResult.bind(this)}
                        value={this.state.sme?.company || ''}
                      />
                    )}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.noBorder)}>Loan Type</TableCell>
                    <TableCell className={clx(classes.noBorder)}>{smeLoan?.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.noBorder)}>Status</TableCell>
                    <TableCell className={clx(classes.noBorder)}>{smeLoan?.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </GridItem>

            {/* SME Loan Fees */}
            <GridItem>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCellNumber}></TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>Original</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>Outstanding</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}>Overdue</TableCell>
                    <TableCell className={classes.tableHeaderCellNumber}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Principal</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.principleAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.outstandingPrincipleAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Interest</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(Math.abs(smeLoanData?.interestAmount), locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.outstandingInterestAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Initial Fee</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(Math.abs(smeLoanData?.initialCostAmount), locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.outstandingInitialFee, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Recurring Fee</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(Math.abs(smeLoanData?.recurringCostAmount), locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.outstandingRecurringFee, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Other Costs</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(Math.abs(smeLoanData?.otherCostsAmount), locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.outstandingOtherCostAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.otherCostOverdueAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCellNumber, classes.noBorder)}></TableCell>
                    <TableCell className={clx(classes.tableHeaderCellNumber, classes.noBorder)}>{currency(TOFIXED(smeLoanData?.principleAmount) + TOFIXED(smeLoan?.interestAmount) + TOFIXED(smeLoan?.initialCostAmount) + TOFIXED(smeLoan?.recurringCostAmount) + TOFIXED(smeLoan?.otherCostsAmount), locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableHeaderCellNumber, classes.noBorder)}>{currency(smeLoanData?.overallOutstandingTotalAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableHeaderCellNumber, classes.noBorder)}>{currency(smeLoanData?.overallTotalOverdueAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableHeaderCellNumber, classes.noBorder)}>{PERCENTAGE(smeLoanData?.overallTotalOverduePercentage)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </GridItem>
          </GridContainer>

          {/* Connecting Amounts */}
          <GridContainer>
            <GridItem>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Rest Partial Payment</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(smeLoanData?.partialPaymentAmount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Amount</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(bankTransaction.amount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                    <TableCell className={clx(classes.tableBodyCell, classes.noBorder, classes.amountsWarning)}>{this.warning}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={clx(classes.tableHeaderCell, classes.noBorder)}>Total Amount</TableCell>
                    <TableCell className={clx(classes.tableBodyCellNumber, classes.noBorder)}>{currency(this.state.totalAmountToBeConnected, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </GridItem>
          </GridContainer>

          {/* Connect and Cancel Buttons */}
          <GridContainer className={classes.buttonContainer}>
            {/* Cancel Button */}
            <Button variant="contained" color="primary" className={classes.marginRight}
              onClick={this.props.onClose}
              disabled={this.state.isLoading}
            >Cancel</Button>
            {/* Process Button */}
            {(connectTransactionType === 'connect-to-dd' && totalConnectedAmount > 0 &&
              <Button variant="contained" color="primary" className={classes.marginLeft}
                disabled={this.state.isLoading || this.warning !== '' || totalConnectedAmount === 0}
                onClick={this.connectSelectedTransactions}
              >Process</Button>
            )}
            {/* Add to Partial Payment Button */}
            {connectTransactionType === 'connect-to-dd' && totalConnectedAmount === 0 && this.newPartialPaymentAmount > 0 && (
              <Button variant="contained" color="primary" className={classes.marginLeft}
                disabled={this.state.isLoading}
                onClick={this.addPartialPayment}
              >Add Partial Payment</Button>
            )}
            {/* Connect to Transaction Button */}
            {connectTransactionType === 'connect-to-transaction' && Math.abs(totalConnectedAmount) > 0 && (
              <Button variant="contained" color="primary" className={classes.marginLeft}
                disabled={this.state.isLoading}
                onClick={this.connectSelectedTransactions}
              >Connect To Transaction</Button>
            )}
            {/* Change Status Button */}
            {/* {connectTransactionType === 'connect-to-transaction' && Math.abs(totalConnectedAmount) === 0 && (
              <Button variant="contained" color="primary" className={classes.marginLeft}
                disabled={this.state.isLoading}
                onClick={() => this.setState({ isChangeStatus: true })}
              >Change Status</Button>
            )} */}
          </GridContainer>

          {/* Connect To Sme Loan Transaction Table */}
          <Paper className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Connect</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={this.state.orderBy === 'plannedDate'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={() => this.handleRequestSort('plannedDate')}
                    >Planned Date</TableSortLabel>
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={this.state.orderBy === 'amount'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={() => this.handleRequestSort('amount')}
                    >Amount</TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={this.state.orderBy === 'status'}
                      // @ts-ignore
                      direction={this.state.order}
                      onClick={() => this.handleRequestSort('status')}
                    >Status</TableSortLabel>
                  </TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Statement</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.specialSortForTransactions(smeLoanTransactions, util.getSorting(this.state.order, this.state.orderBy)).map((tr) => {
                    const latestConnectedStatement = this.getLatestStatement(tr.statusHistory);
                    return (
                      <TableRow key={tr._id}>
                        <TableCell>{
                          <Checkbox
                            checkedIcon={<Clear />}
                            checked={Boolean(tr.connected)}
                            onChange={this.handleCheckbox(tr.id)}
                          />
                        }</TableCell>
                        <TableCell>{moment(tr.plannedDate).format('DD-MM-YYYY')}</TableCell>
                        <TableCell>{tr.description}</TableCell>
                        <TableCell>{currency(tr.amount, locale ? locale : 'nl-NL', smeLoan?.currency ? smeLoan.currency : 'EUR')}</TableCell>
                        <Tooltip placement='bottom' disableFocusListener disableTouchListener
                          title={<StatusHistoryPopup statusHistory={tr.statusHistory} />}
                        >
                          <TableCell>{tr.status}</TableCell>
                        </Tooltip>
                        <TableCell>{latestConnectedStatement?.reason}</TableCell>
                        <TableCell>{latestConnectedStatement?.statement}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Paper>
        </CardBody>
      </Card>

      {/* <ConfirmationDialog title='Are you sure this transaction has no influence on the loan?'
        cancel='NO'
        ok='YES'
        open={this.state.isChangeStatus}
        handleOk={this.confirmChangeStatus}
        handleCancel={() => this.setState({ isChangeStatus: false })} /> */}
    </div>);
  }
}

ConnectUnknownTransactionView.propTypes = {
  classes: PropTypes.object,
  simulations: PropTypes.object.isRequired,
  bankTransaction: PropTypes.object.isRequired,

  connectTransactionType: PropTypes.oneOf(['connect-to-dd', 'connect-to-transaction']),

  onClose: PropTypes.func.isRequired,
  clearLoans: PropTypes.func.isRequired,
  getLatestSmeLoan: PropTypes.func.isRequired,
  requestSmeByIban: PropTypes.func.isRequired,
  clearSmeLoanFees: PropTypes.func.isRequired,
  clearSelectedSme: PropTypes.func.isRequired,
  clearDirectDebits: PropTypes.func.isRequired,
  getSmeLoansByQuery: PropTypes.func.isRequired,
  refreshBTOverview: PropTypes.func.isRequired,
  // setManuallySettled: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  settleAsPatialPayment: PropTypes.func.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  getSmeLoanTransactions: PropTypes.func.isRequired,
  getSmeLoanFeesAndTransactions: PropTypes.func.isRequired,
  connectUnknownSmeLoanTransaction: PropTypes.func.isRequired,
  getFlexLoanLatestWithdrawalOrder: PropTypes.func.isRequired,
  getSmeFlexLoanFees: PropTypes.func.isRequired,
  getLocales: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  simulations: state.configurations.simulations,
});

const mapDispatchToProps = (dispatch) => ({
  clearLoans: () => dispatch(clearLoans()),
  clearSelectedSme: () => dispatch(clearSelectedSme()),
  clearDirectDebits: () => dispatch(clearDirectDebits()),
  clearSelectedCustomer: () => dispatch(clearSelectedCustomer()),
  requestSmeByIban: (iban) => dispatch(requestSmeByIbanNumber(iban)),
  getSmeLoansByQuery: (params) => dispatch(getSmeLoansByQuery(params)),
  clearSmeLoanFees: () => dispatch(clearCalculatedDataOfLoanTransactions()),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  getSmeLoanTransactions: (queryParams) => dispatch(getSmeLoanTransactions(queryParams)),
  getLatestSmeLoan: (smeId, status) => dispatch(getLatestSmeLoanBySmeIdAndStatus(smeId, status)),
  getSmeLoanFeesAndTransactions: (contractId) => dispatch(getSmeLoanFeesAndTransactions(contractId)),
  settleAsPatialPayment: (transaction, btId) => dispatch(settleUnknownAsPatialPayment(transaction, btId)),
  getFlexLoanLatestWithdrawalOrder: (contractId) => dispatch(getFlexLoanLatestWithdrawalOrder(contractId)),
  getSmeFlexLoanFees: (contractId) => dispatch(getSmeFlexLoanFees(contractId)),
  // setManuallySettled: (transactionId, status) => dispatch(saveBankTransactionStatus(transactionId, status)),
  connectUnknownSmeLoanTransaction: (connectData) => dispatch(connectUnknownSmeLoanTransaction(connectData)),
  getLocales: (requestBody) => dispatch(getLocales(requestBody)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(ConnectUnknownTransactionView));