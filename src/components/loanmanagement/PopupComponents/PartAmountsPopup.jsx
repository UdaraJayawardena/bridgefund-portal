import React from 'react';
import PropTypes from 'prop-types'
import { createStyles } from '@material-ui/core';
import withStyles from "@material-ui/core/styles/withStyles";
import util from 'lib/loanmanagement/utility';

const EURO = util.currencyConverter();
const CURRENCY = util.multiCurrencyConverter();
const Styles = createStyles({
  toolTipTable: {
    border: '1px solid white',
    borderCollapse: 'collapse'
  },
  toolTipHead: {
    border: '1px solid white',
    fontSize: '12pt',
    fontWeight: 'bold',
    padding: 3,
    textAlign: 'start'

  },
  toolTipCell: {
    border: '1px solid white',
    fontSize: '10pt',
    padding: 3,
    textAlign: 'end'
  },
});

const PartAmountsPopup = ({ classes, transaction ,locale,currency}) => {

  return (
    <React.Fragment>
      <table className={classes.toolTipTable}>
        <tbody>
          <tr>
            <th className={classes.toolTipHead}>Principle Amount Part</th>
            <th className={classes.toolTipCell}>{CURRENCY(transaction.principleAmountPart,locale,currency)}</th>
          </tr>
          <tr>
            <th className={classes.toolTipHead}>Initial Cost Amount Part</th>
            <th className={classes.toolTipCell}>{CURRENCY(transaction.initialCostAmountPart,locale,currency)}</th>
          </tr>
          <tr>
            <th className={classes.toolTipHead}>Interest Amount Part</th>
            <th className={classes.toolTipCell}>{CURRENCY(transaction.interestAmountPart,locale,currency)}</th>
          </tr>
          <tr>
            <th className={classes.toolTipHead}>Recurring Cost Amount Part</th>
            <th className={classes.toolTipCell}>{CURRENCY(transaction.recurringCostAmountPart,locale,currency)}</th>
          </tr>
        </tbody>
      </table>
    </React.Fragment>
  );
}

PartAmountsPopup.defaultProps = {
  transaction: {}
}

PartAmountsPopup.propTypes = {
  classes: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
};

export default (withStyles(Styles)(PartAmountsPopup));