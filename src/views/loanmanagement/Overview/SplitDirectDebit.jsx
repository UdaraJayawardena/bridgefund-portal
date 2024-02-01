import { cloneDeep } from 'lodash';
import PropTypes from "prop-types";
import React, { Component } from 'react';
import clx from 'classnames';

import withStyles from '@material-ui/core/styles/withStyles';

import CustomDatePicker from 'components/loanmanagement/CustomDatePicker/CustomDatePicker';
import CustomFormatInput from 'components/loanmanagement/CustomFormatInput/CustomFormatInput';
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';

import { TableRow, TableCell, TableHead, TableBody, TextField, Table, createStyles } from '@material-ui/core';

import util from "lib/loanmanagement/utility";

const EURO = util.currencyConverter();
const CURRENCY = util.multiCurrencyConverter();

const Styles = createStyles({
  tableHeadCell: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    paddingRight: 2,
    padding: 2,
    border: 'none',
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#f5f5f5',
  },
  bold: {
    fontWeight: 'bold'
  },
  alignRight: {
    textAlign: 'end'
  },
  alignCenter: {
    textAlign: 'center'
  },
  numberInput: {
    minWidth: 50,
    width: 50
  },
  amountInput: {
    minWidth: 100,
    width: 100,
    margin: 0
  },
  tableCell: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    paddingRight: 2,
    border: 'none'
  },
});

// splitDdPeriod: {
//   "1": { amount: 0, noOfDD: 0, total: 0 },
//   "2": { amount: 0, noOfDD: 0, total: 0 },
//   "3": { amount: 0, noOfDD: 0, total: 0 },
//   ddStartDate: moment().format('YYYY-MM-DD'),
//   totalNoOfDD: 0,
//   total: 0,
// }

class SplitDirectDebit extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.setDefaultData();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.totalLoanAmount !== this.props.totalLoanAmount ||
      prevProps.plannedNoOfDD !== this.props.plannedNoOfDD
    ) {
      this.setDefaultData();
    }
  }

  setDefaultData = () => {
    const splitDdPeriod = cloneDeep(this.props.splitDdPeriod);
    splitDdPeriod["1"].noOfDD = this.props.plannedNoOfDD;
    splitDdPeriod["1"].amount = util.toFixed(this.props.totalLoanAmount / this.props.plannedNoOfDD);
    splitDdPeriod["1"].total = Number((Number(splitDdPeriod["1"].amount) * Number(splitDdPeriod["1"].noOfDD)).toFixed(2));

    splitDdPeriod.total = Number((splitDdPeriod["1"].total + splitDdPeriod["2"].total + splitDdPeriod["3"].total).toFixed(2));
    splitDdPeriod.totalNoOfDD = Number(Number(splitDdPeriod["1"].noOfDD) + Number(splitDdPeriod["2"].noOfDD) + Number(splitDdPeriod["3"].noOfDD));
    this.props.onChange(splitDdPeriod);
  };

  handleChange = (name, value, period) => {
    const splitDdPeriod = cloneDeep(this.props.splitDdPeriod);
    const { locale, currency } = this.props;

    if (period) {
      splitDdPeriod[period][name] = value;
      splitDdPeriod[period].total = Number((Number(splitDdPeriod[period].noOfDD) * Number(splitDdPeriod[period].amount)).toFixed(2));

      let plannedDdBalance = this.props.plannedNoOfDD;
      let balanceAmount = this.props.totalLoanAmount;

      for (let i = 1; i < 4; i++) {

        if (i > Number(period)) {

          splitDdPeriod[i.toString()].noOfDD = plannedDdBalance;
          splitDdPeriod[i.toString()].amount = plannedDdBalance === 0 ? 0 : Number((balanceAmount / plannedDdBalance).toFixed(2));
          splitDdPeriod[i.toString()].total = Number((Number(splitDdPeriod[i.toString()].noOfDD) * Number(splitDdPeriod[i.toString()].amount)).toFixed(2));
        }
        plannedDdBalance -= Number(splitDdPeriod[i.toString()].noOfDD);
        balanceAmount -= splitDdPeriod[i.toString()].total;
      }

      splitDdPeriod.total = Number((splitDdPeriod["1"].total + splitDdPeriod["2"].total + splitDdPeriod["3"].total).toFixed(2));
      splitDdPeriod.totalNoOfDD = Number((Number(splitDdPeriod["1"].noOfDD) + Number(splitDdPeriod["2"].noOfDD) + Number(splitDdPeriod["3"].noOfDD)).toFixed(2));

      if (splitDdPeriod.totalNoOfDD !== this.props.plannedNoOfDD) {
        this.props.displayNotification('Sum of #DDs is not cannot differ from the planned number of DD', 'warning');
        return;
      }
      if (Math.abs(splitDdPeriod.total - this.props.totalLoanAmount) > (0.01 * this.props.plannedNoOfDD)) {
        this.props.displayNotification(`Difference of total loan amount & Sum of split dd amounts should not exceed ${CURRENCY(0.01 * this.props.plannedNoOfDD, locale, currency)}`, 'warning');
        return;
      }
    }

    this.props.onChange(splitDdPeriod);
  }

  render() {
    const { classes, splitDdPeriod, locale, currency, symbol, decimalSeparator, thousandSeparator } = this.props;

    return (
      <Table id="split-dd-table">
        <TableHead id="split-dd-table-head">
          <TableRow id="split-dd-table-header-row">
            <TableCell id="#dd-label" className={clx(classes.tableHeadCell, classes.bold)}>#DD</TableCell>
            <TableCell id="dd-amount-label" className={clx(classes.tableHeadCell, classes.bold, classes.alignCenter)}>DD-Amount</TableCell>
            <TableCell id="total-label" className={clx(classes.tableHeadCell, classes.bold, classes.alignCenter)}>Total</TableCell>
            <TableCell id="start-label" className={clx(classes.tableHeadCell, classes.bold, classes.alignCenter)}>Start Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell className={clx(classes.tableCell)}>
              <TextField
                type="number"
                id="split-dd-no-of-dd-1"
                name="split-dd-no-of-dd-1"
                className={classes.numberInput}
                value={splitDdPeriod['1'].noOfDD}
                onChange={(e) => this.handleChange('noOfDD', e.target.value, '1')}
              />
            </TableCell>
            <TableCell className={clx(classes.tableCell, classes.alignRight)}>
              <MultiCurrencyCustomFormatInput
                type="text"
                id="split-dd-dd-amount-1"
                name="split-dd-dd-amount-1"
                numberformat={splitDdPeriod['1'].amount}
                className={classes.amountInput}
                symbol={symbol}
                decimalSeparator={decimalSeparator}
                thousandSeparator={thousandSeparator}
                changeValue={(val) => this.handleChange('amount', val, '1')}
              />
            </TableCell>
            <TableCell id="split-dd-table-split-period-1-total" className={clx(classes.tableCell, classes.alignRight)}>
              {CURRENCY(splitDdPeriod['1'].total, locale, currency)}
            </TableCell>
            <TableCell className={clx(classes.tableCell)}><CustomDatePicker label="" name="ddStartDate" value={splitDdPeriod.ddStartDate} onChange={this.props.handleDatePicker} /></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={clx(classes.tableCell)}>
              <TextField
                type="number"
                id="split-dd-no-of-dd-2"
                name="split-dd-no-of-dd-2"
                value={splitDdPeriod['2'].noOfDD}
                className={classes.numberInput}
                onChange={(e) => this.handleChange('noOfDD', e.target.value, '2')}
              />
            </TableCell>
            <TableCell className={clx(classes.tableCell, classes.alignRight)}>
              <MultiCurrencyCustomFormatInput
                type="text"
                id="split-dd-dd-amount-2"
                name="split-dd-dd-amount-2"
                numberformat={splitDdPeriod['2'].amount}
                className={classes.amountInput}
                symbol={symbol}
                decimalSeparator={decimalSeparator}
                thousandSeparator={thousandSeparator}
                changeValue={(val) => this.handleChange('amount', val, '2')}
              />
            </TableCell>
            <TableCell id="split-dd-table-split-period-2-total" className={clx(classes.tableCell, classes.alignRight)}>{CURRENCY(splitDdPeriod['2'].total, locale, currency)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={clx(classes.tableCell)}>
              <TextField
                id="split-dd-no-of-dd-3"
                type="number"
                className={classes.numberInput}
                value={splitDdPeriod['3'].noOfDD}
                onChange={(e) => this.handleChange('noOfDD', e.target.value, '3')}
              />
            </TableCell>
            <TableCell className={clx(classes.tableCell, classes.alignRight)}>
              <MultiCurrencyCustomFormatInput
                type="text"
                id="split-dd-dd-amount-3"
                name="split-dd-dd-amount-3"
                numberformat={splitDdPeriod['3'].amount}
                className={classes.amountInput}
                symbol={symbol}
                decimalSeparator={decimalSeparator}
                thousandSeparator={thousandSeparator}
                changeValue={(val) => this.handleChange('amount', val, '3')}
              />
            </TableCell>
            <TableCell id="split-dd-table-split-period-3-total" className={clx(classes.tableCell, classes.alignRight)}>{CURRENCY(splitDdPeriod['3'].total, locale, currency)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={clx(classes.tableCell)}>&nbsp;</TableCell>
            <TableCell className={clx(classes.tableCell)}>&nbsp;</TableCell>
            <TableCell id="split-dd-table-total" className={clx(classes.tableCell, classes.bold, classes.alignRight)}>{CURRENCY(splitDdPeriod.total, locale, currency)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}


SplitDirectDebit.propTypes = {
  classes: PropTypes.object.isRequired,
  splitDdPeriod: PropTypes.object.isRequired,
  plannedNoOfDD: PropTypes.number.isRequired,
  totalLoanAmount: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  displayNotification: PropTypes.func,
  handleDatePicker: PropTypes.func,
  symbol: PropTypes.string,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string,
  locale: PropTypes.string,
  currency: PropTypes.string,
};

export default (withStyles(Styles)(SplitDirectDebit));