import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from 'react';

import {
  Drawer, Dialog, Typography, createStyles, /* Paper, */ DialogContent, DialogTitle
} from '@material-ui/core';

import withStyles from '@material-ui/core/styles/withStyles';

import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import Notifier from 'components/loanmanagement/Notification/Notifier';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';

import Contracts from './Contracts';
import Mandates from './Mandates.jsx';
import CreateSmeLoanView from './CreateSmeLoan.jsx';
import TerminateContract from './TerminateContract';
import ManualCollection from './ManualCollection.jsx';
import TemporaryLoanStop from '../LoanTemporaryStop/LoanTemporaryStop';

import { getActiveLoanStopHistoryIsAvailableBySME, showHideTemporaryLoanStop } from 'store/loanmanagement/actions/SmeLoanTemporaryLoanStop';
import { changeCustomerDetails, clearSelectedCustomer, setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import { clearBicField, clearMandateError, deSelectMandate, showAddContact, showAddFlexContact, showAddTransaction, toggleAddNew, clearMandates } from 'store/loanmanagement/actions/Mandates';

import { requestSmeMandates } from 'store/loanmanagement/actions/SmeMandates';
import { requestSmeLoans, showTerminateSmeLoanModal } from 'store/loanmanagement/actions/SmeLoans';
import AddOrChangeFlexLoans from "components/loanmanagement/FlexLoans/AddOrChangeFlexLoans.jsx";
import { setDashbordNavigationStatus } from 'store/initiation/actions/login';
import SmeDetails from "../SingleLoanOverview/SmeDetails";
import { getCustomerByVTigerId } from "store/crm/actions/Customer.action";

const styles = createStyles({
  cardCategoryWhite: {
    color: 'rgba(255,255,255,.62)',
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '0'
  },
  cardTitleWhite: {
    color: '#FFFFFF',
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: 300,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none',
    textAlign: 'center'
  },
  fullList: {
    width: 'auto'
  }
});
class Overview extends Component {
  state = {
    top: false,
    left: false,
    bottom: false,
    right: false
  };

  findSelectedCustomer(customerId) {
    if (customerId) {
      this.props.getCustomerByVTigerId(customerId).then(customer => {
        const customerDetails = {
          ...customer,
          name: customer.firstName + ' ' + customer.lastName,
          email: customer.email,
          phone: customer.phone,
          id: customer.id,
          company: customer.company,
          firstName: customer.firstName,
          isNeedSyncToAWS: customer.isNeedSyncToAWS,
        };

        this.props.changeCustomerInformation(customerDetails);
        this.props.setHeaderDisplaySubData(` - ${customer.company} `);
      });
    }
  }

  getInitialData() {
    const customerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : this.props.match.params.customerId; //
    this.props.getContractsOnClick(customerId);
    if(customerId) this.props.getMandatesOnClick(customerId);
    this.props.getActiveLoanStopHistoryIsAvailableBySME(customerId);
    this.props.deSelectMandate();
    this.props.clearMandateError();
    this.props.clearBicField();
  }
  componentDidUpdate(prevProps) {
    window.onpopstate = (e) => {
      this.props.setDashbordNavigationStatus(true);
    };
    const preCustomerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : prevProps.match.params.customerId;//
    const customerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : this.props.match.params.customerId;//
    this.findSelectedCustomer(customerId);
    if (preCustomerId !== customerId) {
      this.getInitialData();
      // close mandate if open
      if (this.props.isMandateOpen) {
        this.props.toggleAddNewMandate();
      }
    }
  }
  componentDidMount() {
    // console.log('didmount ', this.props.lmCustomerSysId);
    const customerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : this.props.match.params.customerId;//
    // this.props.clearSelectedCustomer();
    this.getInitialData();
    this.findSelectedCustomer(customerId);
  }
  // componentWillUnmount() {
  //   this.props.clearSelectedCustomer();
  //   this.getInitialData();

  //   // this.props.clearContracts()
  //   this.props.clearMandates();
  // }

  toggleDrawer = (container, side, open) => () => {

    this.setState({
      [side]: open
    }, () => {

      switch (container) {
        case 'contract':
          this.props.showHideAddContract();
          break;
        case 'flex-contract':
          this.props.showHideFlexContactSection();
          break;
        case 'collection':
          this.props.showHideAddTransaction();
          break;
        case 'terminateContract':
          this.props.showHideTerminateContract();
          break;
        case 'temporaryLoanStop':
          this.props.showHideTemporaryLoanStop();
          break;
        default:
          break;
      }

    });

  };

  render() {
    const {
      showAddContracts,
      showTerminateSmeLoanModal,
      showAddTransactions,
      showTemporaryLoanStop,
      showAddFlexContracts,
      selectedSmeName,
      isDashboardContent,

    } = this.props;
    const customerIdFormParams = this.props.match?.params?.customerId ? this.props.match.params.customerId : this.props.lmCustomerSysId; //  
    return (
      <div>
        {/* <Notifier /> */}
        {!isDashboardContent ?
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <CardHeader color="info" >
                <Typography variant="h5" color='inherit'>
                  {selectedSmeName}
                </Typography>
              </CardHeader>
            </GridItem>
          </GridContainer>
          :
          false
        }

        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <SmeDetails />
          </GridItem>
        </GridContainer>
        
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Mandates />
          </GridItem>
        </GridContainer>

        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Contracts />
          </GridItem>
        </GridContainer>

        <Dialog
          id="add-contract-dialog"
          maxWidth={'lg'}
          open={showAddContracts}
          onClose={this.toggleDrawer('contract', 'bottom', false)}
        >
          <CreateSmeLoanView toggleDrawer={this.toggleDrawer('contract', 'bottom', false)} />
        </Dialog>

        <Drawer
          id="manual-collection-drawer"
          anchor="bottom"
          open={showAddTransactions}
          onClose={this.toggleDrawer('collection', 'bottom', false)}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <ManualCollection key="manual-collection-drawer" toggleDrawer={this.toggleDrawer('collection', 'bottom', false)} />
          </div>
        </Drawer>

        <Drawer
          id="terminate-contract-drawer"
          anchor="bottom"
          open={showTerminateSmeLoanModal}
          onClose={this.toggleDrawer('terminateContract', 'bottom', false)}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <TerminateContract key="terminate-contract-component" toggleDrawer={this.toggleDrawer('terminateContract', 'bottom', false)} />
          </div>
        </Drawer>

        <Drawer
          id="temporary-loan-stop-drawer"
          anchor="bottom"
          open={showTemporaryLoanStop}
          onClose={this.toggleDrawer('temporaryLoanStop', 'bottom', false)}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <TemporaryLoanStop key="temporary-loan-stop-drawer" toggleDrawer={this.toggleDrawer('temporaryLoanStop', 'bottom', false)} selectedLoan={this.props.selectedLoan} />
          </div>
        </Drawer>

        <Dialog
          id="flex-loan-dialog"
          maxWidth={'lg'}
          open={showAddFlexContracts}
          onClose={this.toggleDrawer('flex-contract', 'bottom', false)}
          fullWidth={true}
        >
          <DialogTitle id="flex-loan-withdrawal-title">Flex Loan</DialogTitle>
          <DialogContent>
            {/* <Paper square style={{ marginTop: '2%', padding: '1%' }}> */}
            <AddOrChangeFlexLoans key="flex-loan-component" toggleDrawer={this.toggleDrawer('flex-contract', 'bottom', false)} customerId={customerIdFormParams} />
            {/* </Paper> */}
          </DialogContent>
        </Dialog>

      </div>
    );
  }
}


Overview.propTypes = {
  classes: PropTypes.object,
  match: PropTypes.object,
  selectedLoan: PropTypes.object,
  selectedSmeName: PropTypes.string,
  isMandateOpen: PropTypes.bool,
  showAddContracts: PropTypes.bool,
  showAddFlexContracts: PropTypes.bool,
  showAddTransactions: PropTypes.bool,
  showTemporaryLoanStop: PropTypes.bool,
  showTerminateSmeLoanModal: PropTypes.bool,
  clearMandates: PropTypes.func.isRequired,
  clearBicField: PropTypes.func.isRequired,
  deSelectMandate: PropTypes.func.isRequired,
  clearMandateError: PropTypes.func.isRequired,
  getMandatesOnClick: PropTypes.func.isRequired,
  toggleAddNewMandate: PropTypes.func.isRequired,
  showHideAddContract: PropTypes.func.isRequired,
  getContractsOnClick: PropTypes.func.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  showHideAddTransaction: PropTypes.func.isRequired,
  showHideFlexContactSection: PropTypes.func.isRequired,
  showHideTerminateContract: PropTypes.func.isRequired,
  changeCustomerInformation: PropTypes.func.isRequired,
  showHideTemporaryLoanStop: PropTypes.func.isRequired,
  getActiveLoanStopHistoryIsAvailableBySME: PropTypes.func.isRequired,
  lmCustomerSysId: PropTypes.string,
  setHeaderDisplaySubData: PropTypes.func.isRequired,
  setDashbordNavigationStatus: PropTypes.func,
  getCustomerByVTigerId: PropTypes.func
};

const mapStateToProps = state => {
  return {
    showAddContracts: state.mandates.showAddContracts,
    showAddFlexContracts: state.mandates.showAddFlexContracts,
    showTerminateSmeLoanModal: state.smeLoans.showTerminateSmeLoanModal,
    showAddTransactions: state.mandates.showAddTransactions,
    isMandateOpen: state.mandates.addingNewMandate,
    showTemporaryLoanStop: state.loanStopHistory.showTemporaryLoanStop,
    selectedLoan: state.lmglobal.selectedLoan,
    selectedSmeName: state.lmglobal.customerDetails.company,
    isDashboardContent: state.user.isDashboardContent,
    lmCustomerSysId: state.lmglobal.customerDetails.id,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showHideAddTransaction: () => {
      dispatch(showAddTransaction());
    },
    showHideAddContract: () => {
      dispatch(showAddContact());
    },
    showHideFlexContactSection: () => {
      dispatch(showAddFlexContact());
    },
    showHideTerminateContract: () => {
      dispatch(showTerminateSmeLoanModal());
    },
    getContractsOnClick: customerId => {
      dispatch(requestSmeLoans(customerId));
    },
    getMandatesOnClick: customerId => {
      dispatch(requestSmeMandates(customerId));
    },
    deSelectMandate: () => {
      dispatch(deSelectMandate());
    },
    clearMandateError: () => {
      dispatch(clearMandateError());
    },
    clearBicField: () => {
      dispatch(clearBicField());
    },
    changeCustomerInformation: customerDetails => {
      dispatch(changeCustomerDetails(customerDetails));
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    toggleAddNewMandate: () => {
      dispatch(toggleAddNew());
    },
    showHideTemporaryLoanStop: () => {
      dispatch(showHideTemporaryLoanStop());
    },
    getActiveLoanStopHistoryIsAvailableBySME: SME_Id => {
      dispatch(getActiveLoanStopHistoryIsAvailableBySME(SME_Id));
    },
    clearMandates: () => {
      dispatch(clearMandates());
    },
    setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
    setDashbordNavigationStatus: (status) => dispatch(setDashbordNavigationStatus(status)),
    getCustomerByVTigerId: (vTigerAccountNumber) => dispatch(getCustomerByVTigerId(vTigerAccountNumber)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Overview));
