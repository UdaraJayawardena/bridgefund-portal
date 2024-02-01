// @ts-nocheck
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Grid, Checkbox, Paper, DialogTitle, Table, TableBody, TableContainer, TableHead, TableRow,
  TableCell, Button, DialogActions, DialogContentText, DialogContent,
  TextField, LinearProgress, Dialog
} from '@material-ui/core';
import GetApp from '@material-ui/icons/GetApp';
// Libraries
import moment from "moment";
import withStyles from '@material-ui/core/styles/withStyles';
import {
  getAllSnapshots,
  handleSnapshotDialogShowing,
  restoreSnapshot,
  createSnapshot,
  deleteSnapshot,
  handleSnapshotDialogLoading,
} from "store/actions/Snapshot.action";
import { displayNotification } from 'store/crm/actions/Notifier';

const snapshotStyles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  snapShotButton: {
    margin: theme.spacing(1)
  },
  container: {
    maxHeight: 300,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#cccccc',
  },
});


class DatabaseSnapshotsDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snapshotDescription: '',
      checkedSnapshotId: null,
      isOpenConfirmDialog: false,
      confirmDialogTitle: '',
    };
  }

  componentDidMount() {
    this.props.getAllSnapshots();
  }

  handledescriptionChange = (event) => {
    this.setState({ snapshotDescription: event.target.value });
  }

  createSnapshot = () => {
    const snapshotDescription = this.state.snapshotDescription;

    if (snapshotDescription.trim() === '')
      this.props.displayNotification('Snapshot Description is required ', 'warning');
    else {
      this.props.createSnapshot({ "databaseSnapshot": { "description": snapshotDescription, "snapshotId": 'SNAPSHOT-' + moment().format('DD-MM-YYYY-hh-mm-ss') } });
      this.props.handleSnapshotDialogLoading(true);
      this.setState({ snapshotDescription: '' });
    }
  }

  restoreSnapshot = () => {
    this.props.restoreSnapshot({ "snapshotId": this.state.checkedSnapshotId });
    this.props.handleSnapshotDialogLoading(true);
    this.setState({ checkedSnapshotId: null, });
  }

  deleteSnapshot = () => {
    this.props.deleteSnapshot({ "snapshotId": this.state.checkedSnapshotId });
    this.props.handleSnapshotDialogLoading(true);
    this.setState({ checkedSnapshotId: null, });
  }

  // eslint-disable-next-line no-unused-vars
  handleSnapshotSelection(snapshot, event) {

    if (snapshot.snapshotId !== this.state.checkedSnapshotId)
      this.setState({ checkedSnapshotId: snapshot.snapshotId });

    else if (snapshot.snapshotId === this.state.checkedSnapshotId)
      this.setState({ checkedSnapshotId: null });
  }

  handleConfirmDialog = () => {
    const { confirmDialogTitle } = this.state;

    if (confirmDialogTitle === 'Delete') {
      this.deleteSnapshot();
      this.setState({
        isOpenConfirmDialog: false,
        // confirmDialogTitle: ''
      });
      // return;
    }

    if (confirmDialogTitle === 'Restore') {
      this.restoreSnapshot();
      this.setState({
        isOpenConfirmDialog: false,
        // confirmDialogTitle: ''
      });
      // return;
    }
  }

  render() {

    const { checkedSnapshotId, isOpenConfirmDialog, confirmDialogTitle } = this.state;
    const {
      classes,
      handleSnapshotDialogShowing,
      snapshots,
      isLoadingSnapshotDialog
    } = this.props;

    return (
      <div className={classes.root}>
        {isLoadingSnapshotDialog ? <LinearProgress /> : false}
        <Dialog open={this.props.isOpenSnapshotDialog ? true : false}>
          <DialogTitle id="simple-dialog-title">Database Snapshots</DialogTitle>

          <DialogContent>
            <DialogContentText>
              Create New Snapshot
          </DialogContentText>
            <Grid container>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  id="name"
                  label="Description *"
                  type="text"
                  variant="outlined"
                  fullWidth={true}
                  value={this.state.snapshotDescription}
                  onChange={this.handledescriptionChange}
                  placeholder="Snapshot Purpose"
                  disabled={isLoadingSnapshotDialog ? true : false}
                />
              </Grid>
              <Grid item xs={4}>
                <Button className={classes.snapShotButton} disabled={isLoadingSnapshotDialog ? true : false} onClick={this.createSnapshot} color="primary">create snapshot</Button>
              </Grid>
            </Grid>
            <hr />
            <DialogContentText>
              Select Snapshot to Restore or Delete
          </DialogContentText>
            <TableContainer component={Paper} className={classes.container}>
              <Table className={classes.table} size="small" aria-label="a dense table" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Snapshot</TableCell>
                    {/* <TableCell align="center">Download</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody >
                  {
                    snapshots.length === 0 ?
                      <TableRow>
                        <TableCell align="center" colSpan={2}>No Snapshots to show</TableCell>
                      </TableRow>

                      :

                      snapshots.map((snapshot, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            <Checkbox
                              color="primary"
                              checked={checkedSnapshotId === snapshot.snapshotId ? true : false}
                              onChange={(event) => this.handleSnapshotSelection(snapshot, event)}
                              inputProps={{ 'aria-label': 'secondary checkbox' }}
                              disabled={isLoadingSnapshotDialog ? true : false}
                            />
                            {moment(snapshot.createdAt).format('DD-MM-YYYY')}
                          </TableCell>
                          <TableCell align="left">
                            <React.Fragment>
                              <b>{snapshot.snapshotId}</b><br />
                              {snapshot.description}<br />
                              <div>
                                <Button
                                  variant="outlined"
                                  disabled={isLoadingSnapshotDialog ? true : false}
                                  className={classes.snapShotButton}
                                  size="small"
                                  href={snapshot.crmFileName}
                                  target="_blank"
                                  color="primary"
                                  startIcon={<GetApp />}>crm</Button>
                                <Button
                                  variant="outlined"
                                  disabled={isLoadingSnapshotDialog ? true : false}
                                  className={classes.snapShotButton}
                                  size="small"
                                  href={snapshot.initiationFileName}
                                  target="_blank"
                                  color="primary"
                                  startIcon={<GetApp />} >li</Button>
                              </div>
                            </React.Fragment>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button disabled={(!checkedSnapshotId || isLoadingSnapshotDialog) ? true : false}
              onClick={() => { this.setState({ isOpenConfirmDialog: true, confirmDialogTitle: 'Delete' }); }}
              color="secondary">Delete</Button>
            <Button disabled={(!checkedSnapshotId || isLoadingSnapshotDialog) ? true : false}
              onClick={() => { this.setState({ isOpenConfirmDialog: true, confirmDialogTitle: 'Restore' }); }}  >Restore</Button>
            <Button onClick={() => handleSnapshotDialogShowing(false)} color="primary">Cancel</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isOpenConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{checkedSnapshotId}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{'Are You Sure Want To ' + confirmDialogTitle + ' ?'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ isOpenConfirmDialog: false }); }} color="primary">
              Cancel
          </Button>
            <Button onClick={this.handleConfirmDialog} color="primary" >
              Okay
          </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

}

DatabaseSnapshotsDialog.propTypes = {
  classes: PropTypes.object,
  snapshots: PropTypes.array,
  isOpenSnapshotDialog: PropTypes.bool,
  isLoadingSnapshotDialog: PropTypes.bool,
  getAllSnapshots: PropTypes.func.isRequired,
  handleSnapshotDialogShowing: PropTypes.func.isRequired,
  restoreSnapshot: PropTypes.func.isRequired,
  deleteSnapshot: PropTypes.func.isRequired,
  createSnapshot: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  handleSnapshotDialogLoading: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    snapshots: state.snapshot.snapshotList,
    isOpenSnapshotDialog: state.snapshot.isOpenSnapshotDialog,
    isLoadingSnapshotDialog: state.snapshot.isLoadingSnapshotDialog,
    // restoreSnapshotInProgress: state.databaseSnapshot.restoreSnapshotInProgress
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAllSnapshots: () => {
      dispatch(getAllSnapshots());
    },
    handleSnapshotDialogShowing: (isOpen) => {
      dispatch(handleSnapshotDialogShowing(isOpen));
    },
    handleSnapshotDialogLoading: (isLoading) => {
      dispatch(handleSnapshotDialogLoading(isLoading));
    },
    restoreSnapshot: (snapshotId) => {
      dispatch(restoreSnapshot(snapshotId));
    },
    createSnapshot: (snapshotData) => {
      dispatch(createSnapshot(snapshotData));
    },
    deleteSnapshot: (snapshotId) => {
      dispatch(deleteSnapshot(snapshotId));
    },
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(snapshotStyles)(DatabaseSnapshotsDialog));