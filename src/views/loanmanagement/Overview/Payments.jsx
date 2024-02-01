// import moment from 'moment';
// import PropTypes from 'prop-types';
// import classnames from 'classnames';
// import { connect } from 'react-redux';
// import React, { Component } from 'react';

// import {
//   Paper, Table, Select, Tooltip, MenuItem, TableRow, TableCell, TableHead, TableBody,
//   InputLabel, FormControl, TableSortLabel
// } from '@material-ui/core';

// import { Pause } from "@material-ui/icons";
// import withStyles from '@material-ui/core/styles/withStyles';

// import Card from 'components/Card/Card.jsx';
// import CardBody from 'components/Card/CardBody.jsx';
// import GridItem from 'components/Grid/GridItem.jsx';
// import CardFooter from 'components/Card/CardFooter.jsx';
// import CardHeader from 'components/Card/CardHeader.jsx';
// import GridContainer from 'components/Grid/GridContainer.jsx';

// import {
//   getLoanStopHistoryBySME, setLoanStopHistoryOrigin, showHideTemporaryLoanStop
// } from "store/actions/SmeLoanTemporaryLoanStop";

// import Utility from '../../lib/utility';

// const currency = Utility.currencyConverter();
// const styles = theme => ({
//   formControl: {
//     margin: theme.spacing(1),
//     minWidth: 150,
//   },
//   selectEmpty: {
//     marginTop: theme.spacing(2),
//   },
//   paymentTableCell: {
//     margin: 0,
//     padding: 3,
//     textAlign: 'start'
//   },
//   head: {
//     backgroundColor: "#fff",
//     position: "sticky",
//     top: 0,
//     padding: '5px 5px 5px 10px',
//     margin: 0,
//     textAlign: 'start',
//     fontWeight: 'bold',
//     backgroundColor: '#eaeaea'
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
//   }
// });

// class Payments extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       paymentData: [],
//       selectedMandate: '',
//       selectedStatus: '',
//       selectedContract: '',
//       selectedManualInclude: '',
//       cell: new Map(),

//       order: 'asc',
//       orderBy: 'plannedDate',
//     };
//   }

//   componentDidMount() {
//     if (this.props.payments) {
//       this.setState({ paymentData: this.props.payments });
//     }
//   }

//   componentWillReceiveProps(nextProps) {
//     if (nextProps.payments && this.props.payments !== nextProps.payments) {
//       this.setState({ paymentData: nextProps.payments });
//     }
//   }

//   handleRequestSort = (property, event) => {
//     const orderBy = property;
//     let order = 'desc';

//     if (this.state.orderBy === property && this.state.order === 'desc') {
//       order = 'asc';
//     }

//     this.setState({ order, orderBy });
//   };

//   getRowColour = (payment) => {
//     if (payment.status == 'PAID') {
//       return '#B6F64E'
//     }
//     else if (payment.status == 'OPEN') {
//       return '#ffffff'
//     }
//     else if (payment.status == 'ERROR') {

//       for (let i = 0; i < payment.statusHistory.length; i++) {
//         if (payment.statusHistory[i].status === 'PAYMENT_RECEIVED_MANUAL') {
//           return '#6fb7ef';
//         }
//       }

//       let twikeyStatus = '';
//       let twinfieldStatus = '';
//       for (let history of payment.statusHistory) {
//         let today = moment();
//         let duration = moment.duration(today.diff(history.createdAt));
//         let hours = duration.asHours();

//         if (
//           (history.status === '2ND_PAYMENT_REVERSED' ||
//             history.status === '1ST_PAYMENT_REVERSED') &&
//           hours > 24
//         ) {
//           if (history.source === 'Twikey') {
//             twikeyStatus = history.status;
//           }

//           if (history.source === 'Twinfield') {
//             twinfieldStatus = history.status;
//           }
//         }

//         if (twinfieldStatus !== twikeyStatus) {
//           return '#FFCC00'
//         }
//       }
//       return '#f49090'
//     }
//   }

//   handleChange = event => {
//     this.setState({ [event.target.name]: event.target.value });
//   };

//   handleTemporaryLoanStop() {
//     this.props.showHideTemporaryLoanStop();
//     this.props.setLoanStopHistoryOrigin('PAYMENTS');
//     this.props.getLoanStopHistoryBySME(this.props.customer.id);
//   }

//   get filterdPayments() {
//     let data = this.props.payments;
//     if (this.state.selectedContract) {
//       data = data.filter(payment => payment.paymentContracts.contractNumber === this.state.selectedContract);
//     }
//     if (this.state.selectedMandate) {
//       data = data.filter(payment => payment.paymentMandates.mandateNumber === this.state.selectedMandate);
//     }
//     if (this.state.selectedStatus) {
//       data = data.filter(payment => payment.status === this.state.selectedStatus);
//     }
//     if (this.state.selectedManualInclude) {
//       if (this.state.selectedManualInclude === 'Manually Included') {
//         data = data.filter(payment => payment.isManual === true);
//       }
//       if (this.state.selectedManualInclude === 'Twikey Payments') {
//         data = data.filter(payment => payment.isManual === false && payment.reference !== undefined);
//       }
//     }
//     return data;
//   }

//   getFilterdPaymentsForCount(skipField) {
//     let data = this.props.payments;
//     if (this.state.selectedContract && skipField !== 'contract') {
//       data = data.filter(payment => payment.paymentContracts.contractNumber === this.state.selectedContract);
//     }
//     if (this.state.selectedMandate && skipField !== 'mandate') {
//       data = data.filter(payment => payment.paymentMandates.mandateNumber === this.state.selectedMandate);
//     }
//     if (this.state.selectedStatus && skipField !== 'status') {
//       data = data.filter(payment => payment.status === this.state.selectedStatus);
//     }
//     if (this.state.selectedManualInclude && skipField !== 'manual_include') {
//       if (this.state.selectedManualInclude === 'Manually Included') {
//         data = data.filter(payment => payment.isManual === true);
//       }
//       if (this.state.selectedManualInclude === 'Twikey Payments') {
//         data = data.filter(payment => payment.isManual === false && payment.reference !== undefined);
//       }
//     }
//     return data;
//   }

//   moreLess = (i) => {
//     this.state.cell.get(i) ? this.state.cell.set(i, false) : this.state.cell.set(i, true);
//     this.setState({ cell: this.state.cell })

//   };

//   getMandateLength = mandateNumber => this.filterdPayments.filter(payment => payment.paymentMandates.mandateNumber === mandateNumber).length;
//   getContractLength = contractNumber => this.filterdPayments.filter(payment => payment.paymentContracts.contractNumber === contractNumber).length;
//   getStatusLength = status => this.filterdPayments.filter(payment =>
//     payment.status === status && (status !== 'PAID' || !payment.isManual)).length;
//   getManualIncludeLength = manualType => this.filterdPayments.filter(payment => {
//     if (manualType === 'Twikey Payments') {
//       return payment.isManual === false && payment.reference !== undefined;
//     } else {
//       return payment.isManual === (manualType === 'Manually Included')
//     }
//   }).length;

//   render() {
//     const {
//       mandates,
//       contracts,
//       classes,
//       rtlActive,
//     } = this.props;
//     const tableCellClasses = classnames(classes.tableCell, {
//       [classes.tableCellRTL]: rtlActive
//     });
//     return (
//       <div>
//         <Card>
//           <CardHeader color="info">
//             <div>
//               <div style={{ float: 'left' }}>
//                 <h4 className={classes.cardTitleWhite}>Direct Debit</h4>
//               </div>
//               <div style={{ float: 'right' }}>
//                 <h4 hidden={!this.props.isActiveStopsAvailableForSME}><Pause cursor='pointer' onClick={() => this.handleTemporaryLoanStop()} /></h4>
//               </div>
//             </div>
//           </CardHeader>
//           <CardBody>
//             <GridContainer>
//               {/* Mandate Filter */}
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <InputLabel htmlFor="mandate-filter">Mandate</InputLabel>
//                   <Select
//                     value={this.state.selectedMandate}
//                     onChange={this.handleChange}
//                     inputProps={{
//                       name: 'selectedMandate',
//                       id: 'mandate-filter',
//                     }}
//                     className={classes.selectEmpty}
//                   >
//                     <MenuItem value="">
//                       <em>All ({this.filterdPayments.length})</em>
//                     </MenuItem>
//                     {mandates.map((mandate, i) =>
//                       <MenuItem key={i} value={mandate.mandateNumber}>{mandate.mandateNumber + ' (' + this.getMandateLength(mandate.mandateNumber) + ')'}</MenuItem>
//                     )}
//                   </Select>
//                 </FormControl>
//               </GridItem>
//               {/* Status Filter */}
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <InputLabel htmlFor="status-filter">Status</InputLabel>
//                   <Select
//                     value={this.state.selectedStatus}
//                     onChange={this.handleChange}
//                     inputProps={{
//                       name: 'selectedStatus',
//                       id: 'status-filter',
//                     }}
//                     className={classes.selectEmpty}
//                   >
//                     <MenuItem value="">
//                       <em>All ({this.filterdPayments.length})</em>
//                     </MenuItem>
//                     <MenuItem value={'PAID'}>PAID ({this.getStatusLength('PAID')})</MenuItem>
//                     <MenuItem value={'ERROR'}>ERROR ({this.getStatusLength('ERROR')})</MenuItem>
//                     <MenuItem value={'OPEN'}>OPEN ({this.getStatusLength('OPEN')})</MenuItem>
//                   </Select>
//                 </FormControl>
//               </GridItem>
//               {/* Contract Filter */}
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <InputLabel htmlFor="contract-filter">Contract</InputLabel>
//                   <Select
//                     value={this.state.selectedContract}
//                     onChange={this.handleChange}
//                     inputProps={{
//                       name: 'selectedContract',
//                       id: 'contract-filter',
//                     }}
//                     className={classes.selectEmpty}
//                   >
//                     <MenuItem value="">
//                       <em>All ({this.filterdPayments.length})</em>
//                     </MenuItem>
//                     {contracts.map((contract, i) =>
//                       <MenuItem key={i} value={contract.contractNumber}>{`${contract.contractNumber} (${this.getContractLength(contract.contractNumber)})`}</MenuItem>
//                     )}
//                   </Select>
//                 </FormControl>
//               </GridItem>
//               {/* Manual Include Filter */}
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <InputLabel htmlFor="Manual-filter">Manual Include</InputLabel>
//                   <Select
//                     value={this.state.selectedManualInclude}
//                     onChange={this.handleChange}
//                     inputProps={{
//                       name: 'selectedManualInclude',
//                       id: 'Manual-filter',
//                     }}
//                     className={classes.selectEmpty}
//                   >
//                     <MenuItem value="">
//                       <em>All ({this.filterdPayments.length})</em>
//                     </MenuItem>
//                     <MenuItem value='Twikey Payments'>Twikey Payments ({this.getManualIncludeLength('Twikey Payments')})</MenuItem>
//                     <MenuItem value='Manually Included'>Manually Included ({this.getManualIncludeLength('Manually Included')})</MenuItem>
//                   </Select>
//                 </FormControl>
//               </GridItem>
//             </GridContainer>
//             <Paper style={{ height: '400px', width: 'auto', overflowY: 'scroll' }}>
//               <Table>
//                 <TableHead>
//                   <TableRow className={classes.tableRow} >
//                     <TableCell className={classes.head} style={{ width: '10%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'reference'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'reference')}>
//                         Reference
//                       </TableSortLabel>
//                     </TableCell>
//                     <TableCell className={classes.head} style={{ width: '25%' }}>Message</TableCell>
//                     <TableCell className={classes.head} style={{ width: '25%' }}>Location</TableCell>
//                     <TableCell className={classes.head} style={{ width: '8%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'plannedDate'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'plannedDate')}>
//                         Collection Date
//                       </TableSortLabel>
//                     </TableCell>
//                     <TableCell className={classes.head} style={{ width: '8%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'transactionDate'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'transactionDate')}>
//                         Collected Date
//                       </TableSortLabel>
//                     </TableCell>
//                     <TableCell className={classes.head} style={{ width: '7%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'lendedAmount'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'lendedAmount')}>
//                         Lended Amount
//                       </TableSortLabel>
//                     </TableCell>
//                     <TableCell className={classes.head} style={{ width: '7%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'margin'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'margin')}>
//                         Margin
//                       </TableSortLabel>
//                     </TableCell>
//                     <TableCell className={classes.head} style={{ width: '9%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'totalAmount'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'totalAmount')}>
//                         Total Amount
//                       </TableSortLabel>
//                     </TableCell>
//                     <TableCell className={classes.head} style={{ width: '1%' }}>
//                       <TableSortLabel
//                         active={this.state.orderBy === 'status'}
//                         direction={this.state.order}
//                         onClick={this.handleRequestSort.bind(this, 'status')}>
//                         Status
//                       </TableSortLabel>
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {
//                     Utility.stableSort(this.filterdPayments, Utility.getSorting(this.state.order, this.state.orderBy))
//                       .map((payment, i) =>
//                         <TableRow key={i} className={classes.tableRow} style={{ backgroundColor: this.getRowColour(payment) }}>
//                           <TableCell className={classes.paymentTableCell} style={{ width: '10%' }} > {payment.reference}</TableCell>
//                           <Tooltip disableFocusListener disableTouchListener classes={{
//                             popper: classes.htmlPopper,
//                             tooltip: classes.htmlTooltip,
//                           }}
//                             PopperProps={{
//                               popperOptions: {
//                                 modifiers: {
//                                   arrow: {
//                                     enabled: Boolean(this.state.arrowRef),
//                                     element: this.state.arrowRef,
//                                   },
//                                 },
//                               },
//                             }}
//                             title={
//                               <React.Fragment>
//                                 <table style={{ border: '1px solid white', borderCollapse: 'collapse' }}>
//                                   <thead>
//                                     <tr>
//                                       <th className={classes.toolTipHead}>Source</th>
//                                       <th className={classes.toolTipHead}>Status</th>
//                                       <th className={classes.toolTipHead}>Date</th>
//                                     </tr>
//                                   </thead>

//                                   <tbody>
//                                     {payment.statusHistory.map((history, i) =>
//                                       <tr key={i}>
//                                         <td className={classes.toolTipCell}>{history.source}</td>
//                                         <td className={classes.toolTipCell}>{history.status}</td>
//                                         <td className={classes.toolTipCell}>{moment(history.createdAt).format('DD-MM-YYYY')}</td>
//                                       </tr>
//                                     )}
//                                   </tbody>
//                                 </table>

//                                 {this.getRowColour(payment) === '#FFCC00' ? (<p style={{ color: '#FFCC00', fontSize: '10pt' }}>Status of Twikey and Twinfield are not matching</p>) : false}
//                               </React.Fragment>
//                             }
//                           >
//                             <TableCell md={2} className={classes.paymentTableCell} style={{ width: '25%' }}>
//                               {payment.message.length > 60 ?
//                                 (<span>
//                                   {this.state.cell.get(i + '2') ? payment.message : payment.message.slice(0, 60) + '...'}
//                                   <a href='#' onClick={() => { this.moreLess(i + '2') }}>
//                                     {this.state.cell.get(i + '2') ? ' less' : ' more'}
//                                   </a>
//                                 </span>
//                                 )
//                                 :
//                                 payment.message
//                               }
//                             </TableCell>
//                           </Tooltip>
//                           <TableCell md={2} className={classes.paymentTableCell} style={{ width: '25%' }}>
//                             {payment.location}
//                           </TableCell>
//                           <TableCell md={1} className={classes.paymentTableCell} style={{ width: '8%' }}>{payment.plannedDate
//                             ? moment(payment.plannedDate).format('DD-MM-YYYY')
//                             : ''}</TableCell>
//                           <TableCell className={classes.paymentTableCell} style={{ width: '8%' }}>{payment.transactionDate
//                             ? moment(payment.transactionDate).format('DD-MM-YYYY')
//                             : ''}</TableCell>
//                           <TableCell className={classes.paymentTableCell} style={{ width: '7%' }}>{currency(payment.lendedAmount)}</TableCell>
//                           <TableCell className={classes.paymentTableCell} style={{ width: '7%' }}>{currency(payment.margin)}</TableCell>
//                           <TableCell className={classes.paymentTableCell} style={{ width: '9%' }}>{currency(payment.totalAmount)}</TableCell>
//                           <TableCell className={classes.paymentTableCell} style={{ width: '1%' }}>{payment.status}</TableCell>
//                         </TableRow>
//                       )}
//                 </TableBody>
//               </Table>
//             </Paper>
//           </CardBody>
//           <CardFooter>
//           </CardFooter>
//         </Card>
//       </div>
//     )
//   }
// }

// Payments.propTypes = {
//   payments: PropTypes.array.isRequired
// };

// const mapStateToProps = state => {
//   return {
//     contracts: state.contracts.contracts,
//     payments: state.payments.payments,
//     mandates: state.mandates.mandates,
//     isActiveStopsAvailableForSME: state.loanStopHistory.isActiveAvailableForSME
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     showHideTemporaryLoanStop: () => {
//       dispatch(showHideTemporaryLoanStop());
//     },
//     setLoanStopHistoryOrigin: origin => {
//       dispatch(setLoanStopHistoryOrigin(origin));
//     },
//     getLoanStopHistoryBySME: SME_Id => {
//       dispatch(getLoanStopHistoryBySME(SME_Id));
//     },
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(styles)(Payments));
