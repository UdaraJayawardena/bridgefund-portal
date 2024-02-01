import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";

import Classnames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@material-ui/core";

import { DDstatus } from "constants/loanmanagement/sme-loan-repayment-direct-debits"

import Util from "lib/loanmanagement/utility";
import GridContainer from "components/loanmanagement/Grid/GridContainer";
import GridItem from "components/loanmanagement/Grid/GridItem";

class DirectDebit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      statusFilter: "all-processed",

      order: "desc",
      orderBy: "plannedDate",
    };
  }

  handleRequestSort = (property, event) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });

    if (event.target.name === "statusFilter" && event.target.value !== DDstatus.OPEN) {
      this.setState({ order: "desc", orderBy: "plannedDate", })
    }
    else if (event.target.name === "statusFilter" && event.target.value === DDstatus.OPEN) {
      this.setState({ order: "asc", orderBy: "plannedDate", })
    }
  };

  getStatusCount = () => {
    const statusCount = {};

    for (const key of Object.keys(DDstatus)) {
      statusCount[key] = this.props.directDebits.filter(dd => dd.status === DDstatus[key]).length;
    }

    statusCount["all-processed"] = this.props.directDebits.filter(dd => moment(dd.plannedDate).isSameOrBefore(moment(), 'day')).length;
    statusCount["manually-settled"] = this.props.directDebits.filter(dd => dd.statusHistory.find(history => history.status === 'manually-settled') !== undefined).length;

    return statusCount;
  };

  getRowClass = (status, statusHistory) => {
    const { classes } = this.props;
    const rowClass = Classnames({
      [classes["directDebitRow_Green"]]: status === DDstatus.PAID,
      [classes["directDebitRow_Orange"]]: status !== DDstatus.PAID,
      [classes["directDebitRow_Blue"]]: statusHistory
        .find(history => history.status === 'manually-settled') !== undefined
    });
    return rowClass;
  }

  getCellClass = (status) => {
    const { classes } = this.props;
    const cellClass = Classnames({
      [classes.directdebitRowCell]: true,
      [classes["whiteFont"]]: status === DDstatus.PAID,
      [classes["blackFont"]]: status !== DDstatus.PAID,
    });
    return cellClass;
  }

  get filteredData() {
    let directDebits = this.props.directDebits;

    if (this.state.statusFilter && this.state.statusFilter === "all-processed") {
      directDebits = directDebits.filter(dd => moment(dd.plannedDate).isSameOrBefore(moment(), 'day'));
    }

    else if (this.state.statusFilter && this.state.statusFilter === "manually-settled") {
      directDebits = directDebits.filter(dd => dd.statusHistory.find(history => history.status === 'manually-settled') !== undefined);
    }

    else if (this.state.statusFilter) directDebits = directDebits.filter(dd => dd.status === this.state.statusFilter);

    return directDebits;
  };

  render() {
    const { classes } = this.props;

    return (
      <div>

        <GridContainer>
          <GridItem xs={12} sm={6} md={3} lg={3}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="status-filter">Status</InputLabel>
              <Select
                value={this.state.statusFilter}
                onChange={this.handleChange}
                inputProps={{
                  name: 'statusFilter',
                  id: 'status-filter',
                }}
                className={classes.selectEmpty}
              >
                <MenuItem value="">
                  <em>All ({this.props.directDebits.length})</em>
                </MenuItem>
                <MenuItem value="all-processed">
                  <em>all-processed ({this.getStatusCount()["all-processed"]})</em>
                </MenuItem>
                <MenuItem value="manually-settled">
                  <em>manually-settled ({this.getStatusCount()["manually-settled"]})</em>
                </MenuItem>
                {
                  Object.keys(DDstatus).map((key, index) => (
                    <MenuItem key={index} value={DDstatus[key]}>{DDstatus[key]} ({this.getStatusCount()[key]})</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </GridItem>
        </GridContainer>

        <Paper className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow className={classes.tableHeaderRow}>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'termNumber'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'termNumber')}>
                    Our Reference
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'plannedDate'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'plannedDate')}>
                    Planned Date
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'type'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'type')}>
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel>
                    Description
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'amount'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'amount')}>
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'status'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'status')}>
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeaderCell}>
                  <TableSortLabel
                    active={this.state.orderBy === 'newBalanceAmount'}
                    // @ts-ignore
                    direction={this.state.order}
                    onClick={this.handleRequestSort.bind(this, 'newBalanceAmount')}>
                    New Balance
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                Util.stableSort(this.filteredData, Util.getSorting(this.state.order, this.state.orderBy))
                  .map(directDebit => (
                    <TableRow key={directDebit._id} className={this.getRowClass(directDebit.status, directDebit.statusHistory)}>
                      <TableCell className={this.getCellClass(directDebit.status)}>{directDebit.ourReference}</TableCell>
                      <TableCell className={this.getCellClass(directDebit.status)}>{moment(directDebit.plannedDate).format("DD-MM-YYYY")}</TableCell>
                      <TableCell className={this.getCellClass(directDebit.status)}>{directDebit.type}</TableCell>
                      <TableCell className={this.getCellClass(directDebit.status)}>{directDebit.description}</TableCell>
                      <TableCell className={this.getCellClass(directDebit.status)}>{Util.currencyConverter()(directDebit.amount)}</TableCell>
                      <Tooltip
                        title={
                          <React.Fragment>
                            <table className={classes.tooltipTable}>
                              <thead>
                                <tr>
                                  <th className={classes.tooltipTableHeadCell}>date</th>
                                  <th className={classes.tooltipTableHeadCell}>status</th>
                                  <th className={classes.tooltipTableHeadCell}>reason</th>
                                  <th className={classes.tooltipTableHeadCell}>statement</th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  directDebit.statusHistory.map(history => (
                                    <tr key={history._id}>
                                      <td className={classes.tooltipTableBodyCell}>{moment(history.createdAt).format("DD-MM-YYYY")}</td>
                                      <td className={classes.tooltipTableBodyCell}>{history.status}</td>
                                      <td className={classes.tooltipTableBodyCell}>{history.reason}</td>
                                      <td className={classes.tooltipTableBodyCell}>{history.statement}</td>
                                    </tr>
                                  ))
                                }
                              </tbody>
                            </table>
                          </React.Fragment>
                        }
                      >
                        <TableCell className={this.getCellClass(directDebit.status)}>{directDebit.status}</TableCell>
                      </Tooltip>
                    <TableCell className={this.getCellClass(directDebit.status)}>{directDebit.newBalanceAmount ? Util.currencyConverter()(directDebit.newBalanceAmount) : '-'}</TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

DirectDebit.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    directDebits: state.smeLoanTransaction.directdebits,
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(DirectDebit));
