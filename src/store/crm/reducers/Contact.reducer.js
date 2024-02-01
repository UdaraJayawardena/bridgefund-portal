import {
  CLEAR_CONTACT,
  SET_CONTACT,
  UPDATE_CONTACT,
  CLEAR_PERSON_CONTACT,
} from "../constants/Contact";

import { CommonConstants } from "constants/crm";

const defaultState = {
  customerContacts: [],
  customerContacts_ua: Date.now(),
  personContacts: [],
  personContacts_ua: Date.now(),
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case CLEAR_CONTACT:
      return defaultState;

    case SET_CONTACT:
      return {
        ...state,
        ...setContacts(action.payload, state, action.origin)
      };

    case UPDATE_CONTACT:
      return {
        ...state,
        ...updateContacts(action.payload, state)
      };

    case CLEAR_PERSON_CONTACT:
      return {
        ...state,
        personContacts: [],
        personContacts_ua: Date.now()
      };

    default:
      return state;
  }
};

const setContacts = (contacts, state, origin = null) => {
  const customerContacts = [];
  const personContacts = [];
  let customerContacts_ua = state.customerContacts_ua;
  let personContacts_ua = state.personContacts_ua;
  const isPerson = origin === 'personDetails';

  for (const contact of contacts) {
    if (contact.customerId && contact.personId === null || undefined) {
      customerContacts.push(contact);
      customerContacts_ua = Date.now();
    }
    else if (contact.personId && contact.customerId) {
      personContacts.push(contact);
      personContacts_ua = Date.now();
    }
  }

  const contactState = {
    customerContacts: isPerson ? customerContacts.concat(state.customerContacts) : customerContacts,
    personContacts, customerContacts_ua, personContacts_ua
  };

  return contactState;
};


const updateContacts = (contacts, state) => {
  const customerContacts = state.customerContacts;
  const personContacts = state.personContacts;
  let customerContacts_ua = state.customerContacts_ua;
  let personContacts_ua = state.personContacts_ua;

  for (const contact of contacts) {

    if (contact.customerId && contact.personId === null) {

      const searchIndex = customerContacts.findIndex(addr => addr._id === contact._id);

      if (searchIndex === -1) customerContacts.push(contact);
      else if (contact.status === CommonConstants.status.ACTIVE) customerContacts[searchIndex] = contact;
      else customerContacts.splice(searchIndex, 1);

      customerContacts_ua = Date.now();
    }

    else if (contact.personId) {
      const searchIndex = personContacts.findIndex(addr => addr._id === contact._id);

      if (searchIndex === -1) personContacts.push(contact);
      else if (contact.status === CommonConstants.status.ACTIVE) personContacts[searchIndex] = contact;
      else personContacts.splice(searchIndex, 1);

      personContacts_ua = Date.now();
    }
  }

  return { customerContacts, personContacts, customerContacts_ua, personContacts_ua };
};