// import React, { Component } from 'react';
// import PropTypes from "prop-types";
// // @material-ui/core
// import withStyles from "@material-ui/core/styles/withStyles";
// // core components
// import Card from "components/Card/Card.jsx";
// import CardHeader from "components/Card/CardHeader.jsx";
// import CardBody from "components/Card/CardBody.jsx";
// import GridItem from "components/Grid/GridItem.jsx";
// import GridContainer from "components/Grid/GridContainer.jsx";
// import Table from '@material-ui/core/Table';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from "@material-ui/core/TableRow";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import TableSortLabel from '@material-ui/core/TableSortLabel';
// import TablePagination from '@material-ui/core/TablePagination';
// import Tooltip from '@material-ui/core/Tooltip';
// import tableStyle from "assets/jss/material-dashboard-react/components/tableStyle.jsx";
// import { connect } from 'react-redux';
// import IconButton from "@material-ui/core/IconButton";
// import { Link } from 'react-router-dom';
// import AccountBalance from '@material-ui/icons/AccountBalance';
// import PermContactCalendar from '@material-ui/icons/PermContactCalendar';
// import Notifier from "../../components/Notification/Notifier";
// import AutoSuggest from "components/Navbars/IntegrationAutosuggest.jsx"

// import moment from 'moment';
// import Utility from '../../lib/utility';

// import { requestUnidentifiedPayments, showHideSavePopup } from '../../store/actions/unidentifiedPayments';
// import DeleteSweep from '@material-ui/icons/DeleteSweep';
// import Save from '@material-ui/icons/Save';
// import CreateDirectDebit from './CreateDirectDebit.jsx';

// import Drawer from '@material-ui/core/Drawer';

// import ConfirmationDialog from "components/ConfirmationDialog/ConfirmationDialog.jsx"

// import { ignorePayment } from "../../store/actions/unidentifiedPayments";

// const currency = Utility.currencyConverter();

// /*** sort functionality */
// function desc(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function stableSort(array, cmp) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = cmp(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   return stabilizedThis.map(el => el[0]);
// }

// function getSorting(order, orderBy) {
//   return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
// }

// const rows = [
//   { id: 'customerName', numeric: false, disablePadding: false, label: 'Customer' },
//   { id: 'message', numeric: false, disablePadding: false, label: 'Message' },
//   { id: 'date', numeric: false, disablePadding: false, label: 'Payment Date' },
//   { id: 'totalAmount', numeric: false, disablePadding: false, label: 'Total Amount' },
//   { id: 'Ignore', numeric: false, disablePadding: false, label: 'Info' },
//   { id: 'Save', numeric: false, disablePadding: false, label: 'Save' }
// ];

// const styles = {
//   cardCategoryWhite: {
//     "&,& a,& a:hover,& a:focus": {
//       color: "rgba(255,255,255,.62)",
//       margin: "0",
//       fontSize: "14px",
//       marginTop: "0",
//       marginBottom: "0"
//     },
//     "& a,& a:hover,& a:focus": {
//       color: "#FFFFFF"
//     }
//   },
//   cardTitleWhite: {
//     color: "#FFFFFF",
//     marginTop: "0px",
//     minHeight: "auto",
//     fontWeight: "300",
//     fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
//     marginBottom: "3px",
//     textDecoration: "none",
//     "& small": {
//       color: "#777",
//       fontSize: "65%",
//       fontWeight: "400",
//       lineHeight: "1"
//     }
//   }

// };

// class UnIdentifiedDirectDebits extends Component {

//   constructor(props) {
//     super(props)

//     this.state = {
//       value: 0,

//       order: 'asc',
//       orderBy: 'customerName',
//       selected: [],

//       page: 0,
//       rowsPerPage: 15,

//       redirect: false,
//       redirectUrl: '',

//       top: false,
//       left: false,
//       bottom: false,
//       right: false,

//       paymentId: ''
//     };
//   }

//   componentDidMount() {
//     this.props.getAllUnIdentifiedPayments();
//   }

//   handleChange = (event, value) => {
//     this.setState({ value });
//   };

//   handleChangeIndex = index => {
//     this.setState({ value: index });
//   };

//   handleRequestSort = (property, event) => {
//     const orderBy = property;
//     let order = 'desc';

//     if (this.state.orderBy === property && this.state.order === 'desc') {
//       order = 'asc';
//     }

//     this.setState({ order, orderBy });
//   };

//   handleChangePage = (event, page) => {
//     this.setState({ page });
//   };

//   handleChangeRowsPerPage = event => {
//     this.setState({ rowsPerPage: event.target.value });
//   };

//   toggleDrawer = (id) => {
//     if (id) {
//       this.props.showHideSavePopup();
//       this.setState({
//         paymentId: id
//       });
//     }
//   };

//   handleIgnoreClick = (id) => {
//     this.setState({
//       paymentId: id,
//       displayConfirmation: true
//     })
//   }

//   onIgnoreConfirm = (value) => {
//     if (value) {
//       this.props.ignorePayment(this.state.paymentId)
//     }
//     this.setState({
//       displayConfirmation: !this.state.displayConfirmation
//     })
//   }

//   render({ ...props }) {
//     const { classes, customers, selectedCustomer, tableHead, tableData, tableHeaderColor, unIdentifiedPayments, showCreateDirectDebit } = this.props;
//     const { order, orderBy, rowsPerPage, page } = this.state;
//     return (
//       <div>
//         <Notifier />
//         <GridContainer>
//           <GridItem xs={12} sm={12} md={12}>
//             <Card>
//               <CardHeader color="info">
//                 Un-Identified Direct Debits can be Ignored or Save as a Direct Debit after clarify.
//               </CardHeader>

