import React from 'react';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
// import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import { Typography, Button, Fab, Badge, Grid } from '@material-ui/core';
import { DeleteOutline, CheckCircle, Edit, PersonAdd, AddCircle } from '@material-ui/icons';

import GridItem from 'components/crm/Grid/GridItem';
import GridContainer from 'components/crm/Grid/GridContainer';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import Address from 'components/crm/Address/Address';
import Contact from 'components/crm/Contact/Contact';
import CustomDatePicker from 'components/crm/CustomDatePicker/CustomDatePicker';

import { displayNotification } from 'store/crm/actions/Notifier';
import { CUDCustomer, getCustomerAddressContact, resetState, setSelectedCustomerId } from 'store/crm/actions/SmeOverview.action';

// @ts-ignore
import { AddressConstants, CustomerConstants, CddInfoConstants, CommonConstants, HighRiskRegisterConstants, ContactConstants, } from '../../../constants/crm/index';
import { compareObject, compareArrayOfObjects, isNullOrEmpty, updateQueryStringParameter } from 'lib/crm/utility';
import CustomSearch from 'components/crm/CustomInput/CustomSearch';
import { dataValidation_regularExpressions } from 'constants/crm/commonData';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';
import { setHeaderDisplayMainData, setHeaderDisplaySubData, clearHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import { getCustomerSuccessManagerList } from 'store/crm/actions/Customer.action';
import { clearBankAccounts, clearSmeLoanRequestDetails, setRequestBlocksGlobally } from 'store/initiation/actions/CreditRiskOverview.action';
import { clearCustomerDetails, clearSmeLoanRequests, getSmeLoanRequests } from 'store/initiation/actions/BankAccount.action';

class SmeOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customer: cloneDeep(CustomerConstants.emptyObj),
      customerErors: cloneDeep(CustomerConstants.emptyErrorObj),
      addresses: [cloneDeep(AddressConstants.emptyObj)],
      cddInfo: cloneDeep(CddInfoConstants.emptyObj),
      highRiskRegister: cloneDeep(HighRiskRegisterConstants.emptyObj),
      contacts: cloneDeep(ContactConstants.initialEmptyArray),
      isLoading: false,
    };
  }

  setCustomerIdInUrl = (id) => {

    let URL = document.location.origin + document.location.pathname;
    if (id)
      URL = updateQueryStringParameter(
        document.location.href,
        "customerId",
        id
      );
    window.history.pushState({ path: URL }, "", URL);
  };

  componentDidMount() {
    //  this.props.setHeaderDisplayMainData('Customer');

    if (!this.props.isDashboardContent) {
      this.props.addCustomerButtonRef.current.onclick = this.clearState;
      // this.props.setHeaderDisplaySubData(` - ${this.props.selectedCustomer.legalName}`);
    }
    else {
      if (this.props.selectedCustomerId !== '') {
        this.props.getCustomerAddressContact(this.props.selectedCustomerId)
          .then((response) => {
            this.props.setHeaderDisplaySubData(` - ${response.customer.legalName}`);
          });
        return;
      }
      if (this.props.selectedCustomer.legalName)
        this.props.setHeaderDisplaySubData(` - ${this.props.selectedCustomer.legalName}`);
      //we only need customer legal name to disply in this dashboard no need of contract
    }

    const _state = {};
    if (isNullOrEmpty(this.state.customer._id) && !isNullOrEmpty(this.props.selectedCustomer._id)) {
      _state.customer = this.props.selectedCustomer;
      _state.addresses = this.props.customerAddress;
      _state.cddInfo = isNullOrEmpty(this.props.customerCddInfo) ? cloneDeep(CddInfoConstants.emptyObj) : this.props.customerCddInfo;
      _state.highRiskRegister = this.props.customerHighRiskReg;
      _state.contacts = this.props.customerContacts;

      this.setCustomerIdInUrl(_state.customer.id);
    }

    if (Object.keys(_state).length > 0) this.setState(_state);

    this.props.getCustomerSuccessManagerList().catch(() => {/*  */ });
  }

  componentDidUpdate(prevProps) {
    const _state = {};
    if (this.props.customerId && this.props.customerId !== prevProps.customerId) this.props.getCustomerAddressContact(this.props.customerId);
    if (prevProps.selectedCustomer_ua !== this.props.selectedCustomer_ua) {
      _state.customer = isNullOrEmpty(this.props.selectedCustomer) ? cloneDeep(CustomerConstants.emptyObj) : this.props.selectedCustomer;
      this.setCustomerIdInUrl(_state.customer.id);
    }
    if (prevProps.customerAddress_ua !== this.props.customerAddress_ua) _state.addresses = this.props.customerAddress;
    if (prevProps.customerCddInfo_ua !== this.props.customerCddInfo_ua) {
      _state.cddInfo = isNullOrEmpty(this.props.customerCddInfo) ? cloneDeep(CddInfoConstants.emptyObj) : this.props.customerCddInfo;
    }
    if (prevProps.customerHighRiskReg_ua !== this.props.customerHighRiskReg_ua) {
      _state.highRiskRegister = isNullOrEmpty(this.props.selectedCustomer) ? cloneDeep(HighRiskRegisterConstants.emptyObj) : this.props.customerHighRiskReg;
    }
    if (prevProps.customerContacts_ua !== this.props.customerContacts_ua) _state.contacts = this.props.customerContacts;


    if (Object.keys(_state).length > 0) this.setState(_state);
  }

  clearState = () => {
    this.props.resetState();
    this.props.clearHeaderDisplaySubData();
    this.setState({
      customer: cloneDeep(CustomerConstants.emptyObj),
      customerErors: cloneDeep(CustomerConstants.emptyErrorObj),
      addresses: [cloneDeep(AddressConstants.emptyObj)],
      cddInfo: cloneDeep(CddInfoConstants.emptyObj),
      highRiskRegister: cloneDeep(HighRiskRegisterConstants.emptyObj),
      contacts: cloneDeep(ContactConstants.initialEmptyArray),
      isLoading: false
    });
  }

  handleOnCustomerSearchResult = (result) => {
    if (result && typeof result !== 'string') {

      if (this.props.isDashboardContent) {
        this.props.setSelectedCustomerId(result.id);
      }
      else { this.setCustomerIdInUrl(result.id); }

      this.props.getCustomerAddressContact(result.id);
      this.setCustomerIdInUrl(result.id);
      this.props.clearSmeLoanRequestDetails(); // if you change customer then all req details should be cleared
    }
  }

  handleChange = (name, value, componentName) => {

    if (name === 'legalName' && value !== '') {
      this.props.setHeaderDisplaySubData(` - ${value}`);
    }

    const _state = {
      customerErors: {},
    };

    if (componentName) {
      const component = cloneDeep(this.state[componentName]);
      component[name] = value;
      _state[componentName] = component;

      if (componentName === 'customer') {
        _state.customerErors[name] = null;
        if (value === '') {
          this.props.clearCustomerDetails();
          this.props.setHeaderDisplaySubData('');
          this.props.clearSmeLoanRequests();
          this.props.clearBankAccounts();
          this.props.clearSmeLoanRequestDetails();
          this.props.setRequestBlocksGlobally([]);
        }
      }
    }
    else {
      _state[name] = value;
    }
    this.setState(_state);
  };

  showAddressAndContactErrors = (component, error) => {
    if (component === 'addresses') {
      this.setState({ customerErors: { addresses: error } });
    }
    if (component === 'contacts') {
      this.setState({ customerErors: { contacts: error } });
    }
  }

  addOtherSbiCode = () => {
    const customer = cloneDeep(this.state.customer);
    customer.otherSbiCode.push('');
    this.setState({ customer: customer });
  };

  removeOtherSbiCode = (index) => {
    const customer = cloneDeep(this.state.customer);
    if (customer.otherSbiCode.length === 1) return;
    customer.otherSbiCode.splice(index, 1);
    this.setState({ customer: customer });
  };

  handleOtherSbiCodeChange = (index, value) => {
    const customer = cloneDeep(this.state.customer);
    customer.otherSbiCode[index] = value;
    this.setState({ customer: customer, customerErors: { otherSbiCode: null } });
  };

  saveCustomer = () => {

    const customer = { action: 'none', _id: this.state.customer._id };
    const cddInfo = { action: 'none' };
    const address = { data: [] };
    const highRiskRegister = { action: 'none', _id: this.state.highRiskRegister._id };
    const contact = { data: [] };
    const changedData = cloneDeep(this.allChanges.finalObject);

    // customer validations

    if (isNullOrEmpty(this.state.customer.legalName)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { legalName: 'Please fill the legal name' } }); return; }
    if (isNullOrEmpty(this.state.customer.primarySbiCode)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { primarySbiCode: 'Please fill the primary sbi code' } }); return; }
    if (isNullOrEmpty(this.state.customer.legalForm)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { legalForm: 'Please fill the legal form' } }); return; }
    if (isNullOrEmpty(this.state.customer.primaryCustomerSuccessManager)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { primaryCustomerSuccessManager: 'Please fill the primary customer success manager' } }); return; }
    // if (this.state.customer.otherSbiCode.filter(sbiCode => sbiCode === "").length > 0) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { otherSbiCode: 'Please add valid other sbi code' } }); return; }
    if (isNullOrEmpty(this.state.customer.cocId)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { cocId: 'Please fill the legal CoC Id' } }); return; }
    if (isNullOrEmpty(this.state.customer.registrationDate)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { registrationDate: 'Please fill the registration date' } }); return; }
    if (isNullOrEmpty(this.state.customer.language)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { language: 'Please select the customer language' } }); return; }

    // address validations

    if (this.state.addresses.length > 0) {

      // eslint-disable-next-line no-unused-vars
      let isPhysicalAddressAvailable = false;
      for (let i = 0; i < this.state.addresses.length; i++) {
        const address = this.state.addresses[i];

        if (address.type === 'physical') {

          isPhysicalAddressAvailable = true;

          if (isNullOrEmpty(address.streetName) || isNullOrEmpty(address.houseNumber) || isNullOrEmpty(address.cityName) || isNullOrEmpty(address.postalCode)) {
            this.props.displayNotification('Please fill all mandatory fields', 'warning');
            this.setState({ customerErors: { addresses: 'Physical address should have street name , house number ,city name and postal code' } });
            return;
          }
          else if (!new RegExp(CommonConstants.dataValidation_regularExpressions.postlCode).test(address.postalCode)) {
            this.setState({ customerErors: { addresses: 'Invalid postal code !' } });
            this.props.displayNotification('Invalid postal code!', 'warning');
            return;
          }
          this.setState({ customerErors: { addresses: null } });
        }
        else if (address.type === 'postal-code') {

          if (isNullOrEmpty(address.streetName) || isNullOrEmpty(address.cityName) || isNullOrEmpty(address.postalCode)) {
            this.props.displayNotification('Please fill all mandatory fields', 'warning');
            this.setState({ customerErors: { addresses: 'Postal address should have street name , house number ,city name and postal code' } });
            return;
          }
          else if (!new RegExp(CommonConstants.dataValidation_regularExpressions.postlCode).test(address.postalCode)) {
            this.setState({ customerErors: { addresses: 'Invalid postal code !' } });
            this.props.displayNotification('Invalid postal code!', 'warning');
            return;
          }
          else if (!isPhysicalAddressAvailable) {
            this.props.displayNotification('Please fill all mandatory fields', 'warning');
            this.setState({ customerErors: { addresses: 'At least one physical address should be available' } });
            return;
          }
          this.setState({ customerErors: { addresses: null } });
        }
        else {
          this.setState({ customerErors: { addresses: null } });
        }
      }
    }

    // contacts validations

    if (isNullOrEmpty(this.state.contacts.find(contact => contact.type === ContactConstants.type.EMAIL && contact.value && contact.subType))) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { contacts: 'At least one email address should be available' } }); return; }
    if (isNullOrEmpty(this.state.contacts.find(contact => contact.type === ContactConstants.type.PHONE && contact.value && contact.subType))) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ customerErors: { contacts: 'At least one phone number should be available' } }); return; }
    if (this.state.contacts && this.state.contacts.length > 0) {
      const data = this.state.contacts;
      data.filter(item => item._id !== undefined);

      for (let i = 0; i < data.length; i++) {
        const contact = data[i];
        if (contact.type === 'email') {
          if (!new RegExp(CommonConstants.dataValidation_regularExpressions.email).test(contact.value)) {
            //this.setState({ customerErors: { contacts: 'Invalid email address !' } });
            this.props.displayNotification('Invalid email address!', 'warning');
            return;
          }
          this.setState({ customerErors: { contact: null } });
        }
      }
    }


    // @ts-ignore
    if (!isNullOrEmpty(changedData.contact.find(contact => isNullOrEmpty(contact._id) && (isNullOrEmpty(contact.value) || isNullOrEmpty(contact.subType))))) {
      this.props.displayNotification('Please fill both value and subtype in the contact', 'warning');
      this.setState({ customerErors: { contacts: 'Value and type  is required in contacts' } }); return;
    }

    if (!isNullOrEmpty(changedData.highRiskRegister)) changedData.highRiskRegister.date = this.props.systemDate;
    if (!isNullOrEmpty(changedData.cddInfo)) changedData.cddInfo.date = this.props.systemDate;

    if (isNullOrEmpty(this.state.highRiskRegister.indicator)) return this.props.displayNotification('Please fill high risk register indicator!', 'warning');
    if (isNullOrEmpty(this.state.highRiskRegister.source)) return this.props.displayNotification('Please fill high risk register source!', 'warning');

    /* Create the Final request object */
    Object.assign(customer, changedData.customer);
    Object.assign(cddInfo, changedData.cddInfo);
    Object.assign(highRiskRegister, changedData.highRiskRegister);
    Object.assign(address.data, address.data.concat(changedData.address));
    Object.assign(contact.data, contact.data.concat(changedData.contact));

    this.setState({ isLoading: true });
    // console.log({ customer, cddInfo, highRiskRegister, address, contact });
    this.props.CUDCustomer({ customer, cddInfo, highRiskRegister, address, contact })
      .catch(() => { /*  */ })
      .finally(() => this.setState({ isLoading: false }));
  };

  removeSpacesInPhoneNumbers = (contacts) => {

    return contacts.map(contact => {
      contact = JSON.parse(JSON.stringify(contact));
      if (contact.type === 'phone' && /\s/g.test(contact.value)) {
        contact.value = contact.value.replace(/\s/g, '');
        return contact;
      }
      return contact;
    });
  }

  getCustomerChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.customer._id) {

      comparedObj = compareObject(this.props.selectedCustomer, this.state.customer, CustomerConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(CustomerConstants.emptyObj, this.state.customer, CustomerConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.customer._id) {

      returnObj = {
        ...comparedObj,
        action: 'update',
        _id: this.state.customer._id
      };

    } else if (changeCount > 0) {
      returnObj = { ...this.state.customer, action: 'create' };
    }

    return [returnObj, changeCount];
  }

  getCddInfoChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.cddInfo._id) {

      comparedObj = compareObject(this.props.customerCddInfo, this.state.cddInfo, CddInfoConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(CddInfoConstants.emptyObj, this.state.cddInfo, CddInfoConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.cddInfo._id) {

      returnObj = {
        ...comparedObj,
        action: 'create',
      };

    } else if (changeCount > 0) {

      returnObj = { ...this.state.cddInfo, action: 'create' };
    }

    return [returnObj, changeCount];
  }

  getHighRiskRegChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.highRiskRegister._id) {

      comparedObj = compareObject(this.props.customerHighRiskReg, this.state.highRiskRegister, HighRiskRegisterConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(HighRiskRegisterConstants.emptyObj, this.state.highRiskRegister, HighRiskRegisterConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.highRiskRegister._id) {

      returnObj = {
        ...comparedObj,
        action: 'update',
        _id: this.state.highRiskRegister._id
      };

    } else if (changeCount > 0) {

      returnObj = { ...this.state.highRiskRegister, action: 'create' };
    }

    return [returnObj, changeCount];
  }

  getAddressChanges = () => {

    let addresses = [];
    const isUpdating = this.props.customerAddress.find(addr => addr._id !== undefined);

    let comparedObject;
    if (isUpdating) {
      comparedObject = compareArrayOfObjects(this.props.customerAddress, this.state.addresses, AddressConstants.schemaKeysToCompare, 'address');
    } else {
      comparedObject = compareArrayOfObjects([AddressConstants.emptyObj], this.state.addresses, AddressConstants.schemaKeysToCompare, 'address');
    }

    const { updateValues, insertedValues, deletedValues } = comparedObject;
    // console.log("address ", { updateValues, insertedValues, deletedValues });

    addresses = addresses.concat(
      insertedValues.map(val => ({ action: 'create', ...val })),
      updateValues.map(val => ({ action: 'update', ...val })),
      deletedValues.map(val => ({ action: 'delete', ...val }))
    );

    return [addresses, addresses.length];
  }

  getContactChanges = () => {

    let contacts = [];
    const isUpdating = this.props.customerContacts.find(contact => contact._id !== undefined);

    let comparedObject;
    if (isUpdating) {
      comparedObject = compareArrayOfObjects(this.props.customerContacts, this.removeSpacesInPhoneNumbers(this.state.contacts), ContactConstants.schemaKeysToCompare, 'contact');
    } else {
      comparedObject = compareArrayOfObjects(ContactConstants.initialEmptyArray, this.removeSpacesInPhoneNumbers(this.state.contacts), ContactConstants.schemaKeysToCompare, 'contact');
    }

    const { updateValues, insertedValues, deletedValues } = comparedObject;
    // console.log("contacts ", { updateValues, insertedValues, deletedValues });

    contacts = contacts.concat(
      insertedValues.map(val => ({ action: 'create', ...val })),
      updateValues.map(val => ({ action: 'update', ...val })),
      deletedValues.map(val => ({ action: 'delete', ...val }))
    );

    return [contacts, contacts.length];
  }

  get allChanges() {
    let hasChanged = false;
    let changeCount = 0;

    const [customer, cusCngCount] = this.getCustomerChanges();
    changeCount += Number(cusCngCount);

    const [cddInfo, cddChngCnt] = this.getCddInfoChanges();
    changeCount += Number(cddChngCnt);

    const [highRiskRegister, hrrChngCnt] = this.getHighRiskRegChanges();
    changeCount += Number(hrrChngCnt);

    const [address, addrChngCnt] = this.getAddressChanges();
    changeCount += Number(addrChngCnt);

    const [contact, contactChngCnt] = this.getContactChanges();
    changeCount += Number(contactChngCnt);

    if (changeCount > 0) hasChanged = true;

    const finalObject = {
      customer, address, cddInfo, highRiskRegister, contact
    };

    return { hasChanged, finalObject, changeCount };
  }

  render() {
    const { classes, isDashboardContent } = this.props;
    const { customerErors } = this.state;

    return (
      <div className={classes.container}>

        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.TwoBox}>
            <div style={{ float: "left" }}>
              {this.allChanges.hasChanged && this.props.selectedCustomer._id &&
                <span className={classes.isUpdating}>&nbsp;&nbsp;<Edit />(Updating...)</span>
              }
              {this.allChanges.hasChanged && !this.props.selectedCustomer._id &&
                <span className={classes.isUpdating}>&nbsp;&nbsp;<PersonAdd />(New Customer...)</span>
              }
            </div>
          </GridItem>
          <GridItem className={classes.TwoBox}>
            {isDashboardContent ?
              <Grid
                justify="flex-end"
                container
              >
                <Grid item>
                  <Button
                    variant='contained'
                    startIcon={<AddCircle />}
                    className={classes.addIconButton}
                    onClick={this.clearState}
                  >Add Customer</Button>
                  <Button
                    variant='outlined'
                    startIcon={<DeleteOutline />}
                    className={classes.deleteIconButton}
                  >Delete Company</Button>
                </Grid>
              </Grid >
              : null}
          </GridItem>
        </GridContainer>

        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomSearch
              id='company-name-search'
              label='Company Name *'
              placeholder='Dream Beers B.V.'
              changeToFormatType='FirstCap'
              name='legalName'
              value={this.state.customer.legalName}
              onSearchResult={this.handleOnCustomerSearchResult}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              asyncSearchType='customer'
            />
            {customerErors.legalName ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.legalName} </Typography> : false}
            {/* <CustomInputBox
              id='company-name'
              label='Company Name'
              placeholder='Beer in the Box BV'
              changeToFormatType='CamelCase'
              name='legalName'
              value={this.state.customer.legalName}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
            /> */}
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='status'
              label='Status'
              placeholder='Active'
              name='status'
              value={this.state.customer.status}
              disabled />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='primary-sbi'
              label='Primary SBI *'
              pattern={dataValidation_regularExpressions.sbiCode}
              helperText='Max character length is 6'
              placeholder='123456'
              name='primarySbiCode'
              value={this.state.customer.primarySbiCode}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
            />
            {customerErors.primarySbiCode ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.primarySbiCode} </Typography> : false}
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id='legal-form'
              label='Legal Form *'
              placeholder='BV'
              name='legalForm'
              value={this.state.customer.legalForm}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              dropDownValues={Object.keys(CustomerConstants.LegalForm).map(key => { return { key: key, value: CustomerConstants.LegalForm[key] }; })} />
            {customerErors.legalForm ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.legalForm} </Typography> : false}
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id='primary-contact'
              label='Primary Contact *'
              name='primaryCustomerSuccessManager'
              value={this.state.customer.primaryCustomerSuccessManager}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              dropDownValues={this.props.customerSuccessManagerList && this.props.customerSuccessManagerList.map(key => { return { key: key, value: key }; })} />

            {customerErors.primaryCustomerSuccessManager ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.primaryCustomerSuccessManager} </Typography> : false}
          </GridItem>
          <GridItem className={classes.smallBox}>
            {this.state.customer.otherSbiCode.map((code, index) => (
              <CustomInputBox
                key={`other-sbi-${index}`}
                id={`other-sbi-${index}`}
                label='Other SBI'
                placeholder='123456'
                pattern={dataValidation_regularExpressions.sbiCode}
                helperText='Max character length is 6'
                value={code}
                onChange={(name, value) => this.handleOtherSbiCodeChange(index, value)}
                onAdd={this.addOtherSbiCode}
                onRemove={() => this.removeOtherSbiCode(index)}
              />
            ))}
            {customerErors.otherSbiCode ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.otherSbiCode} </Typography> : false}
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="direct-customer"
              label="Direct Customer"
              name='customerIndicator'
              value={this.state.customer.customerIndicator}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              dropDownValues={Object.keys(CustomerConstants.isDirectCustomer).map(key => { return { key: key, value: CustomerConstants.isDirectCustomer[key] }; })}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            {customerErors.addresses ? <Typography color='error' variant="caption" display="block" gutterBottom > {customerErors.addresses} </Typography> : false}
            <Address
              addresses={this.state.addresses}
              onChange={(result) => this.setState({ addresses: result })}
              maxNoAdresses={3}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            {customerErors.contacts ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.contacts} </Typography> : false}
            <Contact contacts={this.state.contacts}
              onChange={(result) => this.setState({ contacts: result })}
              showAddressAndContactErrors={(component, error) => this.showAddressAndContactErrors(component, error)} />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='coc-id'
              label='CoC-Id *'
              placeholder='123456'
              name='cocId'
              value={this.state.customer.cocId}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
            />
            {customerErors.cocId ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.cocId} </Typography> : false}
            <CustomDatePicker
              label="Registration Date *"
              name="registrationDate"
              value={this.state.customer.registrationDate}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              hideSideButtons
            />
            {customerErors.registrationDate ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.registrationDate} </Typography> : false}
            <CustomInputBox
              id='cdd-info'
              label='CDD Info'
              placeholder='Choose File'
              type='file'
              name='document'
              fieldName={CommonConstants.DocumentFieldNames.CddInfo}
              value={this.state.cddInfo.document}
              onChange={(name, value) => this.handleChange(name, value, 'cddInfo')}
            />
            <CustomInputBox
              type='dropdown'
              id='high-risk-indicator'
              label='High Risk Indicator'
              placeholder='No'
              name='indicator'
              value={this.state.highRiskRegister.indicator}
              onChange={(name, value) => this.handleChange(name, value, 'highRiskRegister')}
              dropDownValues={Object.keys(HighRiskRegisterConstants.indicator).map(key => { return { key: key, value: HighRiskRegisterConstants.indicator[key] }; })}
            />
            <CustomInputBox
              type='dropdown'
              id='source-high-risk'
              label='Source High Risk'
              placeholder='BridgeFund'
              name='source'
              value={this.state.highRiskRegister.source}
              onChange={(name, value) => this.handleChange(name, value, 'highRiskRegister')}
              dropDownValues={Object.keys(HighRiskRegisterConstants.source).map(key => { return { key: key, value: HighRiskRegisterConstants.source[key] }; })}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="language"
              label="Language *"
              name='language'
              value={this.state.customer.language}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              dropDownValues={Object.keys(CommonConstants.languages).map(key => { return { key: key, value: CommonConstants.languages[key] }; })}
            />
            {customerErors.language ? <Typography color='error' variant="caption" display="block" gutterBottom> {customerErors.language} </Typography> : false}
          </GridItem>
        </GridContainer>
        {this.allChanges.hasChanged &&
          <Fab variant='extended' className={classes.saveChangesBtn} onClick={this.saveCustomer} disabled={this.state.isLoading}><Badge badgeContent={this.allChanges.changeCount} color="primary"><CheckCircle /></Badge>&nbsp;&nbsp;Save changes</Fab>
        }

      </div>
    );
  }
}

SmeOverview.propTypes = {
  systemDate: PropTypes.string,
  customerId: PropTypes.string,
  selectedCustomer_ua: PropTypes.number,
  customerAddress_ua: PropTypes.number,
  customerContacts_ua: PropTypes.number,
  customerCddInfo_ua: PropTypes.number,
  customerHighRiskReg_ua: PropTypes.number,
  classes: PropTypes.object.isRequired,
  selectedCustomer: PropTypes.object.isRequired,
  customerCddInfo: PropTypes.object.isRequired,
  customerHighRiskReg: PropTypes.object.isRequired,
  addCustomerButtonRef: PropTypes.object.isRequired,
  customerAddress: PropTypes.array.isRequired,
  customerContacts: PropTypes.array.isRequired,
  resetState: PropTypes.func.isRequired,
  CUDCustomer: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  getCustomerAddressContact: PropTypes.func.isRequired,
  customerSuccessManagerList: PropTypes.array,
  getCustomerSuccessManagerList: PropTypes.func,
  clearSmeLoanRequestDetails: PropTypes.func,
  clearCustomerDetails: PropTypes.func,
  clearSmeLoanRequests: PropTypes.func,
  clearBankAccounts: PropTypes.func,
  getSmeLoanRequests: PropTypes.func,
  setRequestBlocksGlobally: PropTypes.func,
};

