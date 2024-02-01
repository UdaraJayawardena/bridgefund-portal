import {
    SET_DIRECT_DEBIT_LOGS,
    // ADD_ITEM_TO_PROCESS_LIST,
    SWITCH_IS_LOADING
} from '../constants/DirectDebitBatch';

const DirectDebitBatchs = (
    state = {
        directdebitbatchsbtob: {},
        directdebitbatchscore: {},
        // checklistforprocess: [],
        isLoading: false,
    }, action) => {
    switch (action.type) {
        case SET_DIRECT_DEBIT_LOGS:
            return {
                ...state,
                directdebitbatchsbtob: action.logs.B2B ? action.logs.B2B : {},
                directdebitbatchscore: action.logs.CORE ? action.logs.CORE : {}
            }
        // case ADD_ITEM_TO_PROCESS_LIST:
        //     console.log('in reducer', state);
        //     return {
        //         ...state,
        //         // directdebitbatchsbtob: action.logs.B2B,
        //         // directdebitbatchscore: action.logs.CORE
        //     }
        case SWITCH_IS_LOADING:
            return { ...state, isLoading: !state.isLoading }
        default:
            return state;
    }
};
export default DirectDebitBatchs;