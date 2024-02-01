/* cSpell:ignore titel */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Notifier from 'components/initiation/Notification/Notifier';

import creditRiskParameterTypeStyle from 'assets/jss/bridgefundPortal/views/creditRiskParameterTypeStyle';

import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button, DialogContentText, MenuItem } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { getCreditRiskParameterTypetList, updateCreditRiskParameterType } from 'store/initiation/actions/CreditRiskParameterTypes.action';
import { AddCircle } from '@material-ui/icons';
import { displayNotification } from 'store/initiation/actions/Notifier';
import CreditRiskConst from 'constants/initiation/credit-risk';


const basicCreditRiskParameterTypetDetails = {
  "description": "",
  "displaySequenceNumber": null,
  "format": "",
  "id": "",
  "_id": null,
  "type": "",
  "updatedAt": "",
  "createdAt": "",
};

class CreditRiskParameterTypesOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      dialogAction: null,
      selectedCRPType: null,
      openCRTypeDialog: false,
      creditRiskParameterTypes: [],
      openDeleteCreditRiskParameterTypeDialog: false,
      creditRiskParameterTypesForProcess: JSON.parse(JSON.stringify(basicCreditRiskParameterTypetDetails)),
      selectedCRTypeObj: {}
    };
  }

  componentDidMount() {
    this.getBasicDetails();
  }

  getCreditRiskParameterTypetList = async () => {
    return await this.props.getCreditRiskParameterTypetList()
      .then((response) => ({ creditRiskParameterTypes: response }))
      .catch((error) => { throw Error(error); });
  }

  getBasicDetails = () => {

    this.setState({ isLoading: true }, () => {

      const requestPromisesArray = [];

      const state = JSON.parse(JSON.stringify(this.state));

      /* Get all platform parameters */
      requestPromisesArray.push(this.getCreditRiskParameterTypetList());

      Promise.all(requestPromisesArray)
        .then((responses) => {

          for (const item of responses) {
            for (const property in item) {
              state[property] = item[property];
            }
          }

        })
        .catch((error) => { console.log(error); })
        .finally(() => {
          this.setState({ ...state, isLoading: false });
        });

    });

  }

  viewCreditRiskParameterTypeDetails = (crpTypeId = null, action = null) => {
  
    const { creditRiskParameterTypes } = this.state;
    const selectedObj = creditRiskParameterTypes.find((data) => data.id === crpTypeId);
    this.setState({ selectedCRTypeObj: selectedObj });

    if (action === 'create' || action === 'update' || action === 'view') {

      this.setState((prevState) => {
        return {
          openCRTypeDialog: !prevState.openCRTypeDialog,
          selectedCRPType: crpTypeId,
          dialogAction: action
        };
      }, () => {

        const { creditRiskParameterTypes, selectedCRPType } = this.state;

        let { creditRiskParameterTypesForProcess } = this.state;

        if (this.state.openCRTypeDialog && selectedCRPType) {
          const temp = creditRiskParameterTypes.find((data) => data.id === selectedCRPType);
          creditRiskParameterTypesForProcess = temp ? JSON.parse(JSON.stringify(temp)) : JSON.parse(JSON.stringify(basicCreditRiskParameterTypetDetails));

        }
        else creditRiskParameterTypesForProcess = JSON.parse(JSON.stringify(basicCreditRiskParameterTypetDetails));

        this.setState({ creditRiskParameterTypesForProcess });

      });

    }
    else if (action === 'delete') {
      this.setState((prevState) => {
        return {
          openDeleteCreditRiskParameterTypeDialog: !prevState.openDeleteCreditRiskParameterTypeDialog,
          selectedCRPType: crpTypeId,
          dialogAction: action
        };
      });
    } else {
      this.setState({ openDeleteCreditRiskParameterTypeDialog: false, openCRTypeDialog: false });
    }

  }

  handleProcessDataChanges = (event, firstProperty, secondProperty = null) => {

    const { creditRiskParameterTypesForProcess } = this.state;

    if (firstProperty in creditRiskParameterTypesForProcess) {
      if (secondProperty && secondProperty in creditRiskParameterTypesForProcess[firstProperty]) creditRiskParameterTypesForProcess[firstProperty][secondProperty] = event.target.value;
      else creditRiskParameterTypesForProcess[firstProperty] = event.target.value;
    }

    this.setState({ creditRiskParameterTypesForProcess });

  }

  processData = () => {

    let { creditRiskParameterTypesForProcess, openCRTypeDialog, selectedCRPType, dialogAction, openDeleteCreditRiskParameterTypeDialog, selectedCRTypeObj } = this.state;

    let creditRiskParameterTypesObj = {};
    if (this.state.dialogAction === 'create') {
      creditRiskParameterTypesObj = {
        action: this.state.dialogAction,
        description: creditRiskParameterTypesForProcess.description,
        displaySequenceNumber: Number(creditRiskParameterTypesForProcess.displaySequenceNumber),
        format: creditRiskParameterTypesForProcess.format,
        type: creditRiskParameterTypesForProcess.type
      };
    }
    else if (this.state.dialogAction === 'update') {
      creditRiskParameterTypesObj = {
        action: this.state.dialogAction,
        id: selectedCRPType,
        description: creditRiskParameterTypesForProcess.description,
        format: creditRiskParameterTypesForProcess.format,
      };
    }
    else if (this.state.dialogAction === 'delete') {
      creditRiskParameterTypesObj = {
        action: this.state.dialogAction,
        _id: selectedCRTypeObj._id,
        type: selectedCRTypeObj.type
      };
    }
    
    const params = { creditRiskParameterTypesObj };
    
    let reloadData = false;

    this.props.updateCreditRiskParameterType(params)
      .then((response) => {
        if (response && response.description === "Type is in use")
          return this.props.displayNotification('Credit Risk Parameter Type is in use', 'warning');

        creditRiskParameterTypesForProcess = JSON.parse(JSON.stringify(basicCreditRiskParameterTypetDetails));
        openCRTypeDialog = false;
        selectedCRPType = null;
        dialogAction = null;
        openDeleteCreditRiskParameterTypeDialog = false;
        reloadData = true;

        this.props.displayNotification('Credit Risk Parameter type ' + this.state.dialogAction + ' successfully', 'success');
      })
      .catch((error) => {
        if (error.message) {
          const type = error.message.includes("displaySequenceNumber") ? 'display sequence number' : 'type';
          return this.props.displayNotification("Credit Risk Parameter " + type + " duplicate", 'error');
        }
        //throw Error(error);

      }).finally(() => {
        this.setState({ creditRiskParameterTypesForProcess, openCRTypeDialog, selectedCRPType, dialogAction, openDeleteCreditRiskParameterTypeDialog },
          () => { if (reloadData) this.getBasicDetails(); });
      });
  }

  render() {

    const { creditRiskParameterTypes, openCRTypeDialog, creditRiskParameterTypesForProcess, openDeleteCreditRiskParameterTypeDialog, dialogAction } = this.state;
   
    const { classes } = this.props;

    const disabledInputs = !((this.state.dialogAction === 'update') || (this.state.dialogAction === 'create'));

    const inputClasses = {
      classes: {
        input: classes.input,
        disabled: classes.disabled,
        notchedOutline: classes.notchedOutline
      }
    };

    return (
      <div>
        <Notifier />
        <div>
          {/* <Paper > */}
          <div >
            {/* <Typography variant="h6" id="tableTitle" component="div" className={classes.tableHeaderLabel}>Credit Risk Parameter Types</Typography> */}
            <Button
              variant='contained'
              startIcon={<AddCircle />}
              className={`${classes.floatRight} ${classes.confirmIconButton}`}
              onClick={() => this.viewCreditRiskParameterTypeDetails(null, 'create')}>
              Add Type
                </Button>
          </div>

          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table aria-label="simple table" className={classes.table}>
              <TableHead className={classes.tableHeadColor}>
                <TableRow>
                  <TableCell className={classes.tableCell}>Action</TableCell>
                  <TableCell className={classes.tableCell} >Sequence Number</TableCell>
                  <TableCell className={classes.tableCell} >Type</TableCell>
                  <TableCell className={classes.tableCell} >Description</TableCell>
                  <TableCell className={classes.tableCell} >Format</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {creditRiskParameterTypes.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className={classes.tableCell}>
                      <div className={classes.actionButtons}><VisibilityIcon className={classes.cursorPointer} onClick={() => this.viewCreditRiskParameterTypeDetails(row.id, 'view')} /></div>
                      <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.viewCreditRiskParameterTypeDetails(row.id, 'update')} /></div>
                      <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.viewCreditRiskParameterTypeDetails(row.id, 'delete')} /></div>
                    </TableCell>
                    <TableCell className={classes.tableCell} >{row.displaySequenceNumber}</TableCell>
                    <TableCell className={classes.tableCell}> {row.type} </TableCell>
                    <TableCell className={classes.tableCell} >{row.description}</TableCell>
                    <TableCell className={classes.tableCell} >{row.format}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>


          {/* </Paper> */}
        </div>

        <Dialog open={openCRTypeDialog} onClose={this.viewCreditRiskParameterTypeDetails} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-details">
          <DialogTitle id="crp-type-details-title">Credit Risk Parameter Types Details</DialogTitle>
          <DialogContent>

            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table aria-label="Credit risk parameter type table" className={classes.table}>
                <TableBody>

                  <TableRow>
                    <TableCell className={classes.tableCell}>Type</TableCell>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        id="type"
                        onChange={(event) => this.handleProcessDataChanges(event, 'type')}
                        value={creditRiskParameterTypesForProcess.type}
                        disabled={dialogAction === 'update'? !disabledInputs : disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.tableCell}>Description</TableCell>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        id="description"
                        onChange={(event) => this.handleProcessDataChanges(event, 'description')}
                        value={creditRiskParameterTypesForProcess.description}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.tableCell}>Format</TableCell>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        style={{width: '75%'}}
                        select
                        id="format"
                        onChange={(event) => this.handleProcessDataChanges(event, 'format')}
                        value={creditRiskParameterTypesForProcess.format}
                        disabled={disabledInputs}
                        InputProps={inputClasses}
                        >
                        {CreditRiskConst.creditRiskParameterTypeFormat.map((option) => (
                          <MenuItem key={option.key} value={option.value}>
                            {option.key}
                          </MenuItem>
                        ))}
                        </TextField> 
                    </TableCell>
                    <TableCell className={classes.tableCell}>Display Sequence Number</TableCell>
                    <TableCell className={classes.tableCell}>
                      <TextField
                        id="displaySequenceNumber"
                        onChange={(event) => this.handleProcessDataChanges(event, 'displaySequenceNumber')}
                        value={creditRiskParameterTypesForProcess.displaySequenceNumber}
                        disabled={dialogAction === 'update'? !disabledInputs : disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.viewCreditRiskParameterTypeDetails} className={classes.cancelIconButton} variant="outlined"
              style={{ textTransform: 'none' }}>Close</Button>
            {
              !disabledInputs ?
                <Button
                  onClick={this.processData}
                  className={classes.confirmIconButton}
                  variant="outlined"
                  style={{ textTransform: 'none' }}>
                  {this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                : null
            }
          </DialogActions>
        </Dialog>

        <Dialog open={openDeleteCreditRiskParameterTypeDialog} aria-labelledby="delete-credit-risk-parameter-types" aria-describedby="alert-dialog-description" onClose={this.viewCreditRiskParameterTypeDetails} >
          <DialogTitle id="alert-dialog-title">Delete Credit Risk Parameter Type</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'Are you sure you want to delete this credit risk parameter type?'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.viewCreditRiskParameterTypeDetails} className={classes.cancelIconButton} variant="outlined">
              Cancel
          </Button>
            <Button onClick={this.processData} className={classes.confirmIconButton} variant="outlined" >
              Delete
          </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreditRiskParameterTypesOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  getCreditRiskParameterTypetList: PropTypes.func.isRequired,
  updateCreditRiskParameterType: PropTypes.func.isRequired,
  origin: PropTypes.string
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => ({
  getCreditRiskParameterTypetList: () => dispatch(getCreditRiskParameterTypetList()),
  updateCreditRiskParameterType: (params) => dispatch(updateCreditRiskParameterType(params)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(creditRiskParameterTypeStyle)(CreditRiskParameterTypesOverview));