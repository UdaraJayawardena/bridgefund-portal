import {
  GET_ALL_SNAPSHOTS,
  SHOW_DATABASE_SNAPSHOTS_DIALOG,
  CLOSE_DATABASE_SNAPSHOTS_DIALOG,
  CREATE_SNAPSHOT_STARTED,
  RESTORE_SNAPSHOT_STARTED,
  CREATE_SNAPSHOT_COMPLETED,
  RESTORE_SNAPSHOT_COMPLETED
} from "../constants/DatabaseSnapshot_old";

const initialState = {
  snapshotsDialogIsOpen: false,
  snapshots: [],
  createSnapshotInProgress: false,
  restoreSnapshotInProgress: false
};

const DatabaseSnapshotReducer = (state = initialState, action) => {

  switch (action.type) {

    case GET_ALL_SNAPSHOTS:
      return {
        ...state,
        snapshots: action.payload
      };

    case SHOW_DATABASE_SNAPSHOTS_DIALOG:
      return {
        ...state,
        snapshotsDialogIsOpen: true
      };

    case CLOSE_DATABASE_SNAPSHOTS_DIALOG:
      return {
        ...state,
        snapshotsDialogIsOpen: false
      };

    case CREATE_SNAPSHOT_STARTED:
      return {
        ...state,
        createSnapshotInProgress: true
      };

    case RESTORE_SNAPSHOT_STARTED:
      return {
        ...state,
        restoreSnapshotInProgress: true
      };
    case CREATE_SNAPSHOT_COMPLETED:
      return {
        ...state,
        createSnapshotInProgress: false
      };
    case RESTORE_SNAPSHOT_COMPLETED:
      return {
        ...state,
        restoreSnapshotInProgress: false
      };


    default:
      return state;
  }

};

export default DatabaseSnapshotReducer;