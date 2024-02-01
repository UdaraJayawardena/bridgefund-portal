/* eslint-disable no-nested-ternary */
import moment from 'moment';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';

// @material-ui/core components
import Table from '@material-ui/core/Table';
import Tooltip from '@material-ui/core/Tooltip';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';

import withStyles from '@material-ui/core/styles/withStyles';
import tasksStyle from 'assets/jss/material-dashboard-react/components/tasksStyle.jsx';

import Card from 'components/loanmanagement/Card/Card.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import { getBicFrmIban } from 'store/loanmanagement/actions/BicIban';

import {
  toggleAddNew,
  clearMandateError,
  saveNewMandate,
  selectMandate,
  deSelectMandate,
  showAddContact,
  showAddFlexContact,
  showAddTransaction,
  createMandatebussy,
  clearBicField,
  activateSepaMandate,
  downloadMandate,
  addNewLoanRequestId,
  inactivateMandate,
  activateSelectedMandate,
  updateMandateStatus,
  changeMandateStatusToSigningPending
} from 'store/loanmanagement/actions/Mandates';

import LoadingOverlay from 'react-loading-overlay';
import copyIcon from 'assets/icons/copy_clipbord.svg';
import copiedIcon from 'assets/icons/Copied.png';
import 'react-datepicker/dist/react-datepicker.css';

import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckCircleTwoTone from '@material-ui/icons/CheckCircleTwoTone';
import Error from '@material-ui/icons/Error';
import FileCopy from '@material-ui/icons/FileCopy';
import Vibration from '@material-ui/icons/Vibration';

import Button from 'components/loanmanagement/CustomButtons/Button.jsx';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';

