/* eslint-disable */
import React from "react";
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { Switch, Route, Redirect } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import clx from "classnames"
// core components
import Header from "components/initiation/Navbars/Navbar.jsx";
import Footer from "components/initiation/Footer/Footer.jsx";
import Sidebar from "components/initiation/Sidebar/Sidebar.jsx";
import Sidebar1 from "components/initiation/Sidebar/Sidebar1.jsx";
// import routes from "routes.js";
import { userPermittedRoutes } from "routes.js";
import dashboardStyle from "assets/jss/material-dashboard-react/layouts/dashboardStyle.jsx";
import image from "assets/img/sidebar-2.jpg";
import pageLogo from '../assets/icons/bf_logo_light.svg';
import { Button } from "@material-ui/core";


import { getSBIParentList } from "store/loanmanagement/actions/SBI";
import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";

const adminRoutes = (routes, key = 0) => {
  let allRoutes = [];
  for (const route of routes) {

    let routeArray = [];

    if (route.layout !== '/admin') continue;

    if (route.component) {
      routeArray.push(<Route
        path={route.layout + route.path}
        component={route.component}
        key={key++}
      />)
    }

    if (route.children && Array.isArray(route.children) && route.children.length > 0) {
      const children = adminRoutes(route.children, key);
      routeArray = routeArray.concat(children)
      key += children.length;
    }

    allRoutes = allRoutes.concat(routeArray);
  }

  return allRoutes;
};

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: image,
      color: "blue",
      hasImage: true,
      fixedClasses: "dropdown show",
      mobileOpen: false,
      routes: []
    };
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  componentDidMount () {
    let routes = userPermittedRoutes();
    this.setState({ routes: routes })
    
    this.props.getSBIParentList();

    /* if development : get simulation date */
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      this.props.getSimulationDate();
    }

    if (navigator.platform.indexOf("Win") > -1) {
      // @ts-ignore
      const ps = new PerfectScrollbar(this.refs.mainPanel);
    }
  }
  componentDidUpdate (e) {
    if (e.history.location.pathname !== e.location.pathname) {
      // @ts-ignore
      this.refs.mainPanel.scrollTop = 0;
    }
  }

  render () {
    const { classes, ...rest } = this.props;
    const { routes } = this.state;

    return (
      <div className={classes.wrapper}>
        <Header isSideBarOpen={this.state.mobileOpen} />
        <div className={classes.pad} />
        <div>
          <Button
            className={
              clx({
                [classes.expandButton]: !this.state.mobileOpen,
                [classes.collapseButton]: this.state.mobileOpen,
              })
            }
            onClick={() => this.handleDrawerToggle()}
          >{'>'}</Button>
          <Sidebar
            routes={routes.filter(r => r.layout === '/admin')}
            logoText={"BridgeFund"}
            logo={pageLogo}
            image={this.state.image}
            handleDrawerToggle={this.handleDrawerToggle}
            open={this.state.mobileOpen}
            color={this.state.color}
            {...rest}
          />
        </div>
        <div style={{ backgroundColor: '#F9FAFC' }} className={clx(classes.mainPanel, { [classes.mainPanelSmall]: this.state.mobileOpen })} ref="mainPanel">
          <div className={classes.content}>
            <div className={classes.container}>
              <Switch>
                {adminRoutes(routes)}
              </Switch>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

Admin.propTypes = {
  classes: PropTypes.object.isRequired
};

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  getSBIParentList: () => dispatch(getSBIParentList()),
  getSimulationDate: () => dispatch(getSimulationDate())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(Admin));
