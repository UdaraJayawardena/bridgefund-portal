/* cSpell: ignore Iban */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Notifier from 'components/initiation/Notification/Notifier';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
// import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import { getBanks, addOrUpdateBank } from "store/initiation/actions/Bank.action";

const basicBankDetails = {
  "id": "",
  "bankFullName": "",
  "bicCode": "",
  "bankCodeInIban": "",
  "mtIdentifier": "",
  "eMandateIndicator": "No"
};

class BanksOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      banks: [],
      selectedBank: null,
      dialogAction: null,
      openBankDetailsDialog: false,
      bankDataForProcess: JSON.parse(JSON.stringify(basicBankDetails)),
    };
  }

  componentDidMount() {
    this.getBasicDetails();
  }

  getAllBanks = async () => {
    return await this.props.getBanks()
      .then((response) => ({ banks: response }))
      .catch((error) => { throw Error(error); });
  }

  getBasicDetails = () => {

    this.setState({ isLoading: true }, () => {

      const requestPromisesArray = [];

      const state = JSON.parse(JSON.stringify(this.state));

      /* get all banks details */
      requestPromisesArray.push(this.getAllBanks());

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

  viewBankDetails = (bankId = null, action = null) => {

    if (action !== 'delete') {

      this.setState((prevState) => {
        return {
          openBankDetailsDialog: !prevState.openBankDetailsDialog,
          selectedBank: bankId,
          dialogAction: action,
        };
      }, () => {

        const { banks, selectedBank } = this.state;

        let { bankDataForProcess } = this.state;

        if (this.state.openBankDetailsDialog && selectedBank) {
          const temp = banks.find((data) => data.id === selectedBank);
          bankDataForProcess = temp ? JSON.parse(JSON.stringify(temp)) : JSON.parse(JSON.stringify(basicBankDetails));

        } else bankDataForProcess = JSON.parse(JSON.stringify(basicBankDetails));

        this.setState({ bankDataForProcess });

      });

    }

  }

  handleProcessDataChanges = (event, name) => {

    const { bankDataForProcess } = this.state;

    if (name in bankDataForProcess) bankDataForProcess[name] = event.target.value;

    this.setState({ bankDataForProcess });

  }

  processData = () => {

    let { bankDataForProcess, openBankDetailsDialog, selectedBank, dialogAction } = this.state;

    const params = {
      bankData: {
        ...bankDataForProcess,
        action: this.state.dialogAction,
      }
    };

    let reloadData = false;

    this.props.addOrUpdateBank(params)
      .then(() => {
        bankDataForProcess = JSON.parse(JSON.stringify(basicBankDetails));
        openBankDetailsDialog = false;
        selectedBank = null;
        dialogAction = null;

        reloadData = true;
      })
      // .catch()
      .finally(() => {
        this.setState({ bankDataForProcess, openBankDetailsDialog, selectedBank, dialogAction },
          () => { if (reloadData) this.getBasicDetails(); });
      });

  }

  render() {

    const { banks, openBankDetailsDialog, bankDataForProcess } = this.state;

    const { classes } = this.props;

    const disableInputs = !((this.state.dialogAction === 'update') || (this.state.dialogAction === 'create'));

    return (
      <div>
        <Notifier />
        {/* <h1>Banks Overview</h1> */}

        <div>
          <Paper >
            <div className={classes.tableHeaders}>
              <Typography variant="h6" id="tableTitle" component="div" className={classes.tableHeaderLabel}>Bank Overview</Typography>
              <Button className={`${classes.floatRight} ${classes.addButton}`} onClick={() => this.viewBankDetails(null, 'create')}>Add Bank</Button>
            </div>
            <TableContainer component={Paper}>
              <Table aria-label="Bank details table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.width_15}>Action</TableCell>
                    <TableCell align="center">Bank-ID</TableCell>
                    <TableCell align="center">Full Name</TableCell>
                    <TableCell align="center">BIC Code</TableCell>
                    <TableCell align="center">IBAN</TableCell>
                    <TableCell align="center">E-Mandate (Y/N)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banks.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell >
                        <div className={classes.actionButtons}><VisibilityIcon className={classes.cursorPointer} onClick={() => this.viewBankDetails(row.id, 'view')} /></div>
                        <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.viewBankDetails(row.id, 'update')} /></div>
                        <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.viewBankDetails(row.id, 'delete')} /></div>
                      </TableCell>
                      <TableCell align="center" component="th" scope="row"> {row.id} </TableCell>
                      <TableCell align="center">{row.bankFullName}</TableCell>
                      <TableCell align="center">{row.bicCode}</TableCell>
                      <TableCell align="center">{row.bankCodeInIban}</TableCell>
                      <TableCell align="center">{row.eMandateIndicator}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>

        <Dialog open={openBankDetailsDialog} onClose={this.viewBankDetails} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-details">
          <DialogTitle id="bank-details-title">Bank Details</DialogTitle>
          <DialogContent>
            {
              this.state.dialogAction !== 'create' ?
                <TextField id="bankId" onChange={(event) => this.handleProcessDataChanges(event, 'id')} className={classes.margin_5} label="Bank ID" variant="outlined" value={bankDataForProcess.id} disabled={disableInputs} />
                : null
            }
            <TextField id="bankFullName" onChange={(event) => this.handleProcessDataChanges(event, 'bankFullName')} className={classes.margin_5} label="Full Name" variant="outlined" value={bankDataForProcess.bankFullName} disabled={disableInputs} />
            <TextField id="bankCodeInIban" onChange={(event) => this.handleProcessDataChanges(event, 'bankCodeInIban')} className={classes.margin_5} label="IBAN" variant="outlined" value={bankDataForProcess.bankCodeInIban} disabled={disableInputs} />
            <TextField id="bicCode" onChange={(event) => this.handleProcessDataChanges(event, 'bicCode')} className={classes.margin_5} label="BIC Code" variant="outlined" value={bankDataForProcess.bicCode} disabled={disableInputs} />
            <TextField id="mtIdentifier" onChange={(event) => this.handleProcessDataChanges(event, 'mtIdentifier')} className={classes.margin_5} label="MT Identifier" variant="outlined" value={bankDataForProcess.mtIdentifier} disabled={disableInputs} />


            {
              !disableInputs ?
                <FormControl variant="outlined" className={`${classes.margin_5} ${classes.width_25}`}>
                  <InputLabel id="eMandateIndicator-label">E-Mandate</InputLabel>
                  <Select
                    labelId="E-Mandate"
                    id="eMandateIndicator"
                    value={bankDataForProcess.eMandateIndicator}
                    onChange={(event) => this.handleProcessDataChanges(event, 'eMandateIndicator')}
                    label="E-Mandate"
                  >
                    <MenuItem value={'Yes'}>Yes</MenuItem>
                    <MenuItem value={'No'}>No</MenuItem>
                  </Select>
                </FormControl>
                :
                <TextField id="eMandateIndicator" onChange={(event) => this.handleProcessDataChanges(event, 'eMandateIndicator')} className={classes.margin_5} label="E-Mandate" variant="outlined" value={bankDataForProcess.eMandateIndicator} disabled={disableInputs} />
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.viewBankDetails} className={classes.popupCloseButton}>Close</Button>
            {
              !disableInputs ?
                <Button onClick={this.processData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                : null
            }
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

BanksOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  getBanks: PropTypes.func.isRequired,
  addOrUpdateBank: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => ({
  getBanks: (requestQuery) => dispatch(getBanks(requestQuery)),
  addOrUpdateBank: (params) => dispatch(addOrUpdateBank(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(BanksOverview));