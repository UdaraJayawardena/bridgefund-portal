/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
/**************/

// core components
import GridItem from 'components/initiation/Grid/GridItem.jsx';
import GridContainer from 'components/initiation/Grid/GridContainer.jsx';

import { TableContainer, Table, TableBody, TableHead, TableRow, Paper, IconButton } from "@material-ui/core";
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Box from '@material-ui/core/Box';
import { displayNotification } from 'store/initiation/actions/Notifier';
import LogViewTable from './LogsViewTable';
import Card from 'components/initiation/Card/Card';
import MuiTableCell from "@material-ui/core/TableCell";

const TableCell = withStyles({
  root: {
    borderBottom: "none"
  }
})(MuiTableCell);

class SelectionTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedContractId: '',
    };
  }

  selectTaskData = (id, parent) => {
    const selectedData = this.filterSelectedData(id, parent);
    this.setState({ selectedContractId: id, selectedData });
  }

  filterSelectedData = (selectedId, parent) => {
    const { tableData } = this.props;
    return tableData.filter(log => log.businessKey === selectedId && this.state.customerGroup[parent][selectedId].includes(log.id));
  }

  static getDerivedStateFromProps(nextProps, prevState) {

    const { tableData } = nextProps;

    if (

      (tableData && tableData.length != 0 && nextProps.setContractId !== prevState.setContractId)
    ) {

      let selectedCustomer = '';

      const groupedData = {};
      tableData.forEach(log => {
        const customer = log.processIdentifierKeys.customerLegalName || log.processIdentifierKeys.customerId || 'Unknown Customer';
        if (Object.prototype.hasOwnProperty.call(groupedData, customer)) {

          if (Object.prototype.hasOwnProperty.call(groupedData[customer], log.businessKey)) {
            groupedData[customer][log.businessKey].push(log.id);
          }
          else {
            const idList = [];
            idList.push(log.id);
            groupedData[customer][log.businessKey] = idList;
          }
        }
        else {
          const newCustomer = { [log.businessKey]: [log.id] };
          groupedData[customer] = newCustomer;

        }

      });

      selectedCustomer = selectedCustomer === '' ? Object.keys(groupedData)[0] : selectedCustomer;

      const cusBusinessKey = Object.keys(groupedData[selectedCustomer])[0];
      const selectedData = tableData.filter(log => log.businessKey === cusBusinessKey && groupedData[selectedCustomer][cusBusinessKey].includes(log.id));

      return { ['customer-id' + 0]: true, customerGroup: groupedData, selectedContractId: cusBusinessKey, selectedData, setContractId: nextProps.setContractId };
    }

  }

  selectionData = () => {
    const { classes } = this.props;
    const rows = [];
    const customerGroup = this.state.customerGroup;
    Object.keys(customerGroup).map((parent, index) => {
      rows.push(
        <TableRow id={'customer-id' + index} key={`parent_${parent.replace(' ', '_')}_${index}`} className={classes.tableRow}>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => this.setState({ ['customer-id' + index]: this.state['customer-id' + index] === true ? false : true })}>
              {this.state['customer-id' + index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell className={classes.tableCell}><b>{parent !== '' ? parent : "UNKNOWN"}</b></TableCell>
        </TableRow>
      );
      rows.push(Object.keys(customerGroup[parent]).map((businessKey, count) => {
        return (
          <TableRow key={`${parent.replace(' ', '_')}_${businessKey}_${count}`} hover classes={{ hover: classes.hover, selected: classes.selected }} className={classes.tableRow}>
            <TableCell onClick={() => this.selectTaskData(businessKey, parent)} className={classes.tableCell} style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
              <Collapse in={this.state['customer-id' + index]} timeout="auto" unmountOnExit>
                <Box margin={1}>
                  {businessKey}
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        );
      }));
      return rows;
    });

    return rows;
  }

  render() {
    const { classes, tableData, tableHeaderColor } = this.props;

    const customerGroup = this.state.customerGroup;

    if (tableData === undefined || tableData.length === 0 || (customerGroup === undefined)) {

      return false;
    }

    return (
      <div className={classes.container}>
        <div className={classes.tableWrapper}>
          <div className={classes.leftpane}>
            <Card>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                        <TableRow>
                          <TableCell >#</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.selectionData()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </GridItem>
              </GridContainer>
            </Card>
          </div>
          <div className={classes.rightpane}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>

                <LogViewTable
                  tableHeaderColor="gray"
                  logViewData={this.state.selectedData}
                  selectedId={this.state.selectedContractId} />
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </div>
    );
  }
}
SelectionTable.defaultProps = {
  tableHeaderColor: "gray"
};
SelectionTable.propTypes = {
  classes: PropTypes.object.isRequired,
  tableData: PropTypes.array,
  logData: PropTypes.array,
  displayNotification: PropTypes.func.isRequired,
  logViewData: PropTypes.array,
  selectedId: PropTypes.string,
  tableHeaderColor: PropTypes.oneOf([
    "info",
    "gray"
  ]),
  setContractId: PropTypes.string
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  };
};

const SelectionTableComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(SelectionTable));

export default SelectionTableComponent;

