import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/crm/utility';
import { httpService } from '../service/httpService';
import { SET_STAKEHOLDER, SET_PERSON_STAKEHOLDER, ADD_STAKEHOLDER_LIST } from 'store/crm/constants/Stakeholder';
import { displayNotification } from './Notifier';


/******************************************
 *               BASE URLS                *
 *****************************************/

const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const getStakeholder = (option) => async dispatch => {

  let request;
  if ( 'customerId' in option) {
    request = { url: CRM_GATEWAY_URL('/get-stakeholder?') + encodeQueryData({ customerId: option.customerId }) };
  } 
  else if ('personId' in option) {
    request = { url: CRM_GATEWAY_URL('/get-stakeholder?') + encodeQueryData({ personId: option.personId }) };
  }

  try {
    const response = await httpService.get(request, dispatch);

    dispatch({ type: SET_STAKEHOLDER, payload: response });
    return response;

  } catch (error) {

    console.error('getStakeholder err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

export const CUDStakeholder = (requestBody) => async dispatch => {

  const request = {
    url: CRM_GATEWAY_URL('/update-stakeholders'),
    body: requestBody
  };

  try {
    const response = await httpService.post(request, dispatch);

    dispatch({ type: ADD_STAKEHOLDER_LIST, payload: response.stakeholders });

    dispatch(displayNotification('Successfully updated the Stakeholder', 'success'));

    return response;

  }
  catch (error) {
    console.error('CUDCStakeholder err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};


export const getCustormerFirstStakeholderPersonName = (customerId) => async dispatch => {

  const request_1 = { url: CRM_GATEWAY_URL('/get-stakeholder?') + encodeQueryData({ customerId: customerId }) };
 

  try {
    let personName = '';
    const stakeHolderResponse = await httpService.get(request_1, dispatch);
    if(stakeHolderResponse.length > 0){
      // stakeholders available
      const firstStakeHolderPerson_Id = stakeHolderResponse[0].personId;
      if(firstStakeHolderPerson_Id){
        const request_2 = { url: CRM_GATEWAY_URL('/get-persons?') + encodeQueryData({ _id: firstStakeHolderPerson_Id }) };
        const personResponse = await httpService.get(request_2, dispatch);
        if(personResponse.length > 0){
          // related person available
          const initial = (personResponse[0].initials)? personResponse[0].initials : '';
          const namePrefix = (personResponse[0].namePrefix)? personResponse[0].namePrefix : '';
          const surname = (personResponse[0].surname)? personResponse[0].surname : '';

          personName = `${initial} ${namePrefix} ${surname}`;
          
        }
      }
    }

    return personName;

  } catch (error) {

    console.error('getStakeholder err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};

/******************************************
 *             Redux Calls                *
 *****************************************/

export const setPersonStakeholder = (stakeholder) => ({ type: SET_PERSON_STAKEHOLDER, payload: stakeholder });

/**************************
 *    Private Functions   *
 *************************/