import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";

import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Notifier from 'components/loanmanagement/Notification/Notifier';
import Messages from "views/loanmanagement/SingleLoanOverview/Messages";
import SmeDetailView from "views/loanmanagement/SingleLoanOverview/SmeDetails";
import TransactionsView from "views/loanmanagement/SingleLoanOverview/Transactions";
import LoanBurnDown from "views/loanmanagement/SingleLoanOverview/LoanBurnDown";
import ManualPayments from "views/loanmanagement/SingleLoanOverview/ManualPayments";
import LoanRecoveryAppointment from "views/loanmanagement/LoanRecoveryAppointment/SmeLoanRecoveryAppointment";
import AddOrChangeFlexLoans from "components/loanmanagement/FlexLoans/AddOrChangeFlexLoans.jsx";
import SingleFlexLoanOverview from "components/loanmanagement/FlexLoans/SingleFlexLoanOverview.jsx";

import customStyles from 'assets/jss/material-dashboard-react/customStyles';
import WithdrawalOverview from 'components/loanmanagement/FlexLoans/WithdrawalOverview';
import { Typography } from '@material-ui/core';
import { getAllFlexloans } from 'store/loanmanagement/actions/FlexLoan.action';

const ORIGIN = "SingleLoanOverview";
class FlexLoanOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      activeTabId: 0,
      contractId: null,
    };
  }

  componentDidMount() {
    // const { params } = this.props.match;
    const urlContractId = (document.location.origin + document.location.pathname).split('flexLoanOverview/')[1];
    const contractId = urlContractId ? urlContractId : null;

    if (contractId) this.setState({ contractId: contractId, activeTabId: 1 });
    this.props.getAllFlexloans();
  }

  handleTabChanges = (event, tabNumber) => {
    if (this.state.activeTabId !== tabNumber) this.setState({ activeTabId: tabNumber });
  }

  handleContractIdChange = (contractId) => {
    this.setState({ contractId });
  }
  getTabNameByIndex = (index) => {
    if (index === 0) {
      return 'Conditions';
    }
    else if (index === 1) {
      return 'Loan Overview';
    }
    else if (index === 2) {
      return 'Withdrawals';
    }
    else if (index === 3) {
      return 'Transactions';
    }
    else if (index === 4) {
      return 'Sme Details';
    }
    else if (index === 5) {
      return 'Appointments';
    }
    else if (index === 6) {
      return 'Messages';
    }
    else if (index === 7) {
      return 'Manual';
    }
    return 'Loan Burn Down Sheet';
  };


  render() {

    const { activeTabId, contractId } = this.state;
    const { smeDetails } = this.props;
    const customerName = contractId ? ` - ${smeDetails.company} - ${contractId}` : '';

    return (
      <React.Fragment>
        <Notifier />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
          <div>
            <Typography variant="h4" style={{ paddingTop: 20, paddingBottom: 20 }}>{this.getTabNameByIndex(activeTabId) + customerName}</Typography>
          </div>
        </div>
        <Tabs
          value={activeTabId}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleTabChanges}
          variant="scrollable"
          scrollButtons="off"
          aria-label='flex-tabs'
        >
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Conditions" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Loan Overview" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Withdrawals" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Transactions" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Sme Details" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Appointments" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Messages" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Manual" />
          <Tab style={{ minWidth: '100px', marginLeft: '0px', paddingLeft: '0px', paddingRight: '20px' }} label="Loan Burn Down Sheet" />
        </Tabs>

        <Paper square style={{ marginTop: '2%', padding: '1%' }}>

          {
            activeTabId === 0 ? <AddOrChangeFlexLoans contractId={this.state.contractId} /> : null
          }

          {
            activeTabId === 1 ? <SingleFlexLoanOverview contractId={this.state.contractId} handleContractIdChange={this.handleContractIdChange}/> : null
          }

          {
            activeTabId === 2 ? <WithdrawalOverview contractId={this.state.contractId} /> : null
          }

          {
            activeTabId === 3 ? <TransactionsView /> : null
          }

          {
            activeTabId === 4 ? <SmeDetailView /> : null
          }

          {
            activeTabId === 5 ? <LoanRecoveryAppointment origin={ORIGIN} loanId={this.props.loan._id} /> : null
          }

          {
            activeTabId === 6 ? <Messages selectedContractId={this.props.loan.contractId} /> : null
          }

          {
            activeTabId === 7 ? <ManualPayments contractId={this.state.contractId} /> : null
          }

          {
            activeTabId === 8 ? <LoanBurnDown loan={this.props.loan} smeLoanHistories={this.props.smeLoanHistories} directdebits={this.props.directdebits} /> : null
          }

        </Paper>

      </React.Fragment>
    );
  }
}

FlexLoanOverview.propTypes = {
  classes: PropTypes.object,
  match: PropTypes.object,
  loan: PropTypes.object,
  smeDetails: PropTypes.object,
  smeLoanHistories: PropTypes.array,
  directdebits: PropTypes.array,
  getAllFlexloans: PropTypes.func,
};

const mapStateToProps = (state) => ({
  loan: state.lmglobal.selectedLoan,
  smeDetails: state.lmglobal.customerDetails,
  smeLoanHistories: state.smeLoanHistory.smeloanhistories,
  directdebits: state.smeLoanTransaction.directdebits,
});

const mapDispatchToProps = (dispatch) => {
  return {
    getAllFlexloans: () => dispatch(getAllFlexloans())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(FlexLoanOverview));