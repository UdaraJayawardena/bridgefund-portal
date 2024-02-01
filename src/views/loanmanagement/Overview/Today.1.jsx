// import React, { Component } from "react";
// import PropTypes from "prop-types";

// // @material-ui/core components
// import withStyles from "@material-ui/core/styles/withStyles";
// import { connect } from 'react-redux';
// import Table from "@material-ui/core/Table";
// import TableRow from "@material-ui/core/TableRow";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import TableHead from '@material-ui/core/TableHead';
// import classnames from "classnames";
// import tasksStyle from "assets/jss/material-dashboard-react/components/tasksStyle.jsx";

// import moment from 'moment';
// import Utility from '../../lib/utility';

// import GridItem from "components/Grid/GridItem.jsx";
// import GridContainer from "components/Grid/GridContainer.jsx";
// import Card from "components/Card/Card.jsx";
// import CardHeader from "components/Card/CardHeader.jsx";
// import CardBody from "components/Card/CardBody.jsx";

// const styles = {
//   cardCategoryWhite: {
//     color: "rgba(255,255,255,.62)",
//     margin: "0",
//     fontSize: "14px",
//     marginTop: "0",
//     marginBottom: "0"
//   },
//   cardTitleWhite: {
//     color: "#FFFFFF",
//     marginTop: "0px",
//     minHeight: "auto",
//     fontWeight: "300",
//     fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
//     marginBottom: "3px",
//     textDecoration: "none"
//   }
// };

// const currency = Utility.currencyConverter();

// const getStartDate = payments => {
//   return payments.reduce((startDate, payment) => {
//     const transactionDate = moment(payment.transactionDate, 'YYYY-MM-DD');

//     if (transactionDate.isBefore(startDate)) {
//       return transactionDate;
//     } else {
//       return startDate;
//     }
//   }, moment());
// };

// const getPaidPayments = payments => {
//   return payments
//     .filter(
//       payment =>
//         payment.status === 'PAID' || payment.message === 'Closing payment'
//     )
//     .map(payment => {
//       payment.collectedDateMoment = moment(payment.transactionDate, 'YYYY-MM-DD');
//       return payment;
//     });
// };

// const getConfiredPayments = payments => {
//   return payments
//     .filter(payment => {
//       if (
//         payment &&
//         payment.statusHistory &&
//         payment.statusHistory.length > 0
//       ) {
//         const index = payment.statusHistory.length - 1;

//         return payment.statusHistory[index].status === 'PAYMENT_RECEIVED';
//       }
//       return false;
//     })
//     .map(payment => {
//       payment.collectedDateMoment = moment(payment.transactionDate, 'YYYY-MM-DD');
//       return payment;
//     });
// };
// const calculatedPredictAmount = (dateForDay, contract, params) => {
//   let [totalForAllContracts, predictedAmounts, actualAmount] = params;

//   totalForAllContracts += contract.totalAmount;

//   if (dateForDay) {
//     if (dateForDay.isAfter(contract.collectionStartDate)) {
//       predictedAmounts[contract._id] = contract.totalAmount;
//       actualAmount += contract.totalAmount;
//     }
//   }

//   return [totalForAllContracts, predictedAmounts, actualAmount];
// };

// const calculatedValues = (dateForDay, contract, payments, params) => {
//   let [
//     predictedAmounts,
//     actualAmount,
//     shouldBePaidToday,
//     totalShouldBePaid,
//     totalPaid,
//     confirmedTotalPaid,
//     paymentAmountToday
//   ] = params;

//   if (dateForDay.isSame(contract.collectionStartDate, 'day')) {
//     predictedAmounts[contract._id] = contract.totalAmount;
//     actualAmount += contract.totalAmount;
//   }

//   if (
//     dateForDay.isAfter(moment(contract.collectionStartDate)) &&
//     dateForDay.weekday() !== 0 &&
//     dateForDay.weekday() !== 6
//   ) {
//     predictedAmounts[contract._id] -= contract.dailyAmount;

//     if (predictedAmounts[contract._id] < 0) {
//       predictedAmounts[contract._id] = 0;
//     } else {
//       shouldBePaidToday += contract.dailyAmount;
//       totalShouldBePaid += contract.dailyAmount;
//     }
//   }

//   payments.forEach(payment => {
//     if (payment.collectedDateMoment.isSame(dateForDay, 'day')) {
//       actualAmount -= payment.totalAmount;
//       if (payment.status === 'PAID' || payment.message === 'Closing payment') {
//         totalPaid += payment.totalAmount;
//       }
//       paymentAmountToday += payment.totalAmount;
//     }
//   });

//   const confirmedPayment = payments.filter(payment => {
//     if (
//       (payment && payment.statusHistory && payment.statusHistory.length > 0) ||
//       payment.message === 'Closing payment'
//     ) {
//       const index = payment.statusHistory.length - 1;

//       return (
//         payment.message === 'Closing payment' ||
//         payment.statusHistory[index].status === 'PAYMENT_RECEIVED'
//       );
//     }
//     return false;
//   });

//   confirmedPayment.forEach(payment => {
//     if (payment.collectedDateMoment.isSame(dateForDay, 'day')) {
//       if (payment.status === 'PAID' || payment.message === 'Closing payment') {
//         confirmedTotalPaid += payment.totalAmount;
//       }
//     }
//   });

//   return [
//     predictedAmounts,
//     actualAmount,
//     shouldBePaidToday,
//     totalShouldBePaid,
//     totalPaid,
//     confirmedTotalPaid,
//     paymentAmountToday
//   ];
// };

// const getTotalPredictAmount = predictedAmounts => {
//   return Object.keys(predictedAmounts).reduce(
//     (total, key) => total + predictedAmounts[key],
//     0
//   );
// };

// const getCurrentStatus = (dateForDay, contracts, payments) => {
//   const currentDate = moment();
//   let dateValues = [];

//   let predictedAmounts = {};
//   let actualAmount = 0;
//   let totalShouldBePaid = 0;
//   let totalPaid = 0;
//   let confirmedTotalPaid = 0;

//   let totalForAllContracts = 0;

//   let params = [totalForAllContracts, predictedAmounts, actualAmount];

//   [
//     totalForAllContracts,
//     predictedAmounts,
//     actualAmount
//   ] = calculatedPredictAmount(dateForDay, contracts, params);

//   if (dateForDay) {
//     while (dateForDay.isBefore(currentDate)) {
//       let paymentAmountToday = 0;
//       let shouldBePaidToday = 0;

//       params = [
//         predictedAmounts,
//         actualAmount,
//         shouldBePaidToday,
//         totalShouldBePaid,
//         totalPaid,
//         confirmedTotalPaid,
//         paymentAmountToday
//       ];

//       [
//         predictedAmounts,
//         actualAmount,
//         shouldBePaidToday,
//         totalShouldBePaid,
//         totalPaid,
//         confirmedTotalPaid,
//         paymentAmountToday
//       ] = calculatedValues(dateForDay, contracts, payments, params);

//       const totalPredictedAmount = getTotalPredictAmount(predictedAmounts);

//       dateValues.push({
//         contractNumber: contracts.contractNumber,
//         date: dateForDay.toDate(),
//         predictedAmount: totalPredictedAmount,
//         totalPaid,
//         totalShouldBePaid,
//         confirmedTotalPaid,
//         percentageBehind: (totalShouldBePaid - totalPaid) / totalShouldBePaid,
//         actualAmount,
//         predictedAmounts: Object.assign({}, predictedAmounts),
//         day: dateValues.length,
//         paymentAmountToday,
//         shouldBePaidToday,
//         percentagePaid: totalPaid / totalForAllContracts,
//         totalTobePaid: totalForAllContracts - totalPaid,
//         totalForAllContracts
//       });

//       dateForDay.add(1, 'days');
//     }
//   }

//   return dateValues[dateValues.length - 1];
// };

// let totalLoanAmount = 0;

// class Today extends Component {

//   calculateAllPaymentStatus() {
//     const contractDetailArray = [];
//     totalLoanAmount = 0;
//     let { payments, contracts } = this.props;
//     // contracts = contracts.filter(con => con.contractNumber === '444-555-666')
//     contracts.forEach(contractElement => {
//       totalLoanAmount += contractElement.totalAmount;

//       const filteredPayments = payments.filter(payment => {
//         return (
//           payment.paymentContracts.contractNumber ===
//           contractElement.contractNumber &&
//           payment.message !== 'Discount payment'
//         );
//       });

//       const startDate = getStartDate(filteredPayments);
//       const paidPayments = getPaidPayments(filteredPayments);

//       let contractDetail = getCurrentStatus(
//         startDate,
//         contractElement,
//         paidPayments
//       );

//       if (contractDetail) {
//         contractDetail.contract = contractElement;
//       }
//       contractDetailArray.push(contractDetail);
//     });

//     return contractDetailArray;
//   }

//   calculatedConfirmedPaymentStatus() {
//     const paymentConfirmedArray = [];
//     const { payments, contracts } = this.props;

//     contracts.forEach(contractElement => {
//       const filteredPayments = payments.filter(payment => {
//         return (
//           payment.paymentContracts.contractNumber ===
//           contractElement.contractNumber
//         );
//       });

//       const startDate = getStartDate(filteredPayments);

//       const paidPayments = getConfiredPayments(filteredPayments);

//       let contractDetail = getCurrentStatus(
//         startDate,
//         contractElement,
//         paidPayments
//       );

//       if (contractDetail) {
//         contractDetail.contract = contractElement;
//       }

//       paymentConfirmedArray.push(contractDetail);
//     });

//     return paymentConfirmedArray;
//   }

//   render() {
//     const { classes, tasksIndexes, tasks, rtlActive } = this.props;
//     const tableCellClasses = classnames(classes.tableCell, {
//       [classes.tableCellRTL]: rtlActive
//     })

//     const values = this.calculateAllPaymentStatus();

//     return (
//       <div>
//         <GridContainer>
//           <GridItem xs={12} sm={12} md={12}>
//             <Card>
//               <CardHeader color="info">
//                 <h5>{this.props.selectedCustomer.company}</h5>
//                 {/* <h5>{this.props.match.params.customerId}</h5> */}
//               </CardHeader>
//               <CardBody>
//                 <GridContainer>
//                   <GridItem xs={12} sm={12} md={12}>
//                     <Table className={classes.table}>
//                       <TableHead className={classes.tableRow}>
//                         <TableRow key={'tasks_header'} className={classes.tableRow}>
//                           <TableCell className={tableCellClasses}>
//                             {'Contract Number'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Should be paid'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Has been paid'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Confirmed paid'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Amount behind'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Percentage paid'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Percentage behind'}
//                           </TableCell>
//                           <TableCell className={tableCellClasses}>
//                             {'Total amount remaining'}
//                           </TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {values.map((contract, key) => contract && (
//                           <TableRow key={key} className={classes.tableRow}>
//                             <TableCell className={tableCellClasses}>
//                               {contract.contractNumber}
//                             </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {contract.contract.status === 'Finished' &&
//                                 currency(contract.contract.amount + contract.contract.fees + contract.contract.interest)
//                               }
//                               {contract.contract.status !== 'Finished' &&
//                                 currency(contract.totalShouldBePaid)
//                               }
//                             </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {currency(contract.totalPaid)}
//                             </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {currency(contract.confirmedTotalPaid)}
//                             </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {contract.contract.status === 'Finished' &&
//                                 currency((contract.contract.amount + contract.contract.fees + contract.contract.interest) - contract.totalPaid)
//                               }
//                               {contract.contract.status !== 'Finished' &&
//                                 currency(contract.totalShouldBePaid - contract.totalPaid)
//                               }
//                             </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {Math.round(contract.percentagePaid * 100)}%
//                                                     </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {Math.round(contract.percentageBehind * 100)}%
//                                                     </TableCell>
//                             <TableCell className={tableCellClasses}>
//                               {currency(contract.totalTobePaid)}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </GridItem>
//                 </GridContainer>

//               </CardBody>
//             </Card>
//           </GridItem>
//         </GridContainer>
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
//   return {};
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(tasksStyle)(Today));