const mapStateToProps = (state) => ({
  selectedCustomer: state.lmglobal.selectedCustomer,
  selectedCustomer_ua: state.lmglobal.selectedCustomer_ua,
  customerAddress: state.address.customerAddress,
  customerAddress_ua: state.address.customerAddress_ua,
  customerContacts: state.contact.customerContacts,
  customerContacts_ua: state.contact.customerContacts_ua,
  customerCddInfo: state.cddinfo.customerCddInfo,
  customerCddInfo_ua: state.cddinfo.customerCddInfo_ua,
  customerHighRiskReg: state.highRiskRegister.customerHighRiskReg.value,
  customerHighRiskReg_ua: state.highRiskRegister.customerHighRiskReg.ua,
  systemDate: state.config.systemDate,
  customerSuccessManagerList: state.customer.customerSuccessManagerList,
  selectedCustomerId: state.lmglobal.selectedCustomerId,
  selectedDashboardItems: state.user.selectedDashboardItems,
  isDashboardContent: state.user.isDashboardContent,
});

const mapDispatchToProps = (dispatch) => ({
  resetState: () => dispatch(resetState()),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  CUDCustomer: (requestBody) => dispatch(CUDCustomer(requestBody)),
  getCustomerAddressContact: (customerId, legalName, activeIndicatior) => dispatch(getCustomerAddressContact(customerId, legalName, activeIndicatior)),
  setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),// dashboard Items change
  setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),// dashboard Items change
  clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),// dashboard Items change
  getCustomerSuccessManagerList: () => dispatch(getCustomerSuccessManagerList()),
  setSelectedCustomerId: (id) => dispatch(setSelectedCustomerId(id)),
  clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails()),
  clearCustomerDetails: () => dispatch(clearCustomerDetails()),
	clearSmeLoanRequests: () => dispatch(clearSmeLoanRequests()),
	clearBankAccounts: () => dispatch(clearBankAccounts()),
	getSmeLoanRequests: (requestQuery) => dispatch(getSmeLoanRequests(requestQuery)),
  setRequestBlocksGlobally: (requestBlocksList) => dispatch(setRequestBlocksGlobally(requestBlocksList)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(SmeOverview));
