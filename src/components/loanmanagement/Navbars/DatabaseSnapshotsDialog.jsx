/* eslint-disable no-unused-vars */
// @ts-nocheck
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from "moment";
import {
  Grid, Checkbox, IconButton, DialogTitle, Table, TableBody, TableHead, TableRow,
  TableCell, Button, DialogActions, DialogContentText, DialogContent,
  TextField, LinearProgress, Dialog, FormControlLabel, FormControl, InputLabel,
  Select, MenuItem, CircularProgress
} from '@material-ui/core';
// import TableContainer from '@material-ui/core/TableContainer';
import GetApp from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';
// Libraries
import {
  getAllSnapshots,
  handleSnapshotDialogShowing,
  restoreSnapshot,
  createSnapshot,
  deleteSnapshot,
  handleSnapshotDialogLoading,
  downloadSnapshot
} from "store/loanmanagement/actions/Snapshot.action";
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import ENV from '../../../config/env';
const clusters = ENV.CLUSTERS;
const snapshotDownloadPaths = ENV.SNAPSHOT_DOWNLOAD_PATHS;

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
  formControl: {
    margin: theme.spacing(1),
    minWidth: '100%',
  },
  user:{
    'font-size': '12px',
    color: 'rgba(0, 0, 0, 0.54)',
    border: '1px solid #9c27b0',
    padding: '2px',
    'border-radius': '4px'
  }
});


class DatabaseSnapshotsDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snapshotDescription: '',
      snapshotId: null,
      checkedSnapshotId: null,
      isOpenConfirmDialog: false,
      confirmDialogTitle: '',
      selectedClusters: [],
      selectedSnapshot: null,
      selectedClusterInFilter: '',
    };
  }

  componentDidMount() {
    this.props.getAllSnapshots();
  }

  handledInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleClusterSelect = (cluster, event) => {
    // event.preventDefault();

    const currentClusterList = this.state.selectedClusters;
    // console.log("cluster ", cluster);

    if (!currentClusterList.includes(cluster)) {
      this.setState({ selectedClusters: currentClusterList.concat([cluster]) });
    }
    else {
      this.setState({ selectedClusters: currentClusterList.filter(item => item !== cluster) });
    }
  }

  createSnapshot = () => {
    const { snapshotDescription, selectedClusters, snapshotId } = this.state;

    if (snapshotDescription.trim() === '') {
      this.props.displayNotification('Snapshot Description is required ', 'warning');
      return;
    }
    if (selectedClusters.length === 0) {
      this.props.displayNotification('Snapshot clusters are required ', 'warning');
      return;
    }
    if (selectedClusters.includes("BFLM") && !selectedClusters.includes("BFF")) {
      this.props.displayNotification('BFF cluster is required ', 'warning');
      return;
    }
    if (selectedClusters.includes("BFFM") && !selectedClusters.includes("BFF")) {
      this.props.displayNotification('BFF cluster is required ', 'warning');
      return;
    }

    // if (!selectedClusters.includes("BFLM") && selectedClusters.includes("BFF"))
    //   this.props.displayNotification('BFLM cluster is required ', 'warning');

    // if (!selectedClusters.includes("BFFM") && selectedClusters.includes("BFF"))
    //   this.props.displayNotification('BFFM cluster is required ', 'warning');

    if (!selectedClusters.includes("LI") && selectedClusters.includes("CRM")) {
      this.props.displayNotification('LI cluster is required ', 'warning');
      return;
    }

    if (selectedClusters.includes("LI") && !selectedClusters.includes("CRM")) {
      this.props.displayNotification('CRM cluster is required ', 'warning');
      return;
    }

    this.props.createSnapshot({
      "snapshot": {
        "description": snapshotDescription,
        "snapshotId": !snapshotId ? 'SNAPSHOT-' + moment().format('DD-MM-YYYY-hh-mm-ss') : snapshotId,
        "clusterList": selectedClusters
      }
    });
    this.props.handleSnapshotDialogLoading(true);
    this.setState({ snapshotDescription: '', selectedClusters: [] });
  }

  restoreSnapshot = () => {
    const { selectedSnapshot, checkedSnapshotId } = this.state;
    this.props.restoreSnapshot({ "snapshotId": checkedSnapshotId, "clusterList": selectedSnapshot.clusterList });
    this.props.handleSnapshotDialogLoading(true);
    this.setState({ checkedSnapshotId: null, });
  }

  deleteSnapshot = () => {
    const { selectedSnapshot, checkedSnapshotId } = this.state;
    this.props.deleteSnapshot({ "snapshotId": checkedSnapshotId, "clusterList": selectedSnapshot.clusterList });
    this.props.handleSnapshotDialogLoading(true);
    this.setState({ checkedSnapshotId: null, });
  }

  // eslint-disable-next-line no-unused-vars
  handleSnapshotSelection(snapshot, event) {

    if (snapshot.snapshotId !== this.state.checkedSnapshotId)
      this.setState({ checkedSnapshotId: snapshot.snapshotId, selectedSnapshot: snapshot });

    else if (snapshot.snapshotId === this.state.checkedSnapshotId)
      this.setState({ checkedSnapshotId: null, selectedSnapshot: snapshot });
  }

  getDownloadLinks = (cluster, snapshotId) => {
    return snapshotDownloadPaths[cluster] + `/cluster-snapshots/${cluster}/${snapshotId}`;
  }

  handleConfirmDialog = () => {
    const { confirmDialogTitle } = this.state;

    if (confirmDialogTitle === 'Delete') {
      this.deleteSnapshot();
      this.setState({
        isOpenConfirmDialog: false,
      });
    }

    if (confirmDialogTitle === 'Restore') {
      this.restoreSnapshot();
      this.setState({
        isOpenConfirmDialog: false,
      });
    }

  }

  getFilteredSnapshots = () => {
    const { snapshots } = this.props;
    const { selectedClusterInFilter } = this.state;
    if (selectedClusterInFilter === '') return snapshots;
    return snapshots.filter(snapshot => snapshot.clusterList.includes(selectedClusterInFilter));
  }

  downloadSnapshot = (cluster, snapshotId) => {
    const {downloadSnapshot} = this.props;
    let url = this.getDownloadLinks(cluster, snapshotId);
    
    downloadSnapshot(url);
  }

  render() {

    const { checkedSnapshotId,
      isOpenConfirmDialog,
      confirmDialogTitle,
      selectedClusters,
      selectedClusterInFilter } = this.state;

    const {
      classes,
      handleSnapshotDialogShowing,
      snapshots,
      isLoadingSnapshotDialog,
      handleSnapshotDialogLoading
    } = this.props;

    return (
      <div className={classes.root} id="main-wrap-div">
        <Dialog id="main-dialog-popup" open={this.props.isOpenSnapshotDialog ? true : false}>
          <Grid id="popup-close-icon-button" container justify="flex-end">
            <IconButton id="close-icon" size="small" color="secondary" aria-label="close"
              className={classes.snapShotButton}
              onClick={() => { handleSnapshotDialogShowing(false); handleSnapshotDialogLoading(false); }}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <DialogTitle id="snapshots-dialog-title">
            Database Snapshots &nbsp;  {isLoadingSnapshotDialog ? <CircularProgress /> : false}
          </DialogTitle>

          <DialogContent id="snapshots-dialog-content">
            {/* <DialogContentText>
              Create New Snapshot
          </DialogContentText> */}
            <Grid container id="snapshots-dialog-content-description">
              <Grid item xs={12} id="snapshots-dialog-content-description-grid">
                <TextField
                  margin="dense"
                  id="snapshot-description"
                  label="Description *"
                  type="text"
                  variant="outlined"
                  name="snapshotDescription"
                  fullWidth={true}
                  value={this.state.snapshotDescription}
                  onChange={this.handledInputChange}
                  placeholder="Snapshot Purpose"
                  disabled={isLoadingSnapshotDialog ? true : false}
                />
              </Grid>
              <Grid item xs={12} id="snapshots-dialog-content-check-box-grid">
                {clusters.map((cluster, index) =>
                  <FormControlLabel
                    id={"snapshots-check-box-label-" + cluster}
                    key={index}
                    control={
                      <Checkbox
                        id={"snapshots-check-box-" + cluster}
                        checked={selectedClusters.includes(cluster) ? true : false}
                        onChange={(e) => { this.handleClusterSelect(cluster, e); }}
                        name={cluster}
                        color="primary"
                        size="small" />
                    }
                    label={cluster}

                  />
                )}
              </Grid>
              <Grid id="snapshots-dialog-content-create-button-grid" item xs={12}>
                <Button variant="outlined" id="snapshots-dialog-create-snapshot-button" fullWidth={true}
                  size="small"
                  disabled={isLoadingSnapshotDialog ? true : false}
                  onClick={this.createSnapshot} color="primary">create snapshot</Button>
              </Grid>
            </Grid>
            <hr />
            <FormControl id="snapshots-dialog-content-select-cluster-div" variant="outlined" className={classes.formControl}>
              <InputLabel id="snapshots-dialog-content-select-cluster-label" htmlFor="selected-cluster-in-filter">Select Cluster</InputLabel>
              <Select
                value={selectedClusterInFilter}
                inputProps={{
                  id: "selected-cluster-in-filter",
                  name: "selectedClusterInFilter"
                }}
                onChange={this.handledInputChange}
                fullWidth={true}
                disabled={isLoadingSnapshotDialog ? true : false}
              >
                <MenuItem id="all-cluster-selection" value="">
                  <em>All</em>
                </MenuItem>
                {clusters.map((cluster, index) =>
                  <MenuItem id={cluster + "-cluster-selection"} key={index} value={cluster}>{cluster}</MenuItem>
                )}
              </Select>
            </FormControl>
            <DialogContentText id="snapshots-dialog-content-restore-delete-title">
              Select Snapshot to Restore or Delete
            </DialogContentText>
            <Table id="snapshots-dialog-content-snapshot-list-table" className={classes.table} size="small" aria-label="a dense table" stickyHeader>
              <TableHead id="snapshots-dialog-content-snapshot-list-table-head">
                <TableRow id="snapshots-dialog-content-snapshot-list-table-header-row">
                  <TableCell id="snapshots-dialog-content-snapshot-list-table-header-row-date" align="center">Date</TableCell>
                  <TableCell id="snapshots-dialog-content-snapshot-list-table-header-row-snapshot" align="center">Snapshot</TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="snapshot_list_table_body">
                {
                  this.getFilteredSnapshots().length === 0 ?
                    <TableRow id="snapshot_list_table_empty_data_row">
                      <TableCell id="snapshot_list_table_empty_data_cell" align="center" colSpan={2}>No Snapshots to show</TableCell>
                    </TableRow>
                    :
                    this.getFilteredSnapshots().map((snapshot, index) => (
                      
                      <TableRow id={"snapshot_list_table_data_row-" + snapshot.snapshotId.replace(/[\s]/, '_')} key={index}>
                        <TableCell component="th" scope="row" id={"snapshots_list_date_cell-" + snapshot.snapshotId}>
                          <Checkbox
                            id={"snapshot_list-table_cell_check_box-" + snapshot.snapshotId.replace(/[\s]/, '_')}
                            color="primary"
                            checked={checkedSnapshotId === snapshot.snapshotId ? true : false}
                            onChange={(event) => this.handleSnapshotSelection(snapshot, event)}
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                            disabled={isLoadingSnapshotDialog ? true : false}
                          />
                          {moment(snapshot.createdAt).format('DD-MM-YYYY')}
                        </TableCell>
                        <TableCell align="left" id={"snapshot_list-table_cell-" + snapshot.snapshotId.replace(/[\s]/, '_')}>
                          <React.Fragment key={index}>
                            <b>{snapshot.snapshotId}</b><br />
                            {snapshot.description}<br />
                            {snapshot.user ? <div><span className={classes.user}>{snapshot.user.firstName + " " + snapshot.user.lastName}</span><br /></div> : null}
                            {snapshot.clusterList.map((cluster, index) =>
                              <Button
                                key={index}
                                variant="outlined"
                                id={"snapshot_cell_downloan_button-"+ snapshot.snapshotId + cluster}
                                disabled={isLoadingSnapshotDialog ? true : false}
                                className={classes.snapShotButton}
                                size="small"
                                target="_blank"
                                color="primary"
                                onClick={() => this.downloadSnapshot(cluster, snapshot.snapshotId)}
                                starticon={<GetApp />}>{cluster}</Button>
                            )}
                          </React.Fragment>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions id="snapshots-dialog-actions-div">
            <Button id="snapshots-dialog-actions-delete-button" disabled={(!checkedSnapshotId || isLoadingSnapshotDialog) ? true : false}
              onClick={() => { this.setState({ isOpenConfirmDialog: true, confirmDialogTitle: 'Delete' }); }}
              color="secondary">Delete</Button>
            <Button id="snapshots-dialog-actions-restore-button" disabled={(!checkedSnapshotId || isLoadingSnapshotDialog) ? true : false}
              onClick={() => { this.setState({ isOpenConfirmDialog: true, confirmDialogTitle: 'Restore' }); }}  >Restore</Button>
            <Button onClick={() => { handleSnapshotDialogShowing(false); handleSnapshotDialogLoading(false); }} color="primary">Cancel</Button>
          </DialogActions>
        </Dialog>
        {/* COnfirmation dialog */}
        <Dialog
          open={isOpenConfirmDialog}
          aria-labelledby="snapshot-action-confirm-popup-title"
          aria-describedby="snapshot-action-confirm-popup-description"
          id="snapshot-action-confirm-popup"
        >
          <DialogTitle id="snapshot-action-confirm-popup-title">{checkedSnapshotId}</DialogTitle>
          <DialogContent id="snapshot-action-confirm-popup-content">
            <DialogContentText id="snapshot-action-confirm-popup-description">{'Are You Sure Want To ' + confirmDialogTitle + ' ?'}</DialogContentText>
          </DialogContent>
          <DialogActions id="snapshot-action-confirm-popup-actions-div">
            <Button id="snapshot-action-confirm-popup-cancel-button" onClick={() => { this.setState({ isOpenConfirmDialog: false }); }} color="primary">
              Cancel
          </Button>
            <Button id="snapshot-action-confirm-popup-okay-button" onClick={this.handleConfirmDialog} color="primary" >
              Okay
          </Button>
          </DialogActions>
        </Dialog>
      </div >
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
  snapshotDownloadURL: PropTypes.string,
  downloadSnapshot: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    snapshots: state.snapshot.snapshotList,
    isOpenSnapshotDialog: state.snapshot.isOpenSnapshotDialog,
    isLoadingSnapshotDialog: state.snapshot.isLoadingSnapshotDialog,
    snapshotDownloadURL: state.snapshot.snapshotDownloadURL,
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
    restoreSnapshot: (snapshotData) => {
      dispatch(restoreSnapshot(snapshotData));
    },
    createSnapshot: (snapshotData) => {
      dispatch(createSnapshot(snapshotData));
    },
    deleteSnapshot: (snapshotData) => {
      dispatch(deleteSnapshot(snapshotData));
    },
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    downloadSnapshot: (snapshotData) => {
      dispatch(downloadSnapshot(snapshotData));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(snapshotStyles)(DatabaseSnapshotsDialog));