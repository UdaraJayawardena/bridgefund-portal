import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { NavLink, Link } from "react-router-dom";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Icon from "@material-ui/core/Icon";
// core components
import sidebarStyle from "assets/jss/material-dashboard-react/components/sidebarStyle.jsx";

const Sidebar = ({ ...props }) => {
  // verifies if routeName is the one active (in browser input)
  function activeRoute (routeName) {
    return props.location.pathname.indexOf(routeName) > -1 ? true : false;
  }
  const { classes, color, logo, image, routes } = props;
  const links = (
    <List className={classes.list}>
      {routes.map((prop, key) => {
        let activePro = " ";
        let listItemClasses;
        if (prop.path === "/upgrade-to-pro") {
          activePro = classes.activePro + " ";
          listItemClasses = classNames({
            [" " + classes[color]]: true
          });
        } else {
          listItemClasses = classNames({
            [" " + classes[color]]: activeRoute(prop.layout + prop.path)
          });
        }
        const whiteFontClasses = classNames({
          [" " + classes.whiteFont]: activeRoute(prop.layout + prop.path)
        });
        return (
          prop.hide === false && //This will hide unwanted Routes from the Side Bar
          <NavLink
            to={prop.layout + prop.path}
            className={activePro + classes.item}
            activeClassName="active"
            key={key}
          >
            <ListItem button className={classes.itemLink + listItemClasses}>
              {typeof prop.icon === "string" ? (
                <Icon
                  className={classNames(classes.itemIcon, whiteFontClasses, {
                    [classes.itemIconRTL]: props.rtlActive
                  })}
                >
                  {prop.icon}
                </Icon>
              ) : (
                  <prop.icon
                    className={classNames(classes.itemIcon, whiteFontClasses, {
                      [classes.itemIconRTL]: props.rtlActive
                    })}
                  />
                )}
              <ListItemText
                primary={
                  props.rtlActive ? prop.rtlName : prop.name
                }
                className={classNames(classes.itemText, whiteFontClasses, {
                  [classes.itemTextRTL]: props.rtlActive
                })}
                disableTypography={true}
              />
            </ListItem>
          </NavLink>
        );
      })}
    </List>
  );
  const brand = (
    <div className={classes.logo}>
      <Link
        to={'/'}
      >
        <img src={logo} alt="logo" />
        <p className={classes.itemText}>
          {process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV : ''}
        </p>
      </Link>
    </div>
  );
  return (
    <div>

      {/* <Hidden mdUp implementation="css"> */}
      <Drawer
        variant="permanent"
        open={props.open}
        classes={{
          paper: classNames(classes.drawerPaper, {
            [classes.drawerOpen]: props.open,
            [classes.drawerClose]: !props.open,
          })
        }}
        onClose={props.handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
      >
        {brand}
        <div className={classes.sidebarWrapper}>
          {links}
        </div>
        {image !== undefined ? (
          <div
            className={classes.background}
          />
        ) : null}
      </Drawer>
    </div>
  );
};

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  logo: PropTypes.any,
  color: PropTypes.any,
  image: PropTypes.any,
  routes: PropTypes.any,
  location: PropTypes.any,
  handleDrawerToggle: PropTypes.any,
  open: PropTypes.bool,
  rtlActive: PropTypes.bool,
};

export default withStyles(sidebarStyle)(Sidebar);
