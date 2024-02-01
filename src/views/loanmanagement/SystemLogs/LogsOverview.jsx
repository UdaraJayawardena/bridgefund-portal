/* eslint-disable no-nested-ternary */
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/multipleLoanOverviewStyle.jsx";
import {
  Paper, Table, TableBody, TableCell, TableHead,
  TableRow, TablePagination, InputLabel, FormControl, Select, MenuItem, Card, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@material-ui/core';
import { Tooltip } from "@mui/material";

import { retrieveNotifications, clearNotifications, sendNotificationById, updateNotification, getMessagesListForAdminDashboard, clearAdminMessagesListStates } from "store/loanmanagement/actions/Notifications";

import util from "lib/loanmanagement/utility";
import Notifier from 'components/loanmanagement/Notification/Notifier';
import GridContainer from 'components/loanmanagement/Grid/GridContainer';
import GridItem from 'components/loanmanagement/Grid/GridItem';
import CardBody from 'components/loanmanagement/Card/CardBody';
import CustomDateRange from 'components/loanmanagement/CustomDateRange/CustomDateRange';

// Icons
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

class LogsOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notificationMethod: 'emails',
      notificationType: 'sme-loan-history-recovery-message',
      startDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      status: '',
      viewMessage: false,
      messageContent: '',

      order: 'asc',
      orderBy: 'metaData.smeName',
      page: 0,
      rowsPerPage: 15,
    };
  }

  componentDidMount() {
    const { pagination } = this.props;

    //Check for passed email object from loan dashboard/messages
    const selectedEmail = this.props.location.state?.selectedEmail ? this.props.location.state?.selectedEmail : undefined;
    if(selectedEmail){
      this.explicitlySetStateFromSelectedEmail(selectedEmail);
    }
    else{
      const queryParams = {
        page: pagination.page + 1,
        perPage: pagination.perPage,
        type: this.state.notificationType,
        method: this.state.notificationMethod,
        status: this.state.status,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
      };
  
      this.props.getMessagesListForAdminDashboard(queryParams);
    }
  }

  componentWillUnmount() {
    this.props.clearNotifications();
    this.props.clearAdminMessagesListStates();
  }

  handleChangePage = (event, page) => {
    const { pagination, adminMessagesListQuery } = this.props;
    this.props.getMessagesListForAdminDashboard({
      ...adminMessagesListQuery,
      ...{ ...pagination, page: page + 1 },
    });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    const { pagination, adminMessagesListQuery} = this.props;
    this.props.getMessagesListForAdminDashboard({
      ...adminMessagesListQuery,
      ...{ ...pagination, perPage: event?.target?.value, page: 1 }
    });
  };
  
  handleRequestSort = (property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
    let filters;
    switch (event.target.name) {
      case 'notificationMethod':
        filters = this.getFilters(null, event.target.value, null, null, null);
        break;
      case 'notificationType':
        filters = this.getFilters(event.target.value, null, null, null, null);
        break;
      case 'status':
        filters = this.getFilters(null, null, event.target.value, null, null);
        break;
      default:
        break;
    }


    if (filters){
      const { pagination, adminMessagesListQuery } = this.props;
      this.props.getMessagesListForAdminDashboard({
        ...adminMessagesListQuery,
        ...{ ...pagination, page: 1 },
        ...filters
      });
    } 
  };

  handleDatePicker = e => {
    if (!moment(e.target.value).isValid()) return;

    const value = moment(e.target.value).format('YYYY-MM-DD');

    this.setState({ [e.target.name]: value });

    let filters;
    switch (e.target.name) {
      case 'startDate':
        if (moment(value).isSameOrBefore(this.state.endDate))
          filters = this.getFilters(null, null, null, value, null);
        break;
      case 'endDate':
        if (moment(value).isSameOrAfter(this.state.endDate))
          filters = this.getFilters(null, null, null, null, value);
        break;

      default:
        break;
    }

    if (filters){
      const { pagination, adminMessagesListQuery } = this.props;
      this.props.getMessagesListForAdminDashboard({
        ...adminMessagesListQuery,
        ...{ ...pagination, page: 1 },
        ...filters
      });
    }
  };
  openMessageView = (content) => {
    this.setState({ messageContent: content, viewMessage: true });
  }
  handleClose = () => {
    this.setState({ messageContent: '', viewMessage: false });
  };
 
  getFilters = (type, method, status, startDate, endDate) => {
    return {
      type: type || this.state.notificationType,
      method: method || this.state.notificationMethod,
      startDate: startDate || this.state.startDate,
      endDate: endDate || this.state.endDate,     
      status: status === '' ? '' : (status ? status : this.state.status),
    };
  };

  retryMessageSending = (notification) => {
    notification.status = 'in-progress';
    this.props.updateNotification(notification);
    this.props.sendNotificationById([notification._id], this.state.notificationMethod);
  };

  get filteredNotifications() {

    let data = this.props.notifications;

    if (this.state.status)
      data = data.filter(d => d.status === this.state.status);

    return data;
  }

  // Check for the type of metadata.err object to display tooltip content
  checkErrorObjectType = (errorObject) => {
    const type = typeof errorObject;
    return type;
  }

  // Get selected email from location.state and set state props 
  explicitlySetStateFromSelectedEmail = (selectedEmail) => {
    this.setState({ 
      notificationType: selectedEmail.type ? selectedEmail.type : "sme-loan-history-recovery-message",
      startDate: selectedEmail.createdAt ? selectedEmail.createdAt.split("T")[0] : moment().subtract(2, 'days').format('YYYY-MM-DD'),
      endDate: selectedEmail.createdAt ? moment(selectedEmail.createdAt.split("T")[0]).add(1, 'days').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      status: selectedEmail.status ? selectedEmail.status : '' 
    },
    () => {
      this.props.getMessagesListForAdminDashboard({
        page: 1,
        perPage: 5,
        type: this.state.notificationType,
        method: this.state.notificationMethod,
        status: this.state.status,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        _id: selectedEmail._id
      });
    });
  }

  render() {
    const { classes, pagination } = this.props;
    return (
      <div>
        <Notifier />
        <Card>
          <CardBody>
            <GridContainer>
              <GridItem>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="method-filter">Notification Method</InputLabel>
                  <Select
                    value={this.state.notificationMethod}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'notificationMethod',
                      id: 'method-filter',
                    }}
                    className={classes.selectEmpty}
                  >
                    <MenuItem value="emails">Email</MenuItem>
                    <MenuItem value="slack" disabled>Slack</MenuItem>
                    <MenuItem value="whatsapp" disabled>WhatsApp</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="type-filter">Notification Type</InputLabel>
                  <Select
                    value={this.state.notificationType}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'notificationType',
                      id: 'type-filter',
                    }}
                    className={classes.selectEmpty}
                  >
                    {/* <MenuItem value="loan-recovery">Loan Recovery</MenuItem> */}
                    <MenuItem value="sme-loan-history-recovery-message">SME Loan Recovery</MenuItem>
                    <MenuItem value="sme-loan-maturity">SME Loan Maturity</MenuItem>
                    <MenuItem value="temporary-loan-stop">Temporary Loan Stop</MenuItem>
                    <MenuItem value="temporary-loan-stop-manager-mail">Temporary Loan Stop Manager</MenuItem>
                    <MenuItem value="sme-loan-recovery-appointment">SME Loan Recovery Appointment</MenuItem>
                    <MenuItem value="claim_sme_loan">Claim SME Loan</MenuItem>
                    <MenuItem value="announce-end-of-temporary-loan-stop-to-customer">SME Loan Temporary Stop End Announcement</MenuItem>
                    <MenuItem value="manager-notification-maturity">SME Loan Maturity Assert Manager Mail</MenuItem>
                    <MenuItem value="revision-announcement">SME Loan Revision Annoucement</MenuItem>
                    <MenuItem value="revision-approval">SME Loan Revision Approval</MenuItem>
                    <MenuItem value="revision-flex-loan">SME Flex Loan Revision</MenuItem>
                    <MenuItem value="end-flex-loan-revision">End Flex Loan Revision</MenuItem>
                    <MenuItem value="confirm-active-consent">Confirm Active Consent</MenuItem>
                    <MenuItem value="psd2-update-notification">PSD2 Update Notification</MenuItem>
                    <MenuItem value="sme-loan-history-recovery-message-warning">SME Loan Recovery Warning</MenuItem>
                    <MenuItem value="generate-direct-debit-batch">Direct Debit Batch Generation</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="status-filter">Notification Status</InputLabel>
                  <Select
                    value={this.state.status}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'status',
                      id: 'status-filter',
                    }}
                    className={classes.selectEmpty}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="block">Block</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <CustomDateRange
                  title="Date Range"
                  startDateFieldName="startDate"
                  endDateFieldName="endDate"
                  startDateValue={this.state.startDate}
                  endDateValue={this.state.endDate}
                  onChange={this.handleDatePicker.bind(this)}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
        </Card>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SME</TableCell>
                <TableCell>SME Loan</TableCell>
                <TableCell>Sender Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email Subject</TableCell>
                <TableCell>Email Message</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.filteredNotifications.length === 0 && ( <TableRow> <TableCell colSpan={7}><p className={classes.noRecordsFoundText}>No records found</p></TableCell> </TableRow> )}
              {
                util.stableSort(this.filteredNotifications, util.getSorting(this.state.order, this.state.orderBy))
                  .map(log => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <b>Email</b>{' : '}{log.to}<br />
                        <b>Name</b>{' : '}{log.metaData?.smeName}</TableCell>
                      <TableCell>
                        <b>Contract-id</b>{' : '}{log.metaData?.contractId}<br />
                        {log.metaData?.smeLoanHistoryGeneratedDate ?
                          <React.Fragment>
                            <b>Loan Historty Date</b>{' : '}{moment(log.metaData?.smeLoanHistoryGeneratedDate).format('YYYY-MM-DD')}
                          </React.Fragment>
                          :
                          false
                        }
                      </TableCell>
                      <TableCell>{log.from}</TableCell>
                      <TableCell>
                      <div className={classes.errorDiv}>
                        <p>
                          {log.status}
                          {log.status === "error" && (
                            <Tooltip
                              title={
                                log.metaData.err && (
                                  <React.Fragment>
                                    {log.metaData.err.response && (
                                      <p>
                                        <b>Error: </b>
                                        {(this.checkErrorObjectType(log.metaData.err.response) === "string" ) && log.metaData.err.response}
                                        {(this.checkErrorObjectType(log.metaData.err.response) === "object" ) && this.checkErrorObjectType(log.metaData.err.response.data.error) === "string" ? log.metaData.err.response.data.error : ""}
                                      </p>
                                    )}
                                    {log.metaData.err.code && (
                                      <p>
                                        <b>Error Code: </b>
                                        {(this.checkErrorObjectType(log.metaData.err.code) === "string" ) && log.metaData.err.code}
                                      </p>
                                    )}
                                    {(this.checkErrorObjectType(log.metaData.err) === "string" ) && (
                                      <p>
                                        {log.metaData.err ? log.metaData.err : ""}
                                      </p>
                                    )}
                                  </React.Fragment>
                                )
                              }
                              arrow
                            >
                              <span className={classes.errorSpanPosition}>
                                <WarningAmberRoundedIcon
                                  className={classes.errorWarningIcon}
                                />
                              </span>
                            </Tooltip>
                          )}
                        </p>
                      </div>
                      </TableCell>
                      <TableCell>{log.subject}</TableCell>
                      <TableCell><Button onClick={() => this.openMessageView(log.html)}>View Message</Button></TableCell>
                      <TableCell>
                        {
                          <Button
                            onClick={() => this.retryMessageSending(log)}
                            disabled={log.status !== 'error' && log.status !== 'new'}
                          >
                            {log.status === "new" ? "Send" : "Retry"}
                          </Button>
                        }
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination.totalCount}
            rowsPerPage={pagination.perPage}
            page={pagination.page}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onPageChange={this.handleChangePage}
            onRowsPerPageChange={this.handleChangeRowsPerPage}
          />
        </Paper>

        <Dialog open={this.state.viewMessage} onClose={this.handleClose} aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description" >
          <DialogTitle id="alert-dialog-slide-title">{"Message Content"}</DialogTitle>
          <DialogContent>
            {this.state.messageContent !== "" ?
              <div id="alert-dialog-slide-description" dangerouslySetInnerHTML={{ __html: this.state.messageContent }} /> : false
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>
              Close </Button>
          </DialogActions>
        </Dialog>
      </div >
    );
  }
}

LogsOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  retrieveNotifications: PropTypes.func,
  clearNotifications: PropTypes.func,
  sendNotificationById: PropTypes.func,
  updateNotification: PropTypes.func,
  pagination: PropTypes.object,
  getMessagesListForAdminDashboard: PropTypes.func,
  clearAdminMessagesListStates: PropTypes.func
};

const mapStateToProps = state => {
  return {
    notifications: state.notifications.notificationList,
    pagination: state.notifications.adminMessagesListPagination,
    adminMessagesListQuery: state.notifications.adminMessagesListQuery
  };
};

const mapDispatchToProps = dispatch => {
  return {
    retrieveNotifications: (filter) => {
      dispatch(retrieveNotifications(filter));
    },
    clearNotifications: () => {
      dispatch(clearNotifications());
    },
    sendNotificationById: (ids, method) => {
      dispatch(sendNotificationById(ids, method));
    },
    updateNotification: (notification) => {
      dispatch(updateNotification(notification));
    },
    getMessagesListForAdminDashboard: (queryParams) => {
      dispatch(getMessagesListForAdminDashboard(queryParams));
    },
    clearAdminMessagesListStates: () => {
      dispatch(clearAdminMessagesListStates());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LogsOverview));
