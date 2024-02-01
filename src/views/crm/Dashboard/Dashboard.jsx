import React from 'react';
import { connect } from 'react-redux';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';

import Notifier from '../../components/Notification/Notifier';
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  render() {

    return (
      <div>
        <Notifier />
        <h1>CRM Portal User Dashboard</h1>
      </div>
    );
  }
}

Dashboard.propTypes = {
};

const mapStateToProp = () => ({
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(Dashboard));