import moment from "moment";
import qs from "querystring";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import LoadingOverlay from "react-loading-overlay";

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@material-ui/core";

import { Error, RemoveShoppingCart } from "@material-ui/icons";

import withStyles from "@material-ui/core/styles/withStyles";

import Util from "lib/loanmanagement/utility";

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import Button from "components/loanmanagement/CustomButtons/Button";
import Notifier from "components/loanmanagement/Notification/Notifier";
import MaterialButton from '@material-ui/core/Button';
import GridContainer from "components/loanmanagement/Grid/GridContainer";
import GridItem from "components/loanmanagement/Grid/GridItem";

import {
  getAllDirectDebitBatchDetails,
  SetDirectDebitBatchLogs,
  // registerBatch,
  // registerTransactions, revertTransactions, registerTransaction,
  createXML,
  getLastestBatch,
  GetBatchByCreationDate,
  getTransactionsForBatchView,
  regenerateBatch,
  approveBatch,
  getUpdateTransactionsCount,
} from "store/loanmanagement/actions/DirectDebitBatchDetails";

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const styles = {
  tableCell: {
    paddingRight: 4,
    paddingLeft: 5
  },
  tableCellWithError: {
    paddingRight: 4,
    paddingLeft: 5,
    color: 'red'
  },
  tableCellWithWarning: {
    paddingRight: 4,
    paddingLeft: 5,
    color: 'orange'
  },
  colorBox: {
    height: "15px",
    width: "15px",
    margin: "5px",
    border: "1px solid black"
  },
  colorDescriptionInnerContainer: {
    display: "flex"
  },
  colorCodeContainer: {
    margin: "5px"
  },
  batchErrors: {
    color: 'red'
  },
  batchWarnings: {
    color: '#717103'
  },
  colorCodeboxWrapper: {
    display: 'flex'
  },
  colorCodeBoxes: {
    position: 'relative',
    float: 'left',
    border: '1px solid dotted',
    padding: '5px',
    marging: '5px 25px 5px 5px'
  },
  erroricon: {
    margin: '5px 0 0 5px',
  }
};
const currency = Util.currencyConverter();

const updateQueryStringParameter = (uri, key, value) => {
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2");
  }
  return uri + separator + key + "=" + value;
};

const initialState = {
  isLoading: false,
  selectedDate: moment().format("YYYY-MM-DD"),
  bToBUnCheckedList: [],
  coreUnCheckedList: [],
  totalUnCheckedBToBAmount: 0,
  totalUnCheckedCoreAmount: 0,
  openRegenerateConfirmation: false,
  openApproveConfirmation: false,
  openTransactionsUpdateError: false,
  isPreviousBatch: false,
  disableApprove: false,
  selectedMandate: null,
  latestBatchDate: null,
  latestBatch: null,
  transactionsForBatch: null,
  batchSettings: null,
  excludedTransactions: {},
  mandateTypes: [],
  transactionCountForSme: {},
  originalData: {},

  batchLength: 0,
  batchNumber: 0,
  disabledPrevBTN: true,
  disabledNextBTN: false,
};

const STATUS = { sentToBank: 'sent-to-bank' };

class DirectDebitBatchDetails extends Component {
  constructor(props) {
    super(props);

    const state = JSON.parse(JSON.stringify(initialState));
    state.isLoading = this.props.isLoading;

    this.state = state;
  }

  componentDidMount() {
    /* Get batch details on page load */
    const _state = JSON.parse(JSON.stringify(this.state));
    const params = this.props.location ? qs.parse(this.props.location.search.slice(1)) : null;// DashboardTabConcept
    const date = params && params.date ? params.date : null;// DashboardTabConcept
    if (date && moment(date).isValid()) {
      _state.selectedDate = date;

    } else {
      if (this.props.configurations.simulations.systemDate) _state.selectedDate = moment(this.props.configurations.simulations.systemDate);
    }

    if (date || _state.selectedDate) {
      _state.isLoading = true;

      this.setState(_state, () => { this.getBatchDataForView(date ? date : moment(_state.selectedDate).format('YYYY-MM-DD')); });

    } else {
      this.setState(_state);
    }
  }

  /* Get batch details for view purpose */
  getBatchDataForView = (date) => {

    if (date && moment(date).isValid()) {

      const _state = JSON.parse(JSON.stringify(this.state));

      _state.excludedTransactions = {};
      _state.transactionsForBatch = {};
      _state.transactionCountForSme = {};
      _state.originalData = {};
      _state.batchSettings = null;
      _state.mandateTypes = [];

      _state.disableApprove = false;
      _state.openRegenerateConfirmation = false;
      _state.openApproveConfirmation = false;
      _state.openTransactionsUpdateError = false;

      /* Check for existing batch for selected date */
      this.props.GetBatchByCreationDate({ date: moment(date).format('YYYY-MM-DD') })
        .then((batchResponse) => {
          if (!batchResponse || !batchResponse[0]) return;
          _state.latestBatch = batchResponse;
          _state.batchLength = batchResponse.length;
          _state.batchNumber = _state.batchNumber ? _state.batchNumber : 0;

          const transactionLoop = [];

          const batch = batchResponse[_state.batchNumber];

          /* Get transactions for each batch type */
          // this.getTransactionsForBatchView(batch,_state);
          // for (const batch of batchResponse) {
          transactionLoop.push(

            this.props.getTransactionsForBatchView({ batchId: batch.externalBatchId, mandateTypes: [batch.mandateType], smeDetails: true })
              .then((transactionsResponse) => {
                if (!transactionsResponse) return;

                if (!_state.transactionsForBatch) _state.transactionsForBatch = {};
                _state.originalData[batch.mandateType] = {
                  transactionsCount: transactionsResponse.transactions.length,
                  excludeIds: batch.excludeIds,
                };
                _state.excludedTransactions[batch.mandateType] = batch.excludeIds;
                _state.transactionsForBatch[batch.mandateType] = transactionsResponse.transactions;
                _state.transactionCountForSme[batch.mandateType] = transactionsResponse.transactionCountForSme;
                _state.batchSettings = transactionsResponse.batchSettings;
                _state.mandateTypes = _state.mandateTypes.concat(transactionsResponse.mandateTypes);

              })
          );
          // }

          return Promise.all(transactionLoop);
        })
        .finally(() => {
          _state.isLoading = false;
          this.setState(_state);
        });

    }
  };


  getTransactionsForBatchView = (batch) => {
    //  const _state = {};
    const _state = JSON.parse(JSON.stringify(this.state));

    this.setState({ isLoading: true }, () => {
      this.props.getTransactionsForBatchView({ batchId: batch.externalBatchId, mandateTypes: [batch.mandateType], smeDetails: true })
        .then((transactionsResponse) => {
          if (!transactionsResponse) return;

          if (!_state.transactionsForBatch) _state.transactionsForBatch = {};
          _state.originalData[batch.mandateType] = {
            transactionsCount: transactionsResponse.transactions.length,
            excludeIds: batch.excludeIds,
          };
          _state.excludedTransactions[batch.mandateType] = batch.excludeIds;
          _state.transactionsForBatch[batch.mandateType] = transactionsResponse.transactions;
          _state.transactionCountForSme[batch.mandateType] = transactionsResponse.transactionCountForSme;
          _state.batchSettings = transactionsResponse.batchSettings;
          _state.mandateTypes = _state.mandateTypes.concat(transactionsResponse.mandateTypes);
          _state.isLoading = false;


        }).finally(() => {
          _state.isLoading = false;
          this.setState(_state);
        });
    });
  }


  componentWillUnmount() {
    this.props.SetDirectDebitBatchLogs([]);
  }

  /* Check box onChange handler */
  handleCheckbox = (batchType, id) => {
    const stateData = batchType === 'b2b' ? this.state.bToBUnCheckedList : this.state.coreUnCheckedList;
    const index = stateData.indexOf(id);
    const unChecked = [...stateData];

    if (index === -1) unChecked.push(id);
    else unChecked.splice(index, 1);

    batchType === 'b2b' ? this.setState({ bToBUnCheckedList: unChecked }) : this.setState({ coreUnCheckedList: unChecked });
  };

  /* Handle transactions excluding */
  handleTransactionExcludes = (batchType, transactionId) => {
    const _state = JSON.parse(JSON.stringify(this.state));
    if (!_state.excludedTransactions[batchType]) _state.excludedTransactions[batchType] = [];
    if (_state.excludedTransactions[batchType].includes(transactionId)) {
      _state.excludedTransactions[batchType].splice(_state.excludedTransactions[batchType].indexOf(transactionId), 1);
    } else {
      _state.excludedTransactions[batchType].push(transactionId);
    }

    this.setState(_state);
  }

  /* Download XML file */
  downloadFile = (batch) => {
    if (batch) {

      const xml = batch.xml;
      const fileName = batch.externalBatchId;
      const blob = new Blob([xml], { type: "text/xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName + ".xml";
      a.click();

    }

  };

  /* Date picker onChange handler */
  handleSelectedDate = date => {

    this.setState({
      isPreviousBatch: moment(date).isBefore(moment(this.state.latestBatchDate)) ? true : false,
      selectedDate: moment(date).format('YYYY-MM-DD'),
      isLoading: true,
    }, () => {
      this.getBatchDataForView(this.state.selectedDate);

      const URL = updateQueryStringParameter(
        document.location.href,
        "date",
        moment(date).format('YYYY-MM-DD')
      );
      window.history.pushState({ path: URL }, "", URL);

    });

    // this.setState({ selectedDate: moment(date).format('YYYY-MM-DD'), isLoading: true },
    //   () => {
    //     this.getBatchDataForView(this.state.selectedDate);
    //     // this.props.getAllDirectDebitBatchDetails(this.state.selectedDate);
    //     this.setState({ isPreviousBatch: moment(this.state.selectedDate).isBefore(moment(this.state.latestBatchDate)) ? true : false });
    //   }
    // );

    // const URL = updateQueryStringParameter(
    //   document.location.href,
    //   "date",
    //   moment(date).format('YYYY-MM-DD')
    // );
    // window.history.pushState({ path: URL }, "", URL);

  };

  /* transactions row colors according to the status */
  getGroupColor = group => {
    switch (group) {
      case "open":
        return "#4db0f4";
      case "failed":
        return "#96ce84";
      case "rejected":
        return "#f2da4e";
      case "frequently-failed":
        return "#ffbe84";
      case "frequently-rejected":
        return "#ff8686";
      case "interest-claim":
        return "#e6520c";
      default:
        return "#FFF";
    }
  };

  /* Regenerate confirmation dialog action onChange handler */
  handleRegenerateConfirmationDialog = (mandateType) => {
    this.setState((prevState) => {
      return {
        openRegenerateConfirmation: !prevState.openRegenerateConfirmation,
        selectedMandate: mandateType
      };
    });
  }

  /* Batch approval confirmation dialog action onChange handler */
  handleApproveConfirmationDialog = (mandateType) => {
    this.setState((prevState) => {
      return {
        openApproveConfirmation: !prevState.openApproveConfirmation,
        selectedMandate: mandateType
      };
    });
  }

  /* Batch approval confirmation dialog action onChange handler */
  handleTransactionsUpdatesErrorDialog = (mandateType) => {
    this.setState((prevState) => {
      return {
        openTransactionsUpdateError: !prevState.openTransactionsUpdateError,
        selectedMandate: mandateType
      };
    });
  }

  /* Split excluded transaction ids and transaction ids with errors */
  splitExcludeTransactions = (selectedBatch, mandateType) => {
    const errorTransactionIds = (selectedBatch && selectedBatch.error) ? selectedBatch.error.map((error) => error.metaData.transactionId) : [];

    const excludedTransactionsIds = this.state.excludedTransactions[mandateType].filter((id) => !errorTransactionIds.includes(id));

    return [excludedTransactionsIds, errorTransactionIds];
  }

  /* Regenerate the batch */
  regenerateBatch = (mandateType) => {

    this.setState({ isLoading: true, openRegenerateConfirmation: false }, () => {

      const selectedBatch = this.state.latestBatch.filter((batch) => batch.mandateType === mandateType)[0];

      const [excludedTransactionsIds] = this.splitExcludeTransactions(selectedBatch, mandateType);

      // const errorTransactionIds = (selectedBatch && selectedBatch.error) ? selectedBatch.error.map((error) => error.metaData.transactionId) : [];

      // const excludedTransactionsIds = this.state.excludedTransactions[mandateType].filter((id) => !errorTransactionIds.includes(id));

      const params = {
        batchCreationDate: moment(selectedBatch.creationDate).format('YYYY-MM-DD'),
        mandateTypeOfBatch: [mandateType],
        excludedTransactions: { [mandateType]: excludedTransactionsIds },
      };

      this.props.regenerateBatch(params)
        .then(() => {
          this.getBatchDataForView(this.state.selectedDate);
        })
        .catch((error) => {
          console.log(error);
          this.setState({ isLoading: false });
        });

    });

  };

  /* Approve selected batch */
  approveBatch = (mandateType) => {

    this.setState({ isLoading: true, openApproveConfirmation: false }, () => {

      const selectedBatch = this.state.latestBatch.filter((batch) => batch.mandateType === mandateType)[this.state.batchNumber];

      /* Check transactions updates */
      this.props.getUpdateTransactionsCount({ id: selectedBatch._id })
        .then((response) => {
          if (response && ('transactionsCount' in response) && Number(response.transactionsCount) > 0) {

            this.setState({ isLoading: false, disableApprove: true }, () => { this.handleTransactionsUpdatesErrorDialog(mandateType); });

          } else {

            const user = sessionStorage.getItem('user');

            const params = {
              externalBatchId: selectedBatch.externalBatchId,
              batchId: selectedBatch._id,
              batchExecutionDate: selectedBatch.executionDate,
              approvedBy: user,
              excludedTransactions: { [mandateType]: this.state.excludedTransactions[mandateType] },
            };

            this.props.approveBatch(params)
              .then(() => {
                this.getBatchDataForView(this.state.selectedDate);
              })
              .catch((error) => {
                console.log(error);
                this.setState({ isLoading: false });
              });

          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({ isLoading: false });
        });



    });

  };

  transactionTable = (batchTransactions, mandateType, errorTransactionsIds = [], excludedTransactionsIds = [], locked) => {
    try {

      const includedTransactions = [];
      const excludedTransactions = [];
      const errorTransactions = [];

      for (const transaction of batchTransactions) {

        if (errorTransactionsIds.includes(transaction._id)) {

          errorTransactions.push(
            <TableRow key={transaction._id}
              style={{ background: this.getGroupColor(transaction.status) }}
            >
              <TableCell style={styles.tableCell}>
                <Checkbox
                  value={transaction._id}
                  checked={false}
                  onChange={() => this.handleTransactionExcludes(mandateType.toUpperCase(), transaction._id)}
                  disabled={locked}
                />
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.mandate ? transaction.mandate.organizationId : 'NAN'}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.ourReference}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {currency(transaction.amount)}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.mandate ? transaction.mandate.mandateId : 'NAN'}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {moment(transaction.plannedDate).format('DD-MM-YYYY')}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.description}
              </TableCell>
              <TableCell style={styles.tableCellWithError}>
                <Error style={styles.erroricon} />
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.status}
              </TableCell>
            </TableRow>
          );

        } else if (excludedTransactionsIds.includes(transaction._id)) {

          excludedTransactions.push(
            <TableRow key={transaction._id}
              style={{ background: this.getGroupColor(transaction.status) }}
            >
              <TableCell style={styles.tableCell}>
                <Checkbox
                  value={transaction._id}
                  checked={false}
                  onChange={() => this.handleTransactionExcludes(mandateType.toUpperCase(), transaction._id)}
                  disabled={locked}
                />
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.mandate ? transaction.mandate.organizationId : 'NAN'}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.ourReference}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {currency(transaction.amount)}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {/* {transaction.mandate.mandateId} */}
                {transaction.mandate ? transaction.mandate.mandateId : 'NAN'}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {moment(transaction.plannedDate).format('DD-MM-YYYY')}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.description}
              </TableCell>
              <TableCell style={styles.tableCellWithWarning}><RemoveShoppingCart style={styles.erroricon} /></TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.status}
              </TableCell>
            </TableRow>
          );

        } else {

          includedTransactions.push(
            <TableRow key={transaction._id}
              style={{ background: this.getGroupColor(transaction.status) }}
            >
              <TableCell style={styles.tableCell}>
                <Checkbox
                  value={transaction._id}
                  checked={true}
                  onChange={() => this.handleTransactionExcludes(mandateType.toUpperCase(), transaction._id)}
                  disabled={locked}
                />
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.mandate ? transaction.mandate.organizationId : 'NAN'}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.ourReference}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {currency(transaction.amount)}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {/* {transaction.mandate.mandateId} */}
                {transaction.mandate ? transaction.mandate.mandateId : 'NAN'}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {moment(transaction.plannedDate).format('DD-MM-YYYY')}
              </TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.description}
              </TableCell>
              <TableCell style={styles.tableCell}></TableCell>
              <TableCell style={styles.tableCell}>
                {transaction.status}
              </TableCell>
            </TableRow>
          );

        }

      }

      return [errorTransactions, excludedTransactions, includedTransactions];

    } catch (error) {
      console.log(error);
      return [null, null, null];
    }
  }

  /* Calculate total amount from selected transactions */
  calculateSelectedTransactionsAmount = (transactions, excludedTransactions = []) => {
    try {

      const b2bSelectedAmount = transactions ? transactions.reduce((a, cv) => {
        if (excludedTransactions.indexOf(cv._id) === -1) return a + cv.amount;
        return a;
      }, 0) : 0;

      return b2bSelectedAmount;

    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  groupDataForView = () => {
 
    try {

      const ViewData = {};

      const excludedTransactions = {};

      if (this.state.latestBatch && this.state.latestBatch.length > 0) {

        const batchSettings = this.state.batchSettings;

        for (const mandateType of this.state.mandateTypes) {

          const DATA = {
            batch: this.state.latestBatch.filter(batch => batch.mandateType === mandateType)[this.state.batchNumber],
            transactions: this.state.transactionsForBatch[mandateType],
            numberOfSelectedTransactions: 0,
            amountForSelectedTransactions: 0,
            isBatchRegistered: false,
            warnings: [],
            isAnyManualChanges: false,
          };

          /* Check any manually excluded transactions are avilabel */
          if (this.state.excludedTransactions[mandateType] && this.state.originalData[mandateType]) {

            if (this.state.originalData[mandateType].excludeIds.length !== this.state.excludedTransactions[mandateType].length) DATA.isAnyManualChanges = true;
            else {
              const diff = this.state.excludedTransactions[mandateType].filter((id) => !this.state.originalData[mandateType].excludeIds.includes(id)).length;
              DATA.isAnyManualChanges = (diff !== 0);
            }

          }

          const [excludedTransactionsIds, errorTransactionIds] = this.splitExcludeTransactions(DATA.batch, mandateType);

          excludedTransactions[mandateType] = {
            errorTransactionIds,
            excludedTransactionsIds,
          };

          DATA.isBatchRegistered = (DATA.batch.status === STATUS.sentToBank);

          DATA.numberOfSelectedTransactions = DATA.transactions.length - this.state.excludedTransactions[mandateType].length;

          DATA.amountForSelectedTransactions = this.calculateSelectedTransactionsAmount(DATA.transactions, this.state.excludedTransactions[mandateType]);

          if (batchSettings && Object.keys(batchSettings).length > 0) {

            const batchLength = this.state.latestBatch.length;

            const lastBatch = this.state.latestBatch.filter(batch => batch.mandateType === mandateType)[batchLength - 1];

            // const lastNumberOfSelectedTransactions = lastBatch.transactions.length;

            if (batchSettings.maxBatchesPerDay === batchLength && ((batchSettings.maxDirectDebitsPerBatch / 100) * 80) < lastBatch.directDebitsCount) {
              DATA.warnings.push({ 'message': 'Take contact with ABN to enlarge max-number-of-direct-debits-per-batch!' });
            }

            if (batchSettings.maxBatchesPerDay === batchLength && (Number(batchSettings.maxAmountPerBatch / 100) * 80) < Number(lastBatch.totalDirectDebitsAmount.toFixed(2))) {
              DATA.warnings.push({ 'message': 'Take contact with ABN to enlarge max-amount-per-batch!' });
            }

            if (batchSettings.maxBatchesPerDay < batchLength) {
              DATA.warnings.push({ 'message': 'Take contact with ABN to enlarge max-batches-per-day!' });
            }

            /* Check transactions count per sme errors */
            if (this.state.transactionCountForSme[mandateType]) {

              const transactionCountForSme = this.state.transactionCountForSme[mandateType];

              for (const item of transactionCountForSme) {
                if (Number(item.count) > Number(batchSettings.maxDirectDebitsPerLoanTypePerDay)) {
                  DATA.warnings.push({ 'message': `Too many direct debits for customer ${item.organizationId ? item.organizationId : item.name} loan ${item.contractId}` });
                }
              }

            }

          }

          ViewData[mandateType] = DATA;

        }

      }

      return [ViewData, excludedTransactions];

    } catch (error) {
      console.log(error);
      return [null, null];

    }
  }


  prevButtonClicked = () => {

    let batchNumber = this.state.batchNumber;
    // let disabledPrevBTN = false;
    if (batchNumber > 0) {
      batchNumber--;
    } else {
      batchNumber = 0;
    }

    if (batchNumber === 0) {
    }

    this.setState({ batchNumber }, () => { this.getTransactionsForBatchView(this.state.latestBatch[batchNumber]); });

  }

  nextButtonClicked = () => {

    let batchNumber = this.state.batchNumber;
    const batchLength = this.state.batchLength;
    if (batchLength > 0) {
      if (batchNumber + 1 < batchLength) {
        batchNumber++;
      } else {
        batchNumber = batchLength - 1;
      }
    } else {
      batchNumber = 0;
    }


    this.setState({ batchNumber }, () => { this.getTransactionsForBatchView(this.state.latestBatch[batchNumber]); });

  }

  render() {
  
    const [ViewData, excludedTransactions] = this.groupDataForView();


    const b2bBatch = (ViewData['B2B'] && ViewData['B2B'].batch) ? ViewData['B2B'].batch : null;
 
    const coreBatch = (ViewData['CORE'] && ViewData['CORE'].batch) ? ViewData['BCORE2B'].batch : null;

    let b2bWarnings = [];
    if (b2bBatch && b2bBatch.warning && b2bBatch.warning.length > 0) b2bWarnings = b2bWarnings.concat(b2bBatch.warning);
    if (ViewData && ViewData['B2B'] && ViewData['B2B'].warnings.length > 0) b2bWarnings = b2bWarnings.concat(ViewData['B2B'].warnings);

    let coreWarnings = [];
    if (coreBatch && coreBatch.warning && coreBatch.warning.length > 0) coreWarnings = coreWarnings.concat(coreBatch.warning);
    if (ViewData && ViewData['CORE'] && ViewData['CORE'].warnings.length > 0) coreWarnings = coreWarnings.concat(ViewData['CORE'].warnings);


    const [b2bErrorTransactions, b2bExcludedTransactions, b2bIncludedTransactions] = ViewData['B2B'] ? this.transactionTable(
      ViewData['B2B'].transactions, 'B2B', excludedTransactions['B2B'].errorTransactionIds,
      excludedTransactions['B2B'].excludedTransactionsIds, ViewData['B2B'].isBatchRegistered
    ) : [null, null, null];

    const [coreErrorTransactions, coreExcludedTransactions, coreIncludedTransactions] = ViewData['CORE'] ? this.transactionTable(
      ViewData['CORE'].transactions, 'CORE', excludedTransactions['CORE'].errorTransactionIds,
      excludedTransactions['CORE'].excludedTransactionsIds, ViewData['CORE'].isBatchRegistered
    ) : [null, null, null];

    const { classes } = this.props;

    let approveButtonTooltip = '';
    if (!b2bBatch) approveButtonTooltip = 'Batch not found';
    if (ViewData['B2B'] && ViewData['B2B'].isBatchRegistered) approveButtonTooltip = 'This batch already approved!';
    if (ViewData['B2B'] && ViewData['B2B'].isAnyManualChanges) approveButtonTooltip = 'Manual changes applied. Regenerate this batch!';

    let disableRegenerateBatch_B2B = false;
    if (this.state.disableApprove) disableRegenerateBatch_B2B = false;
    else disableRegenerateBatch_B2B = !(b2bBatch && !ViewData['B2B'].isBatchRegistered && ViewData['B2B'].isAnyManualChanges);

    let disableApproveBatch_B2B = false;
    if (this.state.disableApprove) disableApproveBatch_B2B = true;
    else disableApproveBatch_B2B = (!b2bBatch || (ViewData['B2B'].isBatchRegistered || ViewData['B2B'].isAnyManualChanges));

    return (
      <div>
        <Notifier />
        <Card>
          <CardBody>
            <LoadingOverlay
              active={this.state.isLoading}
              spinner
              text="Please wait..."
            >

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Select a date :"
                  value={this.state.selectedDate}
                  onChange={this.handleSelectedDate}
                  autoOk={true}
                  KeyboardButtonProps={{
                    'aria-label': 'Select a date',
                  }}
                />
              </MuiPickersUtilsProvider>
              {/* <div> <span style={{"marginRight":"10px"}}>Sequence-No:</span>
              <Button
                    color={(this.state.batchNumber > 0) ? "success" : "white"}
                    disabled={(this.state.batchNumber === 0)}
                    onClick={() =>{this.prevButtonClicked();}}
                    id="preButtton"
                  >Prev
              </Button>
                    {this.state.batchNumber+1}
              <Button
                    color={(this.state.batchLength > 0 && (this.state.batchNumber+1 < this.state.batchLength)) ? "success" : "white"}
                    disabled={!(this.state.batchLength > 0 && (this.state.batchNumber+1 < this.state.batchLength))}
                    onClick={() =>{this.nextButtonClicked();} 
                    }
                    id="nextButtton"
                  >Next
              </Button>
              </div> */}

              <GridContainer spacing={2}>
                <GridItem>
                  <MaterialButton variant="outlined" size="small" id="preButtton"
                    disabled={(this.state.batchNumber === 0)}
                    onClick={() => { this.prevButtonClicked(); }}>{'Previous'}</MaterialButton>
                </GridItem>
                <GridItem>
                  {`${this.state.batchLength === 0 ? 0 : (this.state.batchNumber + 1)} of ${this.state.batchLength} batches`}
                </GridItem>
                <GridItem>
                  <MaterialButton variant="outlined" size="small" id="nextButtton"
                    disabled={!(this.state.batchLength > 0 && (this.state.batchNumber + 1 < this.state.batchLength))}
                    onClick={() => { this.nextButtonClicked(); }}>{'Next'}</MaterialButton>
                </GridItem>
              </GridContainer>

              <div className={classes.colorCodeboxWrapper}>

                <div className={classes.colorCodeBoxes}>
                  Color Codes : Direct debits with status ;
                  <div className={classes.colorDescriptionInnerContainer}>
                    <div className={classes.colorBox} style={{ background: this.getGroupColor('open') }}></div>
                    <div>&quot;open&quot;</div>
                  </div>
                  <div className={classes.colorDescriptionInnerContainer}>
                    <div className={classes.colorBox} style={{ background: this.getGroupColor('failed') }}></div>
                    <div>&quot;failed&quot;</div>
                  </div>
                  <div className={classes.colorDescriptionInnerContainer}>
                    <div className={classes.colorBox} style={{ background: this.getGroupColor('rejected') }}></div>
                    <div>&quot;rejected&quot;</div>
                  </div>
                  <div className={classes.colorDescriptionInnerContainer}>
                    <div className={classes.colorBox} style={{ background: this.getGroupColor('frequently-failed') }}></div>
                    <div>&quot;frequently-failed&quot;</div>
                  </div>
                  <div className={classes.colorDescriptionInnerContainer}>
                    <div className={classes.colorBox} style={{ background: this.getGroupColor('frequently-rejected') }}></div>
                    <div>&quot;frequently-rejected&quot;</div>
                  </div>
                </div>

              </div>



              <Card>
                <CardHeader color="info">
                  <div style={{ float: "left", fontWeight: 500, fontSize: '1.2rem', margin: '1% 0 0 0.5%' }}>
                    B2B {" - " + (b2bBatch ? Util.styleStrings(b2bBatch.status, 'firstUpper') : '')} {b2bBatch ? ` : ${b2bBatch.externalBatchId}` : ''}
                  </div>
                  <Button
                    color={!(b2bBatch && ViewData['B2B'].isBatchRegistered) ? "white" : "success"}
                    style={{ float: "right" }}
                    disabled={!(b2bBatch && ViewData['B2B'].isBatchRegistered)}
                    onClick={() => this.downloadFile(b2bBatch)}
                    id="batch_xml_B2B"
                  >Batch XML</Button>
                  <Button
                    color={disableRegenerateBatch_B2B ? "white" : "danger"}
                    style={{ float: "right", marginRight: '5%' }}
                    disabled={disableRegenerateBatch_B2B}
                    onClick={() => this.handleRegenerateConfirmationDialog('B2B')}
                    id="regenerate_batch_B2B"
                  >Re-generate</Button>
                  <Tooltip title={approveButtonTooltip}>
                    <span>
                      <Button
                        color={disableApproveBatch_B2B ? "white" : "success"}
                        style={{ float: "right", marginRight: '5%' }}
                        disabled={disableApproveBatch_B2B}
                        onClick={() => this.handleApproveConfirmationDialog('B2B')}
                        id="approve_batch_B2B"
                      >Approve</Button>
                    </span>
                  </Tooltip>
                </CardHeader>
                <CardBody>

                  {
                    (b2bBatch && b2bBatch.error && b2bBatch.error.length > 0) ?
                      b2bBatch.error.map((errorObject) => {
                        return (<h4 className={classes.batchErrors} style={{ marginBottom: "1%" }} key={errorObject._id}>Error: {errorObject.message}</h4>);
                      })
                      : <h4 style={{ marginBottom: "1%" }}>Errors : No Errors</h4>
                  }

                  {
                    (b2bWarnings && b2bWarnings.length > 0) ?
                      b2bWarnings.map((warningObject) => {
                        return (<h4 className={classes.batchWarnings} style={{ marginBottom: "1%" }} key={warningObject._id}>Warning: {warningObject.message}</h4>);
                      })
                      : <h4 style={{ marginBottom: "1%" }}>Warnings : No Warnings</h4>
                  }

                  <div>
                    Number of Direct-Debits-in-Batch :{ViewData['B2B'] ? ViewData['B2B'].numberOfSelectedTransactions : 0}
                  </div>
                  <div>
                    Batch total :{currency(ViewData['B2B'] ? ViewData['B2B'].amountForSelectedTransactions : 0)}
                  </div>
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={styles.tableCell} />
                          <TableCell style={styles.tableCell}>Organization ID</TableCell>
                          <TableCell style={styles.tableCell}>Reference</TableCell>
                          <TableCell style={styles.tableCell}>Amount</TableCell>
                          <TableCell style={styles.tableCell}>Mandate</TableCell>
                          <TableCell style={styles.tableCell}>Planned Date</TableCell>
                          <TableCell style={styles.tableCell}>Description</TableCell>
                          <TableCell style={styles.tableCell}></TableCell>
                          <TableCell style={styles.tableCell}>Status</TableCell>
                          {/* <TableCell style={styles.tableCell}></TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {b2bErrorTransactions}
                        {b2bExcludedTransactions}
                        {b2bIncludedTransactions}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardBody>
              </Card>
              {/*  */}
              <Card>
                <CardHeader color="info">

                  <div style={{ float: "left", fontWeight: 500, fontSize: '1.2rem', margin: '1% 0 0 0.5%' }}>
                    CORE {" - " + (coreBatch ? Util.styleStrings(coreBatch.status, 'firstUpper') : '')} {coreBatch ? ` : ${coreBatch.externalBatchId}` : ''}
                  </div>

                  <Button
                    color={!(coreBatch && ViewData['CORE'].isBatchRegistered) ? "white" : "success"}
                    style={{ float: "right" }}
                    disabled={!coreBatch}
                    onClick={() => this.downloadFile(coreBatch)}
                    id="batch_xml_CORE"
                  > Batch XML </Button>
                  <Button
                    color={!(coreBatch && !ViewData['CORE'].isBatchRegistered && ViewData['CORE'].isAnyManualChanges) ? "white" : "danger"}
                    style={{ float: "right", marginRight: '5%' }}
                    disabled={!(coreBatch && !ViewData['CORE'].isBatchRegistered)}
                    onClick={() => this.handleRegenerateConfirmationDialog('CORE')}
                    id="regenerate_batch_CORE"
                  >Re-generate</Button>
                  <Button
                    color={(!coreBatch || (ViewData['CORE'].isBatchRegistered || ViewData['CORE'].isAnyManualChanges)) ? "white" : "success"}
                    style={{ float: "right", marginRight: '5%' }}
                    disabled={!(coreBatch && !ViewData['CORE'].isBatchRegistered)}
                    onClick={() => this.handleApproveConfirmationDialog('CORE')}
                    id="approve_batch_CORE"
                  >Approve</Button>

                </CardHeader>
                <CardBody>

                  {
                    (coreBatch && coreBatch.error && coreBatch.error.length > 0) ?
                      coreBatch.error.map((errorObject) => {
                        return (<h4 className={classes.batchErrors} style={{ marginBottom: "1%" }} key={errorObject._id}>Error: {errorObject.message}</h4>);
                      })
                      : <h4 style={{ marginBottom: "1%" }}>Errors : No Errors</h4>
                  }

                  {
                    (coreWarnings && coreWarnings.length > 0) ?
                      coreWarnings.map((warningObject) => {
                        return (<h4 className={classes.batchWarnings} style={{ marginBottom: "1%" }} key={warningObject._id}>Error: {warningObject.message}</h4>);
                      })
                      : <h4 style={{ marginBottom: "1%" }}>Warnings : No Warnings</h4>
                  }

                  <div>
                    Number of Direct-Debits-in-Batch :{ViewData['CORE'] ? ViewData['CORE'].numberOfSelectedTransactions : 0}
                  </div>
                  <div>
                    Batch total :{currency(ViewData['CORE'] ? ViewData['CORE'].amountForSelectedTransactions : 0)}
                  </div>
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={styles.tableCell}> </TableCell>
                          <TableCell style={styles.tableCell} scope="row">
                            Customer
                          </TableCell>
                          <TableCell style={styles.tableCell} scope="row">
                            Reference
                          </TableCell>
                          <TableCell style={styles.tableCell} scope="row">
                            Amount
                          </TableCell>
                          <TableCell style={styles.tableCell} scope="row">
                            Mandate
                          </TableCell>
                          <TableCell style={styles.tableCell} scope="row">
                            Description
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coreErrorTransactions}
                        {coreExcludedTransactions}
                        {coreIncludedTransactions}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardBody>
              </Card>
            </LoadingOverlay>
          </CardBody>
        </Card>

        {/* Re-generate confirmation */}
        <Dialog
          open={this.state.openRegenerateConfirmation}
          onClose={() => this.handleRegenerateConfirmationDialog(this.state.selectedMandate)}
          aria-labelledby="alert-dialog-regenerate-batch"
          aria-describedby="confirmation-for-batch-regenerate"
        >
          <DialogTitle id="alert-dialog-title">{"Regenerate the batch?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Do you want to re-generate the batch for mandate type : {this.state.selectedMandate} on {moment(this.state.selectedDate).format('DD-MM-YYYY')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleRegenerateConfirmationDialog(this.state.selectedMandate)} color="primary">
              Disagree
            </Button>
            <Button onClick={() => this.regenerateBatch(this.state.selectedMandate)} color="primary" autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>

        {/*Approve confirmation */}
        <Dialog
          open={this.state.openApproveConfirmation}
          onClose={() => this.handleApproveConfirmationDialog(this.state.selectedMandate)}
          aria-labelledby="alert-dialog-regenerate-batch"
          aria-describedby="confirmation-for-batch-regenerate"
        >
          <DialogTitle id="alert-dialog-title">{"Approve the batch?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Do you want to approve the batch for mandate type : {this.state.selectedMandate} on {moment(this.state.selectedDate).format('DD-MM-YYYY')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleApproveConfirmationDialog(this.state.selectedMandate)} color="primary">
              Disagree
            </Button>
            <Button onClick={() => this.approveBatch(this.state.selectedMandate)} color="primary" autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>

        {/*Transactions updated Error Dialog */}
        <Dialog
          open={this.state.openTransactionsUpdateError}
          onClose={() => this.handleTransactionsUpdatesErrorDialog(this.state.selectedMandate)}
          aria-labelledby="alert-dialog-transactions-updated-error"
          aria-describedby="transactions-updated-error"
        >
          <DialogTitle id="transactions-updated-error">{"Transactions have changed"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="transactions-updated-error-description">
              Batch expired. Please generate a new batch with up-to-date transaction information
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleTransactionsUpdatesErrorDialog(this.state.selectedMandate)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

DirectDebitBatchDetails.propTypes = {
  directdebitbatchsbtob: PropTypes.object,
  directdebitbatchscore: PropTypes.object,
  isLoading: PropTypes.bool,
  getAllDirectDebitBatchDetails: PropTypes.func,
  GetBatchByCreationDate: PropTypes.func,
  getTransactionsForBatchView: PropTypes.func,
  SetDirectDebitBatchLogs: PropTypes.func,
  addItemToCheckList: PropTypes.func,
  createXML: PropTypes.func,
  getLastestBatch: PropTypes.func.isRequired,
  regenerateBatch: PropTypes.func.isRequired,
  approveBatch: PropTypes.func.isRequired,
  registerTransactions: PropTypes.func,
  registerBatch: PropTypes.func,
  getUpdateTransactionsCount: PropTypes.func,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object,
  configurations: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    directdebitbatchsbtob: state.directdebitbatchs.directdebitbatchsbtob,
    directdebitbatchscore: state.directdebitbatchs.directdebitbatchscore,
    isLoading: state.directdebitbatchs.isLoading,
    configurations: state.configurations,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAllDirectDebitBatchDetails: date => {
      dispatch(getAllDirectDebitBatchDetails(date));
    },
    GetBatchByCreationDate: params => (dispatch(GetBatchByCreationDate(params))),
    getTransactionsForBatchView: params => (dispatch(getTransactionsForBatchView(params))),
    approveBatch: params => (dispatch(approveBatch(params))),
    regenerateBatch: params => (dispatch(regenerateBatch(params))),
    SetDirectDebitBatchLogs: value => {
      dispatch(SetDirectDebitBatchLogs(value));
    },
    addItemToCheckList: id => {
      dispatch(SetDirectDebitBatchLogs(id));
    },
    createXML: (unselectedBatchDetailIds, date) => {
      dispatch(createXML(unselectedBatchDetailIds, date));
    },
    getLastestBatch: (params) => (dispatch(getLastestBatch(params))),
    getUpdateTransactionsCount: (params) => (dispatch(getUpdateTransactionsCount(params))),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(DirectDebitBatchDetails));
