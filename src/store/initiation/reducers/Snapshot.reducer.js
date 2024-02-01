import {
  GET_SNAPSHOT_LIST,
  HANDLE_SNAPSHOT_DIALOG_SHOWING,
  HANDLE_SNAPSHOT_DIALOG_LOADING,
} from "../constants/Snapshot";

const defaultState = {
  snapshotList: [],
  isOpenSnapshotDialog: false,
  isLoadingSnapshotDialog: false,
};

export default (state = defaultState, action) => {
  switch (action.type) {

    case GET_SNAPSHOT_LIST:
      return {
        ...state,
        snapshotList: action.payload,
      };

    case HANDLE_SNAPSHOT_DIALOG_SHOWING:
      return {
        ...state,
        isOpenSnapshotDialog: action.payload,
      };

    case HANDLE_SNAPSHOT_DIALOG_LOADING:
      return {
        ...state,
        isLoadingSnapshotDialog: action.payload,
      };

    default:
      return state;
  }
};
