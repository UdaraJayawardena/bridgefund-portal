//import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/bridgefundPortal/views/mandateOverviewStyles";
import Button from "components/loanmanagement/CustomButtons/Button.jsx";
import {  Paper,Table,TableBody,TableCell,TableHead,TableRow,TableSortLabel, TableContainer, TablePagination} from "@material-ui/core";

import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';

import { getMandateList, updateMandate, getMandateByMandateId, getPaginatedMandate } from "store/loanmanagement/actions/MandateApproval";

import Util from "lib/loanmanagement/utility";
import ENV from '../../../config/env';
import ConfirmationDialog from 'components/loanmanagement/ConfirmationDialog/ConfirmationDialog';
import NewMandate from "../Mandate/NewMandate";
import { MandateStatus } from '../../../constants/loanmanagement/sme-mandate-const';
import { ContentCutOutlined } from "@mui/icons-material";
import moment from "moment";

export const StatusTypes   = { 
  All: 'all', 
  New: 'new', 
  Signed_Pending_Debtor_Bank: 'signed-pending-debtor-bank',
  Signed: 'signed',   
  Active: 'active',
  'Cancelled/Expired': 'cancelled/expired',
  Confirmed: 'confirmed',
  Rejected: 'rejected' 
};

const API_GATEWAY_URL = ENV.API_GATEWAY_URL;

class MandateApprovalOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status : ['new','signed-pending-debtor-bank','signed','active','cancelled','expired','confirmed','rejected'],
      order: "desc",
      orderBy: "mandateId",
      mandateList: [],
      isShowDialog: false,
      selectedMandateId: '',
      buttonAction: '',
      selectedStatus: 'all',
      isShowMandate: false,

      page: 0,
      rowsPerPage: 25,
      paginatedCustomers: [],
      filteredCustomers: [],
      totalRows: 0
    };
  }
 
  componentDidMount() {
    this.getPaginatedMandate();
  }

  // eslint-disable-next-line no-unused-vars
  handleRequestSort = (property, event) => {
    const orderBy = property;
    let order = "desc";
    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }
    this.setState({ order, orderBy });
  };
  
  /** Load data for selected status array */
  loadMandateDetails = (value) =>{
    this.setState({ selectedStatus:value, page:0 }, () => this.getPaginatedMandate());   
  }

  /** Selected status type mapped into the array */
  statusMapper = (status) =>{
    let status_array=[];
    if(status==='all'){
      status_array=['new','signed-pending-debtor-bank','signed','active','cancelled','expired','confirmed','rejected'];
    }else if(status==='cancelled/expired'){
      status_array=['cancelled','expired'];    
    }else{
      status_array=[status];
    }
    return status_array;
  }
  
  /** Create the pdf download link for given mandate number */
  getPdfUrl=(mandateId)=>{    
    return API_GATEWAY_URL+'/direct-debits/sme-mandates/mandate-id/'+mandateId+'/download';
  }

  getSelectedSmeId(mandateId){
    const { getMandateByMandateId } = this.props;
    getMandateByMandateId(mandateId).then((data)=>{      
      const smeId = data[0]?data[0].smeId:'';
      this.setState({'selectedSmeId': smeId}); 
    });
  }

  refreshTable = () => {     
    this.loadMandateDetails(this.state.selectedStatus);  
  }

  addNewMandateClick = () => {     
    this.setState({
      isShowMandate: true
  });
  }

  actionButtonClick = (e, mandateId, action) => {  
    let dialogTitle       = '';
    let dialogDescription = '';

    switch (action) {
      case 'approve'  : dialogTitle = 'Approve Mandate'; dialogDescription = 'Are you sure to approve the mandate'; break;
      case 'reject'   : dialogTitle = 'Reject Mandate' ; dialogDescription = 'Are you sure to reject the mandate';  break;
      case 'cancelled': dialogTitle = 'Confirm Mandate'; dialogDescription = 'Are you sure to have taken appropriate action for'; break;
      case 'expired'  : dialogTitle = 'Confirm Mandate'; dialogDescription = 'Are you sure to have taken appropriate action for'; break;
      default         : dialogTitle = '';                dialogDescription = ''; break;
    }
    this.getSelectedSmeId(mandateId);
    
    this.setState({
      'selectedMandateId': mandateId, 
      'buttonAction'     : action,
      'dialogTitle'      : dialogTitle,
      'dialogDescription': dialogDescription      
    });  
    this.showDialog();   
  }

  showDialog = () => {
    this.setState({
        isShowDialog: true
    });
  }

  closeDialog = () => {
    this.setState({
        isShowDialog: false
    });
  }
 
  handleDialogOkResponse = () => {   
    const { buttonAction, selectedMandateId } = this.state; 
   
    switch (buttonAction) {
      case 'approve'  : this.updateMandateRecord(selectedMandateId, MandateStatus.ACTIVE  );  break;
      case 'reject'   : this.updateMandateRecord(selectedMandateId, MandateStatus.REJECTED);  break;
      case 'cancelled': this.updateMandateRecord(selectedMandateId, MandateStatus.CONFIRMED); break;
      case 'expired'  : this.updateMandateRecord(selectedMandateId, MandateStatus.CONFIRMED);   break;
      default         : break;
    }
    this.setState({ isShowDialog: false });    
  }

  updateMandateRecord = (mandateId, status) => {
    const { updateMandate } = this.props;
    
    const param = {
      "action"   : "update",
      "mandateId": mandateId, 
      "smeId"    : this.state.selectedSmeId,     
      "status"   : status,      
    };
    updateMandate(param)
    .then((data)=>{
      this.refreshTable();
    })
    .catch(e => {
      console.log('error in mandate update ', e);
    });
  }

  cancelMandate = () => {
    this.setState({
        isShowMandate: false
    });
  }
 
  // paginated mandate
  getPaginatedMandate = () => {    
    const { page, rowsPerPage, selectedStatus } = this.state;
    const status = this.statusMapper(selectedStatus); 
    const queryParam  = {"status":status,"is_contract_doc":false};
    
    const data = { page: page, isNeedPagination: true, limit: rowsPerPage, 
      fields: ['bicCode', 'mandateId', 'status', 'smeId', 'maxAmount', 'confirmationWarning', 'ibanNumber', 'contractDocument', 'legalName','customerName','createdBy','startDate','eMandate'],
      query: queryParam
    };
    this.setState({ isShowLoader: true }, () => {
      this.props.getPaginatedMandate(data)
        .then((response) => {
          const responseData = {
            page: response.currentPage,
            totalRows: response.totalCount,
            mandateList: response.data,
            isShowLoader: false
          };
          this.setState(responseData);
          if (response.data === 0) {
            this.props.displayNotification('Sorry no search results found.', 'warning');
          }
        })
        .catch((error) => {
          this.setState({
            page: 0,
            isShowLoader: false
          });
        });
    });
  }

  /* Pagination handlers */
  handleChangePage = (event, page) => {
    this.setState({ page }, () => { this.getPaginatedMandate(); });
  };

  /*Rows per page handlers */
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value, page:0 }, () => { this.getPaginatedMandate(); });
  };

  render() {
    const { classes } = this.props;
    const { mandateList, rowsPerPage, page, totalRows } = this.state;

    return (
      <div>        
        <div>  
          <NewMandate             
            open={this.state.isShowMandate}
            handleCancel={() => this.cancelMandate()} 
          />

          <ConfirmationDialog title={this.state.dialogTitle}
            content={this.state.dialogDescription+' "'+this.state.selectedMandateId+'" ?'}
            cancel='NO'
            ok='YES'
            open={this.state.isShowDialog}
            handleOk={ () => this.handleDialogOkResponse() }
            handleCancel={() => this.closeDialog()} 
          />                        
          <GridContainer > 
            <GridItem xs={12} sm={3} md={2}>
              <CustomInputBox                  
                type='dropdown'
                id='status-type'
                label='Status Type'
                defaultValue = 'all'
                onChange={(event, newValue) => {
                  if (newValue) {
                    this.setState({ status: newValue });
                    if (newValue !== '') {
                      this.loadMandateDetails(newValue);
                    }
                  }
                }}
                dropDownValues={Object.keys(StatusTypes).map(key => { return { key: key, value: StatusTypes[key] }; })}
                isNoneInDropDownList={false}
              />
            </GridItem>
            <GridItem>                
            </GridItem>                  
            <GridItem  >
              {/* <Button id="add-mandate-button" className={classes.darkBlueButtonLG}  onClick={this.addNewMandateClick}  >                        
                  ADD MANDATE	
              </Button>               */}
            </GridItem>            
          </GridContainer>
        </div>
        <TableContainer component={Paper} className={classes.tableContainer} >
          <Table id="mandate-overview-table" className={classes.table} >
            <TableHead id="mandate-overview-table-head" >
              <TableRow id="mandate-overview-table-header-row" className={classes.tableHeaderRow} >                  
                <TableCell className={classes.tableHeaderCell}>Action</TableCell>
                <TableCell className={classes.tableHeaderCell}>Customer</TableCell>
                <TableCell className={classes.tableHeaderCell}>eMandate</TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'mandateId'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'mandateId')}>Mandate-ID</TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>Mandate Date</TableCell>
                <TableCell className={classes.tableHeaderCell}>Status</TableCell>
                <TableCell className={classes.tableHeaderCellRightAlign}>Customer-Limit</TableCell>
                <TableCell className={classes.tableHeaderCell}>Warning</TableCell>
                <TableCell className={classes.tableHeaderCell}>PDF</TableCell>
                <TableCell className={classes.tableHeaderCell}>IBAN-Entered By-Customer</TableCell>                  
                <TableCell className={classes.tableHeaderCell}>Customer-Name <br></br>Bank-Account</TableCell>
                <TableCell className={classes.tableHeaderCell}>User</TableCell> 
              </TableRow>
            </TableHead>
            <TableBody>            
              {                
                Util.stableSort(mandateList,Util.getSorting(this.state.order, this.state.orderBy))
                .map(mandate => (
                  <TableRow key={mandate._id}>
                    <TableCell className={classes.tableBodyCell}>
                      <div style={{ width:'120px'}}>
                        {(() => {
                          switch (mandate.status) {
                            case 'signed':
                              return  <div style={{ width:"150px" }}>
                                        <Button id="approve-button" className={classes.purpleButtonSM} onClick={(e) => this.actionButtonClick(e, mandate.mandateId, 'approve')} > Approve</Button> 
                                        <Button id="reject-button" className={classes.purpleButtonSM}  onClick={(e) => this.actionButtonClick(e, mandate.mandateId, 'reject')} > Reject</Button> 
                                      </div>
                            case 'cancelled':
                              return  <div>
                                        <Button id="confirm-button" className={classes.purpleButtonSM} onClick={(e) => this.actionButtonClick(e, mandate.mandateId, 'cancelled')} > Confirm</Button>
                                      </div> 
                            case 'expired':
                              return  <div>
                                        <Button id="confirm-button" className={classes.purpleButtonSM} onClick={(e) => this.actionButtonClick(e, mandate.mandateId, 'expired')} > Confirm</Button>
                                      </div>
                            default:
                              return <div className={classes.alginCenter} >-</div>
                            }
                          })()
                        }   
                      </div>           
                    </TableCell>   
                    <TableCell className={classes.tableBodyCell}>{mandate.legalName}</TableCell>                   
                    <TableCell className={classes.tableBodyCell}>{mandate.eMandate?'Yes':'No'}</TableCell>                   
                    <TableCell className={classes.tableBodyCell}>{mandate.mandateId}</TableCell>                      
                    <TableCell className={classes.tableBodyCell}>{moment(mandate.startDate).format('YYYY-MM-DD')}</TableCell>
                    <TableCell className={classes.tableBodyCell}>{mandate.status}</TableCell>
                    <TableCell className={classes.tableBodyCellRightAlign}>{Util.currencyConverter()(mandate.maxAmount)}</TableCell>
                    <TableCell className={classes.tableBodyCell}>{Util.showMessage(mandate.confirmationWarning)}</TableCell>
                    <TableCell className={classes.tableBodyCell}> 
                      {
                        mandate.isPdfAvailable?
                          <a disabled={!mandate.isPdfAvailable} href={this.getPdfUrl(mandate.mandateId)} >
                            <Button className={classes.darkBlueButtonMD} > Download</Button>
                          </a>
                        :
                          <Button className={classes.darkBlueButtonMD} > Not available</Button>
                      }                    
                    </TableCell>
                    <TableCell className={classes.tableBodyCell}>{mandate.ibanNumber}</TableCell>                      
                    <TableCell className={classes.tableBodyCell}>{mandate.customerName}</TableCell>                      
                    <TableCell className={classes.tableBodyCell}>{mandate.createdBy}</TableCell>                      
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>    
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 80, 100]}
            component="div"
            count={(this.state.showSearchBar) ? mandateList.length : totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            backIconButtonProps={{ 'aria-label': 'Previous Page' }}
            nextIconButtonProps={{ 'aria-label': 'Next Page' }}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />  
        </TableContainer> 
      </div>
    );
  }
}

MandateApprovalOverview.propTypes = {
  classes: PropTypes.object.isRequired,  
  getMandateList : PropTypes.func.isRequired,
  selectedMandateId : PropTypes.string,
  buttonAction : PropTypes.string,
  updateMandate : PropTypes.func.isRequired,
  getMandateById : PropTypes.func,
};

const mapStateToProps = state => {
  return {    
  };
};

const mapDispatchToProps = dispatch => {
  return {    
    getMandateList: (data) => dispatch(getMandateList(data)),
    updateMandate:  (data) => dispatch(updateMandate(data)),
    getMandateByMandateId: (mandateId) => dispatch(getMandateByMandateId(mandateId)),
    getPaginatedMandate: (data) => dispatch(getPaginatedMandate(data))
   
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(MandateApprovalOverview));
