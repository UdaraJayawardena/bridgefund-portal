/* eslint-disable no-empty-function */
// @ts-nocheck
/* eslint-disable semi */
/* eslint-disable prefer-const */
/* eslint-disable react/prop-types */
import React from "react";
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/smeLoanRecoveryAppointmentStyles.jsx";
import { MenuItem, InputLabel, FormControl, Select, FormLabel, TextField, InputAdornment, BottomNavigation } from "@material-ui/core";

import Button from 'components/loanmanagement/CustomButtons/Button.jsx';

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import CardFooter from "components/loanmanagement/Card/CardFooter.jsx";

import CustomSearch from 'components/loanmanagement/CustomAutoSuggest/CustomAutoSuggest.jsx';

import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import { MessageType, AppointmentStatus } from "./SmeLoanRecoveryAppointment";

import { sendEmail } from "store/loanmanagement/actions/Notifications";
import { displayNotification } from "store/loanmanagement/actions/Notifier";
import { requestSmeLoans, clearLoans, clearSelectedLoan, getSingleLoanOverviewData } from "store/loanmanagement/actions/SmeLoans";
import { clearSelectedCustomer, changeCustomerDetails } from "store/loanmanagement/actions/HeaderNavigation";
import { getLatestLoanHistoryByLoanId, saveSingleLoanHistoryData } from "store/loanmanagement/actions/Reports";
import {
  switchAddNewLoanAppointmentPopupState, cerateLoanRecoveryAppointment ,
  updateLoanRecoveryAppointment
} from "store/loanmanagement/actions/LoanRecoveryApointments.js";
import { selectLoan } from 'store/loanmanagement/actions/SmeLoans';
import {  setHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import Utility from "lib/loanmanagement/utility";
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
import { getLocales } from 'store/initiation/actions/Configuration.action';
import { getCustomerByVTigerId } from "store/crm/actions/Customer.action";
import { getPlatformParameters } from 'store/initiation/actions/PlatformParameters.action';

const ENV = Utility.getEnv();
const currency = Utility.multiCurrencyConverter();

class AddNewLoanRecoveryAppointment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      smeStakeholderName: '',
      smeStakeholderEmail: ENV === 'acceptance' ? 'test-beheer@bridgefund.nl' : '',
      bridgefundEmployee: '',
      selectedMessageType: '',
      selectedLoan: '',
      outstanding: '',
      overdue: '',
      internalMessage: '',
      externalMessage: '',
      appointedAmount: '',
      checkAppointmentOn: '',
      tailoredProvision: '',
      isSentPaymentLink: false,
      status: AppointmentStatus.OPEN,
      smeCompanyName: this.props.sme && this.props.sme.company ? this.props.sme.company : '',
      defaultLoan: '',
      locale: '',
      decimalSeparator: ',',
      symbol: '',
      thousandSeparator: '.',
      currency: 'EUR',
      platformParameter : {}	


    };
  }

  componentDidMount() {
    const { usage, appointment, origin, sme , calculatedLoanData} = this.props;

    const { loan } = this.props;
    if(loan && usage !== 'EDIT' && usage !== 'NEW'){
      this.getLocales(loan.country, loan.currency);
    }


    if(sme && usage !== 'EDIT' && usage !== 'NEW'){
       if(this.props.loan._id){
        this.props.getLatestLoanHistoryByLoanId(this.props.loan._id);
      }
     const company = sme.company;
      this.setState({
        smeCompanyName: company,
        smeStakeholderName: sme.name,
        overdue:  calculatedLoanData.overallTotalOverdueAmount,
        outstanding: calculatedLoanData.overallOutstandingTotalAmount,
        smeStakeholderEmail: ENV === 'acceptance' ? 'test-beheer@bridgefund.nl' : sme.email,
        selectedLoan: this.props.loan._id,
      });
      return;
    }
    if (origin === "SingleLoanOverview" && usage === "NEW" ) {
      this.props.getLatestLoanHistoryByLoanId(this.props.loan._id);
      this.props.changeCustomerDetails(sme);
      this.setState({
        smeCompanyName: sme.company,
        smeStakeholderName: sme.name,
        overdue:  calculatedLoanData.overallTotalOverdueAmount,
        outstanding: calculatedLoanData.overallOutstandingTotalAmount,
        smeStakeholderEmail: ENV === 'acceptance' ? 'test-beheer@bridgefund.nl' : sme.email,
        selectedLoan: this.props.loan._id,
      });
      return;
    }
    if (usage !== '' && Object.keys(appointment).length !== 0 ) {
      this.props.requestSmeLoans(appointment.smeId);

      this.props.getCustomerByVTigerId(appointment.smeId).then(customer => {
        this.props.changeCustomerDetails(customer);
        let company = customer.company ? customer.company : '';
        this.props.getLatestLoanHistoryByLoanId(appointment.smeLoan._id);
        this.getLocales(appointment.smeLoan.country , appointment.smeLoan.currency);
        if (usage === 'EDIT') {
          this.setState({
            smeStakeholderName: appointment.smeStakeholderName,
            smeStakeholderEmail: appointment.smeStakeholderEmail,
            bridgefundEmployee: appointment.bridgefundEmployee,
            selectedMessageType: appointment.internalExternalSwitch,
            selectedLoan: appointment.smeLoan._id,
            outstanding: appointment.outstanding,
            overdue: appointment.overdue,
            internalMessage: appointment.internalExternalSwitch === MessageType.INTERNAL ? appointment.message : '',
            externalMessage: appointment.internalExternalSwitch === MessageType.EXTERNAL ? appointment.message : '',
            appointedAmount: appointment.amount,
            checkAppointmentOn: moment(appointment.appointmentDate).format('YYYY-MM-DD'),
            tailoredProvision: appointment.provisionPercentage === null ? '' : appointment.provisionPercentage,
            isSentPaymentLink: appointment.sentPaymentLink,
            status: appointment.status,
            smeCompanyName: company
          })
        }
        else if (usage === 'NEW' ) {
          this.setState({
            smeCompanyName: company,
            selectedLoan: appointment.smeLoan._id,
            smeStakeholderName: appointment.smeStakeholderName,
            smeStakeholderEmail: appointment.smeStakeholderEmail,
            bridgefundEmployee: '',
            selectedMessageType: '',
            outstanding: '',
            overdue: '',
            internalMessage: '',
            externalMessage: '',
            appointedAmount: '',
            checkAppointmentOn: '',
            tailoredProvision: '',
            isSentPaymentLink: false,
            status: AppointmentStatus.OPEN,
          })
        }
      }).catch(err => {
        console.log(err);
      })
      return;
    }
  }
  componentWillUnmount() {
    // if (this.props.origin === "ADMIN") {
    //   this.props.clearSelectedLoan();
    //   this.props.clearLoans();
    //   this.props.clearSelectedLoanHistoryData();
    //   this.props.clearSelectedCustomer(); 
    // }
  }
  static getDerivedStateFromProps(props, state) {
    
    if (props.loans && props.loans.length > 0) {
      let activeLoan = props.loans.find(loan => loan.status === 'Active' || loan.status === 'Remaining');
      activeLoan = activeLoan ? activeLoan._id : '';
      if (activeLoan !== state.defaultLoan) return { defaultLoan: activeLoan, selectedLoan: activeLoan };
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.defaultLoan !== prevState.defaultLoan) this.setState({smeCompanyName: this.props.sme.company} );

    
  }

  handleChange = async (event) => {
    this.setState({ [event.target.name]: event.target.value } );
    if (event.target.name === 'selectedLoan') {
      const contract = this.props.loans.find(c => c._id === event.target.value);

      const { customerDetails } = this.props

      if (customerDetails && customerDetails.id === contract.smeId) {
        this.props.setHeaderDisplaySubData(` - ${tcustomerDetails.company} - ${contract.contractId}`);
      } else {
        this.props.getCustomerByVTigerId(contract.smeId).then(customer => {
          this.props.setHeaderDisplaySubData(` - ${customer.company} - ${contract.contractId}`);
        }).catch(err => {
          console.log(err);
        })
      }
      const contractId = contract.contractId;
      this.props.getLoanDetails(contractId);	

      this.props.loans.forEach((ele) => { 
        if(ele.contractId === contractId){
          this.getLocales(ele.country, ele.currency);
          this.props.selectLoan(ele);
        }
      });

      this.props.getLatestLoanHistoryByLoanId(event.target.value);
    }
  }

  getLocales = async (country , currency) => {
  
    if (country && currency) {
        this.props.getLocales({countryCode: country, currencyCode: currency})
            .then(res => {
        if (!res || res.length == 0) {             
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }
        this.setState({ 
            locale: res[0].locale,
            decimalSeparator: res[0].decimalSeparator,
            symbol: res[0].currencySymbol,
            thousandSeparator: res[0].thousandSeparator, 
            currency: currency
        });
        })
        .catch(err => { 
          console.log('getLocales err ', err); });
    }    
  }


  handleNumberInput = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }
  handleAmountField = (value, name) => {
    this.setState({ [name]: value });
  };
  handleDatePickers = event => {
    let value = moment(event.target.value).format('YYYY-MM-DD');
    if (moment(value).isValid()) {
      if (moment(value).isBefore(moment())) return this.props.displayNotification('Please select a future date', 'warning');
      this.setState({ [event.target.name]: value });
    }
  }
  onSearchResult = (value) => {
    this.props.changeCustomerDetails(value);
    this.props.setHeaderDisplaySubData(` - ${value.company}`);
    this.props.clearSelectedLoan();
    this.setState({
        smeStakeholderName: value.name,
        smeStakeholderEmail: ENV === 'acceptance' ? 'test-beheer@bridgefund.nl' : value.email,
        selectedLoan: '',
        outstanding: '',
        overdue: '',
    })
    
    if (value === '') {
      this.props.clearLoans();
      this.props.clearSelectedCustomer(); 
    } else {
      if (value.firstName && this.state.smeStakeholderName === '') {
        this.setState({ 'smeStakeholderName': value.firstName + ' ' + value.lastName, smeStakeholderEmail: ENV === 'acceptance' ? 'test-beheer@bridgefund.nl' : value.email });
      }
    }
  }

  createAppointment = () => {

    if (this.props.sme.id === '') this.props.displayNotification('Please select a sme', 'warning');
    else if (this.state.selectedLoan === '') this.props.displayNotification('Please select a loan', 'warning');
    else if (this.state.smeStakeholderName === '') this.props.displayNotification('Please fill the sme stakeholder name field', 'warning');
    else if (this.state.smeStakeholderEmail === '') this.props.displayNotification('Please fill the sme stakeholder email field', 'warning');
    else if (this.state.bridgefundEmployee === '') this.props.displayNotification('Please fill the bridgefund employee field', 'warning');
    else if (this.state.internalMessage.trim() === '' && this.state.externalMessage.trim() === '')
      this.props.displayNotification('Please fill the internal/external message field', 'warning');
    else if (this.state.appointedAmount === '') this.props.displayNotification('Please fill the apointed amount', 'warning');
    else if (!moment(this.state.checkAppointmentOn).isValid()) this.props.displayNotification('Please enter a valid date for check appointment', 'warning');
    else if (moment(this.state.checkAppointmentOn).isBefore(moment())) this.props.displayNotification('Please select a future date', 'warning');
    // else if (this.state.tailoredProvision === '') this.props.displayNotification('Please fill the tailored provision field', 'warning');
    else {
      this.props.getPlatformParameters({ country : this.props.loan.country })	
      .then(result => {	
        if(result){	
          let createObj = {	
            overdue: this.props.usage !== 'EDIT' ? this.LoanHistory.overdue : this.state.overdue,	
            outstanding: this.props.usage !== 'EDIT' ? this.LoanHistory.outstanding : this.state.outstanding,	
            smeLoan: this.state.selectedLoan,	
            status: AppointmentStatus.OPEN,	
            amount: this.state.appointedAmount,	
            smeId: this.props.sme.id,	
            externalMessage: this.state.externalMessage,	
            internalMessage: this.state.internalMessage,	
            appointmentDate: this.state.checkAppointmentOn,	
            provisionPercentage: this.state.tailoredProvision === '' || this.state.tailoredProvision === null ? null : this.state.tailoredProvision,	
            bridgefundEmployee: this.state.bridgefundEmployee,	
            smeStakeholderName: this.state.smeStakeholderName,	
            smeStakeholderEmail: this.state.smeStakeholderEmail,	
            internalExternalSwitch: this.state.externalMessage.trim() !== '' ? MessageType.EXTERNAL : MessageType.INTERNAL,	
            sentPaymentLink: this.state.isSentPaymentLink,	
            contactDetails: result[0].contactDetails,	
            contactDetailsAssetManager: result[0].contactDetailsAssetManager,	
            language: this.props.loan.language	
      
          }	
          const  loanObj = this.props.loans.find(loan => loan._id === createObj.smeLoan);	
          createObj['loanId']= loanObj.contractNumber;	
          this.props.cerateLoanRecoveryAppointment(createObj)	
        }	
          
      })	
      .catch(() => {	
          this.props.displayNotification('Error occured in get platform parameter!', 'error');	
      });
    }
  }

  createMailAndSend = appointment => {
    let loanObj = this.props.loans.find(loan => loan._id === appointment.smeLoan);
    appointment['loanId'] = loanObj.contractNumber;
    let mail = {
      to: appointment.smeStakeholderEmail,
      cluster: 'loan-management',
      type: 'sme-loan-recovery-appointment',
      metaData: {
        templateType: 'LOAN_RECOVERY_APPOINTMENT',
        ...appointment
      },
      reason: 'sme-loan-recovery-appointment'
    }
    this.props.sendEmail(mail);
  }

  updateAppointment = () => {
    if (
      this.state.status === this.props.appointment.status &&
      this.state.tailoredProvision === this.props.appointment.provisionPercentage
    ) {
      displayNotification('Please update either status or tailored provision', 'warning');
    }
    else {
      let obj = {
        loanId: this.props.appointment._id,
        status: this.state.status,
        provisionPercentage: this.state.tailoredProvision,
      }
      this.props.updateAppointment(obj);
    }
  };

  clear = () => {
    if (this.props.usage === 'EDIT') {
      this.setState({
        tailoredProvision: this.props.appointment.provisionPercentage,
        status: this.props.appointment.status,
      });
    }
    else {
      this.props.clearSelectedCustomer();
      this.props.clearLoans();

      this.setState({
        smeStakeholderName: '',
        smeStakeholderEmail: '',
        bridgefundEmployee: '',
        selectedMessageType: '',
        selectedLoan: '',
        internalMessage: '',
        externalMessage: '',
        appointedAmount: '',
        checkAppointmentOn: '',
        tailoredProvision: '',
        isSentPaymentLink: false,
      })
    }
  }

  get LoanHistory() {
    const { selectedLoanHisory } = this.props
    return {
      outstanding: selectedLoanHisory && Object.keys(selectedLoanHisory).length > 0 ? selectedLoanHisory.outstandingTotalLoanAmount : 0,
      overdue: selectedLoanHisory && Object.keys(selectedLoanHisory).length > 0 ? selectedLoanHisory.totalOverdueAmount : 0
    }
  }

  getActiveLoan = () => {
    let activeLoan = this.props.loans.find(loan => loan.status === 'Active' || loan.status === 'Remaining');
    return activeLoan ? activeLoan._id : '';
  }

  render() {
    const { classes, usage , loan} = this.props;
    const { locale, symbol, decimalSeparator, thousandSeparator } = this.state;
    return (
      <div>
        <Card>
          <CardHeader color='rose'>
            <h4 className={classes.cardTitleWhite}>{usage === "EDIT" ? "Change Appointment" : "Make Appointment"}</h4>
          </CardHeader>
          <CardBody>
            <GridContainer>
              {
                this.props.usage === '' ?
                  <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                    <FormControl style={{ marginTop: 3 }}
                    >
                      <FormLabel style={{ fontSize: 12 }}>SME Name Search</FormLabel>
                      <CustomSearch
                        id="sme-search"
                        name="SMESearch"
                        label="Search SME"
                        value={this.state.smeCompanyName}
                        entity="customers"
                        sugg_field="legalName"
                        onResult={this.onSearchResult.bind(this)}
                      />
                    </FormControl>
                  </GridItem>
                  :
                  <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                    <TextField
                      id="sme-company"
                      name="smeCompany"
                      label="SME Comapny Name"
                      type="text"
                      value={this.state.smeCompanyName}
                      className={classes.textField}
                      readOnly={true}
                      InputLabelProps={{
                        shrink: true,
                        readOnly: true
                      }}
                    />
                  </GridItem>
              }
              <GridItem   style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="loan-filter">Loan ID</InputLabel>
                  <Select
                    value={this.state.selectedLoan}
                    onChange={this.handleChange.bind(this)}
                    inputProps={{
                      name: 'selectedLoan',
                      id: 'loan-filter',
                      contrsctId: this.state.selectedLoan
                    }}
                    className={classes.selectEmpty}
                    readOnly={this.props.usage !== ''}
                  >
                    {this.props.loans.map((contract, i) =>
                      <MenuItem key={i} value={contract._id }  >{contract.contractId}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                <TextField
                  id="smeStakeholderName"
                  name="smeStakeholderName"
                  label="Contact Person"
                  type="text"
                  value={this.state.smeStakeholderName}
                  className={classes.textField}
                  InputLabelProps={{
                    readOnly: this.props.usage === 'EDIT',
                    shrink: true,
                  }}
                  onChange={this.props.usage === 'EDIT' ? () => { } :
                    (this.handleChange.bind(this))
                  }
                />
              </GridItem>
              <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                <TextField
                  id="smeStakeholderEmail"
                  name="smeStakeholderEmail"
                  label="Contact Email"
                  type="text"
                  value={this.state.smeStakeholderEmail}
                  className={classes.textField}
                  InputLabelProps={{
                    readOnly: ENV === 'acceptance' || this.props.usage === 'EDIT',
                    shrink: true
                  }}
                  onChange={ENV === 'acceptance' || this.props.usage === 'EDIT' ? () => { } :
                    (this.handleChange.bind(this))
                  }
                />
              </GridItem>
              
            </GridContainer>
            <GridContainer >
                <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                  <TextField
                      id="bridgefundEmployee"
                      name="bridgefundEmployee"
                      label="Bridgefund Employee"
                      type="text"
                      value={this.state.bridgefundEmployee}
                      className={classes.textField}
                      InputLabelProps={{
                        shrink: true,
                        readOnly: this.props.usage === 'EDIT'
                      }}
                      onChange={this.props.usage === 'EDIT' ? () => { } :
                          (this.handleChange.bind(this))
                      }
                  />
                </GridItem>
                <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                  <TextField
                      id="outstanding"
                      name="outstanding"
                      label="Outstanding"
                      type="text"
                      value={currency((this.props.usage !== 'EDIT' && this.state.selectedLoan !== '' )? this.LoanHistory.outstanding : this.state.outstanding ,locale ? locale : 'nl-NL', this.state.currency ? this.state.currency : 'EUR')}
                      className={classes.textField}
                      InputLabelProps={{
                        readOnly: true,
                        shrink: true
                      }}
                  />
                </GridItem>
                <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                  <TextField
                      id="overdue"
                      name="overdue"
                      label="Overdue"
                      type="text"
                      value={currency(this.props.usage !== 'EDIT' || this.state.selectedLoan !== ''? this.LoanHistory.overdue : this.state.overdue , locale ? locale : 'nl-NL', this.state.currency ? this.state.currency : 'EUR')}
                      className={classes.textField}
                      InputLabelProps={{
                        readOnly: true,
                        shrink: true
                      }}
                  />
                </GridItem>
                <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                  <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="status">Status</InputLabel>
                  <Select
                      value={this.state.status}
                      onChange={this.handleChange}
                      inputProps={{
                        name: 'status',
                        id: 'status',
                      }}
                      className={classes.selectEmpty}
                      readOnly={this.props.usage !== 'EDIT'}
                  >
                    <MenuItem value={AppointmentStatus.OPEN}>{AppointmentStatus.OPEN.toLocaleUpperCase()}</MenuItem>
                    <MenuItem value={AppointmentStatus.CLOSED}>{AppointmentStatus.CLOSED.toLocaleUpperCase()}</MenuItem>
                  </Select>
                </FormControl>
                </GridItem>
            </GridContainer>
            <div style={{ margin: '0px 0px' }}>
              {
                this.props.usage === 'EDIT' ?
                  <GridContainer>
                    <GridItem style={{ margin: '15px 0px' }} xs={12} sm={10} md={8}>
                      <TextField
                        id="message"
                        name="message"
                        label="Message"
                        type="text"
                        fullWidth
                        multiline
                        rows="4"
                        value={this.state.selectedMessageType === MessageType.INTERNAL ? this.state.internalMessage : this.state.externalMessage}
                        className={classes.textField}
                        InputLabelProps={{
                          readOnly: true,
                          shrink: true
                        }}
                      />
                    </GridItem>
                  </GridContainer>
                  :
                  <GridContainer >
                    <GridItem style={{ margin: '15px 0px' }} xs={12} sm={10} md={6}>
                      <TextField
                        id="external-message"
                        name="externalMessage"
                        label="External Message"
                        placeholder="Type your External Message Here..."
                        type="text"
                        fullWidth
                        multiline
                        rows="4"
                        value={this.state.externalMessage}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={this.handleChange.bind(this)}
                      />
                    </GridItem>
                    <GridItem style={{ margin: '15px 0px' }} xs={12} sm={10} md={6}>
                      <TextField
                        id="internal-message"
                        name="internalMessage"
                        label="Internal Message"
                        placeholder="Type your Internal Message Here..."
                        type="text"
                        fullWidth
                        multiline
                        rows="4"
                        value={this.state.internalMessage}
                        className={classes.textField}
                        InputLabelProps={{
                          hidden: this.state.selectedMessageType === MessageType.EXTERNAL,
                          shrink: true
                        }}
                        onChange={this.handleChange.bind(this)}
                      />
                    </GridItem>
                  </GridContainer>
              }
            </div>
            <GridContainer>
              <GridItem style={{ margin: '40px 0px'  }} xs={12} sm={6} md={3}>
                <div style={{ marginTop: -25 }}>
                <MultiCurrencyCustomFormatInput
                      readOnly={this.props.usage === 'EDIT'}
                      className={classes.textField}
                      labelText="Appointed Amount"
                      type="text"
                      id="appointedAmount"
                      name="appointedAmount"
                      numberformat={this.state.appointedAmount}
                      formControlProps={{
                        fullWidth: false
                      }}
                      changeValue={this.handleAmountField.bind(this)}
                      symbol={symbol}
                      decimalSeparator={decimalSeparator}
                      thousandSeparator={thousandSeparator}
                    />

                </div>
              </GridItem>
              <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="sent-payment-link">Sent Payment Link</InputLabel>
                  <Select
                    value={this.state.isSentPaymentLink}
                    onChange={this.handleChange.bind(this)}
                    inputProps={{
                      name: 'isSentPaymentLink',
                      id: 'sent-payment-link',
                    }}
                    className={classes.selectEmpty}
                    readOnly={this.props.usage === 'EDIT'}
                  >
                    <MenuItem value={true}>{'Yes'}</MenuItem>
                    <MenuItem value={false}>{'No'}</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                <FormControl className={classes.formControl}>
                  <TextField
                    id="check-appointment-on"
                    name="checkAppointmentOn"
                    label="Check Appointment On"
                    type="date"
                    value={this.state.checkAppointmentOn}
                    className={classes.textField}
                    disabled={this.props.usage === 'EDIT'}
                    InputLabelProps={{
                      shrink: true,
                      disabled: this.props.usage === 'EDIT'
                    }}
                    onChange={this.props.usage === 'EDIT' ? () => { } :
                      (this.handleDatePickers.bind(this))
                    }
                  />
                </FormControl>
              </GridItem>
              <GridItem style={{ margin: '15px 0px' }} xs={12} sm={6} md={3}>
                <TextField
                  id="tailoredProvision"
                  name="tailoredProvision"
                  label="Tailored Provision"
                  className={classes.textField}
                  placeholder={this.props.usage === '' && this.props.selectedLoanHisory ? this.props.selectedLoanHisory.provisionPercentage + '' : ''}
                  value={this.state.tailoredProvision}
                  InputLabelProps={{
                    shrink: true
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  onKeyPress={Utility.validateNumberInput.bind(this)}
                  onChange={this.handleNumberInput.bind(this)}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter>
            <Button color="danger" size="sm" onClick={this.props.switchAddNewLoanAppointmentPopupState.bind()}>Cancel</Button>
            <Button color="warning" size="sm" onClick={() => this.clear()}>
              {this.props.usage === 'EDIT' ? 'Reset' : 'Clear'}
            </Button>
            {
              this.props.usage === 'EDIT' ?
                <Button color="info" size="sm" onClick={() => this.updateAppointment()}>Update Appointment</Button>
                :
                <Button color="info" size="sm" onClick={() => this.createAppointment()}>Create Appointment</Button>
            }
          </CardFooter>
        </Card>
      </div>
    )
  }
}

AddNewLoanRecoveryAppointment.defaultProps = {
  origin: 'ADMIN'
}

AddNewLoanRecoveryAppointment.propTypes = {
  origin: PropTypes.string,
  usage: PropTypes.string,
  appointment: PropTypes.object,
  setHeaderDisplaySubData: PropTypes.func,
  selectLoan:PropTypes.func,
  calculatedLoanData: PropTypes.object,
  getLocales: PropTypes.func,
  getPlatformParameters: PropTypes.func,	
  loan:PropTypes.object,	
  getLoanDetails: PropTypes.func,
  getCustomerByVTigerId: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    loans: state.lmglobal.smeLoans,
    sme: state.lmglobal.customerDetails,
    selectedLoanHisory: state.reports.selectedLoanHistory,
    loan: state.lmglobal.selectedLoan,
    calculatedLoanData: state.lmglobal.calculatedDataOfLoanTransactions,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearSelectedLoan: () => {
      dispatch(clearSelectedLoan());
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    switchAddNewLoanAppointmentPopupState: () => {
      dispatch(switchAddNewLoanAppointmentPopupState());
    },
    displayNotification: (msg, type) => {
      dispatch(displayNotification(msg, type));
    },
    cerateLoanRecoveryAppointment: appointment => {
      dispatch(cerateLoanRecoveryAppointment(appointment));
    },
    requestSmeLoans: smeId => {
      dispatch(requestSmeLoans(smeId));
    },
    updateAppointment: (appointment, shouldPopupClsoe) => {
      dispatch(updateLoanRecoveryAppointment(appointment, shouldPopupClsoe));
    },
    changeCustomerDetails: customerDetails => {
      dispatch(changeCustomerDetails(customerDetails));
    },
    getLatestLoanHistoryByLoanId: loanId => {
      dispatch(getLatestLoanHistoryByLoanId(loanId));
    },
    clearSelectedLoanHistoryData: () => {
      dispatch(saveSingleLoanHistoryData({}));
    },
    sendEmail: mailContent => {
      dispatch(sendEmail(mailContent));
    },
    clearLoans: () => {
      dispatch(clearLoans());
    },
    setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),
    selectLoan: (loan) => {
      dispatch(selectLoan(loan));
    },
    getLocales: (requestBody) => dispatch(getLocales(requestBody)), 
    getLoanDetails: (contractId) => dispatch(getSingleLoanOverviewData(contractId)),	
    getPlatformParameters: (requestQuery) => dispatch(getPlatformParameters(requestQuery)), 
    getCustomerByVTigerId: (vTigerAccountNumber) => dispatch(getCustomerByVTigerId(vTigerAccountNumber))
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddNewLoanRecoveryAppointment));