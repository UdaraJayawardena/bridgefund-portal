import React from "react";
import clx from "classnames";
import qs from "querystring";
import PropTypes from "prop-types";
import { cloneDeep } from "lodash";
import { Link } from "react-router-dom";

import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { Drawer, Collapse, List, ListItem, ListItemIcon, ListItemText, Icon } from "@material-ui/core";

import withStyles from "@material-ui/core/styles/withStyles";
import sidebarStyle from "assets/jss/material-dashboard-react/components/sidebarStyle.jsx";

import Cookies from 'universal-cookie';

const cookies = new Cookies();


const Sidebar = ({ ...props }) => {

  const { classes, logo, routes, color } = props;

  const [selectedGroups, setSelectedGroups] = React.useState({});

  // verifies if routeName is the one active (in browser input)
  const isActiveRoute = (routeName, origin) => {
    const pathMatched = props.location.pathname.indexOf(routeName) > -1 ? true : false;
    const originMatched = window.location.origin.indexOf(origin) > -1 ? true : false;

    return pathMatched && originMatched;
  };

  const _isGroup = (route) => route.children && Array.isArray(route.children) && route.children.length > 0 ? true : false;

  const _getGroupsToBeOpened = (mainRoutes, groupNames = {}, isChild = false) => {

    let isMatched = false;
    for (const route of mainRoutes) {

      if (!isChild) groupNames = {};

      if (isActiveRoute(route.path, route.origin) && isChild) {
        isMatched = true;
        break;
      }

      if (_isGroup(route)) {
        groupNames[route.name] = true;
        const [childGroups, childMatched] = _getGroupsToBeOpened(route.children, groupNames, true);
        Object.assign(groupNames, childGroups);

        if (childMatched) {
          isMatched = childMatched;
          break;
        } else {
          delete groupNames[route.name];
        }
      }
    }
    return [groupNames, isMatched];
  };

  React.useEffect(() => {
    if (routes.length === 0 || Object.keys(selectedGroups).length !== 0) return undefined;

    const [groupsToBeOpened, matched] = _getGroupsToBeOpened(routes);

    if (matched) setSelectedGroups(groupsToBeOpened);

  }, [routes]);


  const _getIcon = (route) => (typeof route.icon === "string" ?
    (<Icon
      className={clx(classes.itemIcon, {
        [classes.whiteFont]: isActiveRoute(route.path, route.origin),
        [classes.itemIconRTL]: props.rtlActive
      })}
    >
      {route.icon}
    </Icon>)
    :
    (<route.icon
      className={clx(classes.itemIcon, {
        [classes.whiteFont]: isActiveRoute(route.path, route.origin),
        [classes.itemIconRTL]: props.rtlActive
      })}
    />)
  );

  const selectRoute = (route) => {

    const hasChildren = route.children && Array.isArray(route.children) && route.children.length > 0 ? true : false;

    if (!route.path && hasChildren) {
      return selectGroup(route.name);
    }

    if (route.origin && window.location.origin !== route.origin) {
      window.location.replace(route.origin + route.layout + route.path);
    } else {
      props.history.push({ pathname: route.layout + route.path });
    }
  };

  const selectGroup = (name) => {
    const groups = cloneDeep(selectedGroups);
    groups[name] = selectedGroups[name] === undefined ? true : !selectedGroups[name];
    setSelectedGroups(groups);
  };

  const navigationRoutes = (mainRoutes) => (
    <List className={classes.list}>
      {mainRoutes.map((route, index) => !route.hide && (
        <div key={'list' + index}>
          <ListItem
            button
            key={index}
            className={clx(classes.itemLink, {
              [classes[color]]: isActiveRoute(route.path, route.origin),
              [classes.itemLinkCollapsed]: !props.open,
              [classes.openGroups]: route.children && selectedGroups[route.name] && !isActiveRoute(route.path, route.origin)
            })}
          >
            <ListItemIcon
              onClick={() => selectRoute(route)}
            >{_getIcon(route)}</ListItemIcon>
            <ListItemText
              primary={props.rtlActive ? route.rtlName : route.name}
              className={clx(classes.itemText, {
                [classes.whiteFont]: isActiveRoute(route.path, route.origin),
                [classes.itemTextRTL]: props.rtlActive
              })}
              disableTypography={true}
              onClick={() => selectRoute(route)}
            />
            {route.children && Array.isArray(route.children) && route.children.length > 0 && route.children.findIndex(rt => rt.hide === false) > -1 &&
              (selectedGroups[route.name] === true ?
                <ExpandLess onClick={() => selectGroup(route.name)} className={classes.routesExpandBtn} />
                :
                <ExpandMore onClick={() => selectGroup(route.name)} className={classes.routesExpandBtn} />
              )
            }
          </ListItem>
          {route.children && Array.isArray(route.children) && route.children.length > 0 &&
            <Collapse
              unmountOnExit
              in={selectedGroups[route.name]}
              className={clx({
                [classes.intendSubRoutes]: props.open,
                [classes.subRoutes]: !props.open
              })}
            >
              {navigationRoutes(route.children)}
            </Collapse>
          }
        </div>
      ))}
    </List>
  );

  return (
    <Drawer
      anchor='left'
      ModalProps={{
        keepMounted: true
      }}
      open={props.open}
      variant='permanent'
      classes={{
        paper: clx(classes.drawerPaper, {
          [classes.drawerOpen]: props.open,
          [classes.drawerClose]: !props.open,
        })
      }}
    >
      <div>
        {/* Side Bar Top Logo */}
        <div className={classes.logo}>
          <Link to={'/'}>
            <img src={logo} alt="logo" />
            <p className={classes.itemText}>
              {process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV : ''}
            </p>
          </Link>
        </div>
        {/* Navigation Urls */}
        <div className={classes.sidebarWrapper}>
          {navigationRoutes(routes)}
        </div>
      </div>
    </Drawer>
  );

};

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  logo: PropTypes.any,
  color: PropTypes.any,
  image: PropTypes.any,
  routes: PropTypes.array,
  location: PropTypes.any,
  handleDrawerToggle: PropTypes.any,
  open: PropTypes.bool,
  rtlActive: PropTypes.bool,
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

export default withStyles(sidebarStyle)(Sidebar);
