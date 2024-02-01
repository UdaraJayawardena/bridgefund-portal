
import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import Notifier from 'components/initiation/Notification/Notifier';

import LoanRequestList from './loanRequestList';

class SmeOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render () {

    return (
      <>
        <Notifier />
        <div>
          <LoanRequestList parentProps={this.props} />
        </div>
      </>
    );
  }
}

SmeOverview.propTypes = {
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = () => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(SmeOverview));

/***************/
