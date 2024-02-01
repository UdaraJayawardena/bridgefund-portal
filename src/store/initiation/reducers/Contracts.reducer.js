import {
    GET_CONTRACT_LIST
} from "../constants/Contracts";


const defaultState = {
    contractList: []
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case GET_CONTRACT_LIST:
            return {
                ...state,
                contractList: action.payload
            };


        default:
            return state;
    }
};