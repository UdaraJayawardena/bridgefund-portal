import React, { Component } from 'react';
import PropTypes from "prop-types";
// @material-ui/core
import withStyles from "@material-ui/core/styles/withStyles";
// core components
import Card from "components/loanmanagement/Card/Card.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import GridItem from "components/loanmanagement/Grid/GridItem.jsx";
import GridContainer from "components/loanmanagement/Grid/GridContainer.jsx";
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TablePagination from '@material-ui/core/TablePagination';
import Tooltip from '@material-ui/core/Tooltip';
import { connect } from 'react-redux';
import IconButton from "@material-ui/core/IconButton";
import { Link } from 'react-router-dom';
import PermContactCalendar from '@material-ui/icons/PermContactCalendar';
import { Grid, TableContainer, Paper } from '@material-ui/core';
import LoadingOverlay from 'react-loading-overlay';

import { changeCustomerDetails, clearHeaderDisplaySubData, clearSelectedCustomer, setHeaderDisplaySubData } from "store/loanmanagement/actions/HeaderNavigation";
import customerDashboardStyles from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';
import { displayNotification } from 'store/initiation/actions/Notifier';

import history from "./../../../history";
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { clearCalculatedDataOfLoanTransactions } from "store/loanmanagement/actions/SmeLoans";
import { getCustomerListPerPage, searchCustomer } from 'store/crm/actions/Customer.action';
import CustomSearch from 'components/crm/CustomInput/CustomSearch';


/*** sort functionality */
function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  { id: 'accountNo', numeric: false, disablePadding: false, label: 'Account' },
  { id: 'company', numeric: false, disablePadding: false, label: 'Company' },
  { id: 'email', numeric: false, disablePadding: false, label: 'E-mail' },
  { id: 'profile', numeric: false, disablePadding: false, label: 'Profile' },
];

class SmeList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value: 0,

      order: 'asc',
      orderBy: 'calories',
      selected: [],

      page: 0,
      rowsPerPage: 25,
      totalCustomerCount: 0,

      redirect: false,
      redirectUrl: '',

      companyNameInputValue: '',
      searchedCustomers: [],
      searchedCustomersList: [],
      selectedCustomer: null,
      pageLoading: false
    };
  }

  componentDidMount() {
    // this.props.clearSelectedCustomer();
    // this.props.clearCalculatedDataOfLoanTransactions();
    this.handleChangePage('', this.state.page);
  }

  componentDidUpdate(prevProps, prevState) {

  //  if (prevState.searchedCustomers.length !== this.props.customers.length && this.state.searchedCustomers.length !== 1) {
  //    this.setState({ searchedCustomers: this.props.customers });
  //  }
 }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  handleRequestSort = (property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleChangePage = (event, page) => {

    if(page < 0) return;
    
    this.setState({ page, pageLoading: true }, () => {
     this.handleGetCustomerListPerPage()
     .then((res) => {
      const {customersList, metaData} = res;
      this.setState({ totalCustomerCount: metaData.totalCount, searchedCustomers: customersList, pageLoading: false });
      })
      .catch( () => {
       this.setState({  pageLoading: false });
      }
     );
    });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value, pageLoading: true }, () => {
     this.handleGetCustomerListPerPage()
     .then((res) => {
      const {customersList} = res;
      this.setState({ searchedCustomers: customersList, pageLoading: false });
      })
     .catch( () => {
       this.setState({  pageLoading: false });
      }
     );
    });
  };

  get handleGetCustomerListPerPage () {
    return getCustomerListPerPage(this.state.rowsPerPage, this.state.page + 1 );
  }

  get handleSearchCustomerListPerPage () {

    const key = "legalName";
    const value = this.state.companyNameInputValue;
    const criteria = '';
    const customerId = '';
    const option = '';    
    return searchCustomer(key, value, criteria, customerId, option);
  }

  get handleSearchCustomer () {
   return getCustomerListPerPage(this.state.rowsPerPage, this.state.page, this.state.selectedCustomer ); 
  }

  redirectToCustomerProfile = (customer) => {
    this.props.changeCustomerDetails(customer);
    this.props.setHeaderDisplaySubData(` - ${customer.company}`);
    this.props.setNavigationInDashboards('Overview')
      .then(res => {
        if (res) {
          history.push(res);
        }
      });

  };

  handleCustomerSelection = (selectedCustomer) => {
    if (selectedCustomer) {
     this.setState({selectedCustomer, pageLoading: true}, () => {
       this.handleSearchCustomer()
       .then(res => {
        const { customersList } = res;
        this.setState({ searchedCustomers: customersList, pageLoading: false }); 
       });
      }); 
    }
    return;

  }

  render() {
    const { classes, tableHeaderColor, isDashboardContent } = this.props;
    const { order, orderBy, rowsPerPage, page, companyNameInputValue, searchedCustomers, pageLoading, totalCustomerCount } = this.state;


    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item>
                  {'Select a SME to view loan details'}
                </Grid>
                <Grid item xs={5}> 
                  <CustomSearch
                     id='company-name-search'
                     placeholder='Company name'
                     changeToFormatType='FirstCap'
                     name='legalName'
                     value={companyNameInputValue}

                     onSearchResult={newValue => {
                       if (newValue) {
                         this.handleCustomerSelection(newValue);
                       }
                       else {
                         this.handleCustomerSelection('');
                       }
                     }}
                     onChange={(event, newInputValue) => {                       
                      if(!newInputValue || newInputValue ===''){
                       this.setState({ companyNameInputValue: '' });
                       return;
                      }
                       this.setState({ companyNameInputValue: newInputValue });
                     }}
                     asyncSearchType='customer'
                   />
                </Grid>
              </Grid>


            </CardHeader>

            <CardBody>
              <div>
                <TableContainer component={Paper} className={classes.tableContainer}>
                <LoadingOverlay
                     // @ts-ignore
                     id="loader-overlay"
                     active={pageLoading}
                     spinner
                     text='Loading Customers List...'>
                     <Table className={classes.table}>
                       <TableHead className={classes[tableHeaderColor + "primary"]}>
                         <TableRow key={'tasks_header'} >
                           {rows.map(
                             row => (
                               <TableCell
                                 key={row.id}
                                 align={row.numeric ? 'right' : 'left'}
                                 padding={row.disablePadding ? 'none' : 'default'}
                                 // @ts-ignore
                                 sortDirection={orderBy === row.id ? order : false}
                               >
                                 <Tooltip
                                   title="Sort"
                                   placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                   enterDelay={300}
                                 >
                                   <TableSortLabel
                                     active={orderBy === row.id}
                                     // @ts-ignore
                                     direction={order}
                                     onClick={this.handleRequestSort.bind(this, row.id)}
                                   >
                                     {row.label}
                                   </TableSortLabel>
                                 </Tooltip>
                               </TableCell>
                             ),
                             this,
                           )}
                         </TableRow>
                       </TableHead>
                       <TableBody>
                         {stableSort(searchedCustomers, getSorting(order, orderBy))
                           .map(customer => customer && (
                             <TableRow key={customer.id}>

                               <TableCell className={classes.tableCell}>
                                 {customer.accountNo}
                               </TableCell>

                               <TableCell className={classes.tableCell}>
                                {customer.company}
                               </TableCell>

                               <TableCell className={classes.tableCell}>
                                 {customer.email}
                               </TableCell>

                               <TableCell className={classes.tableCell}>
                                 {isDashboardContent ?
                                   <IconButton
                                     className={classes.tableActionButton}
                                     id={"SMEProfile_" + customer.id}
                                     onClick={() => this.redirectToCustomerProfile(customer)}
                                   >
                                     <PermContactCalendar
                                       className={
                                         classes.tableActionButtonIcon + " " + classes.info
                                       }
                                     />
                                   </IconButton>
                                   :
                                   <Link to={`/user/smeProfile/${customer.id}`} >
                                     <IconButton
                                       className={classes.tableActionButton}
                                       id={"SMEProfile_" + customer.id}
                                     >
                                       <PermContactCalendar
                                         className={
                                           classes.tableActionButtonIcon + " " + classes.info
                                         }
                                       />
                                     </IconButton>
                                   </Link>}
                               </TableCell>

                             </TableRow>
                           ))}
                       </TableBody>
                     </Table>
                  </LoadingOverlay>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={totalCustomerCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  backIconButtonProps={{
                    'aria-label': 'Previous Page',
                    disabled: this.state.pageLoading
                  }}
                  nextIconButtonProps={{
                    'aria-label': 'Next Page',
                    disabled: this.state.pageLoading
                  }}
                  onPageChange={this.handleChangePage}
                  onRowsPerPageChange={this.handleChangeRowsPerPage}
                  SelectProps={{
                   disabled: this.state.pageLoading
                 }}
                />
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    );
  }

}

SmeList.defaultProps = {
  tableHeaderColor: "gray"
};

SmeList.propTypes = {
  classes: PropTypes.object.isRequired,
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray"
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  selectedCustomer: PropTypes.object,
  clearSelectedCustomer: PropTypes.func.isRequired,
  selectedDashboardItems: PropTypes.array,
  selectedTabIndex: PropTypes.string,
  isDashboardContent: PropTypes.bool,
  setHeaderDisplaySubData: PropTypes.func,
  changeCustomerDetails: PropTypes.func,
  clearCalculatedDataOfLoanTransactions: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    selectedCustomer: state.lmglobal.customerDetails,
    selectedDashboardItems: state.user.selectedDashboardItems,
    selectedTabIndex: state.user.selectedTabIndex,
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
    changeCustomerDetails: (customer) => dispatch(changeCustomerDetails(customer)),
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
    clearCalculatedDataOfLoanTransactions: () => dispatch(clearCalculatedDataOfLoanTransactions()),
    getCustomerListPerPage: (perPage, pageNumber) => dispatch(getCustomerListPerPage(perPage, pageNumber)),
    searchCustomer: (key, value, criteria, customerId, option) => dispatch(searchCustomer(key, value, criteria, customerId, option)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(customerDashboardStyles)(SmeList));