import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import withStyles from '@material-ui/core/styles/withStyles';
// import Style from 'assets/jss/material-dashboard-react/views/PersonOverviewStyles';

import { Typography, Fab, Badge, Grid, Button } from '@material-ui/core';
import { CheckCircle, Edit, PersonAdd, NavigateNext, AddCircle } from '@material-ui/icons';

import GridContainer from 'components/crm/Grid/GridContainer';
import GridItem from 'components/crm/Grid/GridItem';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import Address from 'components/crm/Address/Address';
import Contact from 'components/crm/Contact/Contact';
import CustomSearch from 'components/crm/CustomInput/CustomSearch';
import CustomDatePicker from 'components/crm/CustomDatePicker/CustomDatePicker';
import { AddressConstants, PersonConstants, CddInfoConstants, CommonConstants, HighRiskRegisterConstants, ContactConstants, PersonIdentityConstants, StakeholderConstants } from 'constants/crm/index';
import { compareObject, compareArrayOfObjects, isNullOrEmpty } from 'lib/crm/utility';

import { displayNotification } from 'store/crm/actions/Notifier';
import { CUDPerson, getPersonAddressContact, clearPersonOverview } from 'store/crm/actions/SmeOverview.action';
import { getStakeholder, setPersonStakeholder } from 'store/crm/actions/StakeholderOverview.action';
import { dataValidation_regularExpressions } from 'constants/crm/commonData';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';
import { setHeaderDisplayMainData, setHeaderDisplaySubData, clearHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';

class PersonOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      person: cloneDeep(PersonConstants.emptyObj),
      personErors: cloneDeep(PersonConstants.emptyErrorObj),
      addresses: [cloneDeep(AddressConstants.emptyObj)],
      cddInfo: cloneDeep(CddInfoConstants.emptyObj),
      stakeholder: cloneDeep(StakeholderConstants.emptyObj),
      stakeholderErors: cloneDeep(StakeholderConstants.emptyErrorObj),
      personIdentity: cloneDeep(PersonIdentityConstants.emptyObj),
      highRiskRegister: cloneDeep(HighRiskRegisterConstants.emptyObj),
      contacts: cloneDeep(ContactConstants.initialEmptyArray),
      isLoading: false,
    };
  }

  componentDidMount() {
    const { stakeholders } = this.props;

    if (!this.props.isDashboardContent) {
      this.props.addPersonButtonRef.current.onclick = this.clearState;
      this.props.nextPersonButtonRef.current.onclick = this.getNextPerson;
    }

    if (stakeholders.length > 0 && !isNullOrEmpty(stakeholders.find(stkh => stkh.customerId === this.props.selectedCustomer._id))) {
      this.getPerson(stakeholders[0]);
    } else {
      if (Object.keys(this.props.selectedCustomer).length !== 0) {
        this.props.getStakeholder({ customerId: this.props.selectedCustomer._id })
        .then(result => {
          if (result && result.length > 0) {
            this.getPerson(result[0]);
          }
        })
        .catch(() => {/*  */ });
      }
    }
  }

  componentWillUnmount() {
    this.props.clearPersonOverview();
  }


  // componentDidUpdate(prevProps) {
  // const _state = {};

  // if (prevProps.selectedPerson.ua !== this.props.selectedPerson.ua) {
  //   _state.person = isNullOrEmpty(this.props.selectedPerson.value) ? cloneDeep(PersonConstants.emptyObj) : this.props.selectedPerson.value;
  // }
  // if (prevProps.personAddress_ua !== this.props.personAddress_ua) _state.addresses = this.props.personAddress;
  // if (prevProps.personCddInfo_ua !== this.props.personCddInfo_ua) {
  //   _state.cddInfo = isNullOrEmpty(this.props.personCddInfo) ? cloneDeep(CddInfoConstants.emptyObj) : this.props.personCddInfo;
  // }
  // if (prevProps.personIdentity.ua !== this.props.personIdentity.ua) {
  //   _state.personIdentity = isNullOrEmpty(this.props.personIdentity.value) ? cloneDeep(PersonIdentityConstants.emptyObj) : this.props.personIdentity.value;
  // }
  // if (prevProps.personHighRiskReg_ua !== this.props.personHighRiskReg_ua) {
  //   _state.highRiskRegister = isNullOrEmpty(this.props.personHighRiskReg) ? cloneDeep(HighRiskRegisterConstants.emptyObj) : this.props.personHighRiskReg;
  // }
  // if (prevProps.personContacts_ua !== this.props.personContacts_ua) _state.contacts = this.props.personContacts;
  // if (prevProps.personStakeholder.ua !== this.props.personStakeholder.ua) {
  //   _state.stakeholder = isNullOrEmpty(this.props.personStakeholder.value) ? { ...cloneDeep(StakeholderConstants.emptyObj), customerId: this.props.selectedCustomer._id } : this.props.personStakeholder.value;
  // }

  // if (prevProps.selectedPerson.ua !== this.props.selectedPerson.ua && !isNullOrEmpty(this.props.selectedPerson.value)) {
  //   _state.person = this.props.selectedPerson.value;
  // }
  // if (prevProps.personAddress_ua !== this.props.personAddress_ua && !isNullOrEmpty(this.props.personAddress)) _state.addresses = this.props.personAddress;
  // if (prevProps.personCddInfo_ua !== this.props.personCddInfo_ua && !isNullOrEmpty(this.props.personCddInfo)) {
  //   _state.cddInfo = this.props.personCddInfo;
  // }
  // if (prevProps.personIdentity.ua !== this.props.personIdentity.ua && !isNullOrEmpty(this.props.personIdentity.value)) {
  //   _state.personIdentity = this.props.personIdentity.value;
  // }
  // if (prevProps.personHighRiskReg_ua !== this.props.personHighRiskReg_ua && !isNullOrEmpty(this.props.personHighRiskReg)) {
  //   _state.highRiskRegister = this.props.personHighRiskReg;
  // }
  // if (prevProps.personContacts_ua !== this.props.personContacts_ua && !isNullOrEmpty(this.props.personContacts)) _state.contacts = this.props.personContacts;
  // if (prevProps.personStakeholder.ua !== this.props.personStakeholder.ua && !isNullOrEmpty(this.props.personStakeholder.value)) {
  //   _state.stakeholder = this.props.personStakeholder.value;
  // }

  // if (prevProps.selectedPerson.ua !== this.props.selectedPerson.ua && isNullOrEmpty(this.props.selectedPerson.value) && !isNullOrEmpty(this.state.person._id)) {

  //   _state.person = cloneDeep(PersonConstants.emptyObj);
  //   _state.addresses = [cloneDeep(AddressConstants.emptyObj)];
  //   _state.cddInfo = cloneDeep(CddInfoConstants.emptyObj);
  //   _state.stakeholder = { ...cloneDeep(StakeholderConstants.emptyObj), customerId: this.props.selectedCustomer._id };
  //   _state.personIdentity = cloneDeep(PersonIdentityConstants.emptyObj);
  //   _state.highRiskRegister = cloneDeep(HighRiskRegisterConstants.emptyObj);
  //   _state.contacts = cloneDeep(ContactConstants.initialEmptyArray);
  // }

  // if (Object.keys(_state).length > 0) { /* console.log('componentDidUpdate', _state, this.state);  */this.setState(_state); }
  // }

  clearState = () => {
    this.props.clearPersonOverview();
    this.setState({
      person: cloneDeep(PersonConstants.emptyObj),
      personErors: cloneDeep(PersonConstants.emptyErrorObj),
      addresses: [cloneDeep(AddressConstants.emptyObj)],
      cddInfo: cloneDeep(CddInfoConstants.emptyObj),
      stakeholder: cloneDeep(StakeholderConstants.emptyObj),
      stakeholderErors: cloneDeep(StakeholderConstants.emptyErrorObj),
      personIdentity: cloneDeep(PersonIdentityConstants.emptyObj),
      highRiskRegister: cloneDeep(HighRiskRegisterConstants.emptyObj),
      contacts: cloneDeep(ContactConstants.initialEmptyArray),
      isLoading: false
    });
  };

  getNextPerson = () => {
    const { stakeholders } = this.props;

    if (stakeholders.length === 0) return this.props.displayNotification('Customer does not have any stakeholders!', 'warning');
    if (isNullOrEmpty(this.state.person._id)) {
      this.getPerson(stakeholders[0]);
    }
    else {
      if (stakeholders.length === 1) return this.props.displayNotification('Customer does not have any other stakeholders!', 'warning');

      const index = stakeholders.findIndex(stkh => stkh.personId === this.state.person._id);
      const newStakeholderIndex = (stakeholders.length - 1) === index ? 0 : (index + 1);
      this.getPerson(stakeholders[newStakeholderIndex]);
    }
  };

  getPerson = (selectedStakeholder) => {
    this.props.setPersonStakeholder(selectedStakeholder);
    this.props.getPersonAddressContact(selectedStakeholder.personId, selectedStakeholder.customerId)
      .then(response => this.updateUsingProps({ ...response, stakeholder: selectedStakeholder }))
      .catch(() => {/*  */ });
  };

  updateUsingProps = (response) => {

    const _state = {};
    if (response.person) _state.person = response.person;
    if (response.address) _state.addresses = response.address;
    if (response.cddInfo) _state.cddInfo = response.cddInfo;
    if (response.personIdentity) _state.personIdentity = response.personIdentity;
    if (response.highRiskRegister) _state.highRiskRegister = response.highRiskRegister;
    if (response.contact) _state.contacts = response.contact;
    if (response.stakeholder) _state.stakeholder = response.stakeholder;
    if (Object.keys(_state).length > 0) { this.setState(_state); }
  }

  handleChange = (name, value, componentName) => {
    const _state = {
      personErors: {},
      stakeholderErors: {},
    };

    if (componentName) {
      const component = cloneDeep(this.state[componentName]);
      if (component[name] === value) return;
      component[name] = value;
      _state[componentName] = component;

      if (componentName === 'person') {
        _state.personErors[name] = null;
      }

      if (componentName === 'stakeholder') {
        _state.stakeholderErors[name] = null;
      }
    }
    else {
      if (_state[name] === value) return;
      _state[name] = value;
    }

    this.setState(_state);
  };

  handleOnPersonSearchResult = (result) => {
    if (result && typeof result !== 'string') {
      const stakeHolder = this.props.stakeholders.find(stkh => stkh.personId === result._id);
      this.getPerson(stakeHolder);
    }
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

  getPersonChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.person._id) {

      comparedObj = compareObject(this.props.selectedPerson.value, this.state.person, PersonConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(PersonConstants.emptyObj, this.state.person, PersonConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.person._id) {

      returnObj = {
        ...comparedObj,
        action: 'update',
        _id: this.state.person._id
      };

    } else if (changeCount > 0) {
      returnObj = { ...this.state.person, action: 'create' };
    }

    return [returnObj, changeCount];
  }

  getStakeholderChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.stakeholder._id) {

      comparedObj = compareObject(this.props.personStakeholder.value, this.state.stakeholder, StakeholderConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(StakeholderConstants.emptyObj, this.state.stakeholder, StakeholderConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.stakeholder._id) {

      returnObj = {
        ...comparedObj,
        action: 'update',
        _id: this.state.stakeholder._id
      };

    } else if (changeCount > 0) {
      returnObj = { ...this.state.stakeholder, action: 'create', customerId: this.props.selectedCustomer._id };
    }

    return [returnObj, changeCount];
  }

  getCddInfoChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.cddInfo._id) {

      comparedObj = compareObject(this.props.personCddInfo, this.state.cddInfo, CddInfoConstants.schemaKeysToCompare);
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

  getPersonIdentityChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.personIdentity._id) {

      comparedObj = compareObject(this.props.personIdentity.value, this.state.personIdentity, PersonIdentityConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(PersonIdentityConstants.emptyObj, this.state.personIdentity, PersonIdentityConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.personIdentity._id) {

      returnObj = {
        ...comparedObj,
        action: 'create',
      };

    } else if (changeCount > 0) {

      returnObj = { ...this.state.personIdentity, action: 'create' };
    }

    return [returnObj, changeCount];
  }

  getHighRiskRegChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.highRiskRegister._id) {

      comparedObj = compareObject(this.props.personHighRiskReg, this.state.highRiskRegister, HighRiskRegisterConstants.schemaKeysToCompare);
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
    const isUpdating = this.props.personAddress.find(addr => addr._id !== undefined);

    let comparedObject;
    if (isUpdating) {
      comparedObject = compareArrayOfObjects(this.props.personAddress, this.state.addresses, AddressConstants.schemaKeysToCompare, 'address');
    } else {
      comparedObject = compareArrayOfObjects([AddressConstants.emptyObj], this.state.addresses, AddressConstants.schemaKeysToCompare, 'address');
    }

    const { updateValues, insertedValues, deletedValues } = comparedObject;
    // console.log({ updateValues, insertedValues, deletedValues });

    addresses = addresses.concat(
      insertedValues.map(val => ({ action: 'create', ...val })),
      updateValues.map(val => ({ action: 'update', ...val })),
      deletedValues.map(val => ({ action: 'delete', ...val }))
    );

    return [addresses, addresses.length];
  }

  getContactChanges = () => {

    let contacts = [];
    const isUpdating = this.props.personContacts.find(c => c._id !== undefined);

    let comparedObject;
    if (isUpdating) {
      comparedObject = compareArrayOfObjects(this.props.personContacts, this.removeSpacesInPhoneNumbers(this.state.contacts), ContactConstants.schemaKeysToCompare, 'contact');
    } else {
      comparedObject = compareArrayOfObjects(ContactConstants.initialEmptyArray, this.removeSpacesInPhoneNumbers(this.state.contacts), ContactConstants.schemaKeysToCompare, 'contact');
    }

    const { updateValues, insertedValues, deletedValues } = comparedObject;
    // console.log({ updateValues, insertedValues, deletedValues });

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

    const [person, cusCngCount] = this.getPersonChanges();
    changeCount += Number(cusCngCount);

    const [cddInfo, cddChngCnt] = this.getCddInfoChanges();
    changeCount += Number(cddChngCnt);

    const [personIdentity, perIdChngCnt] = this.getPersonIdentityChanges();
    changeCount += Number(perIdChngCnt);

    const [highRiskRegister, hrrChngCnt] = this.getHighRiskRegChanges();
    changeCount += Number(hrrChngCnt);

    const [address, addrChngCnt] = this.getAddressChanges();
    changeCount += Number(addrChngCnt);

    const [contact, contactChngCnt] = this.getContactChanges();
    changeCount += Number(contactChngCnt);

    const [stakeholder, stakeholderChngCnt] = this.getStakeholderChanges();
    changeCount += Number(stakeholderChngCnt);

    if (changeCount > 0) hasChanged = true;

    const finalObject = {
      person, address, cddInfo, highRiskRegister, contact, personIdentity, stakeholder
    };

    return { hasChanged, finalObject, changeCount };
  }

  savePerson = () => {

    const person = { action: 'none', _id: this.state.person._id };
    const cddInfo = { action: 'none' };
    const personIdentity = { action: 'none' };
    const stakeholder = { action: 'none', _id: this.state.stakeholder._id, customerId: this.props.selectedCustomer._id };
    const address = { data: [] };
    const highRiskRegister = { action: 'none', _id: this.state.highRiskRegister._id };
    const contact = { data: [] };
    const changedData = cloneDeep(this.allChanges.finalObject);

    //person validations

    if (isNullOrEmpty(this.state.person.surname)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ personErors: { surname: 'Please fill the surname' } }); return; }
    if (isNullOrEmpty(this.state.person.givenName)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ personErors: { givenName: 'Please fill the given name' } }); return; }

    // ONLY if one of these gets updated contractName should get updated
    if (changedData.person.initials || changedData.person.namePrefix || changedData.person.surname) {
      changedData.person.contractName = `${this.state.person.initials} ${this.state.person.namePrefix} ${this.state.person.surname}`;
    }


    //stakeholder validations

    if (isNullOrEmpty(this.state.stakeholder.role)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ stakeholderErors: { role: 'Please select a role' } }); return; }
    if (isNullOrEmpty(this.state.stakeholder.signingContractIndicator)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ stakeholderErors: { signingContractIndicator: 'Please select signing contract indicator' } }); return; }
    if (isNullOrEmpty(this.state.stakeholder.signingGuaranteeIndicator)) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ stakeholderErors: { signingGuaranteeIndicator: 'Please select signing guarantee indicator' } }); return; }

    //addresses validations

    // if (isNullOrEmpty(this.state.addresses.find(add => add.type === AddressConstants.type.Physical))) return this.props.displayNotification('At least one physical address should be available', 'warning');
    // // @ts-ignore
    // if (!isNullOrEmpty(changedData.address.find(add => (isNullOrEmpty(add._id) &&
    //   (isNullOrEmpty(add.streetName) || isNullOrEmpty(add.houseNumber) || isNullOrEmpty(add.postalCode) || isNullOrEmpty(add.cityName) || isNullOrEmpty(add.country))
    // )))) {
    //   return this.props.displayNotification('Please fill all fields in the addresses', 'warning');
    // }
    // if (!isNullOrEmpty(this.state.addresses.find(add => {
    //   const isValid = new RegExp(CommonConstants.dataValidation_regularExpressions.postlCode).test(add.postalCode);
    //   return isValid === false;
    // }))) return this.props.displayNotification('Invalid postal code!', 'warning');

    if (this.state.addresses.length > 0) {

      for (let i = 0; i < this.state.addresses.length; i++) {
        const address = this.state.addresses[i];

        if (address.type === 'physical') {

          if (isNullOrEmpty(address.streetName) || isNullOrEmpty(address.houseNumber) || isNullOrEmpty(address.cityName) || isNullOrEmpty(address.postalCode)) {
            this.props.displayNotification('Please fill all mandatory fields', 'warning');
            this.setState({ personErors: { address: 'Physical address should have street name , house number ,city name and postal code' } });
            return;
          }
          else if (!new RegExp(CommonConstants.dataValidation_regularExpressions.postlCode).test(address.postalCode)) {
            this.setState({ personErors: { address: 'Invalid postal code !' } });
            this.props.displayNotification('Invalid postal code!', 'warning');
            return;
          }
          this.setState({ personErors: { address: null } });
        }
        else if (address.type === 'postal-code') {

          if (isNullOrEmpty(address.streetName) || isNullOrEmpty(address.cityName) || isNullOrEmpty(address.postalCode)) {
            this.props.displayNotification('Please fill all mandatory fields', 'warning');
            this.setState({ personErors: { address: 'Postal address should have street name , house number ,city name and postal code' } });
            return;
          }
          else if (!new RegExp(CommonConstants.dataValidation_regularExpressions.postlCode).test(address.postalCode)) {
            this.setState({ personErors: { address: 'Invalid postal code !' } });
            this.props.displayNotification('Invalid postal code!', 'warning');
            return;
          }
          this.setState({ personErors: { address: null } });
        }
        else {
          this.setState({ personErors: { address: null } });
        }
      }
    }

    // console.log("this.state.contacts ", this.state.contacts);

    //contacts validations

    // if (isNullOrEmpty(this.state.contacts.find(contact => contact.type === ContactConstants.type.EMAIL && contact.value && contact.subType))) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ personErors: { contacts: 'At least one email address should be available' } }); return; }
    //if (isNullOrEmpty(this.state.contacts.find(contact => contact.type === ContactConstants.type.PHONE && contact.value && contact.subType))) { this.props.displayNotification('Please fill all mandatory fields', 'warning'); this.setState({ personErors: { contacts: 'At least one phone number should be available' } }); return; }

    if (this.state.contacts && this.state.contacts.length > 0) {
      const data = this.state.contacts;

      for (let i = 0; i < data.length; i++) {
        const contact = data[i];
        if (contact.type === 'email' && contact.subType && contact.value) {
          if (!new RegExp(CommonConstants.dataValidation_regularExpressions.email).test(contact.value)) {
            this.props.displayNotification('Invalid email address!', 'warning');
            return;
          }
          this.setState({ personErors: { contact: null } });
        }
      }
    }



    // @ts-ignore
    if (!isNullOrEmpty(changedData.contact.find(contact => isNullOrEmpty(contact._id) && (isNullOrEmpty(contact.value) || isNullOrEmpty(contact.subType))))) {
      this.props.displayNotification('Please fill all mandatory fields', 'warning');
      this.setState({ personErors: { contacts: 'Value and type  is required in contacts' } }); return;
    }

    // other object value binding

    if (!isNullOrEmpty(changedData.highRiskRegister)) changedData.highRiskRegister.date = this.props.systemDate;
    if (!isNullOrEmpty(changedData.cddInfo)) changedData.cddInfo.date = this.props.systemDate;

    /* Create the Final request object */
    Object.assign(person, changedData.person);
    Object.assign(cddInfo, changedData.cddInfo);
    Object.assign(personIdentity, changedData.personIdentity);
    Object.assign(stakeholder, changedData.stakeholder);
    Object.assign(highRiskRegister, changedData.highRiskRegister);
    Object.assign(address.data, address.data.concat(changedData.address));
    // @ts-ignore
    Object.assign(contact.data, contact.data.concat(changedData.contact.map(contact => { return { ...contact, customerId: this.props.selectedCustomer._id }; })));

    this.setState({isLoading: true});
    // console.log({ person, cddInfo, personIdentity, highRiskRegister, address, contact, stakeholder });
    this.props.CUDPerson({ person, cddInfo, personIdentity, highRiskRegister, address, contact, stakeholder })
      .then((response) => {
        const _state = {};

        if (address && address.data.length !== 0) {

          const addresses = this.state.addresses;

          for (const address of response.address) {
            const searchIndex = addresses.findIndex(addr =>
              addr.type === address.type && addr.postalCode === address.postalCode && addr.houseNumber === address.houseNumber &&
              addr.houseNumberAddition === address.houseNumberAddition && addr.cityName === address.cityName && addr.country === address.country
            );
            if (searchIndex === -1) continue;
            addresses[searchIndex] = address;
          }
          _state.addresses = addresses;
        }

        if (contact && contact.data.length !== 0) {

          const stateContacts = this.state.contacts;

          for (const contact of response.contact) {

            const searchIndex = stateContacts.findIndex(c => c.type === contact.type && c.subType === contact.subType && c.value === contact.value);
            if (searchIndex === -1) continue;
            stateContacts[searchIndex] = contact;
          }
          _state.contacts = stateContacts;
        }
        if (cddInfo && cddInfo.action !== 'none') _state.cddInfo = response.cddInfo;
        if (highRiskRegister && highRiskRegister.action !== 'none') _state.highRiskRegister = response.highRiskRegister;
        if (person && person.action !== 'none') _state.person = response.person;
        if (personIdentity && personIdentity.action !== 'none') _state.personIdentity = response.personIdentity;
        if (stakeholder && stakeholder.action !== 'none') _state.stakeholder = response.stakeholder;

        this.setState(_state);
      })
      .catch(() => {/*  */ })
      .finally(() => this.setState({ isLoading: false }));
  };

  getPhoneContactDisplayValue = (value) => {
    if (!value.match(/\+31\s/g)) {
      return value.replace('+31', '+31 ');
    }
    return value;
  };

  getPhoneContactChangingValue = (value) => {

    return value.replace('+31 ', '+31');
  };

  render() {
    const { classes, isDashboardContent } = this.props;
    const { personErors, stakeholderErors } = this.state;

    return (
      <div className={classes.container}>

        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.TwoBox}>
            <div style={{ float: "left" }}>
              {this.allChanges.hasChanged && this.state.person._id &&
                <span className={classes.isUpdating}>&nbsp;&nbsp;<Edit />(Updating...)</span>
              }
              {this.allChanges.hasChanged && !this.state.person._id &&
                <span className={classes.isUpdating}>&nbsp;&nbsp;<PersonAdd />(New Person...)</span>
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
                    startIcon={<NavigateNext />}
                    className={classes.confirmIconButton}
                    onClick={this.getNextPerson}
                  >Next Person</Button>
                  <Button
                    variant='contained'
                    startIcon={<AddCircle />}
                    className={classes.confirmIconButton}
                    onClick={this.clearState}
                  >Add Person</Button>
                </Grid>
              </Grid>
              : null}
          </GridItem>
        </GridContainer>
    
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomSearch
              id='surname'
              label='Surname *'
              placeholder='Pietersen'
              changeToFormatType='CamelCase'
              name='surname'
              value={this.state.person.surname}
              onSearchResult={this.handleOnPersonSearchResult}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              asyncSearchType='person'
              SearchOptions={{
                customerId: this.props.selectedCustomer._id,
                criteria: 'in',
                regexOption: 'i'
              }}
            />
            {personErors.surname ? <Typography color='error' variant="caption" display="block" gutterBottom > {personErors.surname} </Typography> : false}
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="namePrefix"
              value={this.state.person.namePrefix}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              label="Prefix"
              name='namePrefix'
              dropDownValues={Object.keys(PersonConstants.prefix).map(key => { return { key: key, value: PersonConstants.prefix[key] }; })}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='status'
              label='Status'
              value={this.state.person.status}
              placeholder='Active'
              disabled />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='initials'
              label='Initials'
              name='initials'
              changeToFormatType='UpperCase'
              value={this.state.person.initials}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              placeholder='J.P.J.' />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='given-name'
              label='Given-Name *'
              name='givenName'
              changeToFormatType='CamelCase'
              value={this.state.person.givenName}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              placeholder='Arman' />
            {personErors.givenName ? <Typography color='error' variant="caption" display="block" gutterBottom > {personErors.givenName} </Typography> : false}
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id="person-identity"
              label="ID"
              placeholder='Choose File'
              type='file'
              name='document'
              fieldName={CommonConstants.DocumentFieldNames.PersonIdentity}
              value={this.state.personIdentity.document}
              onChange={(name, value) => this.handleChange(name, value, 'personIdentity')}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='christian-name'
              label='Christian Name'
              name='christianName'
              value={this.state.person.christianName}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              placeholder='Johannes Petrus Jacobus van der Pietersen' />
          </GridItem>

          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="gender"
              label="Gender"
              name='gender'
              value={this.state.person.gender}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              dropDownValues={Object.keys(PersonConstants.gender).map(key => { return { key: key, value: PersonConstants.gender[key] }; })}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="id-type"
              label="ID-type"
              name='type'
              value={this.state.personIdentity.type}
              onChange={(name, value) => this.handleChange(name, value, 'personIdentity')}
              dropDownValues={Object.keys(PersonConstants.idTypes).map(key => { return { key: key, value: PersonConstants.idTypes[key] }; })}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomDatePicker
              label="Birth Day"
              name="birthDate"
              value={this.state.person.birthDate}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              hideSideButtons
              checkHoliday={false}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='city-of-birth'
              label='City of Birth'
              name='cityOfBirth'
              changeToFormatType='CamelCase'
              value={this.state.person.cityOfBirth}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              placeholder='Amsterdam' />
          </GridItem>
          <GridItem className={classes.smallBox}>
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
          </GridItem>
        </GridContainer>

        <div className={classes.personOverviewHeader}>
          <Typography className={classes.textFieldStyle}>Stakeholder</Typography>
        </div>

        <GridContainer className={classes.flexContainer}>

        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='customer-legal-name'
              label='Legal Name'
              value={this.props.selectedCustomer.legalName}
              placeholder='Legal Name'
              readOnly />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <GridContainer>
              <GridItem xs={6}>
                <CustomInputBox
                  id='stakeholder-role'
                  type='dropdown'
                  name='role'
                  label='Stakeholder role *'
                  value={this.state.stakeholder.role}
                  onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
                  dropDownValues={Object.keys(StakeholderConstants.role).map(key => { return { key: key, value: StakeholderConstants.role[key] }; })}
                  readOnly={!isNullOrEmpty(this.state.stakeholder._id)}
                />
                {stakeholderErors.role ? <Typography color='error' variant="caption" display="block" gutterBottom > {stakeholderErors.role} </Typography> : false}
              </GridItem>
              <GridItem xs={6}>
                <CustomInputBox
                  type='dropdown'
                  id="signing-contract"
                  name='signingContractIndicator'
                  formControlStyle={classes.signingContract}
                  value={this.state.stakeholder.signingContractIndicator}
                  onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
                  label="Signing Contract *"
                  dropDownValues={Object.keys(StakeholderConstants.signingContract).map(key => { return { key: key, value: StakeholderConstants.signingContract[key] }; })}
                  readOnly={!isNullOrEmpty(this.state.stakeholder._id)}
                  isNoneInDropDownList={false}
                />
                {stakeholderErors.signingContractIndicator ? <Typography color='error' variant="caption" gutterBottom > {stakeholderErors.signingContractIndicator} </Typography> : false}
              </GridItem>

            </GridContainer>
          </GridItem>
          <GridItem className={classes.smallBox}>
            <GridContainer>
              <GridItem xs={6}>
                <CustomInputBox
                  type='dropdown'
                  id="signing-guarantee"
                  formControlStyle={classes.signingGuarantee}
                  value={this.state.stakeholder.signingGuaranteeIndicator}
                  onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
                  label="Signing Guarantee *"
                  name='signingGuaranteeIndicator'
                  dropDownValues={Object.keys(StakeholderConstants.signingGuarantee).map(key => { return { key: key, value: StakeholderConstants.signingGuarantee[key] }; })}
                  readOnly={!isNullOrEmpty(this.state.stakeholder._id)}
                  isNoneInDropDownList={false}
                />
                {stakeholderErors.signingGuaranteeIndicator ? <Typography color='error' variant="caption" gutterBottom > {stakeholderErors.signingGuaranteeIndicator} </Typography> : false}
              </GridItem>
              <GridItem xs={6}>
                <CustomInputBox
                  id='share'
                  label='Share'
                  placeholder='100%'
                  type="percentage"
                  value={this.state.stakeholder.sharePercentage}
                  name="sharePercentage"
                  onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
                  readOnly={!isNullOrEmpty(this.state.stakeholder._id)}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
        </GridContainer>

        <div className={classes.addressHeader}>
          <div className={classes.address}>
            <Typography className={classes.textFieldStyle}>Address</Typography>
            {personErors.address ? <Typography color='error' variant="caption" display="block" gutterBottom > {personErors.address} </Typography> : false}
          </div>
          <div className={classes.contact}>
            <Typography className={classes.textFieldStyle}>Contact</Typography>
            {personErors.contacts ? <Typography color='error' variant="caption" display="block" gutterBottom > {personErors.contacts} </Typography> : false}
          </div>
        </div>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <Address
              addresses={this.state.addresses}
              onChange={(result) => this.setState({ addresses: result })}
              maxNoAdresses={3}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <Contact contacts={this.state.contacts} onChange={(result) => this.setState({ contacts: result })} />
          </GridItem>
          <GridItem className={classes.smallBox}>
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

        <div className={classes.personOverviewHeader}>
          <Typography className={classes.textFieldStyle}>Partner</Typography>
        </div>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomDatePicker
              label="Birth Day"
              name="birthDatePartner"
              value={this.state.person.birthDatePartner}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              hideSideButtons
              checkHoliday={false}
            />
          </GridItem>
          <GridItem className={classes.partnerBox}>
            <CustomInputBox
              id='contract-name-partner'
              label='Contract Name'
              name='contractNamePartner'
              changeToFormatType='CamelCase'
              placeholder='E. Splinter'
              value={this.state.person.contractNamePartner}
              onChange={(name, value) => this.handleChange(name, value, 'person')} />
          </GridItem>
          <GridItem className={classes.partnerBox}>
            <CustomInputBox
              type='dropdown'
              id="gender-partner"
              value={this.state.person.genderPartner}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              label="Gender"
              name='genderPartner'
              dropDownValues={Object.keys(PersonConstants.gender).map(key => { return { key: key, value: PersonConstants.gender[key] }; })}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='city-of-birth-partner'
              label='City of Birth'
              name='cityOfBirthPartner'
              changeToFormatType='CamelCase'
              value={this.state.person.cityOfBirthPartner}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              placeholder='City of Birth' />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='id-partner'
              label='ID'
              placeholder='Choose File'
              type='file'
              name='idPartner'
              fieldName={CommonConstants.DocumentFieldNames.PersonPartnerIdentity}
              value={this.state.person.idPartner}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
            />
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.flexContainer}>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='email'
              label='E-mail'
              name='emailPartner'
              pattern={dataValidation_regularExpressions.email}
              helperText='Email should include @ and .'
              placeholder='abc@abc.com'
              value={this.state.person.emailPartner}
              onChange={(name, value) => this.handleChange(name, value, 'person')} />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='phone'
              label='Phone'
              name='phonePartner'
              pattern={dataValidation_regularExpressions.phone}
              placeholder='+31 123456789'
              helperText='Number format should be +31 followed by 9 digits'
              value={this.state.person.phonePartner}
              onFocus={(name, value) => this.handleChange(name, this.getPhoneContactChangingValue(value), 'person')}
              onBlur={(name, value) => this.handleChange(name, this.getPhoneContactDisplayValue(value), 'person')}
              onChange={(name, value) => this.handleChange(name, value, 'person')} />
          </GridItem>
        </GridContainer>
        {
          this.allChanges.hasChanged &&
          <Fab variant='extended' className={classes.saveChangesBtn} onClick={this.savePerson} disabled={this.state.isLoading}><Badge badgeContent={this.allChanges.changeCount} color="primary"><CheckCircle /></Badge>&nbsp;&nbsp;Save changes</Fab>
        }
      </div >
    );
  }
}

