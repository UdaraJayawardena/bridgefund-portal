// import React from 'react';
// import moment from 'moment';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import withStyles from "@material-ui/core/styles/withStyles";
// import Button from '@material-ui/core/Button';
// import Dialog from '@material-ui/core/Dialog';

// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import Typography from '@material-ui/core/Typography';
// import CloseIcon from '@material-ui/icons/Close';
// import Slide from '@material-ui/core/Slide';

// import Card from "components/Card/Card.jsx";
// import CardBody from "components/Card/CardBody.jsx";
// import CardHeader from "components/Card/CardHeader.jsx";
// import GridItem from 'components/Grid/GridItem.jsx';
// import GridContainer from 'components/Grid/GridContainer.jsx';
// import Notifier from "components/Notification/Notifier.jsx";
// import {
//   Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, InputLabel, FormControl,
//   TableSortLabel, Checkbox, FormLabel, Tooltip, createStyles
// } from "@material-ui/core";
// import {
//   requestDirectDebitsByContract, clearDirectDebits, processConnectToDirectDebit, processConnectAmount,
//   saveConnectDirectDebits, requestDirectDebitsByIban,
//   createSmeLoanTransaction, requestOverviewData
// } from "store/actions/SmeLoanTransaction.js";
// import AutoSuggest from "components/CustomAutoSuggest/CustomAutoSuggest.jsx";
// import { clearSelectedCustomer } from "store/actions/HeaderNavigation";
// import { saveBankTransactionStatus } from "store/actions/BankTransactions.js";
// import { clearSmeMandatesByCustomer } from "store/actions/SmeMandates.js";
// import { requestSmeLoan, requestSmeLoans, clearLoans } from '../../store/actions/SmeLoans'
// import { requestSmeByIban, requestSmeById, clearSelectedSme } from "../../store/actions/Smes";

// import DirectDebitStatusHover from './DirectDebitStatusHover'

// import Util from 'lib/utility';

// const currency = Util.currencyConverter();

// const useStyles = createStyles({
//   appBar: {
//     position: 'relative',
//   },
//   title: {
//     flex: 1,
//   },
//   formControl: {
//     minWidth: 150,
//   },
//   toolTipHead: {
//     border: '1px solid white',
//     fontSize: '12pt',
//     fontWeight: 'bold',
//     padding: 3,
//     textAlign: 'center'

//   },
//   toolTipCell: {
//     border: '1px solid white',
//     fontSize: '10pt',
//     padding: 3,
//   },
//   headerMargin: {
//     margin: '5px 0'
//   },
//   marginBottom_10: {
//     marginBottom: '10px'
//   },
//   textDeco_underLine: {
//     textDecoration: 'underline'
//   },
//   transactionDetailsTable: {
//     marginTop: '10px'
//   },
//   transactionDetailsCell: {
//     borderBottom: '0px',
//     padding: '5px'
//   }
// });

// const Transition = React.forwardRef(function transition(props, ref) {
//   // @ts-ignore
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// class ConnectDirectDebitOVerview extends React.Component {
//   constructor(props) {
//     super(props);

//     this.handleClose = this.handleClose.bind(this)
//     this.handleSaveConnectDirectDebits = this.handleSaveConnectDirectDebits.bind(this)

//     this.handlePopoverOpen = this.handlePopoverOpen.bind(this)
//     this.handlePopoverClose = this.handlePopoverClose.bind(this)

//     this.state = {
//       open: false,
//       setOpen: false,

//       order: 'asc',
//       orderBy: 'planned',

//       connectDDs: [],
//       ddHover: false,
//     }
//   }

//   componentDidMount() {
//     if (this.props.counterPartyIban !== null) {
//       this.setState({
//         previousDirectDebits: []
//       }, () => {
//         this.props.requestSmeByCounterpartyIban(this.props.counterPartyIban);
//       })
//     }

//     this.props.getOverviewData(this.props.contractId);

//   }

//   getLatestContract() {
//     const { contracts } = this.props;

//     return contracts ?
//       contracts.sort((c1, c2) => {
//         return new Date(c1.startDate).getTime() > new Date(c2.startDate).getTime() ? -1 : 1;
//       })[0]
//       :
//       null;
//   }

//   getTotalAmountToBeConnected(bankTransactionAmount, smeLoanPartialPaymentAmount) {

