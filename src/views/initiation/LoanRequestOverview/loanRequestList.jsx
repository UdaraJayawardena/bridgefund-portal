// import React from "react";
import React from 'react';
import qs from "querystring";

import PropTypes from 'prop-types';
import moment from "moment";
import withStyles from '@material-ui/core/styles/withStyles';
/**************/

// core components
import GridItem from 'components/initiation/Grid/GridItem.jsx';
import GridContainer from 'components/initiation/Grid/GridContainer.jsx';

import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Tooltip, Dialog, DialogContent,TablePagination, Typography, TableSortLabel} from "@material-ui/core";
import PageView from '@material-ui/icons/Pageview';
import LoadingOverlay from "react-loading-overlay";

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';
import LoanRequest from './loanRequestOverview';
import FlexLoanRequestOverview from './FlexLoanRequestOverview';
import { importLoanRequest } from 'store/initiation/actions/loanRequest.action';
import {clearTaskDataList, getTasksList } from "store/initiation/actions/ProcessDashboard.action";
import CardBody from 'components/initiation/Card/CardBody';
import Card from 'components/initiation/Card/Card';
import { updateQueryStringParameter, EURO } from 'lib/initiation/utility';
import { setImportedLoanRequestContractId } from 'store/crm/actions/SmeOverview.action';

const TASK_DEFINITION_KEY = "view-sme-loan-request-form";
class LoanRequestList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showLoanRequestDrower: false,
      showFlexLoanRequestDrawer: false,
      contractId: null,
      selectedLoanRequest: {},
      loanContractId: null,
      order: "desc",
      orderBy: "startTime",
      processDefinitionKey: "contract-management",
      taskDefinitionKeyIn: ["view-sme-loan-request-form", "view-sme-loan-request-form-2"],
      taskState: "ACTIVE",
    };
  }


  _setContractIdInUrl = (id) => {

    let URL = document.location.origin + document.location.pathname;
    if (id)
      URL = updateQueryStringParameter(
        document.location.href,
        "contractId",
        id
      );
    window.history.pushState({ path: URL }, "", URL);
  };

  componentDidMount () {
    const { importedLoanRequestContractId } = this.props;
    const params = qs.parse(this.props.parentProps.location?.search.slice(1)); //otherRoutes
    const contractId = params.contractId ? params.contractId : importedLoanRequestContractId; //Contract Id as parameter

    this.getSingleLoanRequest(contractId); //Get Single Loan request by contract ID

    this.getLoanRequestProposalList(); //Get Loan Request Proposal List
  }

  //Flex or Fixed Loan popup generation by loan type and SBF number
  requestLoanOverview = (id, loanType) => {
    const selectedRequest = this.props.loanRequestList.filter(item => item.id === id); 
    this.setState({ contractId: id, loanContractId: selectedRequest[0].variables.contractId.value});
    this.setState({ selectedLoanRequest: selectedRequest[0] }, () => (loanType === 'fixed-loan') ? this.handleLoanRequestPopup() : this.handleFlexLoanRequestPopup());
  }

  //Handle fixed loan popup
  handleLoanRequestPopup = () => {
    const { showLoanRequestDrower } = this.state;
    if(showLoanRequestDrower) this.props.setImportedLoanRequestContractId(''); //Clear Contract ID state variable
    this.setState({ showLoanRequestDrower: !showLoanRequestDrower });
  }

  //Handle flex loan popup
  handleFlexLoanRequestPopup = () => {
    const { showFlexLoanRequestDrawer } = this.state;
    if(showFlexLoanRequestDrawer) this.props.setImportedLoanRequestContractId(''); //Clear Contract ID state variable
    this.setState({ showFlexLoanRequestDrawer: !showFlexLoanRequestDrawer });
  }

  /**
   * Get single loan request by id
   * @param {*} id 
   */
  getSingleLoanRequest = (id) => {
    //ImportLoan Request
    const { importedLoanRequestContractId } = this.props;
    const contractId = id ? id : importedLoanRequestContractId; //otherRoutes

    if (contractId) {
      this.props
        .importLoanRequest(TASK_DEFINITION_KEY, contractId)
        .finally(() => {
          this.setState({ loanContractId: contractId });
          const loanRequest = this.props.loanRequestList.find(
            (request) => request.variables.contractId.value === contractId
          );
          if (loanRequest) {
            const loanType = loanRequest.variables.loanType
              ? loanRequest.variables.loanType.value
              : "fixed-loan";
            this.requestLoanOverview(loanRequest.id, loanType);
          }
          this.setState({ selectedLoanRequest: loanRequest });
        });
    }
  };

/**
 * In pagination use this function to change the page
 * @param {*} event 
 * @param {*} page 
 */
  handleChangePage = (event, page) => {
    const { pagination, myTaskListQuery } = this.props;
    this.props.getTasksList({
      ...myTaskListQuery,
      ...{ ...pagination, page: page + 1 },
    });
  };

  /**
   * In pagination use this function to change the rows per page
   * @param {*} e 
   */
  handleChangeRowsPerPage = (e) => {
    const { pagination, myTaskListQuery } = this.props;
    this.props.getTasksList({
      ...myTaskListQuery,
      ...{ ...pagination, perPage: +e.target.value, page: 1 },
    });
  };

  //get loan request proposal list
  getLoanRequestProposalList = () => {
    const { pagination } = this.props;

    const loanProposalList = {
      processDefinitionKey: this.state.processDefinitionKey,
      taskDefinitionKeyIn: this.state.taskDefinitionKeyIn,
      taskState: this.state.taskState,
      page: pagination.page,
      perPage: pagination.perPage,
    };
    return this.props.getTasksList(loanProposalList);
  };

  // eslint-disable-next-line no-unused-vars
  handleRequestSort = (property, event) => {
    const { myTaskListQuery, pagination } = this.props;
    const orderBy = property;

    let order = "desc";
    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy }, () =>
      this.props.getTasksList({
        ...myTaskListQuery,
        ...pagination,
        sortOrder: order,
        sortBy: orderBy,
        page: pagination.page + 1,
      })
    );
  };

//Get specific variable from payload
  getVariableFromVariableList = (varList, varName) => {
    const v = varList.find((v) => v.name === varName);
    if (v) {
      if (v.type === "String") return v.value;

      if (v.type === "Integer" || v.type === "Double") return EURO(v.value);
    }
    return "-";
  };

  render () {
    const { classes,searchedTaskDataList, isLoadingTaskDataList, pagination,} = this.props;
    const { order, orderBy } = this.state;

    return (
      <div className={classes.container}>
        <h3>Loan Request List</h3>
        <Card>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
              <Typography
                  variant="subtitle1"
                  className={classes.taskCount}
                  gutterBottom
                >
                  {"Number of Proposal : " + pagination.totalCount}
                </Typography>
                <TableContainer component={Paper}>
                <LoadingOverlay
                    // @ts-ignore
                    id="loader-overlay"
                    active={isLoadingTaskDataList}
                    spinner
                    text="Loading Workflow Logs..."
                  >
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Contract Id</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Customer Id</TableCell>
                        <TableCell>Loan Type</TableCell>
                        <TableCell className={classes.tableCell}>
                            <TableSortLabel
                              active={orderBy === "startTime"}
                              // @ts-ignore
                              direction={order}
                              onClick={this.handleRequestSort.bind(
                                this,
                                "startTime"
                              )}
                            >
                              Started
                            </TableSortLabel>
                          </TableCell>
                        <TableCell>View</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {searchedTaskDataList.length === 0 ? (
                          <TableRow>
                            <TableCell
                              className={classes.tableCell}
                              align="center"
                              colSpan={13}
                            >
                              {"No Proposal to show"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          
                          searchedTaskDataList.map((process, index) => (
      
                            <TableRow key={index}>
                              <TableCell className={classes.tableCell}>
                                {this.getVariableFromVariableList(
                                  process.variableInstanceList,
                                  "contractId"
                                )}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {this.getVariableFromVariableList(
                                  process.variableInstanceList,
                                  "customerLegalName"
                                )}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {this.getVariableFromVariableList(
                                  process.variableInstanceList,
                                  "customerId"
                                )}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {this.getVariableFromVariableList(
                                  process.variableInstanceList,
                                  "loanType"
                                )}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {moment(process.startTime).format(
                                  "DD:MM:YYYY HH:mm:ss"
                                )}
                              </TableCell>

                              <TableCell>
                                <Tooltip title="View Loan Request">
                                  <PageView style={{ cursor: "pointer" }} onClick={() => this.getSingleLoanRequest( this.getVariableFromVariableList( process.variableInstanceList, "contractId"))}/>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                    </TableBody>
                  </Table>
                  </LoadingOverlay>
                </TableContainer>

                <TablePagination
                  id="table-pagination-bottom"
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={pagination.totalCount}
                  rowsPerPage={pagination.perPage}
                  page={pagination.page}
                  backIconButtonProps={{
                    "aria-label": "Previous Page"
                  }}
                  nextIconButtonProps={{
                    "aria-label": "Next Page"
                  }}
                  onPageChange={this.handleChangePage}
                  onRowsPerPageChange={this.handleChangeRowsPerPage}
                  SelectProps={{
                    disabled: this.state.pageLoading,
                  }}
                />

              </GridItem>
            </GridContainer>
          </CardBody>
        </Card>
        <Dialog
          fullWidth
          maxWidth={'lg'}
          open={this.state.showLoanRequestDrower}
          // onClose={() => this.handleLoanRequestPopup()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <LoanRequest
              selectedLoanRequest={this.state.selectedLoanRequest}
              onClose={() => this.handleLoanRequestPopup()}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          fullWidth
          maxWidth={'lg'}
          open={this.state.showFlexLoanRequestDrawer}
          // onClose={() => this.handleFlexLoanRequestPopup()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <FlexLoanRequestOverview
              selectedLoanRequest={this.state.selectedLoanRequest}
              onClose={() => this.handleFlexLoanRequestPopup()}
            />
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  componentWillUnmount() {
    this.props.clearTaskDataList();
  }
}

LoanRequestList.propTypes = {
  classes: PropTypes.object.isRequired,
  parentProps: PropTypes.object.isRequired,
  customerList: PropTypes.array,
  loanRequestList: PropTypes.array,
  selectedLoanRequest: PropTypes.object,
  importLoanRequest: PropTypes.func,
  tableData: PropTypes.array,
  setImportedLoanRequestContractId: PropTypes.func,
  importedLoanRequestContractId: PropTypes.string,
  searchedTaskDataList: PropTypes.array.isRequired,
  pagination: PropTypes.object,
  isLoadingTaskDataList: PropTypes.bool,
  getTasksList: PropTypes.func,
  clearTaskDataList: PropTypes.func,
  
};

const mapStateToProps = (state) => {
  return {
    loanRequestList: state.loanRequest.loanRequestList,
    importedLoanRequestContractId: state.lmglobal.importedLoanRequestContractId,
    searchedTaskDataList: state.processDashboard.searchedTaskDataList,
    myTaskListQuery: state.processDashboard.myTaskListQuery,
    pagination: state.processDashboard.myTaskListPagination,
    isLoadingTaskDataList: state.processDashboard.isLoadingTaskDataList,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    importLoanRequest: (key, contractId) => dispatch(importLoanRequest(key, contractId)),
    setImportedLoanRequestContractId: (id) => dispatch(setImportedLoanRequestContractId(id)),
    getTasksList: (requestQuery) => dispatch(getTasksList(requestQuery)),
    clearTaskDataList: () => dispatch(clearTaskDataList()),
    
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(LoanRequestList));