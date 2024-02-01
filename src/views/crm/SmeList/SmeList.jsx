// import React from "react";
import React from 'react';

import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
/**************/

// core components

import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Tooltip } from "@material-ui/core";
import VisibilityIcon from '@material-ui/icons/Visibility';

import { getCustomerList } from 'store/crm/actions/Customer.action';

// import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import customerDashboardStyles from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';
import { connect } from 'react-redux';
import { setSelectedCustomerId } from 'store/crm/actions/SmeOverview.action';
import { setHeaderDisplayMainData, setHeaderDisplaySubData, clearHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import history from "./../../../history";
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { clearAllLmGlobal } from 'store/initiation/actions/login';

class SmeList extends React.Component {

  componentDidMount() {
    this.props.getCustomerList();
  }

  redirectToCustomerOverview = (customerId) => {
    const { isDashboardContent } = this.props;
    
    if (!isDashboardContent) {    
      this.props.history.push(`customerOverview?customerId=${customerId}`);
      this.props.setSelectedCustomerId(customerId);
    } else {
      this.props.clearAllLmGlobal();
      this.props.setSelectedCustomerId(customerId);
      this.props.setNavigationInDashboards('SmeDetailView')
      .then(res => {
        if (res) {
          history.push(res);
          }
      });
    }

  };

  render() {
    const { classes, customerList } = this.props;

    return (
      <>
        {/* <Notifier /> */}
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHeadColor}>
              <TableRow>
                <TableCell className={classes.tableCell}>Company Name</TableCell>
                <TableCell className={classes.tableCell}>Legal Form</TableCell>
                <TableCell className={classes.tableCell}>Primary Contact</TableCell>
                <TableCell className={classes.tableCell}>Primary SBI</TableCell>
                <TableCell className={classes.tableCell}>COC ID</TableCell>
                <TableCell className={classes.tableCell}>Status</TableCell>
                <TableCell className={classes.tableCell}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerList.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className={classes.tableCell}>{customer.legalName}</TableCell>
                  <TableCell className={classes.tableCell}>{customer.legalForm}</TableCell>
                  <TableCell className={classes.tableCell}>{customer.primaryCustomerSuccessManager}</TableCell>
                  <TableCell className={classes.tableCell}>{customer.primarySbiCode}</TableCell>
                  <TableCell className={classes.tableCell}>{customer.cocId}</TableCell>
                  <TableCell className={classes.tableCell}>{customer.status}</TableCell>
                  <TableCell className={classes.tableCell}>
                    <Tooltip title='View Customer'>
                      <VisibilityIcon className={classes.visibilityIconButton} onClick={() => this.redirectToCustomerOverview(customer.id)} />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }
}

SmeList.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  customerList: PropTypes.array.isRequired,
  getCustomerList: PropTypes.func.isRequired,
  clearAllLmGlobal: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    customerList: state.customer.customerList,
    selectedDashboardItems: state.user.selectedDashboardItems,
    selectedTabIndex: state.user.selectedTabIndex,
    isDashboardContent: state.user.isDashboardContent
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getCustomerList: () => dispatch(getCustomerList()),
    setSelectedCustomerId: (id) => dispatch(setSelectedCustomerId(id)),
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),// dashboard Items change
    setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),// dashboard Items change
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),// dashboard Items change
    clearAllLmGlobal: () => dispatch(clearAllLmGlobal()),// dashboard Items change  
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(customerDashboardStyles)(SmeList));

/***************/