PersonOverview.propTypes = {
  systemDate: PropTypes.string,
  personAddress_ua: PropTypes.number,
  personCddInfo_ua: PropTypes.number,
  personContacts_ua: PropTypes.number,
  personHighRiskReg_ua: PropTypes.number,
  selectedCustomer: PropTypes.object,
  addPersonButtonRef: PropTypes.object,
  classes: PropTypes.object.isRequired,
  nextPersonButtonRef: PropTypes.object,
  personCddInfo: PropTypes.object.isRequired,
  personIdentity: PropTypes.object.isRequired,
  selectedPerson: PropTypes.object.isRequired,
  personStakeholder: PropTypes.object.isRequired,
  personHighRiskReg: PropTypes.object.isRequired,
  stakeholders: PropTypes.array.isRequired,
  personAddress: PropTypes.array.isRequired,
  personContacts: PropTypes.array.isRequired,
  CUDPerson: PropTypes.func.isRequired,
  getStakeholder: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  clearPersonOverview: PropTypes.func.isRequired,
  setPersonStakeholder: PropTypes.func.isRequired,
  getPersonAddressContact: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  systemDate: state.config.systemDate,
  personAddress: state.address.personAddress,
  personCddInfo: state.cddinfo.personCddInfo,
  selectedPerson: state.person.selectedPerson,
  personContacts: state.contact.personContacts,
  stakeholders: state.stakeholder.stakeholders,
  personAddress_ua: state.address.personAddress_ua,
  personCddInfo_ua: state.cddinfo.personCddInfo_ua,
  selectedCustomer: state.lmglobal.selectedCustomer,
  personContacts_ua: state.contact.personContacts_ua,
  personIdentity: state.personIdentity.personIdentity,
  personStakeholder: state.stakeholder.personStakeholder,
  personHighRiskReg: state.highRiskRegister.personHighRiskReg.value,
  personHighRiskReg_ua: state.highRiskRegister.personHighRiskReg.ua,
  isDashboardContent: state.user.isDashboardContent
});

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  CUDPerson: (requestBody) => dispatch(CUDPerson(requestBody)),
  clearPersonOverview: () => dispatch(clearPersonOverview()),
  getStakeholder: (customerId) => dispatch(getStakeholder(customerId)),
  setPersonStakeholder: (selectedStakeholder) => dispatch(setPersonStakeholder(selectedStakeholder)),
  getPersonAddressContact: (mongoId, customerId, personId, personInitials, namePrefix, surname, activeIndicator) => dispatch(getPersonAddressContact(mongoId, customerId, personId, personInitials, namePrefix, surname, activeIndicator)),
  setHeaderDisplayMainData: (data) => dispatch(setHeaderDisplayMainData(data)),// dashboard Items change
	setHeaderDisplaySubData: (data) => dispatch(setHeaderDisplaySubData(data)),// dashboard Items change
	clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),// dashboard Items change
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(PersonOverview));
