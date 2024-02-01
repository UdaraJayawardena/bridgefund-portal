import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Link } from 'react-router-dom';
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
/*** CFO Imports */
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import TableHead from '@material-ui/core/TableHead';
/**************/
// core components
import tasksStyle from "assets/jss/material-dashboard-react/components/tasksStyle.jsx";

class Trends extends React.Component {
  state = {
    checked: this.props.checkedIndexes
  };
  handleToggle = value => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked
    });
  };
  render() {
    const { classes, trends, rtlActive } = this.props;
    const tableCellClasses = classnames(classes.tableCell, {
      [classes.tableCellRTL]: rtlActive
    })

    return (
      <Table className={classes.table}>
        <TableHead className={classes.tableRow}>
          <TableRow key={'tasks_header'} className={classes.tableRow}>
            <TableCell className={tableCellClasses}>
              {'Customer'}
            </TableCell>
            <TableCell className={tableCellClasses}>
              {'Percentage Behind'}
            </TableCell>
            <TableCell className={tableCellClasses}>
              {'Trend'}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trends.map((trend, key) => (
            <TableRow key={trend.customerId + '-' + key} className={classes.tableRow}>

              <TableCell className={tableCellClasses}>
                <Link to={`smeProfile/${trend.smeId}`} >
                  {trend.customerName}
                </Link>
              </TableCell>

              <TableCell className={tableCellClasses}>
                {trend.percentageBehind.toFixed(1)}%
              </TableCell>

              <TableCell className={classes.tableActions}>

                {trend.trend === 'up' ? (
                  <ArrowUpward
                    className={
                      classes.upArrowCardCategory + " " + classes.successText
                    }
                  />
                ) : (
                    <ArrowDownward
                      className={
                        classes.upArrowCardCategory + " " + classes.successText
                      }
                    />
                  )}

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

Trends.propTypes = {
  classes: PropTypes.object.isRequired,
  tasksIndexes: PropTypes.arrayOf(PropTypes.number),
  trends: PropTypes.array,
  checkedIndexes: PropTypes.array,
  rtlActive: PropTypes.bool
};

export default withStyles(tasksStyle)(Trends);
