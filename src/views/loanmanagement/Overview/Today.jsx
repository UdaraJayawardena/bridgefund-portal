// import moment from 'moment';
// import PropTypes from "prop-types";
// import { connect } from 'react-redux';
// import React, { Component } from "react";
// import tasksStyle from 'assets/jss/material-dashboard-react/components/tasksStyle.jsx';

// import Table from "@material-ui/core/Table";
// import TableRow from "@material-ui/core/TableRow";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import withStyles from "@material-ui/core/styles/withStyles";

// import Tooltip from '@material-ui/core/Tooltip';
// import TableHead from '@material-ui/core/TableHead';

// import Card from "components/Card/Card.jsx";
// import CardBody from "components/Card/CardBody.jsx";
// import CardHeader from "components/Card/CardHeader.jsx";

// import Utility from '../../lib/utility';

// import { clearContracts } from '../../store/actions/Contracts';

// const currency = Utility.currencyConverter();

// class Today extends Component {

//   constructor(props) {
//     super(props);

//     this.state = {};
//   }

//   componentWillMount() {
//     this.props.clearContracts()
//   }

//   componentWillUnmount() {
//     this.props.clearContracts()
//   }

//   getPaymentsUptoToday = payments => {
//     return payments.filter(payment => moment(payment.plannedDate).isSameOrBefore(moment()))
//   }

//   getPaymentsByContract = (payments, contractId) => payments.filter(payment => payment.contractId.toString() === contractId)

//   getShouldBePaid = (payments, contractTotalAmount, termAmount, contractStatus) => {
//     let originalContractTotalAmount = contractTotalAmount
//     if (contractStatus === 'Finished'
//       //  || contractStatus === 'Deleted' // Get the requirement if this condition should be added or not
//     ) {
//       return contractTotalAmount;
//     } else {
//       return payments
//         .filter(payment => !(payment.status === 'PAID' && payment.isManual === true))
//         .reduce((a, cv) => {
//           contractTotalAmount -= termAmount;
//           return contractTotalAmount >= 0 ? a + cv.totalAmount : originalContractTotalAmount
//         }, 0);
//     }
//   }

//   getHasBeenPaid = payments => {
//     return payments
//       .filter(payment =>
//         payment.status == 'PAID'
//         // && payment.message !== 'Discount payment' // Get the requirement if this condition should be added or not
//       )
//       .reduce((a, cv) => { return a + cv.totalAmount }, 0);
//   }

//   getConfirmedPaid = paidPayments => {
//     return paidPayments
//       .filter(payment => payment &&
//         payment.message === 'Closing payment' ||
//         // payment.message === 'Discount payment' || // Get the requirement if this condition should be added or not
//         (payment.statusHistory && payment.statusHistory.length > 0 &&
//           (payment.statusHistory[payment.statusHistory.length - 1].status === 'PAYMENT_RECEIVED' ||
//             payment.statusHistory[payment.statusHistory.length - 1].status === 'PAYMENT_RECEIVED_MANUAL')
//         )
//       )
//       .reduce((a, cv) => { return a + cv.totalAmount }, 0);
//   }

//   getAmountBehind = (shouldBePaid, hasBeenPaid) => shouldBePaid - hasBeenPaid;

//   getPercentagePaid = (hasBeenPaid, contractTotalAmount) => (hasBeenPaid / contractTotalAmount) * 100

//   getPercentageBehind = (amountBehind, contractTotalAmount) => (amountBehind / contractTotalAmount) * 100

//   getTotalAmountRemaining = (contractTotalAmount, hasBeenPaid) => contractTotalAmount - hasBeenPaid


//   getConfirmedBehind = errorPayments => {
//     let today = moment();
//     return errorPayments
//       .filter(payment => payment &&
//         (
//           (moment.duration(today.diff(payment.plannedDate)).asDays() > 7) &&
//           (payment.isManual === false) &&
//           (payment.status === 'OPEN' || payment.status === 'ERROR')
//         )
//       )
//       .reduce((a, cv) => { return a + cv.totalAmount }, 0);
//   }

//   get contractDetails() {
//     return this.props.contracts.map(contract => {
//       let contractTotalAmount = (
//         (contract.amount ? contract.amount : 0) +
//         (contract.interest ? contract.interest : 0) +
//         (contract.fees ? contract.fees : 0)
//       );
//       let termAmount = contractTotalAmount / contract.terms;
//       let paymentsUptoToday = this.getPaymentsUptoToday(this.props.payments);
//       let payments = this.getPaymentsByContract(paymentsUptoToday, contract._id.toString());
//       let shouldBePaid = this.getShouldBePaid(payments, contractTotalAmount, termAmount, contract.status);
//       let hasBeenPaid = this.getHasBeenPaid(payments);
//       let confirmedPaid = this.getConfirmedPaid(payments);
//       let amountBehind = this.getAmountBehind(shouldBePaid, hasBeenPaid);
//       let percentagePaid = this.getPercentagePaid(hasBeenPaid, contractTotalAmount);
//       let percentageBehind = this.getPercentageBehind(amountBehind, contractTotalAmount);
//       let totalAmountRemaining = this.getTotalAmountRemaining(contractTotalAmount, hasBeenPaid);

//       let confirmedBehind = this.getConfirmedBehind(payments); // (Error Payments + Open Payments) 

//       let obj = {
//         contractStatus: contract.status,
//         contractNo: contract.contractNumber,
//         shouldBePaid: shouldBePaid,
//         hasBeenPaid: hasBeenPaid,
//         confirmedPaid: confirmedPaid,
//         amountBehind: amountBehind,
//         percentagePaid: percentagePaid,
//         percentageBehind: percentageBehind,
//         totalAmountRemaining: totalAmountRemaining,
//         contractTotalAmount: contractTotalAmount,
//         confirmedBehind: contract.status === 'Finished' ? shouldBePaid - hasBeenPaid : (confirmedBehind - contract.partialPayment)
//       }
//       return obj;
//     })
//   }

//   getIcon(status) {
//     switch (status) {
//       case 'Active':
//         return (<i className="material-icons">trending_up</i>)
//       case 'Finished':
//         return (<i className="material-icons">done_all</i>)
//       case 'Remaining':
//         return (<i className="material-icons">hourglass_empty</i>)
//       case 'Deleted':
//         return (<i className="material-icons">delete</i>)
//       default:
//         return status;
//     }
//   }

//   render() {
//     const { classes } = this.props;

//     return (
//       <div>
//         <Card>
//           <CardHeader color="info">
//             <h5>{this.props.selectedCustomer.company}</h5>
//             {/* <h5>{this.props.match.params.customerId}</h5> */}
//           </CardHeader>
//           <CardBody>
//             <Table className={classes.table}>
//               <TableHead className={classes.tableRow}>
//                 <TableRow key={'tasks_header'} className={classes.tableRow}>
//                   <TableCell className={classes.tableCell}> </TableCell>
//                   <TableCell className={classes.tableCell}>
//                     {'Contract Number'}
//                   </TableCell>
//                   <TableCell className={classes.tableCell}>
//                     {'Should be paid'}
//                   </TableCell>
//                   <TableCell className={classes.tableCell}>
//                     {'Has been paid'}
//                   </TableCell>
//                   {/* <TableCell className={classes.tableCell}>
//                     {'Confirmed paid'}
//                   </TableCell> */}
//                   <TableCell className={classes.tableCell}>
//                     {'Amount behind'}
//                   </TableCell>

//                   <TableCell className={classes.tableCell}>
//                     {'Confirmed behind'}
//                   </TableCell>

//                   <TableCell className={classes.tableCell}>
//                     {'Percentage paid'}
//                   </TableCell>
//                   <TableCell className={classes.tableCell}>
//                     {'Percentage behind'}
//                   </TableCell>
//                   <TableCell className={classes.tableCell}>
//                     {'Total amount remaining'}
//                   </TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {
//                   this.contractDetails.map((val, key) => (
//                     <TableRow className={classes.tableRow} key={key}>
//                       <Tooltip title={val.contractStatus} placement='top'>
//                         <TableCell className={classes.tableCell}>
//                           {this.getIcon(val.contractStatus)}
//                         </TableCell>
//                       </Tooltip>
//                       <TableCell className={classes.tableCell}>{val.contractNo}</TableCell>
//                       <TableCell className={classes.tableCell}>{currency(val.shouldBePaid)}</TableCell>
//                       <TableCell className={classes.tableCell}>{currency(val.hasBeenPaid)}</TableCell>
//                       {/* <TableCell className={classes.tableCell}>{currency(val.confirmedPaid)}</TableCell> */}
//                       <TableCell className={classes.tableCell}>{currency(val.amountBehind)}</TableCell>

//                       <TableCell className={classes.tableCell}>{currency(val.confirmedBehind)}</TableCell>

//                       <TableCell className={classes.tableCell}>{(val.percentagePaid).toFixed(2)}%</TableCell>
//                       <TableCell className={classes.tableCell}>{(val.percentageBehind).toFixed(2)}%</TableCell>
//                       <TableCell className={classes.tableCell}>{currency(val.totalAmountRemaining)}</TableCell>
//                     </TableRow>
//                   ))
//                 }
//               </TableBody>
//             </Table>
//           </CardBody>
//         </Card>
//       </div>
//     );
//   }
// }

// Today.propTypes = {
//   contracts: PropTypes.array.isRequired,
//   payments: PropTypes.array.isRequired
// };

// const mapStateToProps = state => {
//   return {
//     payments: state.payments.payments,
//     contracts: state.contracts.contracts,
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     clearContracts: () => {
//       dispatch(clearContracts());
//     },
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(tasksStyle)(Today));