//     return this.roundToTwo((bankTransactionAmount < 0 ? bankTransactionAmount * -1 : bankTransactionAmount) +
//       (smeLoanPartialPaymentAmount ? smeLoanPartialPaymentAmount : 0) ? (bankTransactionAmount < 0 ?
//         bankTransactionAmount * -1 : bankTransactionAmount) +
//       (smeLoanPartialPaymentAmount ? smeLoanPartialPaymentAmount : 0) : 0)
//   }

//   componentDidUpdate(prevProps) {

//     const {
//       requestLoansForSme,
//       selectedSme,
//       contracts,
//       directDebits,
//     } = this.props;

//     // When the selected SME changes, the loans for the newly selected SME should be loaded

//     if (selectedSme && prevProps.selectedSme !== selectedSme) {
//       requestLoansForSme(selectedSme.id);
//     }

//     // When the list of contracts changes, the loan history and direct-debits date for the latest contract
//     // should be loaded

//     if (contracts.length > 0 &&
//       (!prevProps.contracts[0] || prevProps.contracts[0].smeId !== contracts[0].smeId)) {

//       this.props.getAllDirectDebits(contracts[0].contractId)
//       this.props.getOverviewData(contracts[0].contractId)
//     }

//     // When the list of direct-debits changes, the correct direct-debits should be preselected

//     if (directDebits && directDebits[0] && (
//       !prevProps.directDebits ||
//       directDebits.length > prevProps.directDebits.length ||
//       directDebits[0].contractId !== prevProps.directDebits[0].contractId
//     )) {

//       this.preselectDirectDebits();
//     }
//   }

//   preselectDirectDebits() {

//     const { amount } = this.props.transactionData;
//     const { partialPaymentAmount } = this.getLatestContract();
//     const directDebits = this.sortDirectDebits(this.props.directDebits);
//     let totalMatched = 0;
//     let index = 0;

//     while (directDebits[index] && totalMatched + directDebits[index].amount <= amount + partialPaymentAmount) {

//       this.props.processConnectToDirectDebit(directDebits, directDebits[index]._id, true);

//       totalMatched += directDebits[index].amount;
//       index++;
//     }
//   }

//   componentWillUnmount() {
//     this.props.clearSelectedCustomer(); // clear selected customer
//     this.props.clearDirectDebits();
//     this.props.clearSmeMandatesByCustomer();
//     this.props.clearSelectedSme();
//     this.props.clearSmeLoans();
//   }

//   handleClose() {
//     this.props.onClose(false)
//   }

//   handleChangeMandateNumber(e) {
//     this.setState({
//       [e.target.name]: e.target.value,
//     });
//   }

//   handleCheckbox = id => event => {
//     this.props.processConnectToDirectDebit(this.props.directDebits, id, event.target.checked)
//   };

//   handleSaveConnectDirectDebits = (directdebits, drawyerCloseCallback) => {
//     let data = directdebits.filter(dd => dd.checked === true)
//     let bankTransactionID = this.props.transactionData._id;
//     // create patial payment to update
//     let initialPartialPayment = 0;
//     let newPartialPayment = 0;

//     const selectedContract = this.getLatestContract();

//     if (selectedContract) {
//       initialPartialPayment = (selectedContract.partialPaymentAmount !== null) ?
//         selectedContract.partialPaymentAmount : 0;
//     }

//     let contractAmount = (this.props.transactionData.amount < 0) ? (
//       this.props.transactionData.amount * -1) : this.props.transactionData.amount;

//     let totalContractAmount = contractAmount + initialPartialPayment;

//     let connectAmount = (this.props.connectAmount < 0) ?
//       (this.props.connectAmount * -1) : this.props.connectAmount

//     newPartialPayment = Math.abs(totalContractAmount - connectAmount);

//     const sumOfSelectedSmeLoanTransactions = (data) => data
//       .reduce((amount, p) => amount + (p.amount < 0 ? -1 * p.amount : p.amount), 0);

//     //calculate amount to be connected

//     const totalAmountToBeConnected = this.getTotalAmountToBeConnected(this.props.transactionData.amount, this.props.overviewData.partialPaymentAmount);

//     if (totalAmountToBeConnected >= sumOfSelectedSmeLoanTransactions(data)) {

//       let body = {
//         status: 'paid',
//         ids: [],
//         updatedPartialPayment: newPartialPayment,
//         contractId: this.props.contractId,
//         statement: this.props.transactionData.statementNumber,
//         isPatialPaymentAddManually: false,
//         btID: bankTransactionID,
//         bankTransaction: this.props.transactionData
//       };

//       const smeLoanTransactionIds = [];

//       if (data.length > 0) {

//         data.forEach(dd => {

//           body.ids.push(dd._id);

//           smeLoanTransactionIds.push(dd.id);

//         });
//       }

//       this.props.saveConnectDirectDebits(body, bankTransactionID, smeLoanTransactionIds);
//     }

//     this.handleChangePartialPaymentTransactions(totalAmountToBeConnected, sumOfSelectedSmeLoanTransactions(data));

//     drawyerCloseCallback();

//   }

//   handleChangePartialPaymentTransactions = (totalAmountToBeConnected, selectedDDSum) => {

//     const oldPartialPaymentAmount =  this.props.overviewData.partialPaymentAmount;

//     const newPartialPaymentAmount = totalAmountToBeConnected - selectedDDSum;

//     if (oldPartialPaymentAmount !== newPartialPaymentAmount) {

//       const selectedContract = this.getLatestContract();

//       let body = {
//         loanId: selectedContract._id,
//         contractId: selectedContract.contractId,
//         smeLoanType: 'fixed-loan',
//         plannedDate: moment().format('DD-MM-YYYY'),
//         transactionDate: moment().format('DD-MM-YYYY'),
//         amount: newPartialPaymentAmount - oldPartialPaymentAmount,
//         status: 'paid',
//         statusHistory: [{ status: 'paid', plannedDate: moment().format('DD-MM-YYYY') }],
//         glIndicator: 'N'
//       }

//       if (oldPartialPaymentAmount < newPartialPaymentAmount) {

//         body.type = 'partial-payment';
//         body.description = 'growth in partial-payment-amount that could not be matched to direct-debits';

//       }

//       if (oldPartialPaymentAmount > newPartialPaymentAmount) {

//         body.type = 'partial-payment-refund';
//         body.description = 'reduction in partial-payment-amount because of match with direct-debits';
//       }

//       this.props.createSmeLoanTransaction(body);
//     }
//   };

//   handleRequestSort = (property) => {
//     const orderBy = property;
//     let order = 'desc';

//     if (this.state.orderBy === property && this.state.order === 'desc') {
//       order = 'asc';
//     }

//     this.setState({ order, orderBy });
//   };

//   getfilteredData() {
//     let directDebits
//     if (this.props.counterpartydirectdebits !== null) {
//       if (this.props.counterPartyIban !== null && this.props.counterpartydirectdebits.ddList) {
//         directDebits = this.props.counterpartydirectdebits.ddList;
//       }
//       else {
//         directDebits = this.props.directDebits;
//       }
//     }

//     return directDebits;
//   }

//   handlePopoverOpen() {
//     this.setState({ ddHover: true })
//   }

//   handlePopoverClose() {
//     this.setState({ ddHover: false })
//   }

//   onSearchResult = value => {
//     this.props.requestSmeBySmeid(value.id);
//   };

//   roundToTwo(num) {
//     // @ts-ignore
//     return +(Math.round(num + "e+2") + "e-2");
//   }

//   // Sort the list of direct-debits. First all failed/rejected sorted by ascending date. Then
//   // all open sorted by descending date

//   sortDirectDebits(directDebits) {

//     const failedDDs = directDebits.filter(
//       directDebit => directDebit.status === 'frequently-failed'
//         || directDebit.status === 'frequently-rejected').sort((dd1, dd2) => {

//           return moment(dd1.plannedDate).isAfter(dd2.plannedDate) ? 1 : -1
//         })

//     const openDDs = directDebits.filter(
//       directDebit => directDebit.status === 'open').sort((dd1, dd2) => {

//         return moment(dd1.plannedDate).isAfter(dd2.plannedDate) ? 1 : -1
//       })

//     return failedDDs.concat(openDDs);
//   }

//   render() {
//     const {
//       classes,
//       open,
//       selectedSme,
//       contracts,
//       overviewData,
//       transactionData,
//       directDebits,
//       connectAmount,
//       contractId,
//       statusSaveDDConnect
//     } = this.props;

//     const { ddHover } = this.state;
//     const selectedContract = (contracts && contracts.length > 0) ? this.getLatestContract() : {};

//     return (
//       <div>
//         <Notifier />
//         <Dialog
//           fullScreen open={open}
//           onClose={this.handleClose}
//           // @ts-ignore
//           TransitionComponent={Transition}>
//           <AppBar className={classes.appBar}>
//             <Toolbar>
//               <IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="close">
//                 <CloseIcon />
//               </IconButton>
//               <Typography variant="h6" className={classes.title}>
//                 Connect To SME Loan Transaction Overview
//                 </Typography>
//             </Toolbar>
//           </AppBar>
//           <Card>
//             <CardHeader>
//               <GridContainer className={classes.marginBottom_10}>
//                 <GridItem xs={12} sm={6} md={3} className={classes.marginBottom_10}>

//                   <FormControl className={classes.formControl}>
//                     <InputLabel shrink htmlFor="customer">
//                       Customer
//                       </InputLabel><br />
//                     <AutoSuggest
//                       name="customer"
//                       id="customer"
//                       inputProps={{
//                         placeholder: selectedSme ? selectedSme.company : 'Customer',
//                         inputProps: {
//                           "aria-label": "Customer"
//                         }
//                       }}
//                       entity="customers"
//                       sugg_field="company"
//                       label={selectedSme ? selectedSme.company : 'Customer'}
//                       onResult={this.onSearchResult.bind(this)}
//                     />
//                   </FormControl>

//                   <Table className={classes.transactionDetailsTable}>
//                     <TableRow>
//                       <TableCell className={classes.transactionDetailsCell}>
//                         Transaction:
//                         </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell className={classes.transactionDetailsCell}>
//                         Amount
//                         </TableCell>
//                       <TableCell className={classes.transactionDetailsCell}>
//                         {transactionData.amount ? currency(transactionData.amount < 0 ? (transactionData.amount * -1) : transactionData.amount) : currency(0)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell className={classes.transactionDetailsCell}>
//                         Counterparty
//                         </TableCell>
//                       <TableCell style={{ borderBottom: '0px', padding: '5px' }}>
//                         {transactionData.counterparty}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell style={{ borderBottom: '0px', padding: '5px' }}>
//                         Iban
//                         </TableCell>
//                       <TableCell style={{ borderBottom: '0px', padding: '5px' }}>
//                         {transactionData.counterpartyIbanNumber}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell style={{ borderBottom: '0px', verticalAlign: 'top', padding: '5px' }}>
//                         Description
//                         </TableCell>
//                       <TableCell style={{ borderBottom: '0px', padding: '5px' }}>
//                         {transactionData.description}
//                       </TableCell>
//                     </TableRow>
//                   </Table>


//                   {/*<br/>*/}
//                   {/*<b>Transaction: </b><br/>*/}
//                   {/*Counterparty: { transactionData.counterParty }<br/>*/}
//                   {/*Iban: { transactionData.counterPartyIban }<br/>*/}
//                   {/*Description: { transactionData.description }*/}
//                 </GridItem>
//                 {/* <GridItem xs={12} sm={12} md={1}></GridItem> */}
//                 <GridItem xs={12} sm={12} md={2}>
//                   <InputLabel>
//                     #
//                     </InputLabel>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>Principle </FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>Interest </FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>Initial Fee </FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>Recurring Fee </FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>Other Cost </FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel> * </FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                 </GridItem>
//                 <GridItem xs={12} sm={12} md={2}>
//                   <InputLabel>
//                     Original
//                     </InputLabel>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{selectedContract.principleAmount ? currency(selectedContract.principleAmount) : currency(0)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{selectedContract.interestAmount ? currency(selectedContract.interestAmount) : currency(0)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{selectedContract.initialCostAmount ? currency(selectedContract.initialCostAmount) : currency(0)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{selectedContract.recurringCostAmount ? currency(selectedContract.recurringCostAmount) : currency(0)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.otherCostsAmount < 0 ? overviewData.otherCostsAmount * -1 : overviewData.otherCostsAmount)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{selectedContract.totalLoanAmount ? currency(selectedContract.totalLoanAmount) : currency(0)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                 </GridItem>
//                 <GridItem xs={12} sm={12} md={2}>
//                   <InputLabel>
//                     Outstanding
//                     </InputLabel>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.outstandingPrincipleAmount)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.outstandingInterestAmount)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.outstandingInitialFee)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.outstandingRecurringFee)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.outstandingOtherCostAmount)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.overallOutstandingTotalAmount)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                 </GridItem>
//                 <GridItem xs={12} sm={12} md={2}>
//                   <InputLabel>
//                     Overdue
//                     </InputLabel>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>-</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>-</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>-</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>-</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>-</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{currency(overviewData.overallTotalOverdueAmount)}</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                 </GridItem>
//                 <GridItem xs={12} sm={12} md={1}>
//                   <InputLabel>
//                     &nbsp;
//                     </InputLabel>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>&nbsp;</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>&nbsp;</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>&nbsp;</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>&nbsp;</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>&nbsp;</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                   <GridContainer>
//                     <GridItem>
//                       <FormLabel>{overviewData.overallTotalOverduePercentage}%</FormLabel>
//                     </GridItem>
//                   </GridContainer>
//                 </GridItem>
//               </GridContainer>
//               <GridContainer>
//                 <GridItem>
//                   Status : {selectedContract.status}
//                 </GridItem>
//                 <GridItem>
//                   Type : {selectedContract.type}
//                 </GridItem>
//               </GridContainer>
//               <GridContainer>
//                 <GridItem>
//                   Rest Partial Payment: {currency(overviewData.partialPaymentAmount)}
//                 </GridItem>
//                 <GridItem>
//                   Amount : {currency(transactionData.amount)}

//                 </GridItem>
//                 <GridItem>
//                   {/* Total Amount : {connectAmount ? currency(connectAmount) : currency(0)} */}
//                     Total Amount : {currency(this.getTotalAmountToBeConnected(transactionData.amount, overviewData.partialPaymentAmount))}
//                 </GridItem>
//                 <GridItem>
//                   {
//                     (this.roundToTwo(connectAmount) > this.roundToTwo((transactionData.amount < 0 ? (transactionData.amount * -1) : transactionData.amount) + (overviewData.partialPaymentAmount))) ? "Amounts doesn't match!" : ((statusSaveDDConnect === false || statusSaveDDConnect === 'error') && contractId === null) ?
//                       <span style={{ color: "red", fontWeight: 700 }}>Please select contract for connect</span> : ""
//                   }
//                 </GridItem>
//                 <GridItem>
//                   <Button variant="contained" color="primary" className={classes.button}
//                     disabled={(connectAmount === 0 || contractId === null) ? true :
//                       (this.roundToTwo(connectAmount) > this.roundToTwo((transactionData.amount < 0 ? transactionData.amount * -1 : transactionData.amount) + (overviewData.partialPaymentAmount)))
//                         ? true : false}
//                     onClick={this.handleSaveConnectDirectDebits.bind(this, directDebits, this.handleClose)}
//                   >
//                     Connect
//                   </Button>
//                 </GridItem>
//               </GridContainer>
//             </CardHeader>
//             <CardBody>

//               <Paper className={classes.tableContainer}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell className={classes.tableHeaderCell} title='Connect'>
//                         Connect
//                         </TableCell>
//                       <TableCell className={classes.tableHeaderCell} title='Planned'>
//                         <TableSortLabel
//                           active={this.state.orderBy === 'planned'}
//                           // @ts-ignore
//                           direction={this.state.order}
//                           onClick={this.handleRequestSort.bind(this, 'planned')}>
//                           Planned
//                           </TableSortLabel>
//                       </TableCell>
//                       <TableCell className={classes.tableHeaderCell} title='Description'>
//                         <TableSortLabel
//                           active={this.state.orderBy === 'description'}
//                           // @ts-ignore
//                           direction={this.state.order}
//                           onClick={this.handleRequestSort.bind(this, 'description')}>
//                           Description
//                           </TableSortLabel>
//                       </TableCell>
//                       <TableCell className={classes.tableHeaderCell} title='Amount'>
//                         <TableSortLabel
//                           active={this.state.orderBy === 'amount'}
//                           // @ts-ignore
//                           direction={this.state.order}
//                           onClick={this.handleRequestSort.bind(this, 'amount')}>
//                           Amount
//                           </TableSortLabel>
//                       </TableCell>
//                       <TableCell className={classes.tableHeaderCell} title='Status'>
//                         <TableSortLabel
//                           active={this.state.orderBy === 'status'}
//                           // @ts-ignore
//                           direction={this.state.order}
//                           onClick={this.handleRequestSort.bind(this, 'status')}>
//                           Status
//                           </TableSortLabel>
//                       </TableCell>
//                       <TableCell className={classes.tableHeaderCell} title='Reason'>
//                         <TableSortLabel
//                           active={this.state.orderBy === 'reason'}
//                           // @ts-ignore
//                           direction={this.state.order}
//                           onClick={this.handleRequestSort.bind(this, 'reason')}>
//                           Reason
//                           </TableSortLabel>
//                       </TableCell>
//                       <TableCell className={classes.tableHeaderCell} title='Statement'>
//                         <TableSortLabel
//                           active={this.state.orderBy === 'statement'}
//                           // @ts-ignore
//                           direction={this.state.order}
//                           onClick={this.handleRequestSort.bind(this, 'statement')}>
//                           Statement
//                           </TableSortLabel>
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {directDebits &&
//                       this.sortDirectDebits(directDebits).map((dd) => (
//                         <TableRow key={'tr-' + dd._id}>
//                           <TableCell className={classes.tableBodyCell}>
//                             <Checkbox
//                               checked={dd.checked ? true : false}
//                               key={dd._id}
//                               value={dd.checked}
//                               inputProps={{ 'aria-label': 'dd-connect' }}
//                               onChange={this.handleCheckbox(dd._id)}
//                             />
//                           </TableCell>
//                           <TableCell
//                             className={classes.tableBodyCell}>{moment(dd.plannedDate).format('DD-MM-YYYY')}</TableCell>
//                           <TableCell className={classes.tableBodyCell}>{dd.description}</TableCell>
//                           <TableCell className={classes.tableBodyCell}>{currency(dd.amount)}</TableCell>

//                           <Tooltip placement='bottom' disableFocusListener disableTouchListener
//                             title={
//                               <React.Fragment>
//                                 <table style={{ border: '1px solid white', borderCollapse: 'collapse' }}>
//                                   <thead>
//                                     <tr>
//                                       <th className={classes.toolTipHead}>Planned Date</th>
//                                       <th className={classes.toolTipHead}>Status</th>
//                                       <th className={classes.toolTipHead}>Reason</th>
//                                       <th className={classes.toolTipHead}>Statement</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {dd.statusHistory.map((history, i) =>
//                                       <tr key={i}>
//                                         <td className={classes.toolTipCell}>{moment(history.createdAt).format('DD-MM-YYYY')}</td>
//                                         <td className={classes.toolTipCell}>{history.status}</td>
//                                         <td className={classes.toolTipCell}>{history.reason}</td>
//                                         <td className={classes.toolTipCell}>{history.statement}</td>
//                                       </tr>
//                                     )}
//                                   </tbody>
//                                 </table>
//                               </React.Fragment>
//                             }
//                           >
//                             <TableCell className={classes.tableBodyCell}
//                             >
//                               <Typography
//                                 aria-owns='mouse-over-popover'
//                                 onMouseEnter={this.handlePopoverOpen}
//                                 onMouseLeave={this.handlePopoverClose}
//                               >
//                                 {dd.status}
//                               </Typography>
//                             </TableCell>
//                           </Tooltip>
//                           <TableCell>{}</TableCell>
//                           <TableCell>{}</TableCell>
//                         </TableRow>
//                       ))
//                     }
//                   </TableBody>
//                 </Table>
//               </Paper>
//             </CardBody>
//           </Card>
//         </Dialog>

//         <DirectDebitStatusHover
//           classes={{
//             paper: classes.paper,
//           }}
//           id="dd-status-hover"
//           open={ddHover}
//           onClose={this.handlePopoverClose}
//           statusHistory={[]}
//         />
//       </div>
//     );
//   }
// }

// ConnectDirectDebitOVerview.propTypes = {
//   classes: PropTypes.object,
//   selectedSme: PropTypes.object,
//   overviewData: PropTypes.object,
//   transactionData: PropTypes.object,
//   counterpartydirectdebits: PropTypes.object,

//   mandates: PropTypes.array,
//   contracts: PropTypes.array,
//   customers: PropTypes.array,
//   directDebits: PropTypes.array,

//   contractId: PropTypes.string,
//   counterPartyIban: PropTypes.string,

//   connectAmount: PropTypes.number,

//   statusSaveDDConnect: PropTypes.bool,
//   updateBankTransactionStatus: PropTypes.bool,

//   open: PropTypes.bool,
//   onClose: PropTypes.func,

//   /* mapDispatchToProps */
//   getSmeLoan: PropTypes.func.isRequired,
//   clearSmeLoans: PropTypes.func.isRequired,
//   getOverviewData: PropTypes.func.isRequired,
//   clearSelectedSme: PropTypes.func.isRequired,
//   clearDirectDebits: PropTypes.func.isRequired,
//   requestSmeBySmeid: PropTypes.func.isRequired,
//   requestLoansForSme: PropTypes.func.isRequired,
//   getAllDirectDebits: PropTypes.func.isRequired,
//   processConnectAmount: PropTypes.func.isRequired,
//   clearSelectedCustomer: PropTypes.func.isRequired,
//   saveConnectDirectDebits: PropTypes.func.isRequired,
//   createSmeLoanTransaction: PropTypes.func.isRequired,
//   saveBankTransactionStatus: PropTypes.func.isRequired,
//   clearSmeMandatesByCustomer: PropTypes.func.isRequired,
//   processConnectToDirectDebit: PropTypes.func.isRequired,
//   requestSmeByCounterpartyIban: PropTypes.func.isRequired,
//   getDirectDebitsByCountrtParty: PropTypes.func.isRequired,
// }

// const mapStateToProps = state => {
//   return {
//     contracts: state.lmglobal.smeLoans,
//     selectedSme: state.smes.selectedSme,
//     customers: state.lmglobal.customers,
//     contractId: state.smeLoanTransaction.contractId,
//     mandates: state.smemandates.smeMandatesByCustomer,
//     directDebits: state.smeLoanTransaction.directdebits,
//     overviewData: state.smeLoanTransaction.overviewData,
//     connectAmount: state.smeLoanTransaction.connectAmount,
//     statusSaveDDConnect: state.smeLoanTransaction.statusSaveDDConnect,
//     counterpartydirectdebits: state.smeLoanTransaction.directdebitsbycounterparty,
//     updateBankTransactionStatus: state.bankTransactions.updateBankTransactionStatus,
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     getAllDirectDebits: contractId => {
//       dispatch(requestDirectDebitsByContract(contractId));
//     },
//     clearSelectedCustomer: () => {
//       dispatch(clearSelectedCustomer());
//     },
//     clearDirectDebits: () => {
//       dispatch(clearDirectDebits([]))
//     },
//     processConnectToDirectDebit: (directdebits, id, checked) => {
//       dispatch(processConnectToDirectDebit(directdebits, id, checked))
//     },
//     processConnectAmount: directdebits => {
//       dispatch(processConnectAmount(directdebits))
//     },
//     saveConnectDirectDebits: (data, btId, smeLoanTransactionIds) => {
//       dispatch(saveConnectDirectDebits(data, btId, smeLoanTransactionIds))
//     },
//     saveBankTransactionStatus: (transactionId, status) => {
//       dispatch(saveBankTransactionStatus(transactionId, status))
//     },
//     getDirectDebitsByCountrtParty: (counterPartyIban) => {
//       dispatch(requestDirectDebitsByIban(counterPartyIban))
//     },
//     clearSmeMandatesByCustomer: () => {
//       dispatch(clearSmeMandatesByCustomer());
//     },
//     getSmeLoan: contractId => {
//       dispatch(requestSmeLoan(contractId));
//     },
//     requestSmeByCounterpartyIban: iban => {
//       dispatch(requestSmeByIban(iban));
//     },
//     requestSmeBySmeid: smeId => {
//       dispatch(requestSmeById(smeId));
//     },
//     clearSelectedSme: () => {
//       dispatch(clearSelectedSme());
//     },
//     clearSmeLoans: () => {
//       dispatch(clearLoans());
//     },
//     requestLoansForSme: smeId => {
//       dispatch(requestSmeLoans(smeId));
//     },
//     createSmeLoanTransaction: transaction => {
//       dispatch(createSmeLoanTransaction(transaction));
//     },
//     getOverviewData: contractId => {
//       dispatch(requestOverviewData(contractId));
//     }
//   }
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(useStyles)(ConnectDirectDebitOVerview));