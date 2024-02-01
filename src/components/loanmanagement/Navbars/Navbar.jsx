import moment from 'moment';
import React, { Component } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { connect } from 'react-redux';
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
// core components
import Button from "components/loanmanagement/CustomButtons/Button.jsx";
import AdminNavbarLinks from "./AdminNavbarLinks.jsx";
import RTLNavbarLinks from "./RTLNavbarLinks.jsx";
import headerStyle from "assets/jss/material-dashboard-react/components/headerStyle.jsx";

import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";
import { Hidden } from '@material-ui/core';
import { Replay } from '@material-ui/icons';

class Header extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  simulationDate = () => {
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {

      const view = this.props.configurations.simulations.systemDate ?
        <>
          <div style={{ position: 'relative', float: 'right', margin: '1% 1% 0 0' }} >
            {
              this.props.configurations.simulations.isWorkingDate ?
                ' ( Working date )' :
                ' ( Not a working date! )'
            }
          </div>
          <div style={{ position: 'relative', float: 'right', margin: '1% 1% 0 0', fontWeight: 500 }} >
            Simulation Date : {moment(this.props.configurations.simulations.systemDate).format('DD-MM-YYYY')}
          </div>
        </>
        :
        <>
          <div style={{ position: 'relative', float: 'right', margin: '1% 1% 0 0' }} >
            <div style={{ position: 'relative', float: 'right', margin: '0 1%', fontWeight: 500, color: 'red', width: '100%' }}>Simulation date not found!</div>
          </div>
        </>;

      return view;

    }

    return null;
  }

  reloadSimulationDate = () => {

    if (!this.state.loading) {
      this.setState({ loading: true }, () => {
        return this.props.getSimulationDate()
          .finally(() => this.setState({ loading: false }));
      });
    }
  }

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
            {this.simulationDate()}
            {(process.env.REACT_APP_ENVIRONMENT !== 'production') &&
              <Button
                color={window.innerWidth > 959 ? "transparent" : "white"}
                justIcon={window.innerWidth > 959}
                simple={!(window.innerWidth > 959)}
                aria-label="SimulationDate"
                style={{ position: 'relative', float: 'right', marginRight: '1%' }}
                onClick={this.reloadSimulationDate}
              >
                <Replay className={classes.icons} />
                <Hidden mdUp implementation="css"><p className={classes.linkText}>Simulation Date</p></Hidden>
              </Button>
            }
          </div>
          {this.props.rtlActive ? <RTLNavbarLinks /> : <AdminNavbarLinks />}
        </Toolbar>
      </AppBar>
    );
  }

}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  configurations: PropTypes.object.isRequired,
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  rtlActive: PropTypes.any,
  isSideBarOpen: PropTypes.bool.isRequired,
  getSimulationDate: PropTypes.func.isRequired,
};

const mapStateToProp = state => ({
  configurations: state.configurations
});

const mapDispatchToProps = (dispatch) => ({
  getSimulationDate: () => dispatch(getSimulationDate())
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(headerStyle)(Header));