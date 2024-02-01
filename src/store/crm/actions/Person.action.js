import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/crm/utility';
import { httpService } from '../service/httpService';


/******************************************
 *               BASE URLS                *
 *****************************************/

const CRM_GATEWAY_URL = createUrl(ENV.CRM_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/

export const searchPerson = (key, value, criteria, customerId, option = 'i') => async dispatch => {

  const searchOptions = { key, value, option };

  if (criteria) searchOptions.criteria = criteria;
  if (customerId) searchOptions.customerId = customerId;

  const request = {
    url: CRM_GATEWAY_URL('/search-persons?') + encodeQueryData(searchOptions),
  };

  try {

    const response = await httpService.get(request, dispatch);
    return response.map(person => ({ _id: person._id, id: person.id, [key]: person[key] }));

  } catch (error) {

    console.error('searchPerson err', error);
    throw Error('Unexpected error occured! Please try again.');
  }
};