// @ts-nocheck
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  FormControlLabel, RadioGroup, Radio, DialogActions, DialogTitle, Table,
  TableCell, TableBody, TableHead, TableRow, DialogContent,
  TextField
} from '@material-ui/core';
import CircularProgress from "@material-ui/core/CircularProgress";
import CustomButton from "components/loanmanagement/CustomButtons/Button.jsx";
// Libraries
import moment from "moment";
import withStyles from '@material-ui/core/styles/withStyles';
import {
  getAllDatabaseSnapshots,
  createDatabaseSnapshot,
  restoreDatabaseSnapshot,
  closeDatabaseShapshotsDialog
} from "store/actions/DatabaseSnapshot";

/*Styles import*/
import customStyles from 'assets/jss/material-dashboard-react/components/customStyles.jsx';

const customStyles2 = {
  ...customStyles,
  scrollable: {
    overflowY: 'auto',
    height: '200px'
  },
  createSnapshotProgress: {
    right: '18%',
    position: 'relative',
    marginTop: '-6px',
  },
  restoreSnapshotProgress: {
    right: '19%',
    position: 'relative',
    marginTop: '-1px',
  },
  dateCell: {
    minWidth: '80px'
  },
  radioCell: {
    maxWidth: '25px'
  },
  createSnapshotTitle: {
    textAlign: 'center',
    fontWeight: 'bold'
  }

};

class DatabaseSnapshotsDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedSnapshot: 'none'
    };
  }

  componentDidMount() {
    this.props.getAllDatabaseSnapshots();
  }

  createSnapshot() {
    const description = document.getElementById('snapshot-description').value;

    this.props.createDatabaseSnapshot(description);
  }

  restoreSnapshot() {

    this.props.restoreDatabaseSnapshot(this.state.selectedSnapshot);

  }

  handleSnapshotSelection(event) {

    this.setState({ selectedSnapshot: event.target.value });

  }

  render() {

    const { selectedSnapshot } = this.state;
    const {
      classes,
      snapshots,
      createSnapshotInProgress,
      restoreSnapshotInProgress
    } = this.props;

    return (
      <React.Fragment>
        <DialogTitle id="simple-dialog-title">Database Snapshots</DialogTitle>
        <DialogContent>
        </DialogContent>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className={classes.createSnapshotTitle}>
                Create a new snapshot
                  </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Description
                  </TableCell>
              <TableCell className={classes.snapshotDescriptionInput}>
                <TextField id="snapshot-description" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DialogActions>
          <React.Fragment>
            <CustomButton
              id="create-snapshot"
              type="button"
              style={{ margin: '0 1% 1% 0' }}
              name="create-snapshot"
              onClick={() => { !createSnapshotInProgress && this.createSnapshot(); }}
              color={"info"} >Create Snapshot</CustomButton>
            {
              createSnapshotInProgress &&
              <CircularProgress size={24} className={classes.buttonProgress + ' ' + classes.createSnapshotProgress} />
            }
          </React.Fragment>

        </DialogActions>


        <RadioGroup onChange={this.handleSnapshotSelection.bind(this)} value={selectedSnapshot} id="snapshot-group" name="snapshot-group">
          <div className={classes.scrollable}>
            <Table >
              <TableHead>
                <TableRow>
                  <TableCell className={classes.radioCell} />
                  <TableCell className={classes.tableCell + ' ' + classes.dateCell}>
                    Date
                      </TableCell>
                  <TableCell className={classes.tableCell}>
                    Snapshot Name
                      </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  snapshots ? snapshots.sort((s1, s2) => {
                    return moment(s1.createdAt).isAfter(s2.createdAt) ? -1 : 1;
                  }).map((snapshot) => (
                    <TableRow key={snapshot.snapshotId}>
                      <TableCell className={classes.radioCell}>
                        <FormControlLabel
                          value={snapshot.snapshotId}
                          control={<Radio />}
                          labelPlacement="start"
                        />
                      </TableCell>
                      <TableCell className={classes.tableCell + ' ' + classes.dateCell}>
                        {moment(snapshot.createdAt).format('DD-MM-YYYY')}
                      </TableCell>
                      <TableCell>
                        <b>{snapshot.snapshotId}</b>
                        <br />
                        <br />
                        {snapshot.description}
                      </TableCell>
                    </TableRow>
                  )) : null
                }
              </TableBody>
            </Table>
          </div>
        </RadioGroup>

        <DialogActions>
          <CustomButton onClick={() => {
            !createSnapshotInProgress && !restoreSnapshotInProgress && this.props.closeDatabaseSnapshotsDialog();
          }}>Cancel</CustomButton>
          <React.Fragment>
            <CustomButton
              type="button"
              id="restore-snapshot"
              name="restore-snapshot"
              onClick={() => { !restoreSnapshotInProgress && this.restoreSnapshot(); }}
              color={"info"} >Restore Snapshot
                </CustomButton>
            {
              restoreSnapshotInProgress && <CircularProgress size={24} className={
                classes.buttonProgress + ' ' + classes.restoreSnapshotProgress} />
            }

          </React.Fragment>
        </DialogActions>
      </React.Fragment>
    );
  }

}

DatabaseSnapshotsDialog.propTypes = {
  classes: PropTypes.object,
  snapshots: PropTypes.array,
  createSnapshotInProgress: PropTypes.bool,
  restoreSnapshotInProgress: PropTypes.bool,
  getAllDatabaseSnapshots: PropTypes.func.isRequired,
  createDatabaseSnapshot: PropTypes.func.isRequired,
  restoreDatabaseSnapshot: PropTypes.func.isRequired,
  closeDatabaseSnapshotsDialog: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    snapshots: state.databaseSnapshot.snapshots,
    createSnapshotInProgress: state.databaseSnapshot.createSnapshotInProgress,
    restoreSnapshotInProgress: state.databaseSnapshot.restoreSnapshotInProgress
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAllDatabaseSnapshots: (communityId, loanStatus, customerId) => {
      dispatch(getAllDatabaseSnapshots(communityId, loanStatus, customerId));
    },
    createDatabaseSnapshot: (description) => {
      dispatch(createDatabaseSnapshot(description));
    },
    restoreDatabaseSnapshot: (description) => {
      dispatch(restoreDatabaseSnapshot(description));
    },
    closeDatabaseSnapshotsDialog: () => {
      dispatch(closeDatabaseShapshotsDialog());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(customStyles2)(DatabaseSnapshotsDialog));