import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Tabs, Tab, Typography, } from '@material-ui/core';
import ErrorBoundary from 'components/common/ErrorBoundary/ErrorBoundary';
import Loader from 'components/loanmanagement/CustomLoader/Loader.jsx';
import { getDashboardItems,
         setSelectedDashboardItems, 
         setSelectedTabIndex, 
         checkIsDashboardContent, 
         setDashbordNavigationStatus } from 'store/initiation/actions/login';
import { getComponentByWireFrame } from './ComponentMapper';
import { clearHeaderDisplayMainData, clearHeaderDisplaySubData, setHeaderDisplayMainData } from 'store/loanmanagement/actions/HeaderNavigation';
import dashboardStyle from 'assets/jss/bridgefundPortal/views/dashboardStyle';
import Notifier from 'components/initiation/Notification/Notifier';
import history from "./../../../history";

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
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

/* ***END*** */
class GenericTabContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            sortedTabList: [],
            tabIndex: null,
            isLoadingDashBoardItems: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.selectedTabIndex && nextProps.selectedTabIndex !== prevState.tabIndex) {
            return {
                tabIndex: nextProps.selectedTabIndex,
                sortedTabList: nextProps.selectedDashboardItems
            };
        }
        return null;

    }

    componentDidMount() {

        this.setState({ isLoadingDashBoardItems: true });
        this.props.checkIsDashboardContent(true);

        const urlParams = new URLSearchParams(window.location.search);
        const selectedTab = urlParams.get("redirectTab");

        const url = window.location.pathname;
        const splitArray = url.split("/");
        const dashboardName = splitArray[splitArray.length - 1];

        this.props.setHeaderDisplayMainData(dashboardName);

        this.props
          .getDashboardItems({ myDashboardName: dashboardName })
          .then((res) => {
            let defaultOpenTabIndex;

            if (selectedTab) {
              defaultOpenTabIndex = res.find(
                (tab) => tab.dashboardItemName === selectedTab
              );
            } else {
              defaultOpenTabIndex = res.find(
                (tab) => tab.primaryScreenIndicator && tab.active
              );
            }

            this.setState(
              {
                sortedTabList: res
                  .filter((tab) => tab.active)
                  .sort((a, b) => a.sequenceNumber - b.sequenceNumber),
                tabIndex: defaultOpenTabIndex
                  ? defaultOpenTabIndex.dashboardItemId
                  : res.sort(
                      (a, b) => a.sequenceNumber - b.sequenceNumber
                    )[0].dashboardItemId,
                isLoadingDashBoardItems: false,
              },
              () => {
                this.props.setSelectedDashboardItems(
                  this.state.sortedTabList
                );
                if (defaultOpenTabIndex) {
                  this.props.setSelectedTabIndex(
                    defaultOpenTabIndex.dashboardItemId
                  );
                } else {
                  this.props.setSelectedTabIndex(
                    res[0].dashboardItemId
                  );
                }
              }
            );
          })
          .then(() => {
            this.setSelectedWireframeName(
              this.props.selectedDashboardItems,
              this.state.tabIndex
            );
          })
          .catch((err) => {
            this.setState({ isLoadingDashBoardItems: false });
          });
            this.props.setDashbordNavigationStatus(false);
    }


    componentDidUpdate(prevProps){

        const navStatus = this.props.dashbordNavigationStatus;
        const currentUrl = window.location.pathname;
        const splitArray = currentUrl.split('/');
        const currentDashboardName = splitArray[splitArray.length - 1];

        
        if(navStatus &&(currentDashboardName !== prevProps.headerDisplayMainData )  ){
            //this.setState({ isLoadingDashBoardItems: true });
            //this.props.checkIsDashboardContent(true);

            this.props.setHeaderDisplayMainData(currentDashboardName);
            
            this.props.getDashboardItems({ myDashboardName: currentDashboardName })
            .then(res => {
                this.props.setSelectedTabIndex(res[0].dashboardItemId);
                this.props.setSelectedDashboardItems(res);
                const defaultOpenTabIndex = res.find(tab => tab.primaryScreenIndicator && tab.active);

                this.setState({
                    sortedTabList: res.filter(tab => tab.active).sort((a, b) => a.sequenceNumber - b.sequenceNumber),
                    tabIndex: defaultOpenTabIndex ? defaultOpenTabIndex.dashboardItemId : res.sort((a, b) => a.sequenceNumber - b.sequenceNumber)[0].dashboardItemId,
                    isLoadingDashBoardItems: false,
                }, () => {
                    this.props.setSelectedDashboardItems(this.state.sortedTabList);
                    if(defaultOpenTabIndex){
                        this.props.setSelectedTabIndex(defaultOpenTabIndex.dashboardItemId);
                    }else{
                        this.props.setSelectedTabIndex(res[0].dashboardItemId);
                    }
                });
            })
            .then(() => {
                this.setSelectedWireframeName(this.props.selectedDashboardItems, this.state.tabIndex);
                this.props.setDashbordNavigationStatus(false);
            })
            .catch(err => {
                this.setState({ isLoadingDashBoardItems: false });
            });
        }
    }


    handleTabIndexChange = (e, value) => {

        this.setState({ tabIndex: value },
            () => {
                this.props.setSelectedTabIndex(value);
                this.setSelectedWireframeName(this.props.tabsList, value);
            }
        );
    };

    setSelectedWireframeName = (tabsList, value) => {
        const selectedTab = tabsList && tabsList.length > 0 ? tabsList.filter(item => item.dashboardItemId === value) : [];
        const selectedDashboardName = selectedTab && selectedTab.length > 0 ? selectedTab[0].dashboardItemName : '';

        // return this.props.setHeaderDisplayMainData(selectedDashboardName);
    }

    displayComponent = (data) => {
        return React.createElement(data);
    }

    render() {

        const { classes, headerDisplayMainData, headerDisplaySubData, selectedTabIndex } = this.props;
        const { sortedTabList, isLoadingDashBoardItems } = this.state;

        return (
            <ErrorBoundary>
                <Notifier />
                <Loader open={isLoadingDashBoardItems} />
                {sortedTabList && sortedTabList.length === 0 && !isLoadingDashBoardItems ?
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                        <div>
                            <Typography variant="h5" style={{ padding: 20 }}><b>{'No Dashboard Items'}</b></Typography>
                        </div>
                    </div> :
                    <React.Fragment>
                        <div className={classes.header}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                                <div>
                                    {/* <Typography variant="h5" style={{ padding: 20 }}><b>{headerDisplayMainData}</b>{headerDisplaySubData}</Typography> */}
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
                                {sortedTabList.map((tab, index) =>
                                    <Tab style={{ minWidth: '15px' }} key={tab.dashboardItemId} label={tab.dashboardItemName} id={`${tab.myDashboardName}-tab-${tab.sequenceNumber}`}
                                        classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}
                                        disabled={!tab.active} value={tab.dashboardItemId}></Tab>)
                                }

                            </Tabs>
                        </div>
                        <div>
                            {sortedTabList.map((tab, index) =>
                                <TabPanel key={index} value={selectedTabIndex ? selectedTabIndex : this.state.tabIndex} index={tab.dashboardItemId}>{getComponentByWireFrame(tab.wireframeName)}</TabPanel>)
                            }

                        </div>
                    </React.Fragment>}
            </ErrorBoundary >
        );
    }

    componentWillUnmount() {
        this.props.clearHeaderDisplayMainData();
        this.props.clearHeaderDisplaySubData();
        this.props.setSelectedTabIndex(0);
        this.props.checkIsDashboardContent(false);
        this.setState({
            sortedTabList: [],
            tabIndex: null,
            isLoadingDashBoardItems: false
        });
    }
}

GenericTabContainer.propTypes = {
    classes: PropTypes.object.isRequired,
    tabsList: PropTypes.array,
    headerDisplayMainData: PropTypes.string,
    headerDisplaySubData: PropTypes.string,
    getDashboardItems: PropTypes.func,
    setSelectedTabIndex: PropTypes.func,
    selectedDashboardItems:PropTypes.array,
    dashbordNavigationStatus: PropTypes.bool,
    setDashbordNavigationStatus: PropTypes.func
};

GenericTabContainer.defaultProps = {
    tabsList: [],
};

const mapStateToProp = (state) => ({
    headerDisplayMainData: state.headerNavigation.headerDisplayMainData,
    headerDisplaySubData: state.headerNavigation.headerDisplaySubData,
    tabsList: state.user.dashboardItems,
    selectedTabIndex: state.user.selectedTabIndex,
    selectedDashboardItems: state.user.selectedDashboardItems,
    dashbordNavigationStatus: state.user.dashbordNavigationStatus
});

const mapDispatchToProps = (dispatch) => ({
    clearHeaderDisplayMainData: () => dispatch(clearHeaderDisplayMainData()),
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    getDashboardItems: (requestQuery) => dispatch(getDashboardItems(requestQuery)),
    setSelectedDashboardItems: (items) => dispatch(setSelectedDashboardItems(items)),
    setSelectedTabIndex: (tabIndex) => dispatch(setSelectedTabIndex(tabIndex)),
    checkIsDashboardContent: (condition) => dispatch(checkIsDashboardContent(condition)),
    setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),
    setDashbordNavigationStatus: (status) => dispatch(setDashbordNavigationStatus(status)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(GenericTabContainer));

