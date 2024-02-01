import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';

import Notifier from 'components/initiation/Notification/Notifier';
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import CreditManagementDashBoard from 'views/initiation/CreditManagement';


class Dashboard extends Component {

  render() {
    return (
      <div>
        <Notifier />
        <CreditManagementDashBoard />
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProp = () => ({
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(Dashboard));