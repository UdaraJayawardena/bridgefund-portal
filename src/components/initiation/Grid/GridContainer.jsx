/* eslint-disable react/prop-types */
import React from "react";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Classnames from "classnames";

const style = {
  grid: {
    margin: "0 -15px !important",
    width: "unset"
  }
};

function GridContainer(props) {
  const { classes, children, className, ...rest } = props;
  const GridContainerClass = Classnames({
    [classes.grid]: className === undefined,
    [className]: className !== undefined
  });
  return (
    <Grid container {...rest} className={GridContainerClass}>
      {children}
    </Grid>
  );
}

export default withStyles(style)(GridContainer);
