import {
    USER_PERMISSION
} from "../constants/user";


const defaultState = {
    permissionList: []
};

export default (state = defaultState, action) => {
    switch (action.type) {

        case USER_PERMISSION:
            return {
                ...state,
                permissionList: action.payload
            };


        default:
            return state;
    }
};