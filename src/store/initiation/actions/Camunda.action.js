import ENV from '../../../config/env';
import { createUrl, encodeQueryData } from 'lib/initiation/utility';
import { httpService } from '../service/httpService';

/******************************************
 *               BASE URLS                *
 *****************************************/

const INITIATION_GATEWAY_URL = createUrl(ENV.INITIATION_GATEWAY_URL);

/******************************************
 *               API CALLS                *
 *****************************************/
/**
 * Get Tasks
 * @param {*} params - taskDefinitionKey, processInstanceBusinessKey, taskDefinitionKeyLike, processDefinitionKey
 */
export const getUserTaskFromWorkflow = (params) => async dispatch => {

  if (params.taskDefinitionKeyLike) params.taskDefinitionKeyLike = `%${params.taskDefinitionKeyLike}%`;

  const request = {
    url: INITIATION_GATEWAY_URL('/get-user-tasks?') + encodeQueryData(params)
  };

  try {

    const response = await httpService.get(request, dispatch);

    return response;

  } catch (error) {

    console.error('getUserTaskFromWorkflow err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};

/**
 * 
 * @param {JSON} requestBody - {
      "id": "string",
      "variables": {},
      "withVariablesInReturn": true
    }
 */
export const completeUserTask = (requestBody) => async dispatch => {

  const request = {
    url: INITIATION_GATEWAY_URL('/complete-user-task'),
    body: requestBody
  };

  try {
    const response = await httpService.post(request, dispatch);

    return response;

  } catch (error) {

    console.error('completeUserTask err', error);
    throw Error('Unexpected error occured! Please try again.');
  }

};