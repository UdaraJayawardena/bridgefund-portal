import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Notifier from 'components/crm/Notification/Notifier';
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

class AdminDashboard extends React.Component {

  render() {

    return (
      <div>
        <Notifier />
        <h1>CRM Portal Admin Dashboard</h1>
      </div>
    );
  }
}

// AdminDashboard.propTypes = {
//   classes: PropTypes.object.isRequired
// };

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = () => {
  return {

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(AdminDashboard));

