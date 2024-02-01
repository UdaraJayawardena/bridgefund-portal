import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';
import { Fab, Badge } from '@material-ui/core';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import CreditManagementCharts from "views/initiation/CreditManagement/Charts/CreditManagementCharts";
import Overview from "views/loanmanagement/Overview/Overview.jsx";

class ReservedDashboardItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {    
    };
  }

  handleComponentType = (type) => {

      // eslint-disable-next-line default-case
      switch (type) {
        case 'Profile': {
          return <><Overview/></>;
        }
        case 'Graphs': {
          return <><CreditManagementCharts/></>;
        }
      }
    
  }

  render() {
      const {reservedDashboard,classes } =this.props;
        return (
      <div>
          {/* <Fab variant='extended' className={classes.saveChangesBtn} ><Badge  color="primary"></Badge>&nbsp;&nbsp;Back</Fab> */}
        {this.handleComponentType(reservedDashboard)}
      </div>
    );
  }
}

ReservedDashboardItem.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapStateToProp = (state) => ({
    reservedDashboard: state.user.reservedDashboard,
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(ReservedDashboardItem));