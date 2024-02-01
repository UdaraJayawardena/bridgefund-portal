// import React, { Component } from 'react';
// import PropTypes from "prop-types";
// // @material-ui/core
// import classnames from "classnames";
// import withStyles from "@material-ui/core/styles/withStyles";
// // core components
// import Card from "components/loanmanagement/Card/Card.jsx";
// import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
// import CardBody from "components/loanmanagement/Card/CardBody.jsx";
// import GridItem from "components/loanmanagement/Grid/GridItem.jsx";
// import GridContainer from "components/loanmanagement/Grid/GridContainer.jsx";
// import Table from '@material-ui/core/Table';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from "@material-ui/core/TableRow";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import TableSortLabel from '@material-ui/core/TableSortLabel';
// import TablePagination from '@material-ui/core/TablePagination';
// import Tooltip from '@material-ui/core/Tooltip';
// import Paper from '@material-ui/core/Paper';
// import tableStyle from "assets/jss/material-dashboard-react/components/tableStyle.jsx";

// import { connect } from 'react-redux';
// import {
//   // getAllCustomers,
//   customerDetails
// } from 'store/loanmanagement/actions/HeaderNavigation';

// import IconButton from "@material-ui/core/IconButton";
// import OpenInNew from "@material-ui/icons/OpenInNew";
// import { Link } from 'react-router-dom';

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
//   { id: 'accountNo', numeric: false, disablePadding: true, label: 'Account' },
//   { id: 'company', numeric: false, disablePadding: true, label: 'Company' },
//   { id: 'email', numeric: false, disablePadding: true, label: 'E-mail' },
//   { id: '', numeric: false, disablePadding: true, label: '' }
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

// class SmeList extends Component {

//   constructor(props) {
//     super(props)

//     this.state = {
//       value: 0,

//       order: 'asc',
//       orderBy: 'calories',
//       selected: [],

//       page: 0,
//       rowsPerPage: 25,

//       redirect: false,
//       redirectUrl: '',

//       customers: []
//     };
//   }

//   componentDidMount() {
//     // this.props.getAllCustomers();
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

//   render({ ...props }) {
//     const { classes, customers, selectedCustomer, tableHead, tableData, tableHeaderColor } = this.props;
//     const { order, orderBy, rowsPerPage, page } = this.state;

//     let filterCustomer = customers.filter(c => { return (c.id == selectedCustomer.id); })

//     let processedCustomers = []
//     if (filterCustomer.length > 0) {
//       processedCustomers = filterCustomer
//     } else {
//       processedCustomers = customers
//     }

//     return (
//       <GridContainer>
//         <GridItem xs={12} sm={12} md={12}>
//           <Card>
//             <CardHeader color="info">
//               <h4 className={classes.cardTitleWhite}>Customer List</h4>
//               <p className={classes.cardCategoryWhite}>
//                 Select a customer to view loan details
//               </p>
//             </CardHeader>

//             <CardBody>
//               <div className={classes.tableResponsive}>
//                 <Table className={classes.table}>
//                   <TableHead className={classes[tableHeaderColor + "primary"]}>
//                     <TableRow key={'tasks_header'} >
//                       {rows.map(
//                         row => (
//                           <TableCell
//                             key={row.id}
//                             align={row.numeric ? 'right' : 'left'}
//                             padding={row.disablePadding ? 'none' : 'default'}
//                             sortDirection={orderBy === row.id ? order : false}
//                           >
//                             <Tooltip
//                               title="Sort"
//                               placement={row.numeric ? 'bottom-end' : 'bottom-start'}
//                               enterDelay={300}
//                             >
//                               <TableSortLabel
//                                 active={orderBy === row.id}
//                                 direction={order}
//                                 onClick={this.handleRequestSort.bind(this, row.id)}
//                               >
//                                 {row.label}
//                               </TableSortLabel>
//                             </Tooltip>
//                           </TableCell>
//                         ),
//                         this,
//                       )}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {stableSort(processedCustomers, getSorting(order, orderBy))
//                       .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                       .map(customer => customer && (
//                         <TableRow key={customer._id} className={classes.tableRow}>

//                           <TableCell>
//                             {customer.accountNo}
//                           </TableCell>

//                           <TableCell>
//                             {customer.company}
//                           </TableCell>

//                           <TableCell>
//                             {customer.email}
//                           </TableCell>

//                           <TableCell>
//                             <Link to={`/user/userProfile/${customer.id}`} >
//                               <IconButton
//                                 className={classes.tableActionButton}
//                               >
//                                 <OpenInNew
//                                   className={
//                                     classes.tableActionButtonIcon + " " + classes.info
//                                   }
//                                 />
//                               </IconButton>
//                             </Link>
//                           </TableCell>

//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25]}
//                   component="div"
//                   count={customers.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   backIconButtonProps={{
//                     'aria-label': 'Previous Page',
//                   }}
//                   nextIconButtonProps={{
//                     'aria-label': 'Next Page',
//                   }}
//                   onChangePage={this.handleChangePage}
//                   onChangeRowsPerPage={this.handleChangeRowsPerPage}
//                 />
//               </div>
//             </CardBody>
//           </Card>
//         </GridItem>
//       </GridContainer>
//     );
//   }

// }

// SmeList.defaultProps = {
//   tableHeaderColor: "gray"
// };

// SmeList.propTypes = {
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
//     customers: state.lmglobal.customers,
//     selectedCustomer: state.lmglobal.customerDetails
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     // getAllCustomers: () => {
//     //   dispatch(getAllCustomers());
//     // }
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(tableStyle)(SmeList));