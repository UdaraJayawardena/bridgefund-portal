import React from "react";
import { connect } from 'react-redux';
import classNames from "classnames";
import PropTypes from 'prop-types';
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
import Settings from "@material-ui/icons/Settings";
// core components
import Button from "components/crm/CustomButtons/Button.jsx";
import headerLinksStyle from "assets/jss/material-dashboard-react/components/headerLinksStyle.jsx";
import { Link } from 'react-router-dom';

// import { getEnv } from "lib/utility";
import { Save } from '@material-ui/icons';
import { Hidden } from '@material-ui/core';
import DatabaseSnapshotsDialog from './DatabaseSnapshotsDialog';
import { handleSnapshotDialogShowing } from "store/crm/actions/Snapshot.action";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const ENV = process.env.REACT_APP_ENVIRONMENT;


//import CustomSearch from '../../components/CustomAutoSuggest/CustomAutoSuggest';

class HeaderLinks extends React.Component {
  state = {
    open: false
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
    this.props.clearAllLmGlobal();
  }

  render () {
    const { classes } = this.props;
    const { open } = this.state;
    const user = sessionStorage.getItem('user');
    const userName = user && user[0].toUpperCase() + user.slice(1);

    return (

      <div className={classes.header} >
        <div className={classes.searchTab}>
          {/* <Search></Search> */}
          {/* <CustomSearch
                        id="sme-search"
                        name="SMESearch"
                        label={'Search'}
                        entity="customers"
                        sugg_field="company"
                        //onResult={this.onSearchResult.bind(this)}
                        value={this.state.sme?.company || ''}
                      /> */}
        </div>
        <div className={classes.navigations}>

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
          <div className={classes.manager}>
            <Button
              buttonRef={node => {
                this.anchorEl = node;
              }}
              // color={window.innerWidth > 959 ? "transparent" : "white"}
              // justIcon={window.innerWidth > 959}
              // simple={!(window.innerWidth > 959)}
              color="transparent"
              justIcon
              simple={false}
              // aria-owns={open ? "menu-list-grow" : null}
              aria-haspopup="true"
              onClick={this.handleToggle}
              className={classes.buttonLink}
            >
              <Notifications className={classes.icons} />
              <span className={classes.notifications}>1</span>
              {/* <Hidden mdUp implementation="css">
              <p onClick={this.handleClick} className={classes.linkText}>
                Notification
              </p>
            </Hidden> */}
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
          </div>
          <div className={classes.manager}>
            <Button
              // color={window.innerWidth > 959 ? "transparent" : "white"}
              // justIcon={window.innerWidth > 959}
              // simple={!(window.innerWidth > 959)}
              color="transparent"
              justIcon
              simple={false}
              aria-label="Person"
              className={classes.buttonLink}
              onClick={this.logOut}
            >
              <Link to='/login' style={{ color: "#3c4858" }}>
                <Person className={classes.icons} />
                {/* <Hidden mdUp implementation="css">
              <p className={classes.linkText}>Profile</p>
            </Hidden> */}
              </Link>
            </Button>
          </div>
          <div className={classes.manager}>
            <p className={classes.linkText}>{userName}</p>
          </div>
        </div>
        {
          this.props.isOpenSnapshotDialog ?
            <DatabaseSnapshotsDialog />
            : false
        }
      </div>

    );
  }
}

HeaderLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpenSnapshotDialog: PropTypes.bool,
  handleSnapshotDialogShowing: PropTypes.func,
  clearAllLmGlobal : PropTypes.func,
};

const mapStateToProps = state => {
  return {
    snapshots: state.snapshot.snapshotList,
    isOpenSnapshotDialog: state.snapshot.isOpenSnapshotDialog,
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
