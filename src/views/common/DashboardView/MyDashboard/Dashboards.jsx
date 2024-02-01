import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/*Material UI Core imports*/
import withStyles from '@material-ui/core/styles/withStyles';
import dashboardStyle from 'assets/jss/bridgefundPortal/views/dashboardStyle';
// import Utility from "../../lib/utility";
import {filterData} from "../../../../lib/common/utility";

/*Styles import*/
// import customStyles from 'assets/jss/foundationPortal/views/dashboardCreationOverviewStyles';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@material-ui/core';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';
import { assignDashboards, getMyDashboardsSelf } from 'store/initiation/actions/login';
import { displayNotification } from 'store/initiation/actions/Notifier';
import Notifier from 'components/initiation/Notification/Notifier';

export class Dashboards extends Component {

  constructor(props) {
    super(props);

    this.state = {
      openModal: false,
      dashboardItemList: [],
      roleList: [],
      userList: [],
      roleId: '',
      userId: '',
      selectedItemList: [],
    };
  }

  componentDidMount() {
    this.getInitialData();
  }

  getInitialData = () => {

    this.props.getMyDashboardsSelf(this.props.frontEndPortalId)
      .then((response) => {
        if (response && response.length > 0) {
            const filteredDashboards = {
                dashboardId: response.map(a => a.dashboardId)
            };
            const selectedDashboards = filterData(response, filteredDashboards);
            this.setState({ dashboardItemList: response, selectedItemList: selectedDashboards });
        
        }
        return {};
      });
  }

  checkForDefaultSelect = (id) => {
    return this.state.selectedItemList.find(item => item.dashboardId === id) ? true : false;
  }

  handleSelectedDashboarsChange = (e, row) => {

    if (e.target.checked)
      this.addElement(row);
    else
      this.removeElement(row);
  }

  addElement = (block) => {
    const array = [...this.state.selectedItemList];
    array.push(block);
    this.setState({ selectedItemList: array });
  }

  removeElement = (block) => {
    const array = [...this.state.selectedItemList];
    const index = array.indexOf(block);
    if (index !== -1) {
      array.splice(index, 1);
      this.setState({ selectedItemList: array });
    }
  }

  addDashboardItem = () => {
    const selectedDashboards = this.state.selectedItemList.map(a => a.dashboardId);

    // const user = sessionStorage.getItem('user');
    // const role = sessionStorage.getItem('role');

    const requestData = {
      dashboardIdList: selectedDashboards,
    };

    this.props.assignDashboards(requestData)
      .then((response) => {
        if (response) {
        return response;
        }
        return {};
      });
  }

  render() {

    const { classes } = this.props;
    const { dashboardItemList } = this.state;

    return (
      <div >
           <Notifier />
           <GridContainer>
          <GridItem className={classes.smallBox}>
           
          </GridItem>
          <GridItem className={classes.smallBox}>
            
          </GridItem>
          <GridItem className={classes.smallBox} alignContent="flex-end">
            <div className={classes.userAssignButtonWrapper}>
              <Button
                variant='contained'
                className={classes.addIconButton}
                onClick={() => this.addDashboardItem()}
              >Save Assign</Button>
            </div>
          </GridItem>
        </GridContainer>

        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table aria-label="simple table" className={classes.table}>
            <TableHead className={classes.tableHeadColor}>
              <TableRow>
               <TableCell className={classes.tableCell}>Action</TableCell>
                <TableCell className={classes.tableCell} >Dashboard</TableCell>
                <TableCell className={classes.tableCell} >Icon</TableCell>
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
                    {row.userId !== null ?
                      <TableCell className={classes.tableCell}>
                        <Checkbox
                          className={classes.checkboxStyle}
                          checked={this.checkForDefaultSelect(row.dashboardId)}
                          onChange={(e) => this.handleSelectedDashboarsChange(e, row)}
                          color="default"
                          inputProps={{ 'aria-label': 'checkbox with default color' }}
                        />
                      </TableCell> :  <TableCell className={classes.tableCell}> 
                      <Checkbox
                          disabled
                          className={classes.checkboxStyle}
                          checked={this.checkForDefaultSelect(row.dashboardId)}
                          // onChange={(e) => this.handleSelectedDashboarsChange(e, row)}
                          color="default"
                          inputProps={{ 'aria-label': 'checkbox with default color' }}
                        />
                      </TableCell>}
                    <TableCell className={classes.tableCell} >{row.dashboardName}</TableCell>
                    <TableCell className={classes.tableCell}> {row.icon} </TableCell>
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

Dashboards.propTypes = {
  classes: PropTypes.object.isRequired,
  frontEndPortalId :PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getMyDashboardsSelf: (id) => dispatch(getMyDashboardsSelf(id)),
    assignDashboards: (requestData) => dispatch(assignDashboards(requestData)),
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
  };
};

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(Dashboards));