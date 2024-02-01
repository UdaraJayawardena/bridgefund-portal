import React from "react";
import { connect } from 'react-redux';
import classNames from "classnames";
import PropTypes from 'prop-types';
import Flags from 'country-flag-icons/react/3x2'
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
// import Hidden from "@material-ui/core/Hidden";
import Poppers from "@material-ui/core/Popper";
// @material-ui/icons
import Person from "@material-ui/icons/Person";
import Notifications from "@material-ui/icons/Notifications";
// core components
import Button from "components/initiation/CustomButtons/Button.jsx";
import headerLinksStyle from "assets/jss/material-dashboard-react/components/headerLinksStyle.jsx";
import { Link } from 'react-router-dom';
import Settings from "@material-ui/icons/Settings";

import { Save } from '@material-ui/icons';
import { Dialog, DialogActions, DialogContent, DialogContentText, Hidden, Menu, Typography } from '@material-ui/core';
import DatabaseSnapshotsDialog from './DatabaseSnapshotsDialog';
import { handleSnapshotDialogShowing } from "store/initiation/actions/Snapshot.action";
import SimulationDateComponent from "components/loanmanagement/Navbars/SimulationDateComponent";

import ProfileImage from 'components/initiation/ProfileImage/ProfileImage.jsx';
import { clearAllLmGlobal } from "store/initiation/actions/login";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const ENV = process.env.REACT_APP_ENVIRONMENT;
const countryFlagIncludedWireFrames = ['SingleLoanOverview', 'AddOrChangeFlexLoans', 'Transactions', 'WithdrawalOverview'];
class HeaderLinks extends React.Component {
  state = {
    open: false,
    anchorEl1: null,
    openModal: false
  };
  handleToggle = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleClose = event => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }

    this.setState({ open: false });
  };


  logOut = () => {
    cookies.remove('session-token', { path: '/' });
    sessionStorage.clear();
    localStorage.removeItem("user");
    this.props.clearAllLmGlobal();
    
    // localStorage.clear();
  }

  handleClickOpenMenu = event => {
    this.setState({ anchorEl1: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl1: null });
  };

  handleDeletePopup = () => {
    this.setState({ openModal: !this.state.openModal });
  }

  checkRestrictedWireFrames = () => {

    const { selectedTabIndex, selectedDashboardItems } = this.props;

    if (!selectedTabIndex || !selectedDashboardItems) return false; 
    const selectedDashboard = selectedDashboardItems.find(selectedDashboadItem => selectedDashboadItem.dashboardItemId === selectedTabIndex);
    if (countryFlagIncludedWireFrames.includes(selectedDashboard.wireframeName)) return true;
    return false;
  }

  handleCustomerFlag = () => {
    const { smeLoan } = this.props;

    if (smeLoan.country === 'NL' && this.checkRestrictedWireFrames()) return (<Flags.NL title="Netherlands" style={{ width: "40px", height: '40px', position: 'absolute'}}/>);
    if (smeLoan.country === 'UK' && this.checkRestrictedWireFrames()) return (<Flags.GB title="United Kingdom" style={{ width: "40px", height: '40px', position: 'absolute'}}/>);
  };

  render () {
    const { classes, headerDisplayMainData , headerDisplaySubData} = this.props;
    const { open } = this.state;
    const user = sessionStorage.getItem('user');
    const userName = user && user[0].toUpperCase() + user.slice(1);
    const profileImageURL = sessionStorage.getItem('profileImage');
    const countryFlag = this.handleCustomerFlag();

    return (

      <div className={classes.header} >
        {/* <div className={classes.searchTab}>
        {ENV === 'production' ? false : <SimulationDateComponent />}
        </div> */}
         <div style={{float: 'left'}}>
        { this.props.isDashboardContent ? <Typography className={classes.headerTitleStyle}><b>{headerDisplayMainData}</b>{headerDisplaySubData}</Typography> :  null} 
           </div>
        <div className={classes.navigations}>
        <div className={classes.manager} style={{ marginRight: '50px', marginBottom: '25px'}}>
            {countryFlag}
        </div>
        <div className={classes.manager}>
        {ENV === 'production' ? false : <SimulationDateComponent />}
          </div>
          {/* Dashboard Icon - removed due to complkications with sidebar and Navbar on responsive layouts */}
          {/* <Link to='/admin/adminDashboard' style={{color:"#3c4858"}}> */}
          {ENV === 'production' ? false :
            <Button
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              aria-label="Snapshots"
              className={classes.buttonLink}
              onClick={() => { this.props.handleSnapshotDialogShowing(true); }}
            >
              <Save className={classes.icons} />
              <Hidden mdUp implementation="css">
                <p className={classes.linkText}>Database Snapshots</p>
              </Hidden>
            </Button>
          }
          <Link to='/admin/dashboard' style={{ color: "#3c4858" }}>
            <Button
              // color={window.innerWidth > 959 ? "transparent" : "white"}
              // justIcon={window.innerWidth > 959}
              // simple={!(window.innerWidth > 959)}
              color="transparent"
              justIcon
              simple={false}
              aria-label="Dashboard"
              className={classes.buttonLink}
            >
              {/* <Dashboard className={classes.icons} /> */}
              <Settings className={classes.icons} />
              {/* <Hidden mdUp implementation="css">
              <p className={classes.linkText}>Admin Dashboard</p>
            </Hidden> */}
            </Button>
          </Link>
          {/* <div className={classes.manager}>
            <Button
              buttonRef={node => {
                this.anchorEl = node;
              }}
              color="transparent"
              justIcon
              simple={false}
              aria-haspopup="true"
              onClick={this.handleToggle}
              className={classes.buttonLink}
            >
              <Notifications className={classes.icons} />
              <span className={classes.notifications}>1</span>
            </Button>
            <Poppers
              open={open}
              anchorEl={this.anchorEl}
              transition
              disablePortal
              className={
                classNames({ [classes.popperClose]: !open }) +
                " " +
                classes.pooperNav
              }
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  // @ts-ignore
                  id="menu-list-grow"
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom"
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={this.handleClose}>
                      <MenuList role="menu">
                        <MenuItem
                          onClick={this.handleClose}
                          className={classes.dropdownItem}
                        >
                          No messages
                      </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Poppers>
          </div> */}
          <div className={classes.manager}>
            <p className={classes.linkText}>Hi {userName}</p>
          </div>
          <div className={classes.manager} style={{marginLeft: "10px"}}>
            <Button
              aria-owns={this.state.anchorEl1 ? "simple-menu" : undefined}
              aria-haspopup="true"
              onClick={this.handleClickOpenMenu}
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              aria-label="Person"
              className={classes.buttonLink}
            >
               {/* <Person className={classes.icons} /> */}
               <ProfileImage url={profileImageURL} width={'45px'}/>
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorEl1}
              open={Boolean(this.state.anchorEl1)}
              onClose={this.handleCloseMenu}
              disableAutoFocusItem
              getContentAnchorEl={null}
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
              transformOrigin={{vertical: 'top', horizontal: 'center'}}
            >
              <MenuItem>
                 <Link to='/admin/my-dashboard' style={{ color: "#3c4858" }}>My Dashboard</Link>
                </MenuItem>
              <MenuItem>
                {/* <Link to='/login' style={{ color: "#3c4858" }}>Logout</Link> */}
                <div onClick={() => this.handleDeletePopup()}>Logout</div>
              </MenuItem>
            </Menu>
          
            {/* <Link to='/login' style={{ color: "#3c4858" }}>
              <Button 
                color={window.innerWidth > 959 ? "transparent" : "white"}
                justIcon={window.innerWidth > 959}
                simple={!(window.innerWidth > 959)}
                aria-label="Person"
                className={classes.buttonLink}
                onClick={this.logOut}
              >
                <Person className={classes.icons} />
              </Button>
            </Link> */}
          </div>

        </div>
        {
          this.props.isOpenSnapshotDialog ?
            <DatabaseSnapshotsDialog />
            : false
        }

        <Dialog
          open={this.state.openModal}
          onClose={() => this.setState({ openModal: !this.state.openModal })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You are going to log out from the system. Are you sure?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className={classes.deleteButtonStyles} onClick={() => this.setState({ openModal: false }, ()=> this.handleCloseMenu())}>
              No
            </Button>
            <Link to='/login'>
              <Button className={classes.deleteButtonStyles} onClick={this.logOut} type="button">
                Yes
              </Button>
            </Link>

          </DialogActions>
        </Dialog>

      </div>
      
    );
  }
}

HeaderLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpenSnapshotDialog: PropTypes.bool,
  handleSnapshotDialogShowing: PropTypes.func,
  clearAllLmGlobal: PropTypes.func,
  selectedTabIndex: PropTypes.string,
  selectedDashboardItems: PropTypes.array
  // dashboardItem: PropTypes.object
};

const mapStateToProps = state => {
  return {
    snapshots: state.snapshot.snapshotList,
    isOpenSnapshotDialog: state.snapshot.isOpenSnapshotDialog,
    tabsList: state.user.dashboardItems,
    headerDisplayMainData: state.headerNavigation.headerDisplayMainData,
    headerDisplaySubData: state.headerNavigation.headerDisplaySubData,
    isDashboardContent: state.user.isDashboardContent,
    smeLoan: state.lmglobal.selectedLoan,
    selectedTabIndex: state.user.selectedTabIndex,
    selectedDashboardItems: state.user.selectedDashboardItems
    // dashboardItem: state.dashboardSearch.dashboardItem,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleSnapshotDialogShowing: (isOpen) => {
      dispatch(handleSnapshotDialogShowing(isOpen));
    },
    clearAllLmGlobal :() =>{dispatch(clearAllLmGlobal());}

  };
};

// @ts-ignore
export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(headerLinksStyle)(HeaderLinks));
