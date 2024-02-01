
import {
   SET_SBI_PARENT_LIST,
} from '../constants/SBI';

const Reports = (
   state = {
      SbiParentList: [],
   },
   action
) => {
   switch (action.type) {
      case SET_SBI_PARENT_LIST:
         return Object.assign({}, state, {
            SbiParentList: action.SBI_List
         });
      default:
         return state;
   }
};

export default Reports;
