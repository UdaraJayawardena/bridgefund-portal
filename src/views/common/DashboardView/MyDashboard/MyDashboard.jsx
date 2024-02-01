
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import dashboardStyle from 'assets/jss/bridgefundPortal/views/dashboardStyle';

import ENV from '../../../../config/env';

// import Notifier from '../../../../components/';
import { Tabs, Tab, Typography } from '@material-ui/core';
import Dashboards from './Dashboards';
import DashboardItems from './DashboardItems';
import UpdateMyDashboards from './UpdateMyDashboards';

import { getFrontEndPortal } from 'store/initiation/actions/login';

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
      // style={{ paddingTop: 10 }}
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

class MyDashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      showTabPanel: false,
      frontEndPortalId:null
    };
  }

  componentWillUnmount() {
    //this.props.resetState();
  }

  handleTabIndexChange = (e, value) => {
    this.setState({ tabIndex: value });

  };

  componentDidMount() {
    this.getFrontEndPortal(ENV.FRONT_END_PORTAL_KEY);
  }

  getFrontEndPortal = (key) => {
    this.props.getFrontEndPortal(key)
      .then((response) => {
        if (response) {
          if(response.length > 0){
            this.setState({ frontEndPortalId: response[0].id,showTabPanel:true });
          }
        }
        return {};
      });
  }

  render() {

    const { classes, selectedTabIndex } = this.props;

    let tabHeaderTitle;
    if (this.state.tabIndex === 0) {
      tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}>My Dashboards<span className={classes.titleCusName}></span></Typography>;
    } else if (this.state.tabIndex === 1) {
      tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}>Update My Dashboards</Typography>;
    } else if (this.state.tabIndex === 2) {
      tabHeaderTitle = <Typography variant="h5" style={{ padding: 20 }}>My Dashboard Items</Typography>;
    }

    return (
      <React.Fragment>
        {/* <Notifier /> */}
        {this.state.showTabPanel?
        <>
        <div className={classes.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
            <div>
              {tabHeaderTitle}
            </div>
          </div>
          <Tabs
            value={selectedTabIndex ? selectedTabIndex : this.state.tabIndex}
            onChange={this.handleTabIndexChange}
            variant="scrollable"
            scrollButtons="auto"
            classes={{
              indicator: classes.tabIndicator
          }}
          >
            <Tab label='My Dashboards' id='create-dashboard-tab-0' style={{minWidth:'15px'}} classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} ></Tab>
            <Tab label='Update My Dashboard' id='update-dashboard-tab-1' style={{minWidth:'15px'}} classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }} ></Tab>
            <Tab label='My Dashboard Item' id='create-dashboard-items-tab-2' style={{minWidth:'15px'}} classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
          </Tabs>
        </div>
        <div>
          <TabPanel value={selectedTabIndex ? selectedTabIndex :this.state.tabIndex} index={0}><Dashboards frontEndPortalId={this.state.frontEndPortalId}/></TabPanel>
          <TabPanel value={selectedTabIndex ? selectedTabIndex :this.state.tabIndex} index={1}><UpdateMyDashboards frontEndPortalId={this.state.frontEndPortalId}/></TabPanel>
          <TabPanel value={selectedTabIndex ? selectedTabIndex :this.state.tabIndex} index={2}><DashboardItems frontEndPortalId={this.state.frontEndPortalId}/></TabPanel>
         
        </div>
        </>
        :
        false
        }
      </React.Fragment>
    );
  }
}

MyDashboard.propTypes = {
  selectedCustomer: PropTypes.object,
  classes: PropTypes.object.isRequired,
  displayNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  selectedTabIndex: state.user.selectedTabIndex
});

const mapDispatchToProps = (dispatch) => ({
  getFrontEndPortal: (name) => dispatch(getFrontEndPortal(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(MyDashboard));
