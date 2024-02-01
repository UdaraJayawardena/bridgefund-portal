// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
// import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Util from 'lib/loanmanagement/utility';
const currency = Util.multiCurrencyConverter();

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});


function Row(props) {
  const { row, currencyVal, locale } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root} onClick={() => setOpen(!open)} style={{cursor:"pointer"}}>
        <TableCell align="left" style={{fontWeight: "500"}}>
          {/* <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton> */}
          {moment().set('M', (row.month-1)).set('year', row.year).format('MMMM YYYY')}
        </TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.cat1.summary)?currency(row.cat1.summary.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>NORMAL LOANS</TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Begin-Date</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Initial-Fee</TableCell>
                    <TableCell align="right" >Interest-Income</TableCell>
                    <TableCell align="right" >Other income</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                    <TableCell align="right" >Total Income</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {(row.drilldown.normalloans.length > 0)?
                  row.drilldown.normalloans.map((sdr,index) => (
                    (row.drilldown.normalloans.length === index + 1)?
                    <TableRow key={index}>
                      <TableCell style={{fontWeight:"600"}}>Totals</TableCell>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    :
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.beginDate)?moment(sdr.beginDate).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell>{(sdr.maturityDate)?moment(sdr.maturityDate).format('DD-MM-YYYY'):''}</TableCell>
                      {/* <TableCell align="right" >{currency(sdr.principle)}</TableCell> */}
                      <TableCell align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    
                    
                  ))
                  :
                  <TableRow key={`NormalLoansNotAwilablefor`}>
                      <TableCell colSpan={11}><h4 style={{color:"red", textAlign:"center"}}>Normal Loans Not Available</h4></TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function FirstMonthRow(props) {
  const { row, currencyVal, locale, countryName } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root} onClick={() => setOpen(!open)} style={{cursor:"pointer"}}>
        <TableCell align="left" style={{fontWeight: "500"}}>
          {moment().set('M', (row.month-1)).set('year', row.year).format('MMMM YYYY')}
        </TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'GBP'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              {/* normal loan */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>FIXED LOANS <br></br> {countryName} </TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Begin-Date</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Initial-Fee</TableCell>
                    <TableCell align="right" >Interest-Income</TableCell>
                    <TableCell align="right" >Other income</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                    <TableCell align="right" >Total Income</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(row.drilldown.normalloans.length > 0)?
                  row.drilldown.normalloans.map((sdr,index) => (
                    (row.drilldown.normalloans.length === index + 1)?
                    <TableRow key={index}>
                      <TableCell style={{fontWeight:"600"}}>Totals</TableCell>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    :
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.beginDate)?moment(sdr.beginDate).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell>{(sdr.maturityDate)?moment(sdr.maturityDate).format('DD-MM-YYYY'):''}</TableCell>
                      {/* <TableCell align="right" >{currency(sdr.principle)}</TableCell> */}
                      <TableCell align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    
                    
                  ))
                    :
                    <TableRow key="selectedLoanNormalLoansNotAwilable">
                      <TableCell colSpan={11}><h4 style={{color:"red", textAlign:"center"}}>Fixed Loans Not Available</h4></TableCell>
                    </TableRow>
                }
                </TableBody>
              </Table>

              {/* refinance loan */}
              <Table style={{marginTop: "30px"}}>
                <TableHead>
                  <TableRow>
                    <TableCell>REFINANCED LOANS <br></br> {countryName} </TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Begin-Date</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Initial-Fee</TableCell>
                    <TableCell align="right" >Interest-Income</TableCell>
                    <TableCell align="right" >Other income</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                    <TableCell align="right" >Total Income</TableCell>
                    <TableCell align="right" >Margin Free Fall</TableCell>
                    <TableCell align="right" >Discount</TableCell>
                    <TableCell align="right" >Refinance-Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(row.drilldown.refinancedLoans.length >0)?

                  row.drilldown.refinancedLoans.map((sdr,index) => (
                    (row.drilldown.refinancedLoans.length === index + 1)?
                    <TableRow key={index}>
                      <TableCell style={{fontWeight:"600"}}>Totals</TableCell>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.refinancedAmount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    :
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.beginDate)?moment(sdr.beginDate).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell>{(sdr.maturityDate)?moment(sdr.maturityDate).format('DD-MM-YYYY'):''}</TableCell>
                      {/* <TableCell align="right" >{currency(sdr.principle)}</TableCell> */}
                      <TableCell align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.refinancedAmount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    
                    
                  ))
                  :
                  <TableRow key="reFinanceLoansNotAwilable">
                      <TableCell colSpan={11}><h4 style={{color:"red", textAlign:"center"}}>Refinance Loans Not Available</h4></TableCell>
                  </TableRow>
                  }
                </TableBody>
              </Table>

              {/* redeemed loan */}

              <Table style={{marginTop: "30px"}}>
                <TableHead>
                  <TableRow>
                    <TableCell>REDEEMED LOANS <br></br> {countryName} </TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Begin-Date</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Initial-Fee</TableCell>
                    <TableCell align="right" >Interest-Income</TableCell>
                    <TableCell align="right" >Other income</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                    <TableCell align="right" >Total Income</TableCell>
                    <TableCell align="right" >Margin Free Fall</TableCell>
                    <TableCell align="right" >Discount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {(row.drilldown.redeemedLoans.length >0)?
                  row.drilldown.redeemedLoans.map((sdr,index) => (
                    (row.drilldown.redeemedLoans.length === index + 1)?
                    <TableRow key={index}>
                      <TableCell style={{fontWeight:"600"}}>Totals</TableCell>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    :
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.beginDate)?moment(sdr.beginDate).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell>{(sdr.maturityDate)?moment(sdr.maturityDate).format('DD-MM-YYYY'):''}</TableCell>
                      {/* <TableCell align="right" >{currency(sdr.principle)}</TableCell> */}
                      <TableCell align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                  ))
                  :
                  <TableRow key="redeemedLoansNotAwilable">
                      <TableCell colSpan={11}><h4 style={{color:"red", textAlign:"center"}}>Redeemed Loans Not Available</h4></TableCell>
                  </TableRow>
                }
                </TableBody>
              </Table>

              {/* Defult loan */}
              <Table style={{marginTop: "30px"}}>
                <TableHead>
                  <TableRow>
                    <TableCell>DEFAULT LOANS</TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Begin-Date</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Initial-Fee</TableCell>
                    <TableCell align="right" >Interest-Income</TableCell>
                    <TableCell align="right" >Other income</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                    <TableCell align="right" >Total Income</TableCell>
                    <TableCell align="right" >Margin Free Fall</TableCell>
                    <TableCell align="right" >Discount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {(row.drilldown.loanInDefaultLoans.length >0)?
                  row.drilldown.loanInDefaultLoans.map((sdr,index) => (
                    (row.drilldown.loanInDefaultLoans.length === index + 1)?
                    <TableRow key={index}>
                      <TableCell style={{fontWeight:"600"}}>Totals</TableCell>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}>{currency(sdr.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" style={{fontWeight:"600"}}></TableCell>
                    </TableRow>  
                    :
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.beginDate)?moment(sdr.beginDate).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell>{(sdr.maturityDate)?moment(sdr.maturityDate).format('DD-MM-YYYY'):''}</TableCell>
                      {/* <TableCell align="right" >{currency(sdr.principle)}</TableCell> */}
                      <TableCell align="right" >{currency(sdr.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'  ``)}</TableCell>
                      <TableCell align="right" >{currency(sdr.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" ></TableCell>
                    </TableRow>  
                  ))
                  :
                  <TableRow key="defaultLoansNotAwilable">
                      <TableCell colSpan={11}><h4 style={{color:"red", textAlign:"center"}}>Default Loans Not Available</h4></TableCell>
                  </TableRow>
                }
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.object.isRequired,
};

FirstMonthRow.propTypes = {
  row: PropTypes.object.isRequired,
};


export function CollapsibleTableFixedLoans(props) {
  const { currencyVal, locale, countryName } = props;
  return (
    <TableContainer component={Paper} style={{marginTop: "30px"}}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell style={{width: "17%"}}></TableCell>
            <TableCell align="right">Initial fee</TableCell>
            <TableCell align="right">Interest income</TableCell>
            <TableCell align="right">Other income</TableCell>
            <TableCell align="right">Claim/Penalty</TableCell>
            <TableCell align="right">Total Income</TableCell>
            <TableCell align="right">Margin  Free fall</TableCell>
            <TableCell align="right">Discount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(props.firstMonthData)?
            // firstMonth row
            <FirstMonthRow key={"firstMonth"} row={props.firstMonthData} currencyVal={currencyVal} locale={locale} countryName={countryName} />
            :
            null
          }

          {props.otherMonths.map((row,index) => (
            <Row key={index} row={row} currencyVal={currencyVal} locale={locale} />
          ))}

          {(props.otherMonthTotal)?
          <TableRow >
            <TableCell align="left" style={{fontWeight: "500"}}>
              Embedded Value (after {moment().set('M', (props.firstMonthData.month-1)).set('year', props.firstMonthData.year).format('MMMM')})
            </TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.initialFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.interestIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.otherIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.totalIncome, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.marginFreeFall, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.otherMonthTotal.discount, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
          </TableRow>
          :
          null
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CollapsibleTableFixedLoans.propTypes = {
  row: PropTypes.object.isRequired,
  otherMonthTotal: PropTypes.object.isRequired,
  otherMonths :PropTypes.array.isRequired,
  firstMonthData:PropTypes.object.isRequired,
};

// flex loans ==========================================================================

function FlexLoanRow(props) {
  const { row, currencyVal, locale } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root} onClick={() => setOpen(!open)} style={{cursor:"pointer"}}>
        <TableCell align="left" style={{fontWeight: "500"}}>

          {moment().set('M', (row.month-1)).set('year', row.year).format('MMMM YYYY')}
        </TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>FLEX LOANS</TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Last Withdrawal</TableCell>
                    <TableCell>Outstanding-Amount at last Withdrawal</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Withdrawal-fee</TableCell>
                    <TableCell align="right" >Recurring-Fee</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                    {/* <TableCell align="right" >Total Income</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                {(row.drilldown.length > 0)?
                  row.drilldown.map((sdr,index) => (
                    (row.drilldown.length === index + 1)?
                    <TableRow key={index}>
                      <TableCell style={{fontWeight:"600"}}>Totals</TableCell>
                      <TableCell colSpan={2}></TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.outstandingAmountAtLastWithdrawal, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.withDrawalFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell style={{fontWeight:"600"}} align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    :
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.lastWithdrawal)?moment(sdr.lastWithdrawal).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell align="right" >{currency(sdr.outstandingAmountAtLastWithdrawal, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.withDrawalFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    
                    
                  ))
                  :
                  <TableRow key={`FlexLoansNotAwilableforOtherMonth`}>
                      <TableCell colSpan={7}><h4 style={{color:"red", textAlign:"center"}}>flex Loans Not Available</h4></TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}



CollapsibleTableFlexLoans.propTypes = {
  row: PropTypes.object.isRequired,
  flexLoanOtherMonthsTotal: PropTypes.object.isRequired,
  flexLoanOverviewOtherMonths :PropTypes.array.isRequired,
};

export function CollapsibleTableFlexLoans(props) {
  const { row, currencyVal, locale, countryName } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <TableContainer component={Paper} style={{marginTop: "30px"}}>
    <Table aria-label="collapsible table">
      <TableHead>
        <TableRow>
          <TableCell style={{width: "17%"}}>FLEX-LOANS <br></br> {countryName} </TableCell>
          <TableCell align="right">Withdrawal-Fee</TableCell>
          <TableCell align="right">Recurring-Fee</TableCell>
          <TableCell align="right">Claim/Penalty</TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>

        </TableRow>
      </TableHead>
      <TableBody>
    <React.Fragment>
      <TableRow className={classes.root} onClick={() => setOpen(!open)} style={{cursor:"pointer"}}>
        <TableCell align="left" style={{fontWeight: "500"}}>
          Totals {moment().set('M', (row.month-1)).format('MMMM')}
        </TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.withDrawalFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
        <TableCell align="right">{(row.summary)?currency(row.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''} </TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>

      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>FLEX-LOANS</TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Last Withdrawal</TableCell>
                    {/* <TableCell align="right"></TableCell> */}
                    <TableCell>Outstanding-Amount at last Withdrawal</TableCell>
                    {/* <TableCell align="right" >Principle</TableCell> */}
                    <TableCell align="right" >Withdrawal-fee</TableCell>
                    <TableCell align="right" >Recurring-Fee</TableCell>
                    <TableCell align="right" >Claim/Penalty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {(row.drilldown.length > 0)?
                  row.drilldown.map((sdr,index) => (
                    <TableRow key={index}>
                      <TableCell>{sdr.smeName}</TableCell>
                      <TableCell>{sdr.contract}</TableCell>
                      <TableCell>{(sdr.lastWithdrawal)?moment(sdr.lastWithdrawal).format('DD-MM-YYYY'):''}</TableCell>
                      <TableCell align="right" >{currency(sdr.outstandingAmountAtLastWithdrawal, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.withDrawalFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right" >{currency(sdr.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                      <TableCell align="right">{currency(sdr.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
                    </TableRow>  
                    
                    
                  ))
                  :
                  <TableRow key={`flexLoansNotAvailable`}>
                      <TableCell colSpan={11}><h4 style={{color:"red", textAlign:"center"}}>Flex Loans Not Available</h4></TableCell>
                    </TableRow>
                  }

                    <TableRow key={'flexLoanTotal'}>
                      <TableCell align="left" style={{fontWeight: "500"}}>
                        Totals 
                      </TableCell>
                      
                      <TableCell align="right"></TableCell>
                      <TableCell align="right"></TableCell>
                      <TableCell align="right" style={{fontWeight: "500"}}>{(row.summary)?currency(row.summary.outstandingAmountAtLastWithdrawal, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                      <TableCell align="right" style={{fontWeight: "500"}}>{(row.summary)?currency(row.summary.withDrawalFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                      <TableCell align="right" style={{fontWeight: "500"}}>{(row.summary)?currency(row.summary.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                      <TableCell align="right" style={{fontWeight: "500"}}>{(row.summary)?currency(row.summary.claimOrInterestPanalty, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR'):''}</TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>

    
    <TableRow>
          <TableCell style={{width: "17%"}}></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
    </TableRow>
    <TableRow>
          <TableCell style={{width: "17%"}}>Expected Recurring Fees:</TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right">Recurring-Fee</TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
          <TableCell align="right"></TableCell>
    </TableRow>

    {props.flexLoanOverviewOtherMonths.map((row,index) => (
            <FlexLoanRow key={index} row={row} currencyVal={currencyVal} locale={locale}  />
    ))}

    {(props.flexLoanOtherMonthsTotal)?
          <TableRow >
            <TableCell align="left" style={{fontWeight: "500"}}>
              Embedded Value (after {moment().set('M', (props.row.month-1)).set('year', props.row.year).format('MMMM')})
            </TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}></TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}>{currency(props.flexLoanOtherMonthsTotal.recurringFee, locale ? locale : 'nl-NL', currencyVal ? currencyVal : 'EUR')}</TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}></TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}></TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}></TableCell>
            <TableCell align="right" style={{fontWeight:"600"}}></TableCell>
          </TableRow>
          :
          null
          }

    </TableBody>
      </Table>
    </TableContainer>
  );
}