import httpService from '../service/httpService';
import ENV from '../../../config/env';
import { displayNotification } from './Notifier';

export const calculateLiquidityOverview = ( params ) => {
  return dispatch => {
    
    return new Promise( ( resolve, reject ) => {
      
      const requestData = {
        url : `${ENV.API_GATEWAY_URL}/liquidity-calculation`,
        body : { liquidityRequirements : { ...params } }
      };
      
      return httpService.post( requestData, dispatch )
      .then( (response) => {
        
        if( response && response.code === 200 ) {
          resolve(response);
        }
        
        reject(response);
      } )
      .catch( (error) => {
        dispatch( displayNotification( 'Liquidity overview - unexpected error ocurred', 'error' ) );
        reject(error);
      } );
      
    } );
    
  };
};