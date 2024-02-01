/* eslint-disable no-nested-ternary */
// import React from "react";
import React from 'react';
import ReactJson from 'react-json-view';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
/**************/

// core components

import { TableContainer, Table, TableBody, TableHead, TableRow, Paper, DialogContent, Dialog, IconButton, TablePagination } from "@material-ui/core";
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';
import moment from "moment";
import { searchProcessLogs } from 'store/initiation/actions/workflowManagement.action';
import Card from 'components/initiation/Card/Card';
import { LogStatus } from 'constants/initiation/logs-view';
import Chip from '@material-ui/core/Chip';

import MuiTableCell from "@material-ui/core/TableCell";
import AddOutlined from '@material-ui/icons/AddOutlined';
import MinimizeOutlined from '@material-ui/icons/MinimizeOutlined';

import ENV from '../../../config/env';
import LoadingOverlay from 'react-loading-overlay';

const TableCell = withStyles({
  root: {
    borderBottom: "none",
    padding: '5px'
  }
})(MuiTableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

class LogViewTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedContractId: '',
      data: [],
      open: false,
      showViewLogsDrower: false,
      viewLogs: [],
      logsOpen: false,
      additionalLogsOpen: [],
      selectedProcess: [],
      isChild: false,
      selectedData: [],
      openActivityList: [],
      clickViewLogId: '',
      isCashed: false,
      expantionState: {}
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {

    if (nextProps.isUpdated === false) {
      return { ...prevState, isCashed: false };
    }
    else if (nextProps.isUpdated === true && prevState.isCashed === false) {
      return {
        selectedContractId: '',
        data: [],
        open: false,
        showViewLogsDrower: false,
        viewLogs: [],
        logsOpen: false,
        additionalLogsOpen: [],
        selectedProcess: [],
        isChild: false,
        selectedData: [],
        openActivityList: [],
        clickViewLogId: '',
        isCashed: true,
        expantionState: {}
      };
    }

  }

  openLogs = () => {
    this.setState({ showViewLogsDrower: !this.state.showViewLogsDrower });
  }

  onClickViewLogs = (data) => {

    if (this.state.clickViewLogId === '' || data != this.state.clickViewLogId) {
      this.props.searchProcessLogs(data)
        .then(result => {
          // @ts-ignore
          this.setState({ selectedProcess: result.records, isChild: true }, () => {
            this.toggleRow(data);
          });
        })
        .catch(() => {/*  */ });
    }
    else {
      this.toggleRow(data);
    }

  }

  toggleRow = (calledProcessInstanceId) => {

    const shownState = this.state.additionalLogsOpen.slice();
    const index = shownState.indexOf(calledProcessInstanceId);

    if (index >= 0) {
      shownState.splice(index, 1);
    }
    else {
      if (this.state.additionalLogsOpen && this.state.additionalLogsOpen.length > 0) {
        shownState.splice(index, 1);
      }
      shownState.push(calledProcessInstanceId);

    }
    this.setState({ additionalLogsOpen: shownState });
  }

  toggleActivityList = (id) => {

    const shownState = this.state.openActivityList.slice();
    const index = shownState.indexOf(id);

    if (index >= 0) {
      shownState.splice(index, 1);
      this.setState({ openActivityList: shownState, additionalLogsOpen: [] });
    }
    else {
      shownState.push(id);
      this.setState({ openActivityList: shownState, additionalLogsOpen: [] });
    }
  }

  getClass(type) {
    switch (type) {
      case 'INTERNALLY_TERMINATED': {
        return 'errorState';
      }
      case 'EXTERNALLY_TERMINATED': {
        return 'errorState';
      }
      case 'ACTIVE': {
        return 'activeState';
      }
      case 'COMPLETED': {
        return 'completeState';
      }
      case 'ERROR': {
        return 'errorState';
      }
    }
  }

  mapLabels(type) {
    switch (type) {
      case 'INTERNALLY_TERMINATED': {
        return LogStatus.INTERNALLY_TERMINATED;
      }
      case 'EXTERNALLY_TERMINATED': {
        return LogStatus.EXTERNALLY_TERMINATED;
      }
      case 'ACTIVE': {
        return LogStatus.ACTIVE;
      }
      case 'COMPLETED': {
        return LogStatus.COMPLETED;
      }
      case 'ERROR': {
        return LogStatus.ERROR;
      }
    }
  }

  /** 
   * Temporary function for convert system user name to System
   * Requested by Rene|[Jira Task: LI-504]
   * Changed by Lasantha
   * */
  getAssignee(assignee) {

    if (!assignee) return '';

    const systemUsers = ENV.SYSTEM_USERS;

    if (systemUsers && systemUsers.includes(assignee)) return 'System';

    return assignee;
  }

  handleChangePage = (event, page) => {
    // console.log('page ', page);
    this.props.setPaginationData(page + 1, this.props.perPage);
  };

  handleChangeRowsPerPage = event => {
    const perPage = event.target.value;
    this.props.setPaginationData(1, perPage);
  };

  render() {
    const { classes, logViewData, tableHeaderColor, page, perPage, totalCount, isLoading } = this.props;
    // console.log('logViewData ', logViewData)

    if (logViewData === undefined || logViewData.length === 0) {
      return false;
    }

    return (
      <>
        <>
          <Card>
            <TableContainer component={Paper}>
              <LoadingOverlay
                // @ts-ignore
                id="loader-overlay"
                active={isLoading}
                spinner
                text='Loading Workflow Logs...'>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                    <TableRow>
                      {!this.props.isSubTable && <TableCell>#</TableCell>}
                      {!this.props.isSubTable && <TableCell >Process Identifier</TableCell>}
                      {!this.props.isSubTable && <TableCell >Process</TableCell>}
                      {!this.props.isSubTable && <TableCell >Status</TableCell>}
                      {!this.props.isSubTable && <TableCell >Tasks</TableCell>}
                      {!this.props.isSubTable && <TableCell >Status</TableCell>}
                      {!this.props.isSubTable && <TableCell >Started Date</TableCell>}
                      {!this.props.isSubTable && <TableCell >End Date</TableCell>}
                      {!this.props.isSubTable && <TableCell >User</TableCell>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {logViewData.map((log, index) => (
                      <React.Fragment key={log.id}>
                        <StyledTableRow key={log.id} id={'customer-id' + index} >
                          {!this.props.isSubTable && <TableCell>
                            <IconButton onClick={() => this.setState({ expantionState: { ...this.state.expantionState, ['customer-id' + index]: this.state.expantionState['customer-id' + index] === true ? false : true } },
                              // @ts-ignore
                              this.toggleActivityList(log.id))} style={{ cursor: "pointer" }}>
                              {this.state.expantionState['customer-id' + index] ? <MinimizeOutlined /> : <AddOutlined />}
                            </IconButton>
                          </TableCell>}
                          {!this.props.isSubTable && <TableCell>
                            {log.businessKey != null ? log.businessKey : ''}<br />
                            {log.processIdentifierKeys && Object.keys(log.processIdentifierKeys).map(key => {
                              return (<>{log.processIdentifierKeys[key]}<br /></>);
                            })}
                          </TableCell>}
                          {!this.props.isSubTable && <TableCell>
                            {log.processDefinitionName != null ? log.processDefinitionName : ''}
                          </TableCell>}
                          {!this.props.isSubTable && <TableCell className={classes[this.getClass(log.state)]}>
                            {log.state != null ? this.mapLabels(log.state) : ''}
                          </TableCell>}
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </StyledTableRow>
                        {log.activityInstanceList.map((item) => (
                          <React.Fragment key={item.id}>
                            {(this.state.openActivityList.includes(log.id) || this.props.isSubTable) && (
                              <TableRow key={item.id}>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                  {item.activityName != null ? item.activityName : ''}
                                </TableCell>

                                <TableCell className={classes[this.getClass(item.state)]}>
                                  {item.state != null ? this.mapLabels(item.state) : ''}
                                  <br />
                                  {item.activityType === 'callActivity' ?
                                    <Chip size="small" variant="outlined" label="View Sub Task" color={item.state === 'ERROR' ? "secondary" : "primary"} onClick={() => this.setState({ clickViewLogId: item.calledProcessInstanceId },
                                      // @ts-ignore
                                      this.onClickViewLogs(item.calledProcessInstanceId))} /> :
                                    item.logList.length > 0 ?
                                      <Chip size="small" variant="outlined" label="View Log" color={item.state === 'ERROR' ? "secondary" : "primary"} onClick={() => this.setState({ viewLogs: item.logList }, this.openLogs)} /> : ''}
                                </TableCell>

                                <TableCell>
                                  {item.startTime != null ? moment(item.startTime).format('DD:MM:YYYY HH:mm:ss') : ''}
                                </TableCell>

                                <TableCell>
                                  {item.endTime != null ? moment(item.endTime).format('DD:MM:YYYY HH:mm:ss') : ''}
                                </TableCell>

                                <TableCell>
                                  {this.getAssignee(item.assignee)}
                                </TableCell>

                              </TableRow>
                            )}

                            {this.state.additionalLogsOpen.includes(item.calledProcessInstanceId) && (
                              <TableRow className="additionl-info">
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                                  <LogsViewTableComponent
                                    tableHeaderColor="info"
                                    logViewData={this.state.selectedProcess}
                                    isSubTable={true} />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>

                        ))}
                      </React.Fragment>
                    )
                    )}
                  </TableBody>
                </Table>
              </LoadingOverlay>
            </TableContainer>
            {this.props.isSubTable ? false : // removed ; need to chenge when row count get more than 10
              <TablePagination
                id="table-pagination-bottom"
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={perPage}
                page={page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            }
          </Card>
        </>

        <Dialog
          fullWidth
          maxWidth={'lg'}
          open={this.state.showViewLogsDrower}
          onClose={() => this.openLogs()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <ReactJson
              displayDataTypes={false}
              enableClipboard={false}
              src={this.state.viewLogs} />
          </DialogContent>
        </Dialog>
      </>

    );
  }
}

LogViewTable.defaultProps = {
  tableHeaderColor: "gray"
};
LogViewTable.propTypes = {
  classes: PropTypes.object.isRequired,
  logViewData: PropTypes.array,
  logData: PropTypes.array,
  searchProcessLogs: PropTypes.func,
  selectedId: PropTypes.string,
  tableHeaderColor: PropTypes.oneOf([
    "info",
    "gray"
  ]),
  isSubTable: PropTypes.bool,
  isUpdated: PropTypes.bool,
  page: PropTypes.number,
  perPage: PropTypes.number,
  totalCount: PropTypes.number,
  setPaginationData: PropTypes.func,
  isLoading: PropTypes.bool,
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchProcessLogs: (processInstanceId) => dispatch(searchProcessLogs({ processInstanceId })),
  };
};

const LogsViewTableComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(LogViewTable));

export default LogsViewTableComponent;