//               <CardBody>
//                 <div className={classes.tableResponsive}>
//                   <Table className={classes.table}>
//                     <TableHead className={classes[tableHeaderColor + "primary"]}>
//                       <TableRow key={'tasks_header'} >
//                         {rows.map(
//                           row => (
//                             <TableCell
//                               key={row.id}
//                               align={row.numeric ? 'right' : 'left'}
//                               padding={row.disablePadding ? 'none' : 'default'}
//                               sortDirection={orderBy === row.id ? order : false}
//                             >
//                               <Tooltip
//                                 title="Sort"
//                                 placement={row.numeric ? 'bottom-end' : 'bottom-start'}
//                                 enterDelay={300}
//                               >
//                                 <TableSortLabel
//                                   active={orderBy === row.id}
//                                   direction={order}
//                                   onClick={this.handleRequestSort.bind(this, row.id)}
//                                 >
//                                   {row.label}
//                                 </TableSortLabel>
//                               </Tooltip>
//                             </TableCell>
//                           )
//                         )}
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {stableSort(unIdentifiedPayments, getSorting(order, orderBy))
//                         .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                         .map(payment => payment && (
//                           <TableRow key={payment._id} className={classes.tableRow}>

//                             <TableCell>
//                               {payment.customerName}
//                             </TableCell>

//                             <TableCell>
//                               {payment.message}
//                             </TableCell>

//                             <TableCell>
//                               {moment(payment.date).format('YYYY-MM-DD')}
//                             </TableCell>

//                             <TableCell>
//                               {currency(payment.totalAmount)}
//                             </TableCell>

//                             <TableCell>
//                               <IconButton
//                                 className={classes.tableActionButton}
//                                 onClick={() => this.handleIgnoreClick(payment._id)}
//                               >
//                                 <DeleteSweep
//                                   className={
//                                     classes.tableActionButtonIcon + " " + classes.info
//                                   }
//                                 />
//                               </IconButton>
//                             </TableCell>

//                             <TableCell>
//                               <IconButton
//                                 className={classes.tableActionButton}
//                                 onClick={() => this.toggleDrawer(payment._id)}
//                               >
//                                 <Save
//                                   className={
//                                     classes.tableActionButtonIcon + " " + classes.info
//                                   }
//                                 />
//                               </IconButton>
//                             </TableCell>

//                           </TableRow>
//                         ))}
//                     </TableBody>
//                   </Table>
//                   <TablePagination
//                     rowsPerPageOptions={[5, 10, 25]}
//                     component="div"
//                     count={unIdentifiedPayments.length}
//                     rowsPerPage={rowsPerPage}
//                     page={page}
//                     backIconButtonProps={{
//                       'aria-label': 'Previous Page',
//                     }}
//                     nextIconButtonProps={{
//                       'aria-label': 'Next Page',
//                     }}
//                     onChangePage={this.handleChangePage}
//                     onChangeRowsPerPage={this.handleChangeRowsPerPage}
//                   />
//                 </div>
//               </CardBody>
//             </Card>
//           </GridItem>
//         </GridContainer>

//         <Drawer
//           anchor="bottom"
//           open={showCreateDirectDebit}
//           onClose={() => this.props.showHideSavePopup()}
//         >
//           <div
//             tabIndex={0}
//             role="button"
//           >
//             <CreateDirectDebit id={this.state.paymentId} />
//           </div>
//         </Drawer>

//         {/*Confirmation Dialog*/}
//         {this.state.displayConfirmation ?
//           <ConfirmationDialog title='Ignore ?'
//             content={'Do you want to Ignore this un-identified record permanently ?'}
//             cancel={<span style={{ textTransform: 'uppercase' }}>NO</span>}
//             ok={<span style={{ textTransform: 'uppercase' }}>YES</span>}
//             open={this.state.displayConfirmation}
//             handleOk={() => this.onIgnoreConfirm(true)}
//             handleCancel={() => this.onIgnoreConfirm(false)} /> : ''
//         }
//       </div>
//     );
//   }

// }

// UnIdentifiedDirectDebits.defaultProps = {
//   tableHeaderColor: "gray"
// };

// UnIdentifiedDirectDebits.propTypes = {
//   classes: PropTypes.object.isRequired,
//   tableHeaderColor: PropTypes.oneOf([
//     "warning",
//     "primary",
//     "danger",
//     "success",
//     "info",
//     "rose",
//     "gray"
//   ]),
//   tableHead: PropTypes.arrayOf(PropTypes.string),
//   tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
// };

// const mapStateToProps = state => {
//   return {
//     loanDetails: state.dashboardLoanDetails.loanDetails,
//     error: state.dashboardLoanDetails.error,
//     events: state.dashboardLoanDetails.events,
//     unIdentifiedPayments: state.unidentifiedPayments.payments,
//     showCreateDirectDebit: state.unidentifiedPayments.savePopupShow
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     getAllUnIdentifiedPayments: () => {
//       dispatch(requestUnidentifiedPayments());
//     },

//     showHideSavePopup: () => {
//       dispatch(showHideSavePopup());
//     },

//     ignorePayment: paymentId => {
//       dispatch(ignorePayment(paymentId));
//     },
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(tableStyle)(UnIdentifiedDirectDebits));