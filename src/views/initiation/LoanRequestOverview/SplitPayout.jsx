import { cloneDeep } from 'lodash';
import PropTypes from "prop-types";
import React, { Component } from 'react';
import clx from 'classnames';

import withStyles from '@material-ui/core/styles/withStyles';

import CustomFormatInput from 'components/initiation/CustomFormatInput/CustomFormatInput';

import { createStyles, IconButton, Select, MenuItem } from '@material-ui/core';

import {toFixed} from "lib/initiation/utility";

import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { Add, Remove } from '@material-ui/icons';

const TOFIXED = toFixed;

const Styles = createStyles({
  bold: {
    fontWeight: 'bold'
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
  tableCellValue: {
    marginLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    paddingRight: 2,
    border: 'none'
  },
  marginTop: {
    marginTop: 10
  },
  marginBottom: {
    marginBottom: 10
  },
  iconButton: {
    padding: 5
  }
});

class SplitPayout extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidUpdate(prevProps) {

    if (prevProps.principalAmount !== this.props.principalAmount) {
      this.refreshInitialData();
    }
  }

  refreshInitialData = () => {
    const splitPayout = {
      isRefinancePayment: this.props.splitPayout.isRefinancePayment,
      first: this.props.principalAmount,
      others: []
    };

    this.props.onChange(splitPayout);
  }

  handleNumberChange = (name, value, index) => {
    const splitPayout = cloneDeep(this.props.splitPayout);
    const principalAmount = this.props.principalAmount;
    value = value === '' ? null : Number(value);

    if (name === 'toSme') {

      if (Number(value) > principalAmount) return this.props.displayNotification('To SME cannot exceed the principal amount', 'warning');

      splitPayout.first = TOFIXED(value);
      if (splitPayout.isRefinancePayment) splitPayout.others = [TOFIXED(this.props.principalAmount - Number(splitPayout.first))];
    }

    if (name === 'thirdPartyAmount') {
      let remains = TOFIXED(principalAmount - Number(splitPayout.first));
      let spliceStartFrom = -1;

      for (let i = 0; i < splitPayout.others.length; i++) {

        if (i === index) {

          if (Number(value) > remains)
            return this.props.displayNotification('Sum of amounts cannot be greater than the principal amount.', 'warning');

          splitPayout.others[i] = value;
        }
        if (i > index) {
          spliceStartFrom = i;
          break;
        }
        remains = TOFIXED(remains - Number(splitPayout.others[i]));
      }

      if (spliceStartFrom > -1) {
        splitPayout.others.splice(spliceStartFrom);
      }

      if (remains > 0) splitPayout.others.push(remains);/* If last add a row  */
    }

    this.props.onChange(splitPayout);
  };

  handleSwitch = (name, value) => {
    const splitPayout = cloneDeep(this.props.splitPayout);

    if (name === 'isRefinancePayment') {

      splitPayout.isRefinancePayment = value;

      if (value) {
        splitPayout.others = [0];
      } else {
        splitPayout.first = this.props.principalAmount;
        splitPayout.others = [];
      }
    }

    this.props.onChange(splitPayout);
  }

  handleBlur = (name, value, index) => {

    if (name === 'thirdPartyAmount') {
      const splitPayout = cloneDeep(this.props.splitPayout);
      const nullIndex = splitPayout.others.findIndex(amount => amount === null);

      if (nullIndex > -1 && index !== splitPayout.others.length - 1) {
        splitPayout.others.splice(nullIndex, 1);
        this.props.onChange(splitPayout);
      }
    }
  }

  addThirdPartyAmount = () => {
    const splitPayout = cloneDeep(this.props.splitPayout);
    splitPayout.others.push(this.currentThirdPartyAmount);
    this.props.onChange(splitPayout);
  };
  removeThirdPartyAmount = () => {
    const splitPayout = cloneDeep(this.props.splitPayout);
    splitPayout.others.pop();
    splitPayout.others = this.recalculateThirdPartAmount(splitPayout);
    this.props.onChange(splitPayout);
  };

  recalculateThirdPartAmount = (splitPayout) => {
    let remains = TOFIXED(this.props.principalAmount - Number(splitPayout.first));

    splitPayout.others.forEach((amount, index) => {
      if (splitPayout.others.length - 1 === index) {
        splitPayout.others[index] = remains;
      }
      else remains = TOFIXED(remains - amount);
    });

    return splitPayout.others;
  };

  get currentThirdPartyAmount() {
    const { principalAmount, splitPayout } = this.props;
    return TOFIXED(principalAmount - Number(splitPayout.first) - splitPayout.others.reduce((a, cv) => { return a + Number(cv); }, 0));
  }

  render() {
    const { classes, splitPayout } = this.props;

    return (
      <GridContainer >
        <GridItem className={classes.marginTop}>
          <span className={clx(classes.tableCell, classes.bold)}>Refinance</span>
          <span className={clx(classes.tableCellValue, classes.bold)}>
            <Select
              value={splitPayout.isRefinancePayment}
              inputProps={{
                name: "isRefinancePayment",
                id: "is-refinance-payment"
              }}
              onChange={(e) => this.handleSwitch('isRefinancePayment', e.target.value)}
            >
              <MenuItem value={1}>YES</MenuItem>
              <MenuItem value={0}>NO</MenuItem>
            </Select></span>
        </GridItem>
        <GridItem className={classes.marginTop}>
          <span className={clx(classes.tableCell, classes.bold)}>Refinanced Contract</span>
          <span className={clx(classes.tableCellValue, classes.bold)}>
            <CustomFormatInput
              type="text"
              id="toSme"
              name="toSme"
              //numberformat={splitPayout.first}
              className={classes.amountInput}
              //changeValue={(val) => this.handleNumberChange('toSme', val)}
              readOnly={!this.props.splitPayout.isRefinancePayment}
            />
          </span>
        </GridItem>
        <GridItem className={classes.marginTop}>
          {splitPayout.others.map((ttpAmount, index) => (
            <div key={index} className={classes.marginBottom}>
              <span className={clx(classes.tableCell, classes.bold)}>To Third Party</span>
              <span className={clx(classes.tableCellValue, classes.bold)}>
                <CustomFormatInput
                  type="text"
                  id={`third-party-amount-${index}`}
                  name={`third-party-amount-${index}`}
                  numberformat={ttpAmount}
                  className={classes.amountInput}
                  changeValue={(val) => this.handleNumberChange('thirdPartyAmount', val, index)}
                  onBlur={(val) => this.handleBlur('thirdPartyAmount', val, index)}
                />
              </span>
              {index === 0 && <span><IconButton className={classes.iconButton} onClick={this.addThirdPartyAmount}><Add color="primary" /></IconButton></span>}
              {index !== 0 && splitPayout.others.length === index + 1 && <span><IconButton className={classes.iconButton} onClick={this.removeThirdPartyAmount}><Remove color="secondary" /></IconButton></span>}
            </div>
          ))}
        </GridItem>
      </GridContainer>
    );
  }
}

SplitPayout.defaultProps = {
  principalAmount: 0,
  splitPayout: {
    isRefinancePayment: 0,
    first: 0,
    others: []
  }
};

SplitPayout.propTypes = {
  classes: PropTypes.object,
  splitPayout: PropTypes.object,
  principalAmount: PropTypes.number,
  onChange: PropTypes.func,
  displayNotification: PropTypes.func,
};

export default (withStyles(Styles)(SplitPayout));