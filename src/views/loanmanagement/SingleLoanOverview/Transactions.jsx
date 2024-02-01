import moment from "moment";
import PropTypes from "prop-types";
import Classnames from "classnames";
import { connect } from "react-redux";
import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@material-ui/core";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// import GridItem from "components/loanmanagement/Grid/GridItem";
import Button from "components/loanmanagement/CustomButtons/Button.jsx";
// import GridContainer from "components/loanmanagement/Grid/GridContainer";

import Util from "lib/loanmanagement/utility";
import { DDstatus, DDtype } from "constants/loanmanagement/sme-loan-repayment-direct-debits";

import TransactionsOverview from "./TransactionsOverview";
import { clearDirectDebits, requestDirectDebits } from "store/loanmanagement/actions/SmeLoanTransaction";
import { getLocales } from "store/initiation/actions/Configuration.action";
import { Grid, Skeleton, TableContainer, TextField } from "@mui/material";
import { Autocomplete } from '@material-ui/lab';
import { changeCustomerDetails, clearHeaderDisplaySubData, setHeaderDisplaySubData } from "store/loanmanagement/actions/HeaderNavigation";
import { clearSelectedLoan, getSingleLoanOverviewData, getSmeLoansByQuery, requestSmeLoans, selectLoan } from "store/loanmanagement/actions/SmeLoans";
import { displayNotification } from "store/loanmanagement/actions/Notifier";

