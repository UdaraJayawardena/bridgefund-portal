import React, { Component } from 'react';
import PropTypes from "prop-types";

import withStyles from "@material-ui/core/styles/withStyles";

import {
  Table, TableHead, TableRow, TableCell, TableBody
} from "@material-ui/core";

import Util from 'lib/loanmanagement/utility';

import styles from "assets/jss/material-dashboard-react/views/smeLoanRecoveryAppointmentStyles.jsx";

const currency = Util.currencyConverter();

class LoanSetDefault extends Component {
  render() {

    const { loanSeInDefault, classes } = this.props;

    return (
        <Table style={{overflow: 'hidden'}}>
          <TableHead>
          <TableRow>
          <TableCell colSpan={5} style={{fontWeight: 'bold', textAlign: 'center'}}>DEFAULT PROCESSING</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.basicCell}>Contract</TableCell>
              <TableCell className={classes.numberCell}>{loanSeInDefault.contractId}</TableCell>
              <TableCell className={classes.basicCell} colSpan={3}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.headCell} colSpan={2}>Outstanding Normal DD</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell className={classes.headCell} colSpan={2}>Outstanding Special DD</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.basicCell}>Number of Outstanding DD</TableCell>
              <TableCell className={classes.numberCell}>{loanSeInDefault.numberOfOutstandingNormalDirectDebits}</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell className={classes.basicCell}>Number of Outstanding DD</TableCell>
              <TableCell className={classes.numberCell}>{loanSeInDefault.numberOfOutstandingSpecialDirectDebits}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.basicCell}>Missed DD</TableCell>
              <TableCell className={classes.numberCell}>{loanSeInDefault.numberOfMissedNormalDirectDebits}</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell className={classes.basicCell}>Missed DD</TableCell>
              <TableCell className={classes.numberCell}>{loanSeInDefault.numberOfMissedSpecialDirectDebits}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.basicCell}>Daily DD Amount</TableCell>
              <TableCell className={classes.numberCell}>{currency(loanSeInDefault.dailyAmountNormalDirectDebits)}</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell className={classes.basicCell}>Daily DD Amount</TableCell>
              <TableCell className={classes.numberCell}>{currency(loanSeInDefault.dailyAmountSpecialDirectDebits)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.basicCell}>Outstanding Amount</TableCell>
              <TableCell className={classes.numberCell}>{currency(loanSeInDefault.outstandingAmountNormalDirectDebits)}</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell className={classes.basicCell}>Outstanding Amount</TableCell>
              <TableCell className={classes.numberCell}>{currency(loanSeInDefault.outstandingAmountSpecialDirectDebits)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.basicCell}>Total Outstanding</TableCell>
              <TableCell className={classes.numberCell}>{currency(loanSeInDefault.totalOutstandingAmount)}</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell colSpan={2} className={classes.headCell}>DD with status 'sent to bank' included!</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.basicCell}>Total Amount to be provisioned</TableCell>
              <TableCell className={classes.numberCell}>{currency(loanSeInDefault.amountToBePaid)}</TableCell>
              <TableCell className={classes.spaceCell}></TableCell>
              <TableCell className={classes.basicCell}>Number of DD</TableCell>
              <TableCell className={classes.numberCell}>{loanSeInDefault.directDebitsSetToBank}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
    )

  }
}

LoanSetDefault.propTypes = {
  classes: PropTypes.object.isRequired,
  loanSeInDefault: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoanSetDefault);