import Drawer from '@material-ui/core/Drawer';
import Paper from "@material-ui/core/Paper";
import { Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

import { requestSmeMandates, requestDirectDebitsByMandate } from 'store/loanmanagement/actions/SmeLoanTransaction';

import MoreHorizRounded from '@material-ui/icons/MoreHorizRounded';
import SpellCheck from '@material-ui/icons/Spellcheck';
import SaveAlt from '@material-ui/icons/SaveAlt';

import { Switch } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import HdrAutoIcon from '@mui/icons-material/HdrAuto';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateIcon from '@mui/icons-material/Create';

import ENV from "../../../config/env";
import { Link } from 'react-router-dom';
const api = ENV.DIRECT_DEBITS_URL;
const returnURL = ENV.MANDATE_RETURN_URL;

const curr = new Date();
curr.setDate(curr.getDate());
const defaultDate = curr.toISOString().substr(0, 10);

const farDate = new Date();
farDate.setFullYear(farDate.getFullYear() + 10);
const defaultEndDate = farDate.toISOString().substr(0, 10);

class Mandates extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: copyIcon,
      defaultStartDate: defaultDate,
      defaultEndDate: defaultEndDate,
      mandateType: 'B2B',
      checked: false,
      showConfirmation: false,
      selectedMandate: null,
      selectedCustomer: null,
      showAddLoanReq: false,
      selectedLinkedToLoanRequest: [],
      showInactivateConfirmation: false,
      showSetMandateToActivateConfimation: false,
      showStatusUpdateConfimation: false,
      activeMandateIds: null,
      updatedStatus: null,
      currentStatus: null,
      showStatusChangeDropDown:true,
    };
  }

  componentDidUpdate(nextProps) {
    if (nextProps.mandates && this.props.mandates !== nextProps.mandates) {
      this.setState({ mandates: nextProps.mandates });
    }
  }

  handleAddNewMandate() {
    this.props.toggleAddNewMandate();

    this.props.clearMandateError();

    this.props.clearBicField();
  }

  handleSwitchOnChange(event) {
    const switchOnChange = event.target.checked;

    this.setState({ checked: switchOnChange });
  }

  handleSaveMandate() {
    this.props.createNewMandate(this.props.customerDetails.id,);
  }

  copyToClipBoard(text, imageId, customerId, status) {
    if (text) {
      const tempInput = document.createElement('input');
      // @ts-ignore
      tempInput.style = 'position: absolute; left: -1000px; top: -1000px';
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      document.getElementById(imageId).title = 'Copied..!!';
      if(status === 'new'){
      this.changeStatusToSigningPending(imageId, customerId);
      }
    }

    this.setState({
      [imageId]: copiedIcon
    });

    setTimeout(() => {
      this.setState({
        [imageId]: undefined
      });
    }, 1000);
  }

  activeSepaMandate(mandateId, customerId) {

    this.setState({
      showConfirmation: true,
      selectedMandate: mandateId,
      selectedCustomer: customerId
    })
    

  }

  handleSelectedMandates(event, mandate) {
    if (event.target.checked) {
      this.props.selectMandate(mandate);
    } else {
      this.props.deSelectMandate(mandate);
    }
  }

  // generate BIC from IBAN Number  event.target.value
  handleChange = event => {
    const { getBicNo } = this.props;
    if (event.target.value !== '') {
      getBicNo(event.target.value);
    } else {
      this.bicNum = { bic: 'IBAN is invalid!' };
    }
  };

  handleSelectedStartDate(date) {
    this.setState({
      defaultStartDate: moment(date.target.value).format('YYYY-MM-DD').toString()
    });
  }

  handleSelectedEndDate(date) {
    this.setState({
      defaultEndDate: moment(date.target.value).format('YYYY-MM-DD').toString()
    });
  }

  handleChangeRowData = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleDownload = async (mandateId, documentId) => {
    this.props.downloadMandate(mandateId, documentId);
  }


  toggleDrawer = (type, container, side, open) => {

    this.setState({
      bottom: open,
      panelType: type
    });

    if (open) {
      switch (type) {
        case 'Loans':
          this.props.requestDirectDebitsByMandate(container);
          break;
        case 'DirectDebits':
          this.props.getSmeMandates(container);
          this.props.requestDirectDebitsByMandate(container);
          break;
        default:
          break;
      }
    }

  };

  handleCloseDialog = () => {
    this.setState({
      showConfirmation: !this.state.showConfirmation,
      selectedMandate: null,
      selectedCustomer: null
    });
  }

  handleConfirmDialog = () => {
  
    const { selectedMandate, selectedCustomer } = this.state;
    const { activateSepaMandate, displayNotification } = this.props;

    if(selectedMandate && selectedCustomer){
      activateSepaMandate(selectedMandate, selectedCustomer)
      this.setState({
        showConfirmation: false,
        selectedMandate: null,
        selectedCustomer: null
      });
      
    }else{
      displayNotification('Should select a mandate', 'warning');
    }
  }

  addNewLoanReqId(mandateId, customerId, linkedToLoanRequest, selectedIban) {

    this.setState({
      showAddLoanReq: true,
      selectedMandate: mandateId,
      selectedCustomer: customerId,
      selectedLinkedToLoanRequest: linkedToLoanRequest,
      selectedIban: selectedIban,
    });
    

  }

  handleCloseAddLoanReqDialog = () => {
    this.setState({
      showAddLoanReq: !this.state.showAddLoanReq,
      selectedMandate: null,
      selectedCustomer: null,
      selectedLinkedToLoanRequest: [],
      selectedIban: null,
    });
  }

  handleConfirmAddLoanReqDialog = () => {
   
    const { selectedMandate, selectedCustomer, selectedLinkedToLoanRequest, selectedIban } = this.state;
    const {addNewLoanRequestId, displayNotification } = this.props;
    if(selectedMandate && selectedCustomer){
      const newLoanReqId = document.getElementById('addNewLoanReqId').value;
      if(selectedLinkedToLoanRequest.indexOf(newLoanReqId) !== -1){
        displayNotification('Entered loan request Id is duplicate.Please enter new Id', 'warning');
      }else{
        const updatedLoanReqIds = [...selectedLinkedToLoanRequest, newLoanReqId]; // Create a new array with the new loan req id
        addNewLoanRequestId(selectedMandate, selectedCustomer, newLoanReqId, updatedLoanReqIds, selectedIban);
        this.setState({
          showAddLoanReq: false,
          selectedMandate: null,
          selectedCustomer: null,
          selectedLinkedToLoanRequest: [],
          selectedIban: null,

        });
      }
    }else{
      displayNotification('Should select a mandate', 'warning');
    }
  }

  inactiveMandate(mandateId, customerId) {

    this.setState({
      showInactivateConfirmation: true,
      selectedMandate: mandateId,
      selectedCustomer: customerId,
    });
  }

  handleCloseInactivateDialog = () => {
    this.setState({
      showInactivateConfirmation: !this.state.showInactivateConfirmation,
      selectedMandate: null,
      selectedCustomer: null,
    });
  }

  handleConfirmInactivateDialog = () => {
   
    const { selectedMandate, selectedCustomer } = this.state;
    const { inactivateMandate, displayNotification } = this.props;

    if(selectedMandate ){
      inactivateMandate(selectedMandate, selectedCustomer);
      this.setState({
        showInactivateConfirmation: false,
        selectedMandate: null,
        selectedCustomer: null,
      });      
    }else{
      displayNotification('Should select a mandate', 'warning');
    }
  }

  setMandateToActive(mandateId, customerId, selectedIban) {

    this.setState({
      showSetMandateToActivateConfimation: true,
      selectedMandate: mandateId,
      selectedCustomer: customerId,
      selectedIban: selectedIban,
    });
  }

  handleConfirmSetMandateToActivateDialog = () => {
   
    const { selectedMandate, selectedCustomer, selectedIban } = this.state;
    const { activateSelectedMandate, displayNotification } = this.props;

    if(selectedMandate && selectedCustomer && selectedIban ){
      const obj = {
        mandateToActivate: selectedMandate,
        customerId: selectedCustomer,
        ibanNumber: selectedIban
      };
      activateSelectedMandate(obj);
      this.setState({
        showSetMandateToActivateConfimation: false,
        selectedMandate: null,
        selectedCustomer: null,
        selectedIban: null,
      });      
    }else{
      displayNotification('Should select a mandate', 'warning');
    }
  }

  handleCloseSetMandateToActivateDialog = () => {
    this.setState({
      showSetMandateToActivateConfimation: !this.state.showSetMandateToActivateConfimation,
      selectedMandate: null,
      selectedCustomer: null,
      selectedIban: null,
    });
  }

  disableSelectMandateRadio(mandate) {
    if(mandate.eMandate === true){
      if((mandate.status === 'active') && (mandate.remarks && mandate.remarks.length === 0)){
         return false;
      }
    return true;
    }
      if((mandate.status === 'active'||mandate.status ===
      'signed-pending-debtor-bank' || mandate.status === 'signed' || mandate.status === 'signing_pending') && (mandate.remarks && mandate.remarks.length === 0)){
        return false;
      }
      return true;   
  }


  handleOptionChange = (event) => {
    this.setState({
      updatedStatus: event.target.value,
      showStatusChangeDropDown: false,
    });
  };

  handleCloseStatusUpdateDialog = () => {
    this.setState({
      showStatusUpdateConfimation: !this.state.showStatusUpdateConfimation,
      selectedMandate: null,
      activeMandateIds: null,
      updatedStatus: null,
      selectedCustomer: null,
      currentStatus: null,
      showStatusChangeDropDown: true
    });
  }

  handleConfirmStatusUpdateDialog = () => {
   
    const { selectedMandate, updatedStatus, selectedCustomer } = this.state;
    const { updateMandateStatus, displayNotification } = this.props;

    if(selectedMandate ){
      updateMandateStatus(selectedMandate, updatedStatus, selectedCustomer);  
      this.setState({
        showStatusUpdateConfimation: false,
        selectedMandate: null,
        selectedCustomer: null,
        activeMandateIds: null,
        updatedStatus: null,
        currentStatus: null,
        showStatusChangeDropDown: true
      });
          
    }else{
      displayNotification('Should select a mandate', 'warning');
    }
  }
  handleUpdateStatusDropdown = (mandateId, customerId, status) => {
    const  excludeId = [mandateId];
    const activeIds = this.props.smeMandatesByCustomer
            .filter(item => item.status === 'active')
            .map(item => item.mandateId)
            .filter(id => !excludeId.includes(id));
    this.setState({
      showStatusUpdateConfimation: true,
      selectedMandate: mandateId,
      activeMandateIds:activeIds,
      selectedCustomer: customerId,
      currentStatus: status
    });
  }

statusOptions = {
    new: ['NEW','SIGNING_PENDING', 'SIGNED','CANCELLED', 'INACTIVE'],
    signed: ['SIGNED','ACTIVE', 'CANCELLED', 'INACTIVE'],
    'signed-pending-debtor-bank': ['SIGNING_PENDING','SIGNED','ACTIVE', 'CANCELLED', 'INACTIVE'],
    active: ['ACTIVE', 'INACTIVE'],
    canceled: ['INACTIVE'],
    rejected: ['INACTIVE'],
    expired: ['INACTIVE'],
    deleted: ['INACTIVE'],
    inactive: ['INACTIVE']
  };

  changeStatusToSigningPending(mandateId, customerId) {

    const { changeMandateStatusToSigningPending } = this.props;
    changeMandateStatusToSigningPending(mandateId, customerId);
  }

  render() {

    const {
      classes,
      rtlActive,
      mandates,
      addingNewMandate,
      selectedMandate,
      addingNewMandateBtn,
      addingMandateIsBusy,
      bicNum,
      tableHeaderColor,
      directdebits,
      smeMandatesByCustomer
    } = this.props;

    const tableCellClasses = classnames(classes.tableCell, {
      [classes.tableCellRTL]: rtlActive
    });

    const values = smeMandatesByCustomer;

    return (
      <LoadingOverlay
        active={addingMandateIsBusy}
        spinner
        text="Creating Mandate"
      >
        <div>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <Card >
                <CardHeader color = 'newInfo'>

                  <div style={{ position: 'relative', float: 'left' }}>
                    <h5 style={{ textAlign: 'left', float: 'left'}}>Mandates</h5>

                    <label style={{ textAlign: 'left', float: 'left', marginTop: 36, marginLeft: 10, color: 'red', fontSize: 12, display: 'none'}}>Show active mandates only</label>

                    <div style={{ textAlign: 'right', float: 'right', marginTop: 25, marginLeft: 10, display: 'none' }}>
                      <Tooltip title=''>
                        <Switch
                          className="mandate-switch"
                          size='medium'
                          color="default"
                          focusVisibleClassName=".MuiSwitch-edgeStart"
                          checked={this.state.checked}
                          onChange={this.handleSwitchOnChange.bind(this)}
                        />
                      </Tooltip>
                    </div>

                  </div>
                  <div style={{ position: 'relative', float: 'right' , marginTop: 19}}>
                    <Button
                    style={{ backgroundColor: '#00b38f'}}
                      color="green"
                      size="sm"
                     
                      onClick={this.handleAddNewMandate.bind(this)}
                    >
                      {addingNewMandateBtn}
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <Table className={classes.table}>
                        <TableHead className={classes.tableRow}>
                          <TableRow
                            key={'tasks_header'}
                            className={classes.tableRow}
                          >
                            
                            <TableCell className={tableCellClasses}>
                              {'Mandate Id'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Mandate Type'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Status'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Status Reason'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Date Initiated'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'IBAN'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Loan Request'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Download PDF / Copy Link'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Update status'}
                            </TableCell>
                            <TableCell className={tableCellClasses}>

                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {'Select'}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {values.map((mandate, key) => {
                            const switchOption = (this.state.checked) ? 'active' : 'all';
                            if (mandate && switchOption === mandate.status) {
                              return mandates && (
                                <TableRow
                                  key={key}
                                  className={classes.tableRow}
                                  style={{
                                    backgroundColor:
                                      (mandate.remarks && mandate.remarks.length>0) &&
                                      '#f49090'
                                  }}
                                >
                                 
                                  
                                  <TableCell className={tableCellClasses}>
                                    {(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
                                      <Link to="#" onClick={this.toggleDrawer.bind(this, 'DirectDebits', mandate.mandateId, 'bottom', true)}>
                                        {mandate.mandateId}
                                      </Link>
                                    }
                                    {(process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') &&
                                      mandate.mandateId
                                    }
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                  {mandate.eMandate === true ? 'eMandate':'sepaMandate'}
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                    {mandate.status}
                                  </TableCell>
                                  <Tooltip
                                    disableHoverListener={(mandate.remarks && mandate.remarks.length > 0) ? false : true}
                                    title={
                                      <div style={{ color: '#FFCC00', fontSize: '10pt' }}>
                                        {mandate.remarks?mandate.remarks.map((remark) => (
                                        <li>{remark}</li>
                                    )):null}
                                      </div>
                                    }
                                  >
                                  <TableCell className={tableCellClasses}>
                                  {mandate.remarks && mandate.remarks.length}
                                  </TableCell>
                                  </Tooltip>
                                  <TableCell className={tableCellClasses}>
                                    {moment(mandate.startDate).format(
                                      'DD-MM-YYYY'
                                    )}
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                  {mandate.ibanNumber}
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                  {mandate.linkedToLoanRequests ? (
                                      <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {mandate.linkedToLoanRequests.map((loanRequest) => (
                                          <li key={loanRequest}>{loanRequest}</li>
                                        ))}
                                      </ul>
                                    ) : null}
                                  </TableCell>

                                  <TableCell className={tableCellClasses}>
                                    {mandate.status === 'signed' ? (
                                      (mandate.remarks && mandate.remarks.length > 0) ? (
                                        <Error
                                          className={classes.icon}
                                          color={'error'}
                                        />
                                      ) : (
                                        <CheckCircle
                                          className={classes.icon}
                                          style={{ color: '#333' }}
                                        />

                                      )
                                    )
                                      : mandate.status ===
                                        'active' ? (
                                        <CheckCircleTwoTone
                                          className={classes.icon}
                                          style={{ color: '#333' }}
                                        />
                                      ) : (
                                        this.state[mandate.mandateId] ?
                                          <Vibration style={{ color: '#333' }} />
                                          :(mandate.confirmationUrl?
                                          <Link to="#"><FileCopy
                                            className={classes.icon}
                                            style={{ color: '#333' }}
                                            titleAccess='Copy to Clipboard'
                                            id={mandate.mandateId}
                                            onClick={() => this.copyToClipBoard(mandate.confirmationUrl, mandate.mandateId, mandate.smeId, mandate.status)}
                                          /></Link> : null )
                                      )}

                                    {
                                      mandate.documentId ?
                                        <Link to="#"><SaveAlt
                                          className={classes.icon}
                                          style={{ color: '#333' }}
                                          titleAccess='Download contract document'
                                          onClick={() => this.handleDownload(mandate.mandateId, mandate.documentId)}
                                        /></Link>: false
                                    }
                                  </TableCell>
                                  <TableCell>
                                  <CreateIcon
                                        className={classes.icon}
                                        style={{ color: '#333',cursor: 'pointer' }}
                                        titleAccess='Update status'
                                        onClick={() => this.handleUpdateStatusDropdown(mandate.mandateId,mandate.smeId, mandate.status)} />
                                  </TableCell>

                                  <TableCell>
                                    {mandate.status === 'signed' && !mandate.eMandate &&
                                      <SpellCheck
                                        className={classes.icon}
                                        style={{ color: '#333' }}
                                        titleAccess='Activate Mandate'
                                        onClick={() => this.activeSepaMandate(mandate.mandateId, mandate.smeId)} />
                                    }
                                    {mandate.status === 'new' &&
                                      <DeleteIcon
                                        className={classes.icon}
                                        style={{ color: '#333' ,cursor: 'pointer'}}
                                        titleAccess='Inactive Mandate'
                                        onClick={() => this.inactiveMandate(mandate.mandateId, mandate.smeId)}
                                         />
                                    }
                                    {mandate.status !== ('active' || 'inactive') && !mandate.eMandate &&
                                      <HdrAutoIcon
                                      className={classes.icon}
                                      style={{ color: '#333',cursor: 'pointer' }}
                                      titleAccess='Set Mandate To Active'
                                      onClick={() => this.setMandateToActive(mandate.mandateId, mandate.smeId, mandate.ibanNumber)} />
                                    }
                                    {mandate.status === 'active' && mandate.linkedToLoanRequests &&
                                      <AddCircleOutlineIcon
                                      className={classes.icon}
                                      style={{ color: '#333',cursor: 'pointer' }}
                                      titleAccess='Add Loan Request Id'
                                        onClick={() =>
                                          this.addNewLoanReqId(
                                            mandate.mandateId,
                                            mandate.smeId,
                                            mandate.linkedToLoanRequests?mandate.linkedToLoanRequests:[],
                                            mandate.ibanNumber
                                          )
                                        }
                                        />}
                                  </TableCell>

                                  <TableCell className={tableCellClasses}>
                                    {this.disableSelectMandateRadio(mandate) ? (
                                      <input
                                        type="radio"
                                        name="selectMandate"
                                        className="mandate-checkbox"
                                        id={"selectMandate_" + mandate.mandateId}
                                        disabled
                                        onChange={event =>
                                          this.handleSelectedMandates(
                                            event,
                                            mandate
                                          )
                                        }
                                      />
                                    ) : (
                                      <input
                                        type="radio"
                                        name="selectMandate"
                                        className="mandate-checkbox"
                                        id={"selectMandate_" + mandate.mandateId}
                                        onChange={event =>
                                          this.handleSelectedMandates(
                                            event,
                                            mandate
                                          )
                                        }
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );

                            } else if (mandate && switchOption === 'all') {
                              return mandates && (
                                <TableRow
                                  key={key}
                                  className={classes.tableRow}
                                  style={{
                                    backgroundColor:
                                      (mandate.remarks && mandate.remarks.length>0) &&
                                      '#f49090'
                                  }}
                                >
                               
                                  <TableCell className={tableCellClasses}>
                                    {(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
                                      <Link to="#" onClick={this.toggleDrawer.bind(this, 'DirectDebits', mandate.mandateId, 'bottom', true)}>
                                        {mandate.mandateId}
                                      </Link>
                                    }
                                    {(process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') &&
                                      mandate.mandateId
                                    }
                                  </TableCell>

                                  <TableCell className={tableCellClasses}>
                                     {mandate.eMandate === true ? 'eMandate':'sepaMandate'}
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                    {mandate.status}
                                  </TableCell>
                                  <Tooltip
                                    disableHoverListener={(mandate.remarks && mandate.remarks.length > 0) ? false : true}
                                    title={
                                      <div style={{ color: '#FFCC00', fontSize: '10pt' }}>
                                        {mandate.remarks? mandate.remarks.map((remark) => (                                    
                                        <li>{remark}</li>                                     
                                        )): null}
                                      </div>
                                    }
                                  >
                                    <TableCell className={tableCellClasses}>
                                      {mandate.remarks && mandate.remarks.length}
                                    </TableCell>
                                  </Tooltip>
                                  <TableCell className={tableCellClasses}>
                                    {moment(mandate.startDate).format(
                                      'DD-MM-YYYY'
                                    )}
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                  {mandate.ibanNumber}
                                  </TableCell>
                                  <TableCell className={tableCellClasses}>
                                  
                                   {mandate.linkedToLoanRequests ? (
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                          {mandate.linkedToLoanRequests.map((loanRequest) => (
                                            <li key={loanRequest}>{loanRequest}</li>
                                          ))}
                                        </ul>
                                      ) : null}
                                  </TableCell>

                                  <TableCell className={tableCellClasses}>
                                    {mandate.status === 'signed' ? (
                                      (mandate.remarks && mandate.remarks.length > 0) ? (
                                        <Error
                                          className={classes.icon}
                                          color={'error'}
                                        />
                                      ) : (
                                        <CheckCircle
                                          className={classes.icon}
                                          style={{ color: '#333' }}
                                        />
                                      )
                                    )
                                      : mandate.status ===
                                        'active' ? (
                                        <CheckCircleTwoTone
                                          className={classes.icon}
                                          style={{ color: '#333' }}
                                        />
                                      ) : (
                                        this.state[mandate.mandateId] ?
                                          <Vibration style={{ color: '#333' }} />
                                          :(mandate.confirmationUrl?
                                          <Link to="#"><FileCopy
                                            className={classes.icon}
                                            style={{ color: '#333' }}
                                            titleAccess='Copy to Clipboard'
                                            id={mandate.mandateId}
                                            onClick={() => this.copyToClipBoard(mandate.confirmationUrl, mandate.mandateId, mandate.smeId, mandate.status)}
                                          /></Link>: null)
                                      )}

                                      {
                                        mandate.documentId ?
                                        <Link to="#"><SaveAlt
                                          className={classes.icon}
                                          style={{ color: '#333' }}
                                          titleAccess='Download contract document'
                                          onClick={() => this.handleDownload(mandate.mandateId, mandate.documentId)}
                                        /></Link> : false
                                    }
                                  </TableCell>
                                  <TableCell>
                                  <CreateIcon
                                        className={classes.icon}
                                        style={{ color: '#333',cursor: 'pointer' }}
                                        titleAccess='Update status'
                                        onClick={() => this.handleUpdateStatusDropdown(mandate.mandateId,mandate.smeId, mandate.status)} />
                                  </TableCell>

                                  <TableCell>
                                    {mandate.status === 'signed' && !mandate.eMandate &&
                                      <SpellCheck
                                        className={classes.icon}
                                        style={{ color: '#333' }}
                                        titleAccess='Activate Mandate'
                                        onClick={() => this.activeSepaMandate(mandate.mandateId, mandate.smeId)} />
                                    }
                                    {mandate.status === 'new' &&
                                      <DeleteIcon
                                        className={classes.icon}
                                        style={{ color: '#333' ,cursor: 'pointer'}}
                                        titleAccess='Inactive Mandate'
                                        onClick={() => this.inactiveMandate(mandate.mandateId, mandate.smeId)}
                                         />
                                    }
                                     {mandate.status !== 'active' && mandate.status !==  'inactive' && !mandate.eMandate &&
                                      <HdrAutoIcon
                                        className={classes.icon}
                                        style={{ color: '#333',cursor: 'pointer' }}
                                        titleAccess='Set Mandate To Active'
                                        onClick={() => this.setMandateToActive(mandate.mandateId, mandate.smeId, mandate.ibanNumber)} />
                                    }
                                    {mandate.status === 'active' && mandate.linkedToLoanRequests &&
                                      <AddCircleOutlineIcon
                                      className={classes.icon}
                                      style={{ color: '#333',cursor: 'pointer' }}
                                      titleAccess='Add Loan Request Id'
                                        onClick={() =>
                                          this.addNewLoanReqId(
                                            mandate.mandateId,
                                            mandate.smeId,
                                            mandate.linkedToLoanRequests?mandate.linkedToLoanRequests:[],
                                            mandate.ibanNumber
                                          )
                                        }
                                        />}
                                  </TableCell>

                                  <TableCell className={tableCellClasses}>
                                    {this.disableSelectMandateRadio(mandate) ? (
                                      <input
                                        type="radio"
                                        name="selectMandate"
                                        className="mandate-checkbox"
                                        id={"selectMandate_" + mandate.mandateId}
                                        disabled
                                        onChange={event =>
                                          this.handleSelectedMandates(
                                            event,
                                            mandate
                                          )
                                        }
                                      />
                                    ) : (
                                      <input
                                        type="radio"
                                        name="selectMandate"
                                        className="mandate-checkbox"
                                        id={"selectMandate_" + mandate.mandateId}
                                        onChange={event =>
                                          this.handleSelectedMandates(
                                            event,
                                            mandate
                                          )
                                        }
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          })

                          }

                          {addingNewMandate ? (
                            <TableRow
                              key={'addNewMandateky'}
                              className={classes.tableRow}
                            >
                              <TableCell className={tableCellClasses} />
                              <TableCell className={tableCellClasses}>
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                               
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                                <FormControl className={classes.formControl}>
                                  <TextField
                                    id="mandateSBF"
                                    label="Please fill in SBF"
                                    type="text"
                                    className={classes.textField}
                                    InputLabelProps={{
                                      shrink: true
                                    }}
                                    style={{ fontWeight: 100, fontSize: 14 }}
                                  />
                                </FormControl>
                              </TableCell>
                              <TableCell className={tableCellClasses}>
                                {/* <a
                                  className="addNewMandateBtn margin-bottom-0_5vw"
                                  onClick={this.handleSaveMandate.bind(this)}
                                >
                                  Save Mandate
                                </a> */}
                                <Button
                                style={{ backgroundColor : '#13294b'}}
                                  color="blue"
                                  size="sm"
                                  onClick={this.handleSaveMandate.bind(this)}
                                >
                                  Generate
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : (
                            false
                          )}
                        </TableBody>
                      </Table>

                      {selectedMandate !== '' && !addingNewMandate ? (
                        <div style={{ position: 'relative', float: 'right' }}>
                          <Button
                             style={{ backgroundColor: '#00b38f'}}
                             color="green"
                            size="sm"
                            round
                            onClick={this.props.showAddContactSection}
                            disabled={addingNewMandate ? true : false}
                            id="AddContractBtn"
                          >
                            Add Fixed Loan
                          </Button>
                          <Button
                             style={{ backgroundColor: '#00b38f'}}
                             color="green"
                            size="sm"
                            round
                            onClick={this.props.showAddFlexContactSection}
                            disabled={addingNewMandate ? true : false}
                            id="AddFlexContractBtn"
                          >
                            Add Flex Loan
                          </Button>
                          {/* <Button
                            color="rose"
                            size="sm"
                            round
                            onClick={this.props.showAddTransactionSection}
                            disabled={addingNewMandate ? true : false}
                          >
                            Manual Collection
                          </Button> */}
                        </div>
                      ) : (
                        false
                      )}
                    </GridItem>
                  </GridContainer>
                </CardBody>
              </Card>
            </GridItem>
          </GridContainer>

          <Drawer
            anchor="bottom"
            open={this.state.bottom && this.state.panelType === 'DirectDebits'}
            onClick={this.toggleDrawer.bind(this, 'DirectDebits', [], 'bottom', false)}
          >
            <Paper className={classes.tableMain}>
              <GridContainer>
                <GridItem>
                  <Card>
                    <CardHeader color="warning">
                      Sme Mandate
                    </CardHeader>
                    <CardBody>
                      <Table className={classes.table}>
                        <TableHead className={classes[tableHeaderColor + "primary"]}>
                          <TableRow key={'directdebits_header'}>
                            <TableCell>mandateId</TableCell>
                            <TableCell>smeId</TableCell>
                            <TableCell>ibanNumber</TableCell>
                            <TableCell>startDate</TableCell> 
                            <TableCell>type</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mandates.map((mandate, idx) => {
                            return mandate.mandateId ? (
                              <TableRow key={idx} >
                                <TableCell>{mandate.mandateId}</TableCell>
                                <TableCell>{mandate.smeId}</TableCell>
                                <TableCell>{mandate.ibanNumber}</TableCell>
                                <TableCell> {moment(mandate.startDate).format(
                                      'DD-MM-YYYY'
                                    )}</TableCell>
                                <TableCell>{mandate.eMandate === true ? 'eMandate':'sepaMandate'}</TableCell>
                              </TableRow>
                            ) : null;

                          })}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card>
                    <CardHeader color="warning">
                      Direct Debits
                    </CardHeader>
                    <CardBody>
                      <Table className={classes.table}>
                        <TableHead className={classes[tableHeaderColor + "primary"]}>
                          <TableRow key={'directdebits_header'}>
                            <TableCell>contractId</TableCell>
                            <TableCell>mandateId</TableCell>
                            <TableCell>termNumber</TableCell>
                            <TableCell>description</TableCell>
                            <TableCell>plannedDate</TableCell>
                            <TableCell>transactionDate</TableCell>
                            <TableCell>amount</TableCell>
                            <TableCell>loanStatus</TableCell>
                            <TableCell>directDebitCounter</TableCell>
                            <TableCell>ourReference</TableCell>
                            <TableCell>externalReferenceId</TableCell>
                            <TableCell>batchId</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {directdebits.map((dd, idx) => {
                            return dd._id ? (
                              <TableRow key={idx} >
                                <TableCell>{dd.contractId}</TableCell>
                                <TableCell>{dd.mandateId}</TableCell>
                                <TableCell>{dd.termNumber}</TableCell>
                                <TableCell>{dd.description}</TableCell>
                                <TableCell>{dd.plannedDate}</TableCell>
                                <TableCell>{dd.transactionDate}</TableCell>
                                <TableCell>{dd.amount}</TableCell>
                                <TableCell>{dd.loanStatus}</TableCell>
                                <TableCell>{dd.directDebitCounter}</TableCell>
                                <TableCell>{dd.ourReference}</TableCell>
                                <TableCell>{dd.externalReferenceId}</TableCell>
                                <TableCell>{dd.batchId}</TableCell>
                              </TableRow>
                            ) : null;
                          })}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                </GridItem>
              </GridContainer>
            </Paper>
          </Drawer>

          <Dialog open={this.state.showConfirmation} maxWidth='sm'>
            <DialogTitle aria-labelledby="form-dialog-title">
              {'Are you sure you want to Activate the selected mandate?'}
            </DialogTitle>
            <DialogActions>
              <Button id="cancel-loan-confirm-drawer-back-button" size="sm" color="primary" onClick={this.handleCloseDialog}>
                cancel
              </Button>
              <Button id="cancel-loan-confirm-drawer-confirm-button" size="sm" color="info" onClick={this.handleConfirmDialog}>
                confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={this.state.showAddLoanReq} maxWidth='sm'>
            <DialogTitle aria-labelledby="form-dialog-title">
              {'Enter New Loan Request Id'}
            </DialogTitle>
             <TextField id="addNewLoanReqId" label="Please enter new loan request Id" variant="outlined" style={{ fontWeight: 100, fontSize: 14, marginLeft: 10, marginRight: 10 }}/>
            <DialogActions>
              <Button id="cancel-loan-confirm-drawer-back-button" size="sm" color="primary" onClick={this.handleCloseAddLoanReqDialog}>
                Cancel
              </Button>
              <Button id="cancel-loan-confirm-drawer-confirm-button" size="sm" color="info" onClick={this.handleConfirmAddLoanReqDialog}>
                Add
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={this.state.showInactivateConfirmation} maxWidth='sm'>
            <DialogTitle aria-labelledby="form-dialog-title">
              {'Are you sure you want to Inactivate the selected mandate?'}
            </DialogTitle>
            <DialogActions>
              <Button id="cancel-loan-confirm-drawer-back-button" size="sm" color="primary" onClick={this.handleCloseInactivateDialog}>
                cancel
              </Button>
              <Button id="cancel-loan-confirm-drawer-confirm-button" size="sm" color="info" onClick={this.handleConfirmInactivateDialog}>
                confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={this.state.showSetMandateToActivateConfimation} maxWidth='sm'>
            <DialogTitle aria-labelledby="form-dialog-title">
              {`Are you sure you want to set '${this.state.selectedMandate}' to 'ACTIVE' state?`}             
            </DialogTitle>
            <DialogContent>
            {`This action will inactivate currently active mandate for ${this.state.selectedIban}`}
            </DialogContent>
           
            <DialogActions>
              <Button id="cancel-loan-confirm-drawer-back-button" size="sm" color="primary" onClick={this.handleCloseSetMandateToActivateDialog}>
                cancel
              </Button>
              <Button id="cancel-loan-confirm-drawer-confirm-button" size="sm" color="info" onClick={this.handleConfirmSetMandateToActivateDialog}>
                confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={this.state.showStatusUpdateConfimation} maxWidth='sm' style={{ minWidth: "500px" }}>
             <DialogTitle aria-labelledby="form-dialog-title">
          
              {`Update Status`} 
            </DialogTitle> 
            
           
            <DialogContent>
           {
            <FormControl style={{ minWidth: "500px" }} fullWidth={true} >
              <Select
                label='update status'
                              
                onChange={event =>
                this.handleOptionChange(
                event,
                )
                }
                >{this.state.currentStatus&&this.statusOptions[this.state.currentStatus].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
                ))}
              </Select>
            </FormControl>}
            <p></p>
            {(this.state.updatedStatus === 'ACTIVE' && this.state.activeMandateIds.length>0)? `This action will inactivate mandate 
                                      ${this.state.activeMandateIds} , the currently not paid transactions related to this mandate will be assigned to ${this.state.selectedMandate} . Please confirm.` : null}
            </DialogContent>
           
            <DialogActions>
              <Button id="cancel-loan-confirm-drawer-back-button" size="sm" color="primary" onClick={this.handleCloseStatusUpdateDialog}>
                cancel
              </Button>
             {(this.state.showStatusChangeDropDown === false) && <Button id="cancel-loan-confirm-drawer-confirm-button" size="sm" color="info" onClick={this.handleConfirmStatusUpdateDialog}>
                confirm
              </Button>}
            </DialogActions>
          </Dialog>

        </div>
      </LoadingOverlay >
    );
  }
}

Mandates.propTypes = {
  customerDetails: PropTypes.object,
  classes: PropTypes.object.isRequired,
  directdebits: PropTypes.array,
  mandates: PropTypes.array.isRequired,
  smeMandatesByCustomer: PropTypes.array,
  rtlActive: PropTypes.bool,
  addingNewMandate: PropTypes.bool,
  addingMandateIsBusy: PropTypes.bool,
  bicNum: PropTypes.string,
  tableHeaderColor: PropTypes.string,
  selectedMandate: PropTypes.string.isRequired,
  addingNewMandateBtn: PropTypes.string.isRequired,
  getBicNo: PropTypes.func.isRequired,
  signMandate: PropTypes.func.isRequired,
  selectMandate: PropTypes.func.isRequired,
  clearBicField: PropTypes.func.isRequired,
  getSmeMandates: PropTypes.func.isRequired,
  deSelectMandate: PropTypes.func.isRequired,
  createNewMandate: PropTypes.func.isRequired,
  clearMandateError: PropTypes.func.isRequired,
  toggleAddNewMandate: PropTypes.func.isRequired,
  showAddContactSection: PropTypes.func.isRequired,
  showAddFlexContactSection: PropTypes.func.isRequired,
  showAddTransactionSection: PropTypes.func.isRequired,
  requestDirectDebitsByMandate: PropTypes.func.isRequired,
  activateSepaMandate: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedMandate: state.mandates.selectedMandate,
    mandates: state.smemandates.smemandates,
    addingNewMandate: state.mandates.addingNewMandate,
    addingNewMandateBtn: state.mandates.addNewMandateButton,
    customerDetails: state.lmglobal.customerDetails,
    addingMandateIsBusy: state.mandates.addingMandateIsBusy,
    bicNum: state.mandates.bic_number,
    directdebits: state.smeLoanTransaction.directdebits,
    smeMandatesByCustomer: state.smemandates.smeMandatesByCustomer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleAddNewMandate: () => {
      dispatch(toggleAddNew());
    },

    createNewMandate: (customerId) => {
      const obj = {
        customerId: customerId,
        loanRequestId: document.getElementById('mandateSBF').value,
        returnUrl: returnURL
      };

      if (
        obj.loan_request_id !== '' 
      ) {
        dispatch(saveNewMandate(obj));
        dispatch(toggleAddNew());
        dispatch(createMandatebussy());
      } else {
        dispatch(displayNotification('Please fill all the fields', 'warning'));
      }
    },

    showAddTransactionSection: () => {
      dispatch(showAddTransaction());
    },

    showAddContactSection: () => {
      dispatch(showAddContact());
    },

    showAddFlexContactSection: () => {
      dispatch(showAddFlexContact());
    },

    selectMandate: mandateId => {
      dispatch(selectMandate(mandateId));
    },

    deSelectMandate: () => {
      dispatch(deSelectMandate());
    },

    clearMandateError: () => {
      dispatch(clearMandateError());
    },

    getBicNo: iban => {
      dispatch(getBicFrmIban(iban));
    },

    clearBicField: () => {
      dispatch(clearBicField());
    },

    getSmeMandates: mandateId => {
      dispatch(requestSmeMandates(mandateId));
    },
    requestDirectDebitsByMandate: mandateId => {
      dispatch(requestDirectDebitsByMandate(mandateId));
    },

    activateSepaMandate: (mandateId, customerId) => {
      dispatch(activateSepaMandate(mandateId, customerId));
    },

    downloadMandate: (mandateId, documentId) => {
      dispatch(downloadMandate(mandateId, documentId));
    },

    displayNotification: (message, type) => dispatch(displayNotification(message, type)),

    addNewLoanRequestId: (mandateId, customerId, newLoanReqId, updatedLoanReqIds, ibanNumber) => {
      dispatch(addNewLoanRequestId(mandateId, customerId,newLoanReqId, updatedLoanReqIds, ibanNumber));
    },

    inactivateMandate: (mandateId, customerId) => {
      dispatch(inactivateMandate(mandateId, customerId));
    },

    activateSelectedMandate: (obj) => {
      dispatch(activateSelectedMandate(obj));
    },

    updateMandateStatus: (mandateId, updatedStatus, customerId) => {
      dispatch(updateMandateStatus(mandateId, updatedStatus, customerId));
    },

    changeMandateStatusToSigningPending: (mandateId, customerId) => {
      dispatch(changeMandateStatusToSigningPending(mandateId, customerId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(tasksStyle)(Mandates));
