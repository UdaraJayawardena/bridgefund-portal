import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";
import {
  Paper,
  TableContainer,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow, 
  Grid, 
  TextField,
  Tooltip
} from "@material-ui/core";
import { Autocomplete } from '@material-ui/lab';
import Button from 'components/loanmanagement/CustomButtons/Button';
import { retrieveEmailNotificationsBySme, clearSmeEmailNotifications, getMessagesListForLoanDashboard, clearMessagesListStates } from "store/loanmanagement/actions/Notifications";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import util from "lib/loanmanagement/utility";
import { clearSelectedLoan, getSingleLoanOverviewData, getSmeLoansByQuery, requestSmeLoans, selectLoan } from "store/loanmanagement/actions/SmeLoans";
import { changeCustomerDetails, clearHeaderDisplaySubData, setHeaderDisplaySubData } from "store/loanmanagement/actions/HeaderNavigation";
import CustomSearch from "components/crm/CustomInput/CustomSearch";
import { getCustomerListPerPage } from "store/crm/actions/Customer.action";
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import LoadingOverlay from "react-loading-overlay";
import { withRouter } from "react-router-dom";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const authorizedUserTypes = ["Administrator", "IT developer", "IT Tech lead", "IT Admin"];
class Messages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      smeId: "",
      selectedMessageIndex: null,

      contractIdValue: this.props.selectedLoan && this.props.selectedLoan.contractId ? this.props.selectedLoan.contractId : '',
      contractIdInputValue: this.props.selectedLoan && this.props.selectedLoan.contractId ? this.props.selectedLoan.contractId : '',
      contractList: [],
      customerList: [],
      defaultSelectedCompanyNameValue: this.props.customerDetails && this.props.customerDetails.company ? this.props.customerDetails.company : "",
      companyNameValue: '',
      isLoadingData: false,
      statusColorMap: {
        success: "green",
        error: "red",
        new: "blue",
        "in-progress": "orange",
        block: "gray",
      },
      isUserAccessAlertBoxOpen: false
    };
  }

  componentDidMount() {

    const { selectedLoan } = this.props;
    const { companyNameValue, defaultSelectedCompanyNameValue, contractIdValue } = this.state;

    // this.props.retrieveEmailNotificationsBySme(this.getRequestDataObject(customerDetails.id, selectedLoan._id, selectedLoan.contractId));

    this.getLoanDashboardMessagesList();

    if (defaultSelectedCompanyNameValue === "") {
      if (!companyNameValue) {
        this.setAllContractsForDropDownMenu();
      }
      if (companyNameValue) {
        this.setState({companyNameValue});
        if(!selectedLoan._id) {
          this.setAllSMEContractsForDropDownMenu(companyNameValue);
        }
      }
    }
    else if (defaultSelectedCompanyNameValue && defaultSelectedCompanyNameValue !== ""){
      this.setState(
        {
          companyNameValue: defaultSelectedCompanyNameValue,
          contractList: [contractIdValue],
          contractIdValue: contractIdValue,
          contractIdInputValue: contractIdValue,
        },
        () => {
          this.props.displayNotification(
            "Company Name & Contract Id selected",
            "success"
          );
          this.props.setHeaderDisplaySubData(
            ` - ${defaultSelectedCompanyNameValue} - ${contractIdValue}`
          );
          this.getLoanDashboardMessagesList();
        }
      );
    }
  }

  initData = (customerSysId, loanMongoId, selContractId) => {//done
    this.setLoading(true);
    this.props.retrieveEmailNotificationsBySme(this.getRequestDataObject(customerSysId, loanMongoId, selContractId))
      .then(() => this.setLoading(false))
      .catch(err => { console.log('initData error ', err); this.setLoading(false); });
  }

  getRequestDataObject = (customerSysId = null, loanMongoId = null, selContractId = null) => {//done
    if (customerSysId && (loanMongoId == null && selContractId == null)) {
      return { "$or": [{"metaData.customerId": customerSysId}, {"metaData.smeId": customerSysId}] };
    }
    if (customerSysId === null && (loanMongoId || selContractId)) {
      return { "$or": [{"metaData.contractId": selContractId}, {"metaData.contractId": selContractId}] };
    }
    if (customerSysId && (loanMongoId || selContractId)) {
      return { "$or": [{"metaData.smeLoan": loanMongoId}, {"metaData.contractId": selContractId}] };
    }
    return { "$or": [{"metaData.customerId": "" }, {"metaData.smeId": ""}, {"metaData.contractId": ""}] };
  }

  componentWillUnmount() { //done
    this.props.clearSmeEmailNotifications();
    this.props.clearMessagesListStates();
  }

  handleModelOpen = (messageIndex) => {//done
    this.setState({ selectedMessageIndex: messageIndex });
  }

  handleClose = () => {//done
    this.setState({ selectedMessageIndex: null });
  }

  setMessagesForSelectedContractId = (contractId) => {
    const { MessagesListQuery } = this.props;
    const { companyNameValue, contractList } = this.state;
    const selectedContractId = contractList.find(contract => contract.contractId === contractId).contractId;
    this.setLoading(true);
    this.props.getMessagesListForLoanDashboard({...MessagesListQuery, page: 1, contractId: selectedContractId})
      .then(() => {
        this.setLoading(false);
        this.props.selectLoan({ contractId });
        if (companyNameValue) {
          this.props.setHeaderDisplaySubData(` - ${companyNameValue} - ${contractId}`);
        }

        if (!companyNameValue) {
          this.getCustomerdetailsByContractId(contractId);
        }
      })
      .catch((err) => {
        this.setLoading(false);
        console.log('error retrieveEmailNotificationsBySme ', err);
      });
  }

  getCustomerdetailsByContractId = (contractId) => {
    this.setLoading(true);
    this.props.getLoanDetails(contractId)
      .then(res => {
        this.setLoading(false);
        this.setState({
          companyNameValue: res.sme.company,
        }, () => this.setAllSMEContractsForDropDownMenu(res.sme.company));
        this.props.setHeaderDisplaySubData(` - ${res.sme.company} - ${contractId}`);
      })
      .catch((err) => {
        this.setLoading(false);
        console.log('error getCustomerdetailsByContractId ', err);
      });
  }

  setAllSMEContractsForDropDownMenu = (companyNameValue) => {
    const { customerDetails } = this.props;
    //need to set contract data if customer got only one contract
    const customerId = customerDetails.accountNo;

    this.props.setHeaderDisplaySubData(` - ${companyNameValue}`);

    this.props.requestSmeLoans(customerId)
      .then(res => {
        if (res.length === 1) {
          const singleContractId = res[0].contractId;// the only one contract current customer got
          this.props.displayNotification('Customer has only one contract', 'success');
          this.setState({
            contractList: res/* .map(loan => loan.contractId) */,
            contractIdValue: singleContractId,
            contractIdInputValue: singleContractId,
          }, () => this.setMessagesForSelectedContractId(singleContractId));
        }
        else {
          this.setState({
            contractList: res/* .map(loan => loan.contractId) */,
          }, () => {
            this.props.clearSelectedLoan();
          });
        }
        this.setLoading(false);
      })
      .catch(e => {
        console.log('error in requestSmeLoans ', e);
        this.setLoading(false);
      });

  }

  setLoading = (status) => {
    this.setState({ isLoadingData: status });
  }

  get handleGetCustomerListPerPage() {
    return getCustomerListPerPage(1, 1, { legalName: this.state.companyNameValue });
  }

  handleCustomerSelection = (customer) => {
    const { MessagesListQuery } = this.props;
    if (!customer) {
      //set all contracts and all customers
      this.clearCustomer();
      return;
    }

    this.handleGetCustomerListPerPage()
    .then((res) => {
      const { customersList } = res;
      if (customersList && customersList.length > 0) {
        const selectedCustomer = customersList[0];
        this.props.setHeaderDisplaySubData(` - ${customer.legalName}`);
        this.props.changeCustomerDetails(selectedCustomer);
        // this.props.retrieveEmailNotificationsBySme(this.getRequestDataObject(selectedCustomer.id, null));
        this.props.getMessagesListForLoanDashboard({...MessagesListQuery, page: 1, customerId: selectedCustomer.id, contractId: ""});
        this.clearContract();
      }
    });
  }

  clearContract = () => {
    const { companyNameValue } = this.state;
    const { customerDetails, MessagesListQuery } = this.props;
    this.setState({
      contractIdValue: '',
      contractIdInputValue: '',
    }, () => this.setAllSMEContractsForDropDownMenu(companyNameValue));
    this.props.clearSmeEmailNotifications();
    this.props.clearMessagesListStates();
    this.props.clearSelectedLoan();
    this.props.setHeaderDisplaySubData(` - ${companyNameValue}`);
    // this.props.retrieveEmailNotificationsBySme(this.getRequestDataObject(customerDetails.id, null));
    const queryParams = {
      customerId: customerDetails.id,
      page: 1
    };
    return this.props.getMessagesListForLoanDashboard({...MessagesListQuery, ...{...queryParams}});

  }
  
  clearCustomer = () => {
    const { MessagesListQuery } = this.props;
    this.setLoading(true);
    //set all customers and set all loans
    this.setAllContractsForDropDownMenu();
    //header data clearing
    this.props.clearHeaderDisplaySubData();
    this.props.clearSmeEmailNotifications();
    this.props.clearSelectedLoan();
    this.props.getMessagesListForLoanDashboard({...MessagesListQuery, page: 1, customerId: "", contractId: ""});
  }

  setAllContractsForDropDownMenu = () => {
    this.setLoading(true);
    this.props.getSmeLoansByQuery({}, ['contractId'])
      .then(res => {
        this.setState({
          contractList: res/* .map(contract => contract.contractId) */,
          companyNameValue: '',
          contractIdValue: '',
          contractIdInputValue: '',
        }, () => {
          // this.props.clearSelectedLoan();
          this.setLoading(false);
        });
      })
      .catch(e => {
        console.log('error in getSmeLoansByQuery ', e);
        this.setLoading(false);
      });
  }

  reFormatEmailView = (template) => {

    if(template){

      let styleToRemove = "margin-top: -20px";

      const salutaionClass = template.match(/.salutation-text[\s\S]+?}/g);
      const contentTextClass = template.match(/.content-text[\s\S]+?}/g);

      if(salutaionClass && salutaionClass[0]){
        const salutaionClassReplacement = salutaionClass[0].replace(styleToRemove, '');
        template = template.replace(salutaionClass[0], salutaionClassReplacement); 
      }
      
      if(contentTextClass && contentTextClass[0]){
        const contentTextClassReplacement = contentTextClass[0].replace(styleToRemove, '');
        template = template.replace(contentTextClass[0], contentTextClassReplacement);
      }
     
      return template

    }
    
  }
  
  // Fetch Messages List 
  getLoanDashboardMessagesList = () => {
    const { pagination, customerDetails, selectedLoan } = this.props;
    const queryParams = {
      page: pagination.page + 1,
      perPage: pagination.perPage,
      customerId: customerDetails.id ? customerDetails.id : "",
      contractId: selectedLoan.contractId ? selectedLoan.contractId : ""
    };

    return this.props.getMessagesListForLoanDashboard(queryParams);
  }

  handleChangePage = (event, page) => {
    const { pagination, MessagesListQuery } = this.props;
    this.props.getMessagesListForLoanDashboard({
      ...MessagesListQuery,
      ...{ ...pagination, page: page + 1 },
    });
  };

  handleChangeRowsPerPage = (event) => {
    const { pagination, MessagesListQuery} = this.props;
    this.props.getMessagesListForLoanDashboard({
      ...MessagesListQuery,
      ...{ ...pagination, perPage: event?.target?.value, page: 1 }
    });
  }

  openUserAccessAlertBox = () => {
    this.setState({ isUserAccessAlertBoxOpen: true });
  }

  closeUserAccessAlertBox = () => {
    this.setState({ isUserAccessAlertBoxOpen: false });
  }

  checkForUserRoleAccess = () => {
    const loggedInUserRole = sessionStorage.getItem("role");
    return authorizedUserTypes.includes(loggedInUserRole);
  }

  navigateToAdminDashboard = (emailObject) => {
    if(this.checkForUserRoleAccess()){
      this.props.history.push({
        pathname: `/admin/notifications`,
        state: {selectedEmail: emailObject}
      });
    }
    else{
      this.openUserAccessAlertBox();
    }
  }

  render() {
    const { smeEmails, classes, pagination, isLoadingMessagesList } = this.props;
    const { companyNameValue, contractIdValue, contractIdInputValue, contractList, statusColorMap } = this.state;
    return (
      <div>
        <Grid container spacing={3} style={{ margin: 10 }}>
          <Grid item>
            <CustomSearch
              id="company-name-search"
              label="Company Name *"
              placeholder="Dream Beers B.V."
              changeToFormatType="FirstCap"
              name="legalName"
              asyncSearchType="customer"
              value={companyNameValue}
              onChange={(event, newInputValue) => {
                if (!newInputValue || newInputValue === "") {
                  this.setState({ companyNameValue: "" });
                  this.handleCustomerSelection(null);
                  return;
                }
                this.setState({ companyNameValue: newInputValue });
              }}
              onSearchResult={(newValue) => {
                if (newValue) {
                  this.setState(
                    { companyNameValue: newValue.legalName },
                    () => this.handleCustomerSelection(newValue)
                  );
                } else {
                  this.handleCustomerSelection(null);
                }
              }}
            />
          </Grid>
          <Grid item>
            <Autocomplete
              size="small"
              ListboxProps={{
                className: classes.autoSuggestListStyle,
                shrink: true,
              }}
              value={contractIdValue}
              onChange={(event, newValue) => {
                if (newValue) {
                  this.setState({ contractIdValue: newValue },
                    () => this.setMessagesForSelectedContractId(newValue));
                }
                else {
                  // this.setState({ contractIdValue: '' }, () => this.clearContract());
                  this.clearContract();
                }
              }}
              inputValue={contractIdInputValue}
              onInputChange={(event, newInputValue) => {
                this.setState({ contractIdInputValue: newInputValue });
              }}
              id="contract-id"
              options={contractList.map((contract) => contract.contractId)}
              disabled={
                companyNameValue &&
                contractList &&
                contractList.length === 1
              }
              renderInput={(params) => (
                <TextField {...params} label="Contract Id"
                  placeholder="SBF246357"
                  variant="outlined"
                  InputLabelProps={{
                    className: classes.autoSuggestTextLabelStyle,
                  }}
                  InputProps={{
                    ...params.InputProps,
                    className: classes.autoSuggestTextStyle,
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Paper>
          <TableContainer component={Paper}>
            <LoadingOverlay
              active={isLoadingMessagesList}
              spinner
              text="Fetching data..."
            >
              <Table id="message-table">
                <TableHead id="message-table-head">
                  <TableRow id="message-table-header-row">
                    <TableCell className={classes.tableCell}>
                      Generated Date
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      Status
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      Sent Date
                    </TableCell>
                    <TableCell className={classes.tableCell}>To</TableCell>
                    <TableCell className={classes.tableCell}>
                      From
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      Subject
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      Message
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody id="message-table-body">
                {smeEmails.length === 0 && ( <TableRow><TableCell colSpan={7}><p className={classes.noRecordsFoundText}>No records found</p></TableCell></TableRow> )}
                  {util
                    .stableSort(
                      smeEmails,
                      util.getSorting("desc", "updatedAt")
                    )
                    .map((email, index) => (
                      <TableRow id={email._id} key={email._id}>
                        <TableCell
                          className={classes.tableCell}
                          id={email._id + "-" + email.createdAt}
                        >
                          {moment(email.createdAt).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell
                          className={classes.tableCell}
                          id={email._id + "-" + email.status}
                          style={{ color: statusColorMap[email.status] }}
                        >
                          {email.status}
                        </TableCell>
                        <TableCell
                          className={classes.tableCell}
                          id={email._id + "-" + email.updatedAt}
                        >
                          {email.status === "error" ||
                          email.status === "new" ? (
                            <center>-</center>
                          ) : (
                            moment(email.updatedAt).format("DD-MM-YYYY")
                          )}
                        </TableCell>
                        <TableCell
                          className={classes.tableCell}
                          id={email._id + "-reciepients"}
                        >
                          {email.to + " "}
                          {email.cc ? ", " + email.cc : " "}
                          {email.bcc ? ", " + email.bcc : " "}
                        </TableCell>
                        <TableCell
                          className={classes.tableCell}
                          id={email._id + "-" + email.from}
                        >
                          {email.from}
                        </TableCell>
                        <TableCell
                          className={classes.tableCell}
                          id={email._id + "-" + email.subject}
                        >
                          {email.subject}
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                          <div>
                            <Button
                              id="view-message-button"
                              size="small"
                              color="success"
                              onClick={() => this.handleModelOpen(index)}
                            >
                              {" "}
                              View Message{" "}
                            </Button>
                            {this.state.selectedMessageIndex === index ? (
                              <Dialog
                                id="message-dialog"
                                open={
                                  this.state.selectedMessageIndex === index
                                }
                                keepMounted
                                onClose={this.handleClose}
                                aria-labelledby="alert-dialog-slide-title"
                                aria-describedby="alert-dialog-slide-description"
                                maxWidth={"md"}
                              >
                                <DialogTitle id="alert-dialog-slide-title">
                                  {"Message Content"}
                                </DialogTitle>
                                <DialogContent>
                                  {email.html ? (
                                    <div
                                      id="alert-dialog-slide-description"
                                      className={
                                        email.status === "error" &&
                                        classes.dialogErrorContentOverlay
                                      }
                                      dangerouslySetInnerHTML={{
                                        __html: this.reFormatEmailView(
                                          email.html
                                        ),
                                      }}
                                    />
                                  ) : (
                                    <div
                                      id="alert-dialog-slide-description"
                                      className={
                                        email.status === "error" &&
                                        classes.dialogErrorContentOverlay
                                      }
                                      dangerouslySetInnerHTML={{
                                        __html: email.text,
                                      }}
                                    />
                                  )}
                                  {email.status === "error" && (
                                    <div
                                      className={
                                        classes.dialogErrorContentOverlayText
                                      }
                                      style={
                                        this.checkForUserRoleAccess()
                                          ? { left: "8%" }
                                          : { left: "3%" }
                                      }
                                    >
                                      {this.checkForUserRoleAccess() ? (
                                        <p
                                          className={
                                            classes.dialogErrorContentOverlayTextContent
                                          }
                                        >
                                          {" "}
                                          Oops! There’s a problem with this
                                          message. Click{" "}
                                          <span
                                            className={
                                              classes.dialogErrorContentOverlayTextSpan
                                            }
                                            onClick={() =>
                                              this.navigateToAdminDashboard(
                                                email
                                              )
                                            }
                                          >
                                            here
                                          </span>{" "}
                                          to go to Admin Notifications.
                                        </p>
                                      ) : (
                                        <p
                                          className={
                                            classes.dialogErrorContentOverlayTextContent
                                          }
                                        >
                                          {" "}
                                          Oops! There’s a problem with this
                                          message. Please submit an incident
                                          in the IT Service Desk.
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                                <DialogActions>
                                  <Button
                                    id="close-message-button"
                                    onClick={this.handleClose}
                                    color="secondary"
                                    size="small"
                                  >
                                    Close{" "}
                                  </Button>
                                </DialogActions>
                              </Dialog>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
              "aria-label": "Previous Page",
            }}
            nextIconButtonProps={{
              "aria-label": "Next Page",
            }}
            onPageChange={this.handleChangePage}
            onRowsPerPageChange={this.handleChangeRowsPerPage}
            SelectProps={{
              disabled: this.state.pageLoading,
            }}
          />
        </Paper>
      </div>
    );
  }
}


Messages.propTypes = {
  classes: PropTypes.object.isRequired,
  customerDetails: PropTypes.object,
  lmContractSysId: PropTypes.string,
  smeEmails: PropTypes.array,
  retrieveEmailNotificationsBySme: PropTypes.func.isRequired,
  clearSmeEmailNotifications: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
  selectedLoan: PropTypes.object,
  getSmeLoansByQuery: PropTypes.func,
  changeCustomerDetails: PropTypes.func,
  setHeaderDisplaySubData: PropTypes.func,
  getLoanDetails: PropTypes.func,
  clearSelectedLoan: PropTypes.func,
  selectLoan: PropTypes.func,
  clearHeaderDisplaySubData: PropTypes.func,
  requestSmeLoans: PropTypes.func,
  getMessagesListForLoanDashboard: PropTypes.func,
  pagination: PropTypes.object,
  isLoadingMessagesList: PropTypes.bool,
  clearMessagesListStates: PropTypes.func,
  displayNotification: PropTypes.func
};

const mapStateToProps = state => {
  return {
    smeEmails: state.notifications.smeEmails,
    isDashboardContent: state.user.isDashboardContent,
    customerDetails: state.lmglobal.customerDetails,
    selectedLoan: state.lmglobal.selectedLoan,
    lmCustomerSysId: state.lmglobal.customerDetails.id,
    lmContractSysId: state.lmglobal.selectedLoan._id,
    lmContractId: state.lmglobal.selectedLoan.contractId,
    pagination: state.notifications.messagesListPagination,
    MessagesListQuery: state.notifications.MessagesListQuery,
    isLoadingMessagesList: state.notifications.isLoadingMessagesList
  };
};

const mapDispatchToProps = dispatch => {
  return {
    retrieveEmailNotificationsBySme: (smeId) => dispatch(retrieveEmailNotificationsBySme(smeId)),
    clearSmeEmailNotifications: () => (dispatch(clearSmeEmailNotifications())),
    getSmeLoansByQuery: (condition, fields) => dispatch(getSmeLoansByQuery(condition, fields)),
    setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
    changeCustomerDetails: (data) => dispatch(changeCustomerDetails(data)),
    getLoanDetails: (contractId) => dispatch(getSingleLoanOverviewData(contractId)),
    clearSelectedLoan: () => dispatch(clearSelectedLoan()),
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    selectLoan: (loan) => dispatch(selectLoan(loan)),
    requestSmeLoans: (contractId) => dispatch(requestSmeLoans(contractId)),
    getMessagesListForLoanDashboard: (queryParams) => dispatch(getMessagesListForLoanDashboard(queryParams)),
    clearMessagesListStates: () => dispatch(clearMessagesListStates()),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withRouter(Messages)));
