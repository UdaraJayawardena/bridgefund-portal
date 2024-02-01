import React from 'react';
import PropTypes from 'prop-types';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';
import Icon from '@material-ui/core/Icon';
// @material-ui/icons
import Warning from '@material-ui/icons/Warning';
import DateRange from '@material-ui/icons/DateRange';
import Update from '@material-ui/icons/Update';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Accessibility from '@material-ui/icons/Accessibility';
import BugReport from '@material-ui/icons/BugReport';
import Event from '@material-ui/icons/Event';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
// core components
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import EventLog from 'components/loanmanagement/Tasks/EventLog.jsx';
import CustomTabs from 'components/loanmanagement/CustomTabs/CustomTabs.jsx';
import Card from 'components/loanmanagement/Card/Card.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import CardIcon from 'components/loanmanagement/Card/CardIcon.jsx';
import CardFooter from 'components/loanmanagement/Card/CardFooter.jsx';
import Notifier from 'components/loanmanagement/Notification/Notifier';
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';
import { getEventLogs, getLoanTrends } from 'store/loanmanagement/actions/Dashboard';
import Trends from 'components/loanmanagement/Tasks/Trends.jsx';
import Paper from '@material-ui/core/Paper';
import { requestPaymentsAsAtDate } from 'store/loanmanagement/actions/Payments';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { getCustomerListPerPage } from 'store/crm/actions/Customer.action';

class Dashboard extends React.Component {
  //Variables to store Index keys for respective events data set
  panic_indexes = [];
  high_indexes = [];
  medium_indexes = [];

  //Variables to store Index keys for respective trends data set
  trend_up_indexes = [];
  trend_down_indexes = [];

  componentDidMount() {
    // this.props.getAllLoanData();
    this.props.getAllEventLogs();
    // this.props.getAllUnIdentifiedPayments();
    this.props.getAllPaymentsAsAtDate();
    this.props.getAllLoanTrends();

    this.props.getCustomerListPerPage(1, 1).then((res) => {
      const { metaData } = res;
      if (metaData) {
        this.setState({ customerCount: metaData.totalCount });
      }
    });
  }

  sortLoanData(a, b) {
    const dateA = a.percentageBehind;

    const dateB = b.percentageBehind;

    let comparison = 0;

    if (dateA > dateB) {
      comparison = 1;
    } else if (dateA < dateB) {
      comparison = -1;
    }

    return comparison * -1;
  }

  state = {
    value: 0,
    customerCount: 0
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const {
      classes,
      loanDetails,
      events,
      todaysPayments,
      trendsUp,
      trendsDown
    } = this.props;

    let panics = [],
      highs = [],
      mediums = [],
      trend_up = [],
      trend_down = [];

    if (loanDetails) {
      loanDetails.sort(this.sortLoanData);
      trend_up = loanDetails.filter(e => e.trend === 'up');
      trend_down = loanDetails.filter(e => e.trend === 'down');

      this.trend_up_indexes = [];
      this.trend_down_indexes = [];
      Object.keys(trend_up).map((e, key) =>
        this.trend_up_indexes.push(key)
      );
      Object.keys(trend_down).map((e, key) =>
        this.trend_down_indexes.push(key)
      );
    }
    if (events) {
      events
        .sort((a, b) => {
          let aPriority = a.priority;
          let bPriority = b.priority;
          return aPriority > bPriority ? -1 : aPriority < bPriority ? 1 : 0;
        })
        .sort((a, b) => {
          let aTime = new Date(a.timestamp);
          let bTime = new Date(b.timestamp);

          return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
        });

      panics = [];
      panics = events.filter(e => e.priority === 3);
      highs = [];
      highs = events.filter(e => e.priority === 2);
      mediums = [];
      mediums = events.filter(e => e.priority === 1);

      this.panic_indexes = [];
      this.high_indexes = [];
      this.medium_indexes = [];
      Object.keys(panics).map((e, key) =>
        this.panic_indexes.push(key)
      );
      Object.keys(highs).map((e, key) => this.high_indexes.push(key));
      Object.keys(mediums).map((e, key) =>
        this.medium_indexes.push(key)
      );
    }

    let tpTotal = 0
    if (todaysPayments) {
      todaysPayments.map(tp => { return tpTotal += tp.totalDirectDebitsAmount })
    }

    return (
      <div>
        <Notifier />
        <GridContainer>
          <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="success" stats icon>
                <CardIcon color="success">
                  <Icon>euro_symbol</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Revenue</p>
                <h3 className={classes.cardTitle}>{Number(tpTotal.toFixed(2))}</h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <DateRange />
                  Predicted payments for today
                </div>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="info" stats icon>
                <CardIcon color="info">
                  <Accessibility />
                </CardIcon>
                <p className={classes.cardCategory}>SME(s)</p>
                <h3 className={classes.cardTitle}>{this.state.customerCount}</h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <Update />
                  Just Updated
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <CustomTabs
              title="Priority:"
              headerColor="primary"
              tabs={[
                {
                  tabName: 'Panic',
                  tabIcon: BugReport,
                  tabContent: (
                    <Paper
                      style={{
                        height: panics.length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'scroll'
                      }}
                    >
                      <EventLog
                        checkedIndexes={[]}
                        tasksIndexes={this.panic_indexes}
                        tasks={panics}
                      />
                    </Paper>
                  )
                },
                {
                  tabName: 'High',
                  tabIcon: Warning,
                  tabContent: (
                    <Paper
                      style={{
                        height: panics.length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'scroll'
                      }}
                    >
                      <EventLog
                        checkedIndexes={[]}
                        tasksIndexes={this.high_indexes}
                        tasks={highs}
                      />
                    </Paper>
                  )
                },
                {
                  tabName: 'Medium',
                  tabIcon: Event,
                  tabContent: (
                    <Paper
                      style={{
                        height: panics.length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'scroll'
                      }}
                    >
                      <EventLog
                        checkedIndexes={[]}
                        tasksIndexes={this.medium_indexes}
                        tasks={mediums}
                      />
                    </Paper>
                  )
                }
              ]}
            />
          </GridItem>
        </GridContainer>

        {/** Trend Data Table */}
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <CustomTabs
              title="Trend:"
              headerColor="info"
              tabs={[
                {
                  tabName: 'Up',
                  tabIcon: ArrowUpward,
                  tabContent: (
                    <Paper
                      style={{
                        height: trendsUp.length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'scroll'
                      }}
                    >
                      <Trends
                        checkedIndexes={[]}
                        trends={trendsUp}
                      />
                    </Paper>
                  )
                },
                {
                  tabName: 'Down',
                  tabIcon: ArrowDownward,
                  tabContent: (
                    <Paper
                      style={{
                        height: trendsUp.length > 0 ? '40vh' : 'auto',
                        width: 'auto',
                        overflowY: 'scroll'
                      }}
                    >
                      <Trends
                        checkedIndexes={[]}
                        trends={trendsDown}
                      />
                    </Paper>
                  )
                }
              ]}
            />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  events: PropTypes.array,
  todaysPayments: PropTypes.array,
  trendsUp: PropTypes.array,
  trendsDown: PropTypes.array,
  loanDetails: PropTypes.array,
  getAllEventLogs: PropTypes.func.isRequired,
  getAllLoanTrends: PropTypes.func.isRequired,
  displayNotifications: PropTypes.func.isRequired,
  getAllPaymentsAsAtDate: PropTypes.func.isRequired,
  getCustomerListPerPage:  PropTypes.func
};

const mapStateToProps = state => {
  return {
    events: state.dashboardLoanDetails.events,
    todaysPayments: state.payments.todaysPayments,
    trendsUp: state.dashboardLoanDetails.trendsUp,
    trendsDown: state.dashboardLoanDetails.trendsDown
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAllEventLogs: () => (dispatch(getEventLogs())),
    getAllPaymentsAsAtDate: () => (dispatch(requestPaymentsAsAtDate())),
    displayNotifications: (message, type) => (dispatch(displayNotification(message, type))),
    getAllLoanTrends: () => (dispatch(getLoanTrends())),
    getCustomerListPerPage: (perPage, pageNumber) => (dispatch(getCustomerListPerPage(perPage, pageNumber)))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(Dashboard));