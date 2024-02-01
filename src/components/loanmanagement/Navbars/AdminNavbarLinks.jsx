// import React from "react";
import React, { Suspense } from 'react';

import PropTypes from 'prop-types';
import classNames from "classnames";
import { connect } from 'react-redux';
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Hidden from "@material-ui/core/Hidden";
import Poppers from "@material-ui/core/Popper";
// @material-ui/icons
import Person from "@material-ui/icons/Person";
import Save from "@material-ui/icons/Save";
import Notifications from "@material-ui/icons/Notifications";
import Button from "components/loanmanagement/CustomButtons/Button.jsx";

import headerLinksStyle from "assets/jss/material-dashboard-react/components/headerLinksStyle.jsx";

import { Link } from 'react-router-dom';

import Settings from "@material-ui/icons/Settings";
// Action calls 
import DatabaseSnapshotsDialog from './DatabaseSnapshotsDialog';
import { handleSnapshotDialogShowing } from "store/loanmanagement/actions/Snapshot.action";
import Utility from "lib/loanmanagement/utility";

import LanguageSelector from "components/loanmanagement/LanguageSelector/LanguageSelector";
import { clearAllLmGlobal } from 'store/initiation/actions/login';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const ENV = Utility.getEnv();

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

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    return (
      <div>
        <Suspense fallback={null}>
          {ENV === 'production' ? false :
            <div className={classes.langWrapper}>
              <LanguageSelector />
            </div>
          }
          {ENV === 'production' ? false :
            <Button
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              aria-label="Snapshots"
              className={classes.buttonLink}
              onClick={() => { this.props.handleSnapshotDialogShowing(true); }}
              id="openSnapshotDialog"
            >
              <Save className={classes.icons} />
              <Hidden mdUp implementation="css">
                <p className={classes.linkText}>Database Snapshots</p>
              </Hidden>
            </Button>
          }
          <Link to='/admin/dashboard' style={{ color: "#3c4858" }}>
            <Button
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              aria-label="Dashboard"
              className={classes.buttonLink}
            >
              {/* <Dashboard className={classes.icons} /> */}
              <Settings className={classes.icons} />
              <Hidden mdUp implementation="css">
                <p className={classes.linkText}>Admin Dashboard</p>
              </Hidden>
            </Button>
          </Link>

          <div className={classes.manager}>

            <Button
              buttonRef={node => {
                this.anchorEl = node;
              }}
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              aria-owns={open ? "menu-list-grow" : null}
              aria-haspopup="true"
              onClick={this.handleToggle}
              className={classes.buttonLink}
            >
              <Notifications className={classes.icons} />
              <span className={classes.notifications}>1</span>
              <Hidden mdUp implementation="css">
                <p className={classes.linkText}>
                  Notification
              </p>
              </Hidden>
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

            <Button
              color={window.innerWidth > 959 ? "transparent" : "white"}
              justIcon={window.innerWidth > 959}
              simple={!(window.innerWidth > 959)}
              aria-label="Person"
              className={classes.buttonLink}
              onClick={this.logOut}
            >
              <Link to='/login' style={{ color: "#3c4858" }}>
                <Person className={classes.icons} />
                <Hidden mdUp implementation="css">
                  <p className={classes.linkText}>Profile</p>
                </Hidden>
              </Link>
            </Button>
          </div>

          {
            this.props.isOpenSnapshotDialog ?
              <DatabaseSnapshotsDialog />
              : false
          }
        </Suspense>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(headerLinksStyle)(HeaderLinks));
