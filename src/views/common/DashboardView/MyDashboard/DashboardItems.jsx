import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/*Material UI Core imports*/
import withStyles from '@material-ui/core/styles/withStyles';
import dashboardStyle from 'assets/jss/bridgefundPortal/views/dashboardStyle';
// import Utility from "../../lib/utility";

/*Styles import*/
// import customStyles from 'assets/jss/foundationPortal/views/dashboardCreationOverviewStyles';
import { FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Grid, Button, TextField } from '@material-ui/core';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';
import { getMyDashboardsItems, getMyDashboardsSelf, updateMyDashboardItems } from 'store/initiation/actions/login';
import Notifier from 'components/initiation/Notification/Notifier';
import { AddCircle } from '@material-ui/icons';
import NoEncryptionTwoToneIcon from '@material-ui/icons/NoEncryptionTwoTone';
import EditIcon from '@material-ui/icons/Edit';
import { displayNotification } from 'store/initiation/actions/Notifier';

// import {filterData} from "../../../../lib/common/utility";

export class DashboardItems extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dashboardItemList: [],
      roleName: '',
      userName: '',
      selectedDashboardList: [],
      dashboardList: [],
      dashboardName: '',
      openModal: false,

      name: '',
      dashboardId: '',
      sequenceNumber: null,
      wireframeId: '',
      modalType: '',
      selectedId: '',
      primaryScreenIndicator: 0,
      isActive: 1,
      currentSequenceNumber: ''
    };
  }

  componentDidMount() {
    this.getInitialData();
  }

  getInitialData = () => {

    // this.props.getMyDashboardsItems()
    //   .then((response) => {
    //     if (response && response.length > 0) {
    //     this.setState({ dashboardItemList: response, selectedItemList: response  });
    //     }
    //     return {};
    //   });

      this.props.getMyDashboardsSelf(this.props.frontEndPortalId)
      .then((response) => {
        if (response && response.length > 0) {
          this.setState({selectedDashboardList: response });
        }
      });

  }

  getFilterdDashboardsItems =() => {
  
    this.props.getMyDashboardsItems( this.state.dashboardName === '' ? null : this.state.dashboardName)
      .then((response) => {
        if (response && response.length > 0) {
          const currentSequenceNumber = Math.max(...response.map(o => o.sequenceNumber));
          this.setState({ dashboardItemList: response ,currentSequenceNumber: currentSequenceNumber});
        }
        return {};
      });
  }

  editDashboardItem = (id, action) => {
    const editObject = this.state.dashboardItemList.filter(item => item.id === id)[0];

    this.setState({
      openModal: true,
      name: editObject.dashboardItemName != null ? editObject.dashboardItemName : '',
      dashboardId: editObject.id != null ? editObject.id : '',
      sequenceNumber: editObject.sequenceNumber != null ? editObject.sequenceNumber : null,
      wireframeName: editObject.wireframeName != null ? editObject.wireframeName : '',
      primaryScreenIndicator: editObject.primaryScreenIndicator === true ? 1 : 0,
      active: editObject.active === 1 ? true : false,
      modalType: action,
      selectedId: id
    });
  }

  saveDashboardItem = () => {
    let sendRequest = true;
    const requestData = {
      primaryScreenIndicator: this.state.primaryScreenIndicator ===  1 ? true : false,
      sequenceNumber: Number(this.state.sequenceNumber),
      active: this.state.isActive === 1 ? true : false
    };

    const updateData = {
      "query": { "id": this.state.selectedId },
      "updates": requestData 
    };
    if(this.state.modalType === 'Update'){
      if(!(Number.isInteger(this.state.sequenceNumber)  && this.state.sequenceNumber > 0 && this.state.sequenceNumber <= this.state.currentSequenceNumber)){
        this.props.displayNotification(`Sequence number is not valid one. (please enter integer between 1 and ${this.state.currentSequenceNumber})`,'warning');
        sendRequest = false;
      }
    }      

    if(sendRequest){
      this.props.updateMyDashboardItems(updateData)
      .then((response) => {
        if (response) {
          this.setState({ openModal: false }, () => this.getFilterdDashboardsItems());
        }
        return {};
      });
    }

    
  }

  render() {

    const { classes } = this.props;
    const { dashboardItemList, dashboardName } = this.state;

    return (
      <div  >
         <Notifier />
       
        <GridContainer className={classes.dashboardTopPain}>
          <GridItem className={classes.smallBox}>
          <FormControl size="small" variant="outlined" fullWidth  className={classes.formStyle}>
              <InputLabel className={classes.inputLabel} htmlFor="dashboard-selcetor">{"Dashboard"}</InputLabel>
              <Select
                disabled={this.state.openModal ? true : false}
                labelId="dashboard-select-outlined-label"
                id="dashboard-select-outlined"
                label="Dashboards"
                name='dashboardId'
                value={this.state.dashboardName}
                className={classes.inputProp}
                onChange={event => {
                  const { value } = event.target;
                  this.setState({ dashboardName: value}, () => this.getFilterdDashboardsItems());
                }}
              >
                {this.state.selectedDashboardList && this.state.selectedDashboardList.map(item =>
                  <MenuItem className={classes.inputLabel} key={item.dashboardId} value={item.dashboardName}>{item.dashboardName}</MenuItem>
                )}
              </Select>
            </FormControl>

          </GridItem>

          {this.state.openModal ? <GridItem className={classes.smallBox}>
            <TextField
              disabled={this.state.openModal ? true : false}
              className={classes.textFieldStyle}
              fullWidth={true}
              id="name"
              defaultValue={this.state.name}
              label="Dashboard Item Name"
              variant="outlined"
              InputProps={{
                className: classes.inputProp
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.inputLabel
              }}
            />
          </GridItem> : <GridItem className={classes.smallBox}>
            <div style={{width: "100%"}}></div>
            </GridItem>}

          {this.state.openModal ? <GridItem className={classes.smallBox}>
            <TextField
              className={classes.textFieldStyle}
              fullWidth={true}
              id="sequenceNumber"
              defaultValue={this.state.sequenceNumber}
              disabled = {(this.state.modalType === 'Create')? true:false}
              label="Sequence Number"
              type="number"
              variant="outlined"
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
          </GridItem> :  
          <GridItem className={classes.smallBox}>
            </GridItem>
            }

          {this.state.openModal ? <GridItem className={classes.smallBox}>

          <TextField
              disabled={this.state.openModal ? true : false}
              className={classes.textFieldStyle}
              fullWidth={true}
              id="wireframeId"
              value={this.state.wireframeName}
              label="Wireframe Name"
              variant="outlined"
              onChange={event => {
                const { value } = event.target;
                this.setState({ wireframeName: value });
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

          </GridItem> : null}

          {this.state.openModal ? <GridItem className={classes.smallBox}>
            <TextField
              className={classes.textFieldStyle}
              variant="outlined"
              fullWidth={true}
              select
              id="primaryScreenIndicator"
              label="Primary Screen Indicator"
              onChange={event => {
                const { value } = event.target;
                this.setState({ primaryScreenIndicator: value });
              }}
              value={this.state.primaryScreenIndicator}
              InputProps={{
                className: classes.inputProp
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.inputLabel
              }}
            >
              <MenuItem className={classes.menuItem} value={0}>No</MenuItem>
              <MenuItem className={classes.menuItem} value={1}>Yes</MenuItem>
            </TextField>
          </GridItem> : null}

          {this.state.openModal ? <GridItem className={classes.smallBox}>
            <TextField
              variant="outlined"
              fullWidth={true}
              select
              id="active-state"
              label="Active"
              onChange={event => {
                const { value } = event.target;
                this.setState({ isActive: value });
              }}
              value={this.state.isActive}
              InputProps={{
                className: classes.inputProp
              }}
              InputLabelProps={{
                shrink: true,
                className: classes.inputLabel
              }}
            >
              <MenuItem className={classes.menuItem} value={0}>No</MenuItem>
              <MenuItem className={classes.menuItem} value={1}>Yes</MenuItem>
            </TextField>
          </GridItem> : null}

        </GridContainer> {this.state.openModal ? <Grid
          justify="flex-end"
          container
        >
          <Grid item >
            <Button
              variant="outlined"
              className={classes.cancelIconButton}
              onClick={() => this.setState({ openModal: false })}
            >Cancel</Button>
            <Button
              variant='contained'
              className={classes.confirmIconButton}
              disabled={this.state.disabled}
              onClick={this.saveDashboardItem}
            >{this.state.modalType === 'Create' ? "Create" : "Update"}</Button>
          </Grid>
        </Grid> : null}

        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table aria-label="simple table" className={classes.table}>
            <TableHead className={classes.tableHeadColor}>
              <TableRow>
              <TableCell className={classes.tableCell}>{  dashboardName !== '' ? 'Action' : null}</TableCell>
                <TableCell className={classes.tableCell} >Dashboard</TableCell>
                <TableCell className={classes.tableCell} >Item Name</TableCell>
                <TableCell className={classes.tableCell} >Sequence Number</TableCell>
                <TableCell className={classes.tableCell} >Wireframe</TableCell>
                <TableCell className={classes.tableCell} >Functionality</TableCell>
                <TableCell className={classes.tableCell} >Primary Screen Indicator</TableCell>
                <TableCell className={classes.tableCell} >Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardItemList && dashboardItemList.length === 0 ?

                <TableRow>
                  <TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={7}>
                    {'No Dashboard items to show'}
                  </TableCell>
                </TableRow>
                :
                dashboardItemList.map((row) => (
                  <TableRow key={row.name}>
                     <TableCell className={classes.tableCell}>
                      {
                        dashboardName !== '' ? <div className={classes.actionButtons}>
                          {row.userId !== null ?
                            <EditIcon className={classes.cursorPointer} onClick={() => this.editDashboardItem(row.id, 'Update')} /> : <NoEncryptionTwoToneIcon />}
                        </div> : null
                      }
                    </TableCell>
                    <TableCell className={classes.tableCell} >{row.myDashboardName}</TableCell>
                    <TableCell className={classes.tableCell}> {row.dashboardItemName} </TableCell>
                    <TableCell className={classes.tableCell}> {row.sequenceNumber} </TableCell>
                    <TableCell className={classes.tableCell}> {row.wireframeName} </TableCell>
                    <TableCell className={classes.tableCell} >{row.functionalityName} </TableCell>
                    <TableCell className={classes.tableCell} >
                      {row.primaryScreenIndicator ? <label className={classes.activeLable} >Yes</label> : <label className={classes.inActiveLable}>No</label>}</TableCell>
                    <TableCell className={classes.tableCell} >
                      {row.active ? <label className={classes.activeLable} >Active</label> : <label className={classes.inActiveLable}>Inactive</label>}</TableCell>
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

DashboardItems.propTypes = {
  classes: PropTypes.object.isRequired,
  frontEndPortalId :PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getMyDashboardsItems: (dashboardName) => dispatch(getMyDashboardsItems(dashboardName)),
    getMyDashboardsSelf: (id) => dispatch(getMyDashboardsSelf(id)),
    updateMyDashboardItems:(data) =>  dispatch(updateMyDashboardItems(data)),
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
  };
};

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(DashboardItems));