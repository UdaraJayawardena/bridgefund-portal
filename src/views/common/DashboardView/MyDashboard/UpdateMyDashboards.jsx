import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/*Material UI Core imports*/
import withStyles from '@material-ui/core/styles/withStyles';

/*Styles import*/
import customStyles from 'assets/jss/bridgefundPortal/views/dashboardStyle';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Grid, Button } from '@material-ui/core';
import { getMyDashboardsSelf, updateSingleMyDashbord } from 'store/initiation/actions/login';
import { displayNotification } from 'store/initiation/actions/Notifier';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';
import NoEncryptionTwoToneIcon from '@material-ui/icons/NoEncryptionTwoTone';
import Notifier from 'components/initiation/Notification/Notifier';


import EditIcon from '@material-ui/icons/Edit';

export class UpdateMyDashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      openModal: false,
      selectedMyDashboardList: [],
      sequenceNumber: 0,
      currentSequenceNumber: null,
      dashboardName :'',
      icon: '',
      selectedId: '',
    };
  }

  componentDidMount() {
    this.getInitialData();
  }

  getInitialData = () => {
    this.props.getMyDashboardsSelf(this.props.frontEndPortalId)
    .then((response) => {
      if (response) {
        const currentSequenceNumber = response.length > 0? Math.max(...response.map(o => o.sequenceNumber)):0;
        this.setState({ selectedMyDashboardList: response, currentSequenceNumber },() => {this.clear()});
      }
      return {};
    });
  }


  editMyDashboardView = (id) => {
    const editObject = this.state.selectedMyDashboardList.find(item => item.id === id);
    const _state = {
      openModal: true,
      dashboardName: editObject.dashboardName ? editObject.dashboardName : '',
      icon: editObject.icon ? editObject.icon : '',
      sequenceNumber: editObject.sequenceNumber ? editObject.sequenceNumber : null,
      selectedId: id
    };
    this.setState(_state);
  }

  clear = () => {
    this.setState({
      openModal: false,
      sequenceNumber: 0,
      dashboardName :'',
      icon: '',
      selectedId: ''
    });
  }

  updateMyDashboard = () => {
    let sendRequest = true;
    if(!(Number.isInteger(this.state.sequenceNumber)  && this.state.sequenceNumber > 0 && this.state.sequenceNumber <= this.state.currentSequenceNumber)){
      this.props.displayNotification(`Sequence number is not valid one. (please enter integer between 1 and ${this.state.currentSequenceNumber})`,'warning');
      sendRequest = false;
    }
    
    const updateData = {
      query: { id: this.state.selectedId },
      updates: {sequenceNumber : this.state.sequenceNumber},
      frontEndPortalId: this.props.frontEndPortalId
    };

    if(sendRequest){
      this.props.updateSingleMyDashbord(updateData)
        .then((response) => {
          if (response) {
            // this.clear();
            debugger
            this.getFilterdDashboardsAfterSuccess();
          }
          return {};
        });
    }
  }



  getFilterdDashboardsAfterSuccess = () => {
    this.props.getMyDashboardsSelf(this.props.frontEndPortalId)
      .then((response) => {
        if (response) {
          const currentSequenceNumber = response.length > 0? Math.max(...response.map(o => o.sequenceNumber)):0;
          this.setState({ selectedMyDashboardList: response, currentSequenceNumber },() => {this.clear()});
        }
        return {};
      });
  }

  render() {

    const { classes } = this.props;
    const { selectedMyDashboardList } = this.state;

    return (
      <div  >
        <Notifier />
        {this.state.openModal ? 
          <GridContainer className={classes.dashboardTopPain}>
            <GridItem className={classes.smallBox}>
              <TextField
                disabled = {true}
                fullWidth={true}
                id="name"
                value={this.state.dashboardName}
                label="Dashboard Name"
                variant="outlined"
                InputProps={{
                  className: classes.inputProp
                }}
                InputLabelProps={{
                  shrink: true,
                  className: classes.inputLabel
                }}
              />
            </GridItem>
            <GridItem className={classes.smallBox}>
              <TextField
                  disabled = {true}
                  fullWidth={true}
                  id="icon"
                  value={this.state.icon}
                  label="Icon"
                  variant="outlined"
                  InputProps={{
                    className: classes.inputProp
                  }}
                  InputLabelProps={{
                    shrink: true,
                    className: classes.inputLabel
                  }}
                />
            </GridItem>
            {/* sequence number */}
            <GridItem className={classes.smallBox}>
              <TextField
                fullWidth={true}
                id="sequenceNumber"
                value={this.state.sequenceNumber}
                label="Sequence Number"
                variant="outlined"
                type="number"
                onChange={event => {
                  const { value } = event.target;
                  this.setState({ sequenceNumber: Number(value) });
                }}
                InputProps={{
                  className: classes.inputProp,
                  inputProps: { 
                    max: this.state.currentSequenceNumber, min: 1 
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                  className: classes.inputLabel
                }}
              />
            </GridItem>
          </GridContainer>
          :
          null
          }

          {this.state.openModal ?
            <Grid
              justify="flex-end"
              container
            >
              <Grid item >
                <Button
                  variant="outlined"
                  className={classes.cancelIconButton}
                  onClick={() => this.clear()}
                >Cancel</Button>
                <Button
                  variant='contained'
                  className={classes.confirmIconButton}
                  onClick={() => this.updateMyDashboard()}
                >Update</Button>
              </Grid>
            </Grid>
            : null}

        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table aria-label="simple table" className={classes.table}>
            <TableHead className={classes.tableHeadColor}>
              <TableRow>
                <TableCell className={classes.tableCell} >Action</TableCell>
                <TableCell className={classes.tableCell} >Dashboard</TableCell>
                <TableCell className={classes.tableCell} >Icon</TableCell>
                <TableCell className={classes.tableCell} >Sequence Number</TableCell>
                <TableCell className={classes.tableCell} >Main Dashboard Sequence Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMyDashboardList && selectedMyDashboardList.length === 0 ?

                <TableRow>
                  <TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={7}>
                    {'No My Dashboards to show'}
                  </TableCell>
                </TableRow>
                :
                selectedMyDashboardList.map((row) => (
                  <TableRow key={row.name}>
                     <TableCell className={classes.tableCell}>
                        <div className={classes.actionButtons}>
                        {row.userId !== null ?
                          <EditIcon className={classes.cursorPointer} onClick={() => this.editMyDashboardView(row.id)} /> : <NoEncryptionTwoToneIcon />}
                      </div> 
                    </TableCell>
                    <TableCell className={classes.tableCell} >{row.dashboardName}</TableCell>
                    <TableCell className={classes.tableCell}> {row.icon} </TableCell>
                    <TableCell className={classes.tableCell}> {row.sequenceNumber} </TableCell>
                    <TableCell className={classes.tableCell} style={{"color":"grey"}}> {row.dashboardSequenceNumber} </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

UpdateMyDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  frontEndPortalId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    getMyDashboardsSelf: (query) => dispatch(getMyDashboardsSelf(query)),
    updateSingleMyDashbord : (data) => dispatch(updateSingleMyDashbord(data)),
  };
};

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(UpdateMyDashboard));