
import React from 'react';
import qs from "querystring";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import Notifier from 'components/crm/Notification/Notifier';
import { Tabs, Tab, Typography, Button } from '@material-ui/core';

import SmeDetailView from './SmeOverview';
import PersonDetailView from './PersonOverview';
import StakeholderOverview from './StakeholderOverview';
import CompanyStructureOverview from './CompanyStructureOverview';
import MemoOverview from '../MemoOverview/index';
import { AddCircle, NavigateNext } from '@material-ui/icons';

import { displayNotification } from 'store/crm/actions/Notifier';
import { resetState } from 'store/crm/actions/SmeOverview.action';

/* Tab Panel */

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
      style={{ paddingTop: 10 }}
    >
      {value === index && children}
    </div >
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

/* ***END*** */

class SmeOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      customerId: null,
      source: null
    };
    this.addCustomerButtonRef = React.createRef();
    this.addPersonButtonRef = React.createRef();
    this.nextPersonButtonRef = React.createRef();
  }

  componentDidMount() {
    const params = qs.parse(this.props.location?.search.slice(1));
    const customerId = params.customerId ? params.customerId : null;
    const source = params.source ? params.source : null;
    this.setState({ customerId });
    this.setState({source});
  }

  componentWillUnmount() {
    this.props.resetState();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.selectedCustomer !== prevProps.selectedCustomer &&
      this.state.source === "contractOverview"
    ) {
      this.setState({
        tabIndex: 1,
      });
    }
  }

  handleTabIndexChange = (e, value) => {
    this.setState({ tabIndex: value });
  };

  displayTopLeftButtons = () => {
    const { classes } = this.props;

    if (this.state.tabIndex === 0) {
      return (
        <>
          <Button
            variant='contained'
            startIcon={<AddCircle />}
            className={classes.blueIconButton}
            ref={this.addCustomerButtonRef}
          >Add Customer</Button>
        </>
      );
    }
    else if (this.state.tabIndex === 1) {
      return (
        <>
          <Button
            variant='contained'
            startIcon={<NavigateNext />}
            className={classes.personBlueIconButton}
            ref={this.nextPersonButtonRef}
          >Next Person</Button>
          <Button
            variant='contained'
            startIcon={<AddCircle />}
            className={classes.personBlueIconButton}
            ref={this.addPersonButtonRef}
          >Add Person</Button>
        </>
      );
    }
    return null;
  };

  render() {

    const { classes } = this.props;

    const customerName = this.props.selectedCustomer._id && this.state.tabIndex !== 1 ? ' - ' + this.props.selectedCustomer.legalName : '';

    let tabHeaderTitle;
    if (this.state.tabIndex === 0) {
      tabHeaderTitle = <Typography variant="h4" style={{ padding: 20 }}>Customer Overview <span className={classes.titleCusName}>{customerName}</span></Typography>;
    }
    else if (this.state.tabIndex === 1) {
      tabHeaderTitle = <Typography variant="h4" style={{ padding: 20 }}>Person Overview <span className={classes.titleCusName}>{customerName}</span></Typography>;
    }
    else if (this.state.tabIndex === 2) {
      tabHeaderTitle = <Typography variant="h4" style={{ padding: 20 }}>Stakeholders Overview</Typography>;
    }
    else if (this.state.tabIndex === 3) {
      tabHeaderTitle = <Typography variant="h4" style={{ padding: 20 }}>Company Structure <span className={classes.titleCusName}>{customerName}</span></Typography>;
    }
    else if (this.state.tabIndex === 4) {
      tabHeaderTitle = <Typography variant="h4" style={{ padding: 20 }}>Memo Overview <span className={classes.titleCusName}>{customerName}</span></Typography>;
    }

    return (
      <React.Fragment>
        <Notifier />
        <div className={classes.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
            <div>
              {tabHeaderTitle}
            </div>
            <div style={{ padding: '20px 0px' }}>{this.displayTopLeftButtons()}</div>
          </div>
          <Tabs
            value={this.state.tabIndex}
            onChange={this.handleTabIndexChange}
            variant="scrollable"
            scrollButtons="auto"
            // indicatorColor="primary"
            // textColor="primary"
            classes={{
              indicator: classes.tabIndicator
            }}
          >
            <Tab label='Customer Overview' id='sme-overview-tab-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
            <Tab label='Person Overview' id='person-overview-tab-1' disabled={this.props.selectedCustomer._id ? false : true} classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
            <Tab label='Stakeholders' id='stakeholders-tab-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
            <Tab label='Company Structures' id='company-structure-tab-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
            <Tab label='Memo Overview' id='memo-overiew-tab-4' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
          </Tabs>
        </div>
        <div>
          <TabPanel value={this.state.tabIndex} index={0}><SmeDetailView customerId={this.state.customerId} addCustomerButtonRef={this.addCustomerButtonRef} /></TabPanel>
          <TabPanel value={this.state.tabIndex} index={1}>
            <PersonDetailView nextPersonButtonRef={this.nextPersonButtonRef} addPersonButtonRef={this.addPersonButtonRef} />
          </TabPanel>
          <TabPanel value={this.state.tabIndex} index={2}>{(this.state.tabIndex === 2) ? <StakeholderOverview /> : null}</TabPanel>
          <TabPanel value={this.state.tabIndex} index={3}>{this.props.companyStructures ? <CompanyStructureOverview /> : null}</TabPanel>
          <TabPanel value={this.state.tabIndex} index={4}>{(this.state.tabIndex === 4) ? <MemoOverview /> : null}</TabPanel>
        </div>
      </React.Fragment>
    );
  }
}

SmeOverview.propTypes = {
  selectedCustomer: PropTypes.object,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  stakeholders: PropTypes.array.isRequired,
  companyStructures: PropTypes.array,
  resetState: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  stakeholders: state.stakeholder.stakeholders,
  selectedCustomer: state.lmglobal.selectedCustomer,
  companyStructures: state.companyStructure.companyStructures,
});

const mapDispatchToProps = (dispatch) => ({
  resetState: () => dispatch(resetState()),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(SmeOverview));
