import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
/*** CFO Icons */
import Info from "@material-ui/icons/Info";
import TableHead from '@material-ui/core/TableHead';
import { Link } from 'react-router-dom';

/**************/
// core components
import tasksStyle from "assets/jss/material-dashboard-react/components/tasksStyle.jsx";

class EventLog extends React.Component {
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

  get getErrorPaymentCount() {
    let errorPaymentCount = 0;
    return errorPaymentCount;
  }
  get getPaidPaymentCount() {
    let paidPaymentCount = 0;
    return paidPaymentCount;
  }

  render() {
    const { classes, tasksIndexes, tasks, rtlActive } = this.props;
    const tableCellClasses = classnames(classes.tableCell, {
      [classes.tableCellRTL]: rtlActive
    })

    return (
      <Table className={classes.table}>
        <TableHead className={classes.tableRow}>
          <TableRow key={'tasks_header'} className={classes.tableRow}>
            <TableCell className={tableCellClasses}>
              {'Date'}
            </TableCell>
            <TableCell className={tableCellClasses}>
              {'Customer'}
            </TableCell>
            <TableCell className={tableCellClasses}>
              {'Message'}
            </TableCell>
            <TableCell className={tableCellClasses}>
              {'Priority'}
            </TableCell>
            <TableCell className={tableCellClasses}>
              {''}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasksIndexes.map((value, key) => tasks[value] && (
            <TableRow key={tasks[value]._id + '-' + key} className={classes.tableRow}>

              <TableCell className={tableCellClasses}>
                {tasks[value].createdAt}
              </TableCell>

              <TableCell className={tableCellClasses}>
                <Link to={`smeProfile/${tasks[value].customerId}`} >
                  {tasks[value].customerName}
                </Link>
              </TableCell>

              <TableCell className={tableCellClasses}>
                {tasks[value].message}
              </TableCell>

              <TableCell className={tableCellClasses}>
                {tasks[value].priority === 3 ? "Panic" : tasks[value].priority === 2 ? "High" : "Medium"}
              </TableCell>

              <TableCell className={classes.tableActions}>
                <Tooltip
                  id="tooltip-top-start"
                  title={<div>
                    <p>
                      Total No of errors:{' '}
                      {this.getErrorPaymentCount === undefined
                        ? 0
                        : this.getErrorPaymentCount}
                    </p>
                    <p>
                      Total No of payments:{' '}
                      {this.getPaidPaymentCount === undefined
                        ? 0
                        : this.getPaidPaymentCount}
                    </p>
                  </div>}
                  placement="top"
                  classes={{ tooltip: classes.tooltip }}
                >
                  <IconButton
                    aria-label="Info"
                    className={classes.tableActionButton}
                  >
                    <Info
                      className={
                        classes.tableActionButtonIcon + " " + classes.info
                      }
                    />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

EventLog.propTypes = {
  classes: PropTypes.object.isRequired,
  tasks: PropTypes.array,
  checkedIndexes: PropTypes.array,
  tasksIndexes: PropTypes.arrayOf(PropTypes.number),
  rtlActive: PropTypes.bool
};

export default (withStyles(tasksStyle)(EventLog));