import styles from "assets/jss/bridgefundPortal/views/integratedSingleLoanOverviewStyle";
import CustomSearch from "components/crm/CustomInput/CustomSearch";
import { getCustomerListPerPage } from "store/crm/actions/Customer.action";
// import styles_2 from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";
class Transactions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      statusFilter: "all-processed",
      typeFilter: "all",
      openReactivate: false,
      isLoading: false,

      order: "desc",
      orderBy: "plannedDate",

      contractIdValue: this.props.smeLoan && this.props.smeLoan.contractId ? this.props.smeLoan.contractId : '',
      contractIdInputValue: this.props.smeLoan && this.props.smeLoan.contractId ? this.props.smeLoan.contractId : '',
      contractIdList: [],
      customerList: [],
      companyNameValue: '',
      isLoadingLoanData: true,
      currency: 'EUR',
      locale: 'nl-NL'
    };
  }

  componentDidMount() {
    const { lmContractSysId, customerDetails, requestDirectDebits, smeLoan } = this.props;
    const companyNameValue = customerDetails && customerDetails.company ? customerDetails.company : '';

    this.getLocales();

    if (lmContractSysId) {//customer details are already available if contractId is available
      requestDirectDebits(lmContractSysId)
        .then(() => this.setLoading(false))
        .catch((err) => {
          this.setLoading(false);
          console.log('error requestDirectDebits ', err);
        });
      return;
    }
    if (!companyNameValue && !lmContractSysId) {
      this.setAllContractsForDropDownMenu();
      return;
    }
    if (companyNameValue) {
      this.setState({ companyNameValue: companyNameValue });
      if (!lmContractSysId) {
        this.setAllSMEContractsForDropDownMenu(companyNameValue);
      }
    }
    if (!companyNameValue) {
      this.setAllContractsForDropDownMenu();
    }
  }

  getLocales = async () => {
    const { smeLoan } = this.props;

    if (smeLoan.country && smeLoan.currency) {
      this.props.getLocales({countryCode: smeLoan.country, currencyCode: smeLoan.currency})
			.then(res => {
        if (!res || res.length === 0) {
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }

				this.setState({ 
          locale: res[0].locale, 
          currency: smeLoan.currency
        });
			})
			.catch(err => { console.log('getLocales err ', err); });
    }    
  }

  handleRequestSort = (property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  getStatusCount = () => {
    const statusCount = {};

    for (const key of Object.keys(DDstatus)) {
      statusCount[DDstatus[key]] = this.props.transactions.filter(dd => dd.status === DDstatus[key]).length;
    }

    statusCount["all-processed"] = this.props.transactions.filter(dd => moment(dd.plannedDate).isSameOrBefore(moment(this.props.systemDate), 'day') ||
      moment(dd.transactionDate).isSameOrBefore(moment(this.props.systemDate), 'day')).length;
    statusCount["manually-settled"] = this.props.transactions.filter(dd => dd.statusHistory.find(history => history.status === 'manually-settled') !== undefined).length;

    return statusCount;
  };

  getTypesCount = () => {
    const typesCount = {};

    for (const key of Object.keys(DDtype)) {
      typesCount[key] = this.props.transactions.filter(dd => dd.type === DDtype[key]).length;
    }

    typesCount["all"] = this.props.transactions.filter(dd => moment(dd.plannedDate).isSameOrBefore(moment(this.props.systemDate), 'day')).length;

    return typesCount;
  };

  getRowClass = (status, statusHistory) => {
    const { classes } = this.props;
    const rowClass = Classnames({
      [classes["directDebitRow_Green"]]: status === DDstatus.PAID,
      [classes["directDebitRow_Orange"]]: status !== DDstatus.PAID,
      [classes["directDebitRow_Blue"]]: statusHistory
        .find(history => history.status === 'manually-settled') !== undefined
    });
    return rowClass;
  }

  getCellClass = (status) => {
    const { classes } = this.props;
    const cellClass = Classnames({
      [classes.tableCell]: true,
      [classes["whiteFont"]]: status === DDstatus.PAID,
      [classes["blackFont"]]: status !== DDstatus.PAID,
    });
    return cellClass;
  }

  get filteredData() {
    let transactions = this.props.transactions;
    const { statusFilter, typeFilter } = this.state;

    if (statusFilter && statusFilter === "all-processed" && typeFilter === "all") {
      transactions = transactions.filter(dd => moment(dd.transactionDate).isSameOrBefore(moment(this.props.systemDate), 'day') ||
        moment(dd.plannedDate).isSameOrBefore(moment(this.props.systemDate), 'day'));
    }
    else if (statusFilter && statusFilter === "all-processed" && typeFilter !== "all") {
      transactions = transactions.filter(dd => (moment(dd.transactionDate).isSameOrBefore(moment(this.props.systemDate), 'day') ||
        moment(dd.plannedDate).isSameOrBefore(moment(this.props.systemDate), 'day')) && dd.type === typeFilter);
    }

    else if (statusFilter && statusFilter === "manually-settled" && typeFilter === "all") {
      transactions = transactions.filter(dd => dd.statusHistory.find(history => history.status === 'manually-settled') !== undefined);
    }

    else if (statusFilter && statusFilter === "manually-settled" && typeFilter !== "all") {
      transactions = transactions.filter(dd => dd.statusHistory.find(history => history.status === 'manually-settled') !== undefined && dd.type === typeFilter);
    }

    else if (statusFilter && typeFilter === "all") transactions = transactions.filter(dd => dd.status === statusFilter);

    else if (statusFilter && typeFilter !== "all") transactions = transactions.filter(dd => dd.status === statusFilter && dd.type === typeFilter);

    else if (statusFilter === "" && typeFilter !== "all") transactions = transactions.filter(dd => dd.type === typeFilter);

    else if (statusFilter === "" && typeFilter === "all") transactions = this.props.transactions;

    return transactions;
  }

  isEnableReactivateTransactions = () => {
    return this.props.transactions
      .filter(t =>
        t.termNumber < 99000 &&
        (t.status === DDstatus.FREQUENTLY_REJECTED || t.status === DDstatus.FREQUENTLY_FAILED))
      .length > 0 ? true : false;
  }

  setDDsForSelectedContractId = (contractId) => {
    const { companyNameValue } = this.state;
    this.setLoading(true);
    this.props.requestDirectDebits(contractId)
      .then((res) => {

        this.setLoading(false);
        this.props.selectLoan({ contractId });
        if (companyNameValue) {
          this.props.setHeaderDisplaySubData(` - ${companyNameValue} - ${contractId}`);
        }

        if (!companyNameValue) {
          this.getCustomerdetailsByContractId(contractId);
        }
      })
      .catch((err) => {
        this.setLoading(false);
        console.log('error requestDirectDebits ', err);
      });
  }

  getCustomerdetailsByContractId = (contractId) => {
    this.setLoading(true);
    this.props.getLoanDetails(contractId)
      .then(res => {
        this.setLoading(false);
        this.setState({
          companyNameValue: res.sme.company,
        }, () => this.setAllSMEContractsForDropDownMenu(res.sme.company));
        this.props.setHeaderDisplaySubData(` - ${res.sme.company} - ${contractId}`);
      })
      .catch((err) => {
        this.setLoading(false);
        console.log('error getCustomerdetailsByContractId ', err);
      });
  }

  setAllSMEContractsForDropDownMenu = (companyNameValue) => {
    const { customerDetails } = this.props;
    //need to set contract data if customer got only one contract
    const customerId = customerDetails.accountNo;

    this.props.setHeaderDisplaySubData(` - ${companyNameValue}`);

    this.props.requestSmeLoans(customerId)
      .then(res => {
        if (res.length === 1) {
          const singleContractId = res[0].contractId;// the only one contract current customer got
          this.props.displayNotification('Customer has only one contract', 'success');
          this.setState({
            contractIdList: res.map(loan => loan.contractId),
            contractIdValue: singleContractId,
            contractIdInputValue: singleContractId,
          }, () => this.setDDsForSelectedContractId(singleContractId));
        }
        else {
          this.setState({
            contractIdList: res.map(loan => loan.contractId),
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

  setLoading = (status) => {
    this.setState({ isLoadingLoanData: status });
  }

  get handleGetCustomerListPerPage() {
    return getCustomerListPerPage(1, 1, {legalName: this.state.companyNameValue});
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
          this.props.setHeaderDisplaySubData(` - ${customer.legalName}`);
          this.props.changeCustomerDetails(customersList[0]);
          this.clearContract();
        }
      });
  }

  clearContract = () => {

    const { companyNameValue } = this.state;

    this.setState({
      contractIdValue: '',
      contractIdInputValue: '',
    }, () => this.setAllSMEContractsForDropDownMenu(companyNameValue));

    this.props.clearDirectDebits();
    this.props.clearSelectedLoan();

    this.props.setHeaderDisplaySubData(` - ${companyNameValue}`);


  }

  clearCustomer = () => {
    this.setLoading(true);
    //set all customers and set all loans
    this.setAllContractsForDropDownMenu();
    //header data clearing
    this.props.clearHeaderDisplaySubData();
    this.props.clearDirectDebits();
    this.props.clearSelectedLoan();
  }

  setAllContractsForDropDownMenu = () => {
    this.setLoading(true);
    this.props.getSmeLoansByQuery({}, ['contractId'])
      .then(res => {
        this.setState({
          contractIdList: res.map(contract => contract.contractId),
          companyNameValue: '',
          contractIdValue: '',
          contractIdInputValue: '',
        }, () => {
          // this.props.clearSelectedLoan();
          this.setLoading(false);
        });
      })
      .catch(e => {
        console.log('error in getSmeLoansByQuery ', e);
        this.setLoading(false);
      });
  }

  render() {
    const { classes } = this.props;
    const { contractIdValue, contractIdInputValue, companyNameValue, contractIdList, isLoadingLoanData, currency, locale } = this.state;
    const statusCounts = this.getStatusCount();

    return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.topPaper} variant="outlined">
              <Grid container spacing={3} className={classes.boxMargin} >
                <Grid item xs={3}>
                  <CustomSearch
                    id='company-name-search'
                    label='Company Name *'
                    placeholder='Dream Beers B.V.'
                    changeToFormatType='FirstCap'
                    name='legalName'
                    asyncSearchType='customer'
                    value={companyNameValue}
                    onChange={(event, newInputValue) => {                 
                      if(!newInputValue || newInputValue ===''){
                       this.setState({companyNameValue: '' });
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
                <Grid item xs={2}>
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
                          () => this.setDDsForSelectedContractId(newValue));
                      }
                      else {
                        this.clearContract();
                      }
                    }}
                    inputValue={contractIdInputValue}
                    onInputChange={(event, newInputValue) => {
                      this.setState({ contractIdInputValue: newInputValue });
                    }}
                    id="contract-id"
                    options={contractIdList}
                    disabled={companyNameValue && contractIdList && contractIdList.length === 1 ? true : false}
                    renderInput={(params) => (
                      <TextField {...params} label="Contract-Id" variant="outlined"
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
                <Grid item xs={2}>
                  <FormControl size='small' fullWidth variant="outlined">
                    <InputLabel className={classes.inputLabelStyle} id="status-filter-label">Status</InputLabel>
                    <Select
                      id="status-filter"
                      labelId="status-filter-label"
                      value={this.state.statusFilter}
                      onChange={this.handleChange}
                      name="statusFilter"
                      label="Status"
                      className={classes.inputProp}
                    >
                      <MenuItem id="all-statuses" value="" className={classes.menuItem}>
                        <em>All ({this.props.transactions.length})</em>
                      </MenuItem>
                      <MenuItem id="all-proessed-status" value="all-processed" className={classes.menuItem}>
                        <em>all-processed ({statusCounts["all-processed"]})</em>
                      </MenuItem>
                      <MenuItem id="manually-settled-status" value="manually-settled" className={classes.menuItem}>
                        <em>manually-settled ({statusCounts["manually-settled"]})</em>
                      </MenuItem>
                      {
                        Object.keys(DDstatus).map((key, index) => (
                          <MenuItem className={classes.menuItem} id={DDstatus[key] + '-status'} key={index} value={DDstatus[key]}>{DDstatus[key]} ({statusCounts[DDstatus[key]]})</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={2}>
                  <FormControl size='small' fullWidth variant="outlined">
                    <InputLabel className={classes.inputLabelStyle} id="types-filter-label">Type</InputLabel>
                    <Select
                      labelId="types-filter-label"
                      id='types-filter'
                      value={this.state.typeFilter}
                      onChange={this.handleChange}
                      label="Type"
                      name="typeFilter"
                      className={classes.inputProp}
                    >
                      <MenuItem id="all-types" value="all" className={classes.menuItem}>
                        <em>All({this.getTypesCount()["all"]})</em>
                      </MenuItem>
                      {
                        Object.keys(DDtype).map((key, index) => (

                          <MenuItem className={classes.menuItem} id={DDtype[key] + '-type'} key={index} value={DDtype[key]}>{DDtype[key]} ({this.getTypesCount()[key]})</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>

                {this.isEnableReactivateTransactions() &&
                  <Grid item >
                    <Button id="reactivate-transactions-button" color="success" className={classes.button} onClick={() => this.setState({ openReactivate: true })}>Reactivate Transactions</Button>
                  </Grid>}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TableContainer component={Paper} className={classes.transactionContainerTableStyle}>
              <Table className={classes.table} stickyHeader id="transactions-table">
                <TableHead className={classes.tableHeadColor} id="transactions-table-head">
                  <TableRow id="transactions-table-header-row" >
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'termNumber'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'termNumber')}>
                        Our Reference
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'plannedDate'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'plannedDate')}>
                        Planned Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'transactionDate'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'transactionDate')}>
                        Transaction Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel>
                        Description
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'type'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'type')}>
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'amount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'amount')}>
                        Amount
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'newBalanceAmount'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'newBalanceAmount')}>
                        New Balance
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'status'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'status')}>
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'id'}
                        // @ts-ignore
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'id')}>
                        ID
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                {!isLoadingLoanData ?
                  <TableBody id="trasactionsTable_body">
                    {getSortedList(this.filteredData, this.state.order, this.state.orderBy)
                      .map(transaction => (

                        <TableRow id={transaction._id} key={transaction._id} className={this.getRowClass(transaction.status, transaction.statusHistory)}>
                          <TableCell id={transaction.id + "-ourReference"} className={this.getCellClass(transaction.status)}>{transaction.ourReference}</TableCell>
                          <TableCell id={transaction.id + "-plannedDate"} className={this.getCellClass(transaction.status)}>{moment(transaction.plannedDate).format("DD-MM-YYYY")}</TableCell>
                          <TableCell id={transaction.id + "-trasactionDate"} className={this.getCellClass(transaction.status)}>{(transaction.transactionDate) ? moment(transaction.transactionDate).format("DD-MM-YYYY") : ''}</TableCell>
                          <TableCell id={transaction.id + "-description"} className={this.getCellClass(transaction.status)}>{transaction.description}</TableCell>
                          <TableCell id={transaction.id + "-type"} className={this.getCellClass(transaction.status)}>{transaction.type}</TableCell>
                          <Tooltip id={transaction._id + '-amount-tooltip'} title={<React.Fragment>
                            <table id={transaction._id + '-amount-tooltip-table'} className={classes.tooltipTable}>
                              <tbody id={transaction._id + '-amount-tooltip-table-body'}>
                                <tr>
                                  <th className={classes.tooltipTableBodyCell} align="left">Principle Amount Part</th>
                                  <th id={transaction._id + '-' + transaction.principleAmountPart} className={classes.tooltipTableBodyCell} align="right">{transaction.principleAmountPart ? Util.multiCurrencyConverter()(transaction.principleAmountPart, locale, currency) : 'N/A'}</th>
                                </tr>
                                <tr>
                                  <th className={classes.tooltipTableBodyCell} align="left">Initial Cost Amount Part</th>
                                  <th id={transaction._id + '-' + transaction.initialCostAmountPart} className={classes.tooltipTableBodyCell} align="right">{transaction.initialCostAmountPart ? Util.multiCurrencyConverter()(transaction.initialCostAmountPart, locale, currency) : 'N/A'}</th>
                                </tr>
                                <tr>
                                  <th className={classes.tooltipTableBodyCell} align="left">Interest Amount Part</th>
                                  <th id={transaction._id + '-' + transaction.interestAmountPart} className={classes.tooltipTableBodyCell} align="right">{transaction.interestAmountPart ? Util.multiCurrencyConverter()(transaction.interestAmountPart, locale, currency) : 'N/A'}</th>
                                </tr>
                                <tr>
                                  <th className={classes.tooltipTableBodyCell} align="left">Recurring Cost Amount Part</th>
                                  <th id={transaction._id + '-' + transaction.recurringCostAmountPart} className={classes.tooltipTableBodyCell} align="right">{transaction.recurringCostAmountPart ? Util.multiCurrencyConverter()(transaction.recurringCostAmountPart, locale, currency) : 'N/A'}</th>
                                </tr>
                              </tbody>
                            </table>
                          </React.Fragment>} >
                            <TableCell id={transaction.id + "-amount"} className={this.getCellClass(transaction.status)}>{Util.multiCurrencyConverter()(transaction.amount, locale, currency)}</TableCell>
                          </Tooltip>
                          <TableCell id={transaction.id + "-newBalance"} className={this.getCellClass(transaction.status)}>{transaction.newBalanceAmount ? Util.multiCurrencyConverter()(transaction.newBalanceAmount, locale, currency) : '-'}</TableCell>
                          <Tooltip id={transaction._id + '-status-tooltip'}
                            title={
                              <React.Fragment>
                                <table id={transaction._id + '-status-tooltip-table'} className={classes.tooltipTable}>
                                  <thead id={transaction._id + '-status-tooltip-table'}>
                                    <tr>
                                      <th className={classes.tooltipTableHeadCell}>date</th>
                                      <th className={classes.tooltipTableHeadCell}>status</th>
                                      <th className={classes.tooltipTableHeadCell}>reason</th>
                                      <th className={classes.tooltipTableHeadCell}>statement</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {
                                      transaction.statusHistory.map(history => (
                                        <tr key={history._id}>
                                          <td id={history._id + '-' + history.createdAt} className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                          <td id={history._id + '-' + history.status} className={classes.tooltipTableBodyCell}>{history.status}</td>
                                          <td id={history._id + '-' + history.reason} className={classes.tooltipTableBodyCell}>{history.reason}</td>
                                          <td id={history._id + '-' + history.statement} className={classes.tooltipTableBodyCell}>{history.statement}</td>
                                        </tr>
                                      ))
                                    }
                                  </tbody>
                                </table>
                              </React.Fragment>
                            }
                          >
                            <TableCell id={transaction.id + "-status"} className={this.getCellClass(transaction.status)}>{transaction.status}</TableCell>
                          </Tooltip>
                          <TableCell id={transaction.id + "-trasactionId"} className={this.getCellClass(transaction.status)}>{transaction.id}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                  :
                  false}
              </Table>
              {isLoadingLoanData ?
                <>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </>
                :
                false}
            </TableContainer>
          </Grid>
        </Grid>

        <Dialog
          id="reactivate-transaction-drawer"
          open={this.state.openReactivate}
          onClose={() => this.setState({ openReactivate: false })}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
          maxWidth={'lg'}
        >
          <DialogTitle id="form-dialog-title">Frequently Rejected/Failed Transactions</DialogTitle>
          <DialogContent>
            <TransactionsOverview
              key="reactivate-transaction-drawer-content"
              loanId={this.props.smeLoan && this.props.smeLoan._id ? this.props.smeLoan._id : ''}
              transactions={this.props.transactions}
              onClose={() => this.setState({ openReactivate: false })}
              transactionsFrequency={this.props.smeLoan && this.props.smeLoan.directDebitFrequency ? this.props.smeLoan.directDebitFrequency : ''} 
              country={this.props.smeLoan && this.props.smeLoan.country ? this.props.smeLoan.country : 'NL'}
              locale={locale}
              currency={currency}/>
          </DialogContent>
        </Dialog>

      </>
    );
  }
}

Transactions.propTypes = {
  classes: PropTypes.object.isRequired,
  smeLoan: PropTypes.object.isRequired,
  transactions: PropTypes.array,
  systemDate: PropTypes.string,
  lmContractSysId: PropTypes.string,
  isDashboardContent: PropTypes.bool,
  getLocales: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    customerDetails: state.lmglobal.customerDetails,
    smeLoan: state.lmglobal.selectedLoan,
    transactions: state.smeLoanTransaction.directdebits,
    systemDate: state.configurations.simulations.systemDate,
    lmContractSysId: state.lmglobal.selectedLoan.contractId,
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    requestDirectDebits: (contractId) => dispatch(requestDirectDebits(contractId)),
    clearDirectDebits: () => dispatch(clearDirectDebits()),
    setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
    requestSmeLoans: (contractId) => dispatch(requestSmeLoans(contractId)),
    changeCustomerDetails: (data) => dispatch(changeCustomerDetails(data)),
    getSmeLoansByQuery: (condition, fields) => dispatch(getSmeLoansByQuery(condition, fields)),
    getLoanDetails: (contractId) => dispatch(getSingleLoanOverviewData(contractId)),
    clearSelectedLoan: () => dispatch(clearSelectedLoan()),
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    selectLoan: (loan) => dispatch(selectLoan(loan)),
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Transactions));


const getSortedList = (list, order, orderBy) => {

  const sortedList = list;

  if ((orderBy === 'plannedDate' || orderBy === 'transactionDate') && order === 'asc') {
    sortedList.sort(function (a, b) {
      let diff = new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime();
      if (diff === 0) {
        diff = Number(a.id.split('TR')[1]) - Number(b.id.split('TR')[1]);
      }
      return diff;
    });
  }

  if ((orderBy === 'plannedDate' || orderBy === 'transactionDate') && order === 'desc') {
    sortedList.sort(function (a, b) {
      let diff = new Date(b[orderBy]).getTime() - new Date(a[orderBy]).getTime();
      if (diff === 0) {
        diff = Number(b.id.split('TR')[1]) - Number(a.id.split('TR')[1]);
      }
      return diff;
    });
  }

  if ((orderBy !== 'plannedDate' || orderBy !== 'transactionDate') && order === 'asc') {
    sortedList.sort(function (a, b) {
      return -desc(a, b, orderBy);
    });
  }

  if ((orderBy !== 'plannedDate' || orderBy !== 'transactionDate') && order === 'desc') {
    sortedList.sort(function (a, b) {
      return desc(a, b, orderBy);
    });
  }

  return sortedList;
};

const desc = (a, b, orderBy) => {
  const aValue = a[orderBy] === null ? '' : a[orderBy];
  const bValue = b[orderBy] === null ? '' : b[orderBy];
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
};
