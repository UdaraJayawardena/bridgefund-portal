import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";

import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import Utility from "lib/loanmanagement/utility";

import customStyles from 'assets/jss/material-dashboard-react/customStyles';
import { Paper, TableContainer } from '@material-ui/core';

const currencyConvertor = Utility.currencyConverter();

const cellLabels = [
  'Liquidity Begin Balance', 'Planned Principle to Receive', 'Planned Principle Overdue',
  'Liquidity End Balance', 'Monthly Free Fall Planned Direct-Debits'
];

export class LiquidityTableView extends Component {

  constructor(props) {
    super(props);

    const overviewData = this.props.overviewData ? this.props.overviewData : null;

    this.state = {
      overviewData
    };

  }

  generateFreeFallMonthsContent = () => {

    const { classes } = this.props;

    const {
      plannedPrincipleAmountToReceive,
      plannedPrincipleAmountOverdue,
      liquidityEndBalance,
      freeFallPerMonth } = this.state.overviewData;

    const freeFallPerMonth_propertyNames = [
      'liquidityBeginBalanceMonth', 'plannedPrincipleToReceive',
      'plannedPrincipleOverdue', 'liquidityEndBalanceMonth',
      'plannedPrincipleToReceive'
    ];

    const onStartDate = [0, (plannedPrincipleAmountToReceive), (plannedPrincipleAmountOverdue), liquidityEndBalance, plannedPrincipleAmountToReceive];

    const result = [];

    let rowCount = 1;

    for (let index = 0; index < 5; index++) {

      const cells = [];

      /* Description cell */
      cells.push(<TableCell align={'left'} className={classes.miniCell} key={`detail_${cellLabels[index]}`} >{cellLabels[index]}</TableCell>);

      cells.push(<TableCell align={'right'} className={classes.miniCell} key={`detail_${cellLabels[index]}_${index}`} >{currencyConvertor(onStartDate[index].toFixed(2))}</TableCell>);

      cells.push(
        freeFallPerMonth.map((monthData, j) => (
          <TableCell align={'right'} className={classes.miniCell} key={`detail_${cellLabels[index]}_${index}_${j}`} >{currencyConvertor(monthData[freeFallPerMonth_propertyNames[index]].toFixed(2))}</TableCell>
        ))
      );


      result.push(
        <TableRow key={`freeFallMonth_${index}`} style={{ backgroundColor: ((rowCount % 2 === 0) ? "#fff" : "#f5f5f5") }}>
          {cells}
        </TableRow>
      );

      rowCount++;


    }

    return result;

  }

  generateFreeFallLoanContent = () => {

    const { freeFallPerLoan } = this.state.overviewData;
    const { classes } = this.props;

    let result = [];

    if (freeFallPerLoan && (freeFallPerLoan.length > 0)) {

      const liquidityEnd = moment().add(1, 'year').startOf('month').format('YYYY-MM-DD');

      /* get single loan details */
      result = freeFallPerLoan.map((loanData, index) => {

        const rows = [];

        let month = moment().startOf('month').format('YYYY-MM-DD');

        const cell = [];

        /* contractId */
        cell.push(<TableCell align={'left'} className={classes.miniCell} key={`smeLoan_${loanData.contractId}`}>{loanData.contractId}</TableCell>);
        cell.push(<TableCell align={'left'} className={classes.miniCell} key={`smeLoan_${loanData.contractId}_empty`}></TableCell>);

        let count = 0;

        /* get loans' monthly data */
        while (month < liquidityEnd) {

          if ((loanData.monthly[count]) && (month === moment(loanData.monthly[count].month).format('YYYY-MM-DD'))) {
            cell.push(<TableCell align={'right'} className={classes.miniCell} key={`smeLoan_${loanData.contractId}_${index}_${month}`}>{currencyConvertor(loanData.monthly[count].value.toFixed(2))}</TableCell>);
            count++;

          } else {

            cell.push(<TableCell align={'center'} className={classes.miniCell} key={`smeLoan_${loanData.contractId}_${index}_${month}_Nan`}>-</TableCell>);
          }

          month = moment(month).add(1, 'month').format('YYYY-MM-DD');

        }


        rows.push(
          <TableRow key={`freeFallLoan_${loanData.contractId}`}>{cell}</TableRow>
        );

        return rows;

      });

    }

    result.unshift(<TableRow key={'smeLoan_head'}>
      <TableCell>Contract ID</TableCell>
      <TableCell colSpan={13}></TableCell>
    </TableRow>);

    return result;

  }

  render() {

    let tablePart_01 = null;
    let tablePart_02 = null;

    if (this.state.overviewData) {
      tablePart_01 = this.generateFreeFallMonthsContent();
      tablePart_02 = this.generateFreeFallLoanContent();
    }

    return (
      <React.Fragment>
        {/* <GridContainer style={{ overflowX: 'scroll', overflowY: 'hidden' }}> */}
        <TableContainer component={Paper} >
          <Table>
            <TableHead >
              <TableRow key={'tasks_header_description'} >
                <TableCell ></TableCell>
                <TableCell ></TableCell>
                <TableCell colSpan={12} align={'left'}>End of Month : </TableCell>
              </TableRow>
              <TableRow key={'tasks_header'} >
                <TableCell
                  key={0}
                  align={'center'}
                  padding={'none'}
                  style={{ width: '15%', borderRight: '1px solid #e0e0e0e' }}
                >Details     </TableCell>
                <TableCell
                  key={0}
                  align={'center'}
                  padding={'none'}
                  style={{ width: '15%', borderRight: '1px solid #e0e0e0' }}
                >On Start Date</TableCell>
                {
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) =>
                    (<TableCell align={'center'} padding={'none'} style={{ width: '10%', borderRight: '1px solid #e0e0e0' }} key={`cell_${i}`} >{`${i}`}</TableCell>))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {tablePart_01}
              {tablePart_02}
            </TableBody>
          </Table>
          </TableContainer>
        {/* </GridContainer> */}
      </React.Fragment>
    );
  }
}

LiquidityTableView.propTypes = {
  classes: PropTypes.object,
  overviewData: PropTypes.object.isRequired,
};

const mapDispatchToProps = {

};

export default connect(null, mapDispatchToProps)(withStyles(customStyles)(LiquidityTableView));