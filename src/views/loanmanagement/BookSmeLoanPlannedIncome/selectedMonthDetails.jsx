import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
// import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Util from 'lib/loanmanagement/utility';
import { getLocales } from "store/initiation/actions/Configuration.action";
const currency = Util.multiCurrencyConverter();

// const useRowStyles = makeStyles({
//   root: {
//     '& > *': {
//       borderBottom: 'unset',
//     },
//   },
// });

export default function SelectedMonthDetails(props) {
    
    const {currencyVal, locale} = props

    return (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell align="left">{moment().set('M', (props.selectMonthData.month-1)).set('year', props.selectMonthData.year).format('MMMM YYYY')}</TableCell>
                <TableCell align="right">Initial fee</TableCell>
                <TableCell align="right">Interest income</TableCell>
                <TableCell align="right">Other income</TableCell>
                <TableCell align="right">Claim/Penalty</TableCell>
                <TableCell align="right">Total Income</TableCell>
                <TableCell align="right">Margin  Free fall</TableCell>
                <TableCell align="right">Discount</TableCell>
                <TableCell align="right">Refinance-Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            <TableRow key="cat1">
                <TableCell align="right" style={{fontWeight: "500"}}>Outstanding Loans</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat1.summary)?currency(props.selectMonthData.cat1.summary.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat1.summary)?currency(props.selectMonthData.cat1.summary.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat1.summary)?currency(props.selectMonthData.cat1.summary.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat1.summary)?currency(props.selectMonthData.cat1.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat1.summary)?currency(props.selectMonthData.cat1.summary.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right"></TableCell>
            </TableRow>
            <TableRow key="cat2">
                <TableCell align="right" style={{fontWeight: "500"}}>Refinanced Loans</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat2.summary)?currency(props.selectMonthData.cat2.summary.refinancedAmount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
            </TableRow>
            <TableRow key="cat3">
                <TableCell align="right" style={{fontWeight: "500"}}>Redeemed Loans</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat3.summary)?currency(props.selectMonthData.cat3.summary.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right"></TableCell>
            </TableRow>
            <TableRow key="cat3">
                <TableCell align="right" style={{fontWeight: "500"}}>Default Loans</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat4.summary)?currency(props.selectMonthData.cat4.summary.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat4.summary)?currency(props.selectMonthData.cat4.summary.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat4.summary)?currency(props.selectMonthData.cat4.summary.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat4.summary)?currency(props.selectMonthData.cat4.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat4.summary)?currency(props.selectMonthData.cat4.summary.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right">{(props.selectMonthData.cat4.summary)?currency(props.selectMonthData.cat4.summary.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right"></TableCell>
            </TableRow>
            <TableRow key="TotalSelectedMonth" style={{fontWeight: "500"}}>
                <TableCell align="left" style={{fontWeight: "500"}}>Totals {moment().set('M', (props.selectMonthData.month-1)).set('year', props.selectMonthData.year).format('MMMM')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right" style={{fontWeight: "500"}}>{currency(props.totalrow.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                <TableCell align="right"></TableCell>
                
            </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      );
  }

  SelectedMonthDetails.propTypes = {
    selectMonthData: PropTypes.object.isRequired,
    totalrow: PropTypes.object.isRequired
  };
