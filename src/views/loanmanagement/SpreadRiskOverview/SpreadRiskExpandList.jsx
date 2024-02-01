import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/multipleLoanOverviewStyle.jsx";

import {
  Accordion, AccordionSummary, AccordionDetails, Grid, Typography
} from '@material-ui/core';

import { requestMultipleOverviewData } from "store/loanmanagement/actions/Reports";

import MultipleLoanOverview from '../MultipleLoanOverview/MultipleLoanOverview';

import Utility from 'lib/loanmanagement/utility';

const CURRENCY = Utility.multiCurrencyConverter();

class SpreadRiskExpandList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMultipleLoanOverview: false,
      filterValue: '',
      multipleLoanOverviewProps: {},

      order: 'asc',
      orderBy: 'overdue',
      expandedPanelKey: ''
    };
  }

  openMultipleLoanOverview = (row, index) => {
    this.state.expandedPanelKey === index ? this.setState({ expandedPanelKey: '' }) : this.setState({ expandedPanelKey: index })
    this.props.filterType === 'SBI_NAME' ?
      this.setState({ filterValue: { sbiName: row.name, sbiCode: row.sbiCode } }) :
      this.setState({ filterValue: row.name });
  }

  render() {

    // let totalOutstanding = 0;
    const calcTotalOutstanding = (value) => {
      // totalOutstanding += value;
      return value;
    };

    // let totalNoOfLoans = 0;
    const calclTotalLoans = value => {
      // totalNoOfLoans += value;
      return value;
    };

    // let totalOverdue = 0;
    const calcTotalOverdue = (value) => {
      // totalOverdue += value;
      return value;
    };

    // let totalPortfolio = 0
    const calcTotalPortfolio = value => {
      // totalPortfolio += value;
      return value;
    };

    // let totalPercentageOverdue = 0
    // const calcTotalpercentageOverdue = value => {
    //   totalPercentageOverdue += value;
    //   return value;
    // }
    const currency = this.props.currency; 
    const locale = this.props.locale;

    return (
      <div>
        <Accordion disabled>
          <AccordionSummary >
            <Grid container>
              <Grid item xs={5}>
                <Typography>.</Typography>
              </Grid>
              <Grid item xs={2} style={{ textAlign: "right" }}>
                <Typography>Outstanding Loan</Typography>
              </Grid>
              <Grid item xs={1} style={{ textAlign: "right" }}>
                <Typography>% of Porfolio</Typography>
              </Grid>
              <Grid item xs={1} style={{ textAlign: "right" }}>
                <Typography>No-of-Loans</Typography>
              </Grid>
              <Grid item xs={2} style={{ textAlign: "right" }}>
                <Typography>Over Due</Typography>
              </Grid>
              <Grid item xs={1} style={{ textAlign: "right" }}>
                <Typography>% Over Due</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
        </Accordion>
        {this.props.tableData.map((row, index) => (
          <Accordion key={index} expanded={this.state.expandedPanelKey === index} onChange={() => this.openMultipleLoanOverview(row, index)} >
            <AccordionSummary  >
              <Grid container spacing={0}>
                <Grid item xs={5}>
                  <Typography>{row.name}</Typography>
                </Grid>
                <Grid item xs={2} style={{ textAlign: "right" }}>
                  <Typography>{CURRENCY(calcTotalOutstanding(row.outstandingLoan), locale, currency )} </Typography>
                </Grid>
                <Grid item xs={1} style={{ textAlign: "right" }}>
                  <Typography>{(calcTotalPortfolio(row.percentagePortfolio)).toFixed(2)} %</Typography>
                </Grid>
                <Grid item xs={1} style={{ textAlign: "right" }}>
                  <Typography>{calclTotalLoans(row.noOfLoans)}</Typography>
                </Grid>
                <Grid item xs={2} style={{ textAlign: "right" }}>
                  <Typography>{CURRENCY(calcTotalOverdue(row.overdue), locale, currency )}</Typography>
                </Grid>
                <Grid item xs={1} style={{ textAlign: "right" }}>
                  <Typography>{(row.percentageOverdue).toFixed(2)} %</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails style={{ overflow: 'overlay' }}>
              {this.state.expandedPanelKey === index ?
                <MultipleLoanOverview isSpreadRiskOverview={true}
                  filterType={this.props.filterType}
                  filterValue={this.state.filterValue}
                  origin='SPREAD_RISK'
                  overviewDate={this.props.overviewDate}
                  locale = {this.props.locale}
                  currency= {this.props.currency}
                />
                : <div></div>}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );
  }
}

SpreadRiskExpandList.propTypes = {
  tableData: PropTypes.array.isRequired,
  overviewDate: PropTypes.string.isRequired,
  filterType: PropTypes.string,
  locale: PropTypes.string,
  currency: PropTypes.string
};

const mapDispatchToProps = dispatch => {
  return {
    requestMultipleOverviewData: (SBI_Code, date) => {
      dispatch(requestMultipleOverviewData(SBI_Code, date));
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles)(SpreadRiskExpandList));
