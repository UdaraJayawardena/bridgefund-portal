import {
  CLEAR_ADDRESS,
  SET_ADDRESS,
  UPDATE_ADDRESS,
  CLEAR_PERSON_ADDRESS,
} from "../constants/Address";

import { CommonConstants } from "constants/crm";

const defaultState = {
  customerAddress: [],
  customerAddress_ua: Date.now(),
  personAddress: [],
  personAddress_ua: Date.now(),
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case CLEAR_ADDRESS:
      return defaultState;

    case SET_ADDRESS:
      return {
        ...state,
        ...setAddresses(action.payload, state, action.origin)
      };

    case UPDATE_ADDRESS:
      return {
        ...state,
        ...updateAddresses(action.payload, state)
      };
    case CLEAR_PERSON_ADDRESS:
      return {
        ...state,
        personAddress: [],
        personAddress_ua: Date.now(),
      };

    default:
      return state;
  }
};

const setAddresses = (addresses, state, origin = null) => {
  const customerAddress = [];
  const personAddress = [];
  let customerAddress_ua = state.customerAddress_ua;
  let personAddress_ua = state.personAddress_ua;
  const isPerson = origin === 'personDetails';

  for (const address of addresses) {

    if (address.customerId) {
      customerAddress.push(address);
      customerAddress_ua = Date.now();
    }

    else if (address.personId) {
      personAddress.push(address);
      personAddress_ua = Date.now();
    }
  }

  return {
    customerAddress: isPerson ? customerAddress.concat(state.customerAddress) : customerAddress,
    personAddress, customerAddress_ua, personAddress_ua
  };
};

const updateAddresses = (addresses, state) => {

  const customerAddress = state.customerAddress;
  const personAddress = state.personAddress;
  let customerAddress_ua = state.customerAddress_ua;
  let personAddress_ua = state.personAddress_ua;

  for (const address of addresses) {

    if (address.customerId) {

      const searchIndex = customerAddress.findIndex(addr => addr._id === address._id);

      if (searchIndex === -1) customerAddress.push(address);
      else if (address.status === CommonConstants.status.ACTIVE) customerAddress[searchIndex] = address;
      else customerAddress.splice(searchIndex, 1);

      customerAddress_ua = Date.now();
    }

    else if (address.personId) {
      const searchIndex = personAddress.findIndex(addr => addr._id === address._id);
      if (searchIndex === -1) personAddress.push(address);
      else if (address.status === CommonConstants.status.ACTIVE) personAddress[searchIndex] = address;
      else personAddress.splice(searchIndex, 1);

      personAddress_ua = Date.now();
    }
  }

  return { customerAddress, personAddress, customerAddress_ua, personAddress_ua };
};