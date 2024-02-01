/* cSpell:ignore titel */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Notifier from 'components/initiation/Notification/Notifier';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

import { getPlatformParameters, addOrUpdatePlatformParameters, getAFAParameters, addAFAPlatformParameters } from "store/initiation/actions/PlatformParameters.action";
import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';

import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { displayNotification } from "store/initiation/actions/Notifier";
import Typography from '@material-ui/core/Typography';
import { Button, InputAdornment, Select, MenuItem } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';


const basicPlatformDetails = {
  "id": "",
  "country": "",
  "platformName": "",
  "address": {
    "city": "",
    "houseNumber": "",
    "postalCode": "",
    "streetName": "",
  },
  "cocId": "",
  "contactDetails": "",
  "contactDetailsAssetManager": "",
  "creditorId": "",
  "nameManagingDirector1": "",
  "titelMd1": "",
  "nameManagingDirector2": "",
  "titelMd2": "",
  "thirdPartyName": "",
  "nameOfOurBank": "",
  "ibanOfOurBank": "",
  "bicOfOurBank": "",
  "createdAt": "",
  "updatedAt": ""
};

const basicAFADetails = {
  "maxNumberOfWorkingDaysBankFile": 0,
  "minimalNumberOfDaysInBankFile": 0,
  "minimalTurnOverAmount": 0,
  "higherBalancePercentage": 0,
  "smallestLoanAmount": 0,
  "mandateCustomerNameCheck": true,
};
class PlatformOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      dialogAction: null,
      selectedPlatform: null,
      openPlatformDetailsDialog: false,
      platformParameters: [],
      countryList: [],
      symbol: '€',
      thousandSeparator: '.',
      decimalSeparator: ',',
      isPlatformCompleted: false,
      platformDataForProcess: JSON.parse(JSON.stringify(basicPlatformDetails)),
      firstAnalysisParameter: JSON.parse(JSON.stringify(basicAFADetails)),
    };
  }

  componentDidMount() {
    this.getCountryList();
    this.getBasicDetails();
  }


  getPlatformParameters = async () => {
    return await this.props.getPlatformParameters()
      .then((response) => ({ platformParameters: response }))
      .catch((error) => { throw Error(error); });
  }


  getCountryList = async () => {
    return await this.props.getFieldNameValues({ fieldName: 'country', activeIndicator: 'YES' })
      .then((response) => ({ countryList: response }))
      .catch((error) => { throw Error(error); });
  }


  getLocales = async (country) => {

    this.props.getLocales({ countryCode: country })
      .then(res => {
        if (!res || res.length === 0) {
          return this.props.displayNotification('No locale found for the selected country!', 'warning');
        }
        this.setState({
          symbol: res[0].currencySymbol,
          decimalSeparator: res[0].decimalSeparator,
          thousandSeparator: res[0].thousandSeparator
        });
      })
      .catch(err => { console.log('getLocales err ', err); });
  }


  getBasicDetails = () => {

    this.setState({ isLoading: true, isPlatformCompleted: false }, () => {

      const requestPromisesArray = [];

      const state = JSON.parse(JSON.stringify(this.state));

      /* Get all country list */
      requestPromisesArray.push(this.getCountryList());

      /* Get all platform parameters */
      requestPromisesArray.push(this.getPlatformParameters());

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


  viewPlatformDetails = (platformId = null, action = null) => {
    if (action !== 'delete') {
      this.setState((prevState) => {
        return {
          openPlatformDetailsDialog: !prevState.openPlatformDetailsDialog,
          selectedPlatform: platformId,
          dialogAction: action
        };

      }, async () => {

        const { platformParameters, selectedPlatform, isPlatformCompleted } = this.state;

        let { platformDataForProcess, firstAnalysisParameter } = this.state;
        let tempData = JSON.parse(JSON.stringify(basicAFADetails));

        if (this.state.openPlatformDetailsDialog && selectedPlatform) {
          const temp = platformParameters.find((data) => data.id === selectedPlatform);
          temp.mandateCustomerNameCheck = temp.mandateCustomerNameCheck ? temp.mandateCustomerNameCheck : false;
          platformDataForProcess = temp ? JSON.parse(JSON.stringify(temp)) : JSON.parse(JSON.stringify(basicPlatformDetails));
          // this.getAFAParameters({ platformName: platformDataForProcess.platformName })

          await this.props.getAFAParameters({ platformName: platformDataForProcess.platformName }).then((response) => {
            if (response) {
              const { maxNumberOfWorkingDaysBankFile, minimalNumberOfDaysInBankFile, minimalTurnOverAmount, higherBalancePercentage } = response;
              tempData = {
                maxNumberOfWorkingDaysBankFile: maxNumberOfWorkingDaysBankFile ? maxNumberOfWorkingDaysBankFile : 0,
                minimalNumberOfDaysInBankFile: minimalNumberOfDaysInBankFile ? minimalNumberOfDaysInBankFile : 0,
                minimalTurnOverAmount: minimalTurnOverAmount ? minimalTurnOverAmount : 0,
                higherBalancePercentage: higherBalancePercentage ? higherBalancePercentage : 0
              };
            }

          }).catch((error) => { console.log(error); });

        }
        else platformDataForProcess = JSON.parse(JSON.stringify(basicPlatformDetails));

        firstAnalysisParameter = tempData ? JSON.parse(JSON.stringify(tempData)) : JSON.parse(JSON.stringify(basicAFADetails));

        if (isPlatformCompleted) {
          this.getBasicDetails();
        }

        this.setState({ platformDataForProcess, firstAnalysisParameter, isPlatformCompleted: false });

      });

    }

  }



  handleProcessDataChanges = (event, firstProperty, secondProperty = null) => {

    const { platformDataForProcess } = this.state;

    if (firstProperty === 'country') this.getLocales(event.target.value);

    if (firstProperty in platformDataForProcess) {
      if (secondProperty && secondProperty in platformDataForProcess[firstProperty]) {
        platformDataForProcess[firstProperty][secondProperty] = event.target.value;
      } else {
        platformDataForProcess[firstProperty] = event.target.value;
      }
    }

    this.setState({ platformDataForProcess });

  }


  handleAFADataChanges = (event, firstProperty) => {

    const { firstAnalysisParameter } = this.state;

    if (firstProperty in firstAnalysisParameter) {

      if (firstProperty === 'smallestLoanAmount' || firstProperty === 'minimalTurnOverAmount') firstAnalysisParameter[firstProperty] = Number(event);
      else if (firstProperty === 'maxNumberOfWorkingDaysBankFile' || firstProperty === 'minimalNumberOfDaysInBankFile'
        || firstProperty === 'higherBalancePercentage') firstAnalysisParameter[firstProperty] = Number(event.target.value);
      else if (firstProperty === 'mandateCustomerNameCheck') firstAnalysisParameter[firstProperty] = event.target.checked;
      else firstAnalysisParameter[firstProperty] = event.target.value;
    }

    this.setState({ firstAnalysisParameter });

  }


  processData = () => {


    let { firstAnalysisParameter, platformDataForProcess, openPlatformDetailsDialog, selectedPlatform, dialogAction } = this.state;

    if (!platformDataForProcess.country) {

      return this.props.displayNotification(
        "Must include country",
        "warning"
      );
    }
    const params = {
      platformParameter: {
        ...platformDataForProcess,
        action: this.state.dialogAction,
      }
    };

    let reloadData = false;

    this.props.addOrUpdatePlatformParameters(params)
      .then(() => {
        if (dialogAction === 'create') {
          platformDataForProcess = JSON.parse(JSON.stringify(basicPlatformDetails));
          firstAnalysisParameter = JSON.parse(JSON.stringify(basicAFADetails));
          openPlatformDetailsDialog = false;
          selectedPlatform = null;
          dialogAction = null;

          reloadData = true;
        }

    })
      .finally(() => {
        this.setState({ firstAnalysisParameter, platformDataForProcess, openPlatformDetailsDialog, selectedPlatform, dialogAction, isPlatformCompleted: true },
          () => { if (reloadData) this.getBasicDetails(); });
      });

  }


  processAFAData = () => {

    let { firstAnalysisParameter, platformDataForProcess, openPlatformDetailsDialog, selectedPlatform, dialogAction } = this.state;

    const params = {

      ...firstAnalysisParameter,
      action: this.state.dialogAction,
      platformName: platformDataForProcess ? platformDataForProcess.platformName : '',

    };

    let reloadData = false;

    this.props.addAFAPlatformParameters(params)
      .then(() => {
        platformDataForProcess = JSON.parse(JSON.stringify(basicPlatformDetails));
        firstAnalysisParameter = JSON.parse(JSON.stringify(basicAFADetails));
        openPlatformDetailsDialog = false;
        selectedPlatform = null;
        dialogAction = null;

        reloadData = true;
      })
      // .catch()
      .finally(() => {
        this.setState({ firstAnalysisParameter, platformDataForProcess, openPlatformDetailsDialog, selectedPlatform, dialogAction },
          () => { if (reloadData) this.getBasicDetails(); });
      });

  }

  render() {

    const { platformParameters, openPlatformDetailsDialog, isPlatformCompleted, platformDataForProcess, countryList, dialogAction, symbol, decimalSeparator, thousandSeparator, firstAnalysisParameter } = this.state;

    const { classes } = this.props;

    const disabledInputs = !((this.state.dialogAction === 'update') || (this.state.dialogAction === 'create'));

    let address = { streetName: '', houseNumber: '', postalCode: '', city: '' };
    address = (platformDataForProcess.address && Object.keys(platformDataForProcess.address).length > 0) ? platformDataForProcess.address : address;

    const inputClasses = {
      classes: {
        input: classes.input,
        disabled: classes.disabled,
      }
    };

    return (
      <div>
        <Notifier />
        {/* {this.props.origin === "ADMIN" ?
          <h1>Platform Overview</h1> : false} */}

        <div>
          <Paper >
            <div className={classes.tableHeaders}>
              <Typography variant="h5" id="tableTitle" component="div" className={classes.tableHeaderLabel}>Platform Overview</Typography>
              <Button className={`${classes.floatRight} ${classes.addButton}`} onClick={() => this.viewPlatformDetails(null, 'create')}>Add Platform</Button>
            </div>

            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.width_15}>Action</TableCell>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">COC-ID</TableCell>
                    <TableCell align="center">Creditor ID</TableCell>
                    <TableCell align="center">Contact Details</TableCell>
                    <TableCell align="center">Third Party Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {platformParameters.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell >
                        <div className={classes.actionButtons}><VisibilityIcon className={classes.cursorPointer} onClick={() => this.viewPlatformDetails(row.id, 'view')} /></div>
                        <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.viewPlatformDetails(row.id, 'update')} /></div>
                        <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.viewPlatformDetails(row.id, 'delete')} /></div>
                      </TableCell>
                      <TableCell align="center" component="th" scope="row"> {row.platformName} </TableCell>
                      <TableCell align="center">{row.cocId}</TableCell>
                      <TableCell align="center">{row.creditorId}</TableCell>
                      <TableCell align="center">{row.contactDetails}</TableCell>
                      <TableCell align="center">{row.thirdPartyName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </Paper>
        </div>

        <Dialog open={openPlatformDetailsDialog} onClose={this.viewPlatformDetails} fullWidth={true} maxWidth={'md'} aria-labelledby="bank-details">
          <DialogTitle id="platform-details-title">Platform Details</DialogTitle>
          <DialogContent>


            <TableContainer component={Paper}>
              <Table aria-label="Platform parameter table">
                <TableBody>
                  <TableRow>
                    <TableCell className={`${classes.width_20} ${classes.fontWeight_600}`}>Country</TableCell>
                    <TableCell align="left">
                      <Select
                        id="country"
                        name="country"
                        value={platformDataForProcess.country}
                        disabled={dialogAction !== 'create'}
                        onChange={(event) => this.handleProcessDataChanges(event, 'country')}
                      >
                        {countryList.map((country, index) =>
                          <MenuItem id={country.id} key={country.id} value={country.fieldNameValue}>{country.fieldNameValue}</MenuItem>
                        )}
                      </Select>
                    </TableCell>
                    <TableCell className={`${classes.width_20} ${classes.fontWeight_600}`}></TableCell>
                    <TableCell align="left">
                    </TableCell>
                    <TableCell align="left">
                    </TableCell>
                    <TableCell align="left">
                    </TableCell>
                  </TableRow>


                  <TableRow>
                    <TableCell colSpan={2} className={classes.firstAnalysesParameterLabel}>Contract Details: </TableCell>
                    <TableCell align="left">
                    </TableCell>
                    <TableCell align="left">
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.width_20} ${classes.fontWeight_600}`}>Name</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="platformName"
                        onChange={(event) => this.handleProcessDataChanges(event, 'platformName')}
                        value={platformDataForProcess.platformName}
                        disabled={dialogAction !== 'create'}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={`${classes.width_20} ${classes.fontWeight_600}`}>COC-ID</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="cocId"
                        onChange={(event) => this.handleProcessDataChanges(event, 'cocId')}
                        value={platformDataForProcess.cocId}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>
                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Street Name</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="streetName"
                        onChange={(event) => this.handleProcessDataChanges(event, 'address', 'streetName')}
                        value={address.streetName}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>Housing Number</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="streetName"
                        onChange={(event) => this.handleProcessDataChanges(event, 'address', 'houseNumber')}
                        value={address.houseNumber}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Postal Code</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="streetName"
                        onChange={(event) => this.handleProcessDataChanges(event, 'address', 'postalCode')}
                        value={address.postalCode}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>City</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="streetName"
                        onChange={(event) => this.handleProcessDataChanges(event, 'address', 'city')}
                        value={address.city}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>


                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Contract Details</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="contactDetails"
                        onChange={(event) => this.handleProcessDataChanges(event, 'contactDetails')}
                        value={platformDataForProcess.contactDetails}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>Contact Details Asset Manager</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="contactDetailsAssetManager"
                        onChange={(event) => this.handleProcessDataChanges(event, 'contactDetailsAssetManager')}
                        value={platformDataForProcess.contactDetailsAssetManager}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>



                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Managing Director 1</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="nameManagingDirector1"
                        onChange={(event) => this.handleProcessDataChanges(event, 'nameManagingDirector1')}
                        value={platformDataForProcess.nameManagingDirector1}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>Managing Director 2</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="nameManagingDirector2"
                        onChange={(event) => this.handleProcessDataChanges(event, 'nameManagingDirector2')}
                        value={platformDataForProcess.nameManagingDirector2}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>

                  </TableRow>

                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Titel MD 1</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="titelMd1"
                        onChange={(event) => this.handleProcessDataChanges(event, 'titelMd1')}
                        value={platformDataForProcess.titelMd1}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>Titel MD 2</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="titelMd2"
                        onChange={(event) => this.handleProcessDataChanges(event, 'titelMd2')}
                        value={platformDataForProcess.titelMd2}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>

                  <TableRow className={classes.emptyRow} key={`${Math.random()}`}><TableCell colSpan={4} className={classes.padding_5} ></TableCell></TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className={classes.firstAnalysesParameterLabel}>Bank Account-Details : </TableCell>
                    <TableCell align="left">
                    </TableCell>
                    <TableCell align="left">
                    </TableCell>
                  </TableRow>
                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Creditor ID</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="creditorId"
                        onChange={(event) => this.handleProcessDataChanges(event, 'creditorId')}
                        value={platformDataForProcess.creditorId}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>Third-Party-Name</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="thirdPartyName"
                        onChange={(event) => this.handleProcessDataChanges(event, 'thirdPartyName')}
                        value={platformDataForProcess.thirdPartyName}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>
                  <TableRow >
                    <TableCell className={classes.fontWeight_600}> Iban of Our Bank   </TableCell>
                    <TableCell align="left">
                      <TextField
                        id="ibanOfOurBank"
                        onChange={(event) => this.handleProcessDataChanges(event, 'ibanOfOurBank')}
                        value={platformDataForProcess.ibanOfOurBank}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}>bic of Our Bank</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="bicOfOurBank"
                        onChange={(event) => this.handleProcessDataChanges(event, 'bicOfOurBank')}
                        value={platformDataForProcess.bicOfOurBank}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                  </TableRow>
                  <TableRow >
                    <TableCell className={classes.fontWeight_600}>Name of Our Bank</TableCell>
                    <TableCell align="left">
                      <TextField
                        id="nameOfOurBank"
                        onChange={(event) => this.handleProcessDataChanges(event, 'nameOfOurBank')}
                        value={platformDataForProcess.nameOfOurBank}
                        disabled={disabledInputs}
                        InputProps={inputClasses} />
                    </TableCell>
                    <TableCell className={classes.fontWeight_600}></TableCell>
                    <TableCell align="left">
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className={classes.buttonUi}>
                <Button onClick={this.viewPlatformDetails} className={classes.popupCloseButton}>Close</Button>
                {
                  !disabledInputs ?
                    <Button onClick={this.processData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                    : null
                }
              </div>
              <div>
                {
                  this.state.dialogAction === 'update' ?
                    <><Table>
                      <TableBody>

                        <TableRow className={classes.emptyRow} key={`${Math.random()}`}><TableCell colSpan={4} className={classes.padding_5}></TableCell></TableRow>
                        <TableRow>
                          <TableCell colSpan={2} className={classes.firstAnalysesParameterLabel}>First Analyses Parameters:  </TableCell>
                          <TableCell align="left">
                          </TableCell>
                          <TableCell align="left">
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className={classes.fontWeight_600}>Maximum Number of Days Old</TableCell>
                          <TableCell align="left">
                            <TextField
                              id="maxNumberOfWorkingDaysBankFile"
                              onChange={(event) => this.handleAFADataChanges(event, 'maxNumberOfWorkingDaysBankFile')}
                              value={firstAnalysisParameter.maxNumberOfWorkingDaysBankFile}
                              disabled={disabledInputs}
                              InputProps={inputClasses} />
                          </TableCell>
                          <TableCell className={classes.fontWeight_600}>Minimal Number of Days in Bank File</TableCell>
                          <TableCell align="left">
                            <TextField
                              id="minimalNumberOfDaysInBankFile"
                              onChange={(event) => this.handleAFADataChanges(event, 'minimalNumberOfDaysInBankFile')}
                              value={firstAnalysisParameter.minimalNumberOfDaysInBankFile}
                              disabled={disabledInputs}
                              InputProps={inputClasses} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className={classes.fontWeight_600}>Higher Balance Percentage</TableCell>
                          <TableCell align="left">
                            <TextField
                              id="higherBalancePercentage"
                              onChange={(event) => this.handleAFADataChanges(event, 'higherBalancePercentage')}
                              value={firstAnalysisParameter.higherBalancePercentage}
                              disabled={disabledInputs}
                              InputProps={{
                                classes: {
                                  input: classes.input,
                                  disabled: classes.disabled,
                                },
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }} />
                          </TableCell>
                          <TableCell className={classes.fontWeight_600}>Minimal Turn Over Amount</TableCell>
                          <TableCell align="left">
                            <MultiCurrencyCustomFormatInput
                              type="text"
                              id="minimalTurnOverAmount"
                              name="minimalTurnOverAmount"
                              numberformat={firstAnalysisParameter.minimalTurnOverAmount}
                              readOnly={disabledInputs}
                              symbol={symbol}
                              decimalSeparator={decimalSeparator}
                              thousandSeparator={thousandSeparator}
                              changeValue={(event) => this.handleAFADataChanges(event, 'minimalTurnOverAmount')} />
                          </TableCell>
                        </TableRow>
                        {/* <TableRow >
      <TableCell className={classes.fontWeight_600}>Smallest Loan Amount</TableCell>
      <TableCell align="left">
        <MultiCurrencyCustomFormatInput
          type="text"
          id="smallestLoanAmount"
          name="smallestLoanAmount"
          numberformat={firstAnalysisParameter.smallestLoanAmount}
          readOnly={disabledInputs}
          symbol={symbol}
          decimalSeparator={decimalSeparator}
          thousandSeparator={thousandSeparator}
          changeValue={(event) => this.handleAFADataChanges(event, 'smallestLoanAmount')} />
      </TableCell>
      <TableCell className={classes.fontWeight_600}>Mandate Customer Name Check</TableCell>
      <TableCell align="left">
        <Checkbox
          checked={firstAnalysisParameter.mandateCustomerNameCheck}
          color="default"
          onChange={(event) => this.handleAFADataChanges(event, 'mandateCustomerNameCheck')}
          disabled={disabledInputs}
        />
      </TableCell>
    </TableRow> */}
                      </TableBody>
                    </Table><div className={classes.buttonUi}>
                        <Button onClick={this.viewPlatformDetails} className={classes.popupCloseButton}>Close</Button>
                        {!disabledInputs && platformDataForProcess.platformName ?
                          <Button onClick={this.processAFAData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                          : null}
                      </div></>
                    : null
                }
              </div>

            </TableContainer>
          </DialogContent>
          {/* <DialogActions>
            <Button onClick={this.viewPlatformDetails} className={classes.popupCloseButton}>Close</Button>
            {
              !disabledInputs ?
                <Button onClick={this.processData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                : null
            }
          </DialogActions> */}
        </Dialog>

      </div>
    );
  }
}

PlatformOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  getPlatformParameters: PropTypes.func.isRequired,
  addOrUpdatePlatformParameters: PropTypes.func.isRequired,
  getAFAParameters: PropTypes.func.isRequired,
  displayNotification: PropTypes.func,
  addAFAPlatformParameters: PropTypes.func.isRequired,
  origin: PropTypes.string
};

PlatformOverview.defaultProps = {
  origin: "ADMIN"
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  getPlatformParameters: (requestQuery) => dispatch(getPlatformParameters(requestQuery)),
  getAFAParameters: (requestQuery) => dispatch(getAFAParameters(requestQuery)),
  addOrUpdatePlatformParameters: (params) => dispatch(addOrUpdatePlatformParameters(params)),
  addAFAPlatformParameters: (params) => dispatch(addAFAPlatformParameters(params)),
  getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
  getLocales: (requestBody) => dispatch(getLocales(requestBody)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(PlatformOverview));
