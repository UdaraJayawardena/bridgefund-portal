import React, { Component } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { connect } from 'react-redux';
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
// core components
import AdminNavbarLinks from "./AdminNavbarLinks.jsx";
import RTLNavbarLinks from "./RTLNavbarLinks.jsx";
import headerStyle from "assets/jss/material-dashboard-react/components/headerStyle.jsx";

class Header extends Component {

  render () {

    const { classes, color, isSideBarOpen } = this.props;
    const appBarClasses = classNames({
      [" " + classes[color]]: color,
      [classes.smallHeaderBar]: isSideBarOpen
    });

    return (
      <AppBar className={classNames(classes.appBar, appBarClasses)} style={{ backgroundColor: '#fff' }}>
        <Toolbar className={classes.container}>
          <div className={classes.flex}>
            {''}
          </div>
          {this.props.rtlActive ? <RTLNavbarLinks /> : <AdminNavbarLinks />}
        </Toolbar>
      </AppBar>
    );
  }

}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  rtlActive: PropTypes.any,
  isSideBarOpen: PropTypes.bool.isRequired,
};

const mapStateToProp = state => ({
  configurations: state.configurations
});

export default connect(mapStateToProp, null)(withStyles(headerStyle)(Header));