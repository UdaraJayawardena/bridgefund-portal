// @ts-nocheck
/* eslint-disable */
import React from "react";
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import { browserHistory } from 'react-router';
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
import GridLayout from 'components/common/GridLayout/GridLayout.jsx';

// import routes from "routes.js";
import { userPermittedRoutes } from "routes.js";
import dashboardStyle from "assets/jss/material-dashboard-react/layouts/dashboardStyle.jsx";
import image from "assets/img/sidebar-2.jpg";
import pageLogo from '../assets/icons/bf_logo_light.svg';
import { Button, makeStyles } from "@material-ui/core";
// import { getCustomerSuccessManagerList } from 'store/crm/actions/Customer.action';

import { getSBIParentList } from "store/loanmanagement/actions/SBI";
import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";


const userRoutes = (routes, key = 0) => {
  let allRoutes = [];
  for (const route of routes) {

    let routeArray = [];

    if (route.layout !== '/user') continue;

    if (route.component) {
      routeArray.push(<Route
        path={route.layout + route.path}
        component={route.component}
        key={key++}
      />)
    }

    if (route.children && Array.isArray(route.children) && route.children.length > 0) {
      const children = userRoutes(route.children, key);
      routeArray = routeArray.concat(children)
      key += children.length;
    }

    allRoutes = allRoutes.concat(routeArray);
  }

  return allRoutes;
};

class User extends React.Component {
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

  componentDidMount() {
    let routes = userPermittedRoutes();
    this.setState({ routes: routes })

    this.props.getSBIParentList();

    // this.props.getCustomerSuccessManagerList().catch(() => {/*  */ });

    /* if development : get simulation date */
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      this.props.getSimulationDate();
    }

    if (navigator.platform.indexOf("Win") > -1) {
      const ps = new PerfectScrollbar(this.refs.mainPanel);
    }
  }

  componentDidUpdate(e) {
    if (e.history.location.pathname !== e.location.pathname) {
      this.refs.mainPanel.scrollTop = 0;
    }
  }

  render() {
    const { classes, ...rest } = this.props;
    const { routes } = this.state;

    const pathName = window.location.pathname;

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
            routes={routes.filter(r => r.layout === '/user')}
            logoText={"BridgeFund"}
            logo={pageLogo}
            image={this.state.image}
            handleDrawerToggle={this.handleDrawerToggle}
            open={this.state.mobileOpen}
            color={this.state.color}
            selectedDashboardItems={this.props.selectedDashboardItems}
            isDashboardContent={this.props.isDashboardContent}
            {...rest}
          />
        </div>
        <div style={{ backgroundColor: '#F9FAFC' }} className={clx(classes.mainPanel, { [classes.mainPanelSmall]: this.state.mobileOpen })} ref="mainPanel">
          <div className={classes.content}>
            <div className={classes.container}>

              <GridLayout
                routes={routes}
                pathName={pathName}
                classes={classes}
              />

              <Switch>
                {userRoutes(routes)}
              </Switch>
            </div>
          </div>
          <Footer />
        </div >
      </div >
    );
  }
}

User.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedDashboardItems: PropTypes.array,
  configurations: PropTypes.object.isRequired,
  isDashboardContent: PropTypes.bool
};

const mapStateToProps = state => ({
  configurations: state.configurations,
  selectedDashboardItems: state.user.selectedDashboardItems,
  isDashboardContent: state.user.isDashboardContent,
});

const mapDispatchToProps = dispatch => ({
  getSBIParentList: () => dispatch(getSBIParentList()),
  getSimulationDate: () => dispatch(getSimulationDate()),
  // // getCustomerSuccessManagerList: () => dispatch(getCustomerSuccessManagerList())
});

// export default (withStyles(dashboardStyle)(User));

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(User));
