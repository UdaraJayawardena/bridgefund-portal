import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/bridgefundPortal/views/firstAnalysesOverviewStyles";
import GridItem from "components/initiation/Grid/GridItem";
import GridContainer from "components/initiation/Grid/GridContainer";
import ParameterValuesBlock from "./ParameterValuesBlock";
import { displayNotification } from "store/initiation/actions/Notifier";
import { getFirstAnalysisIndicators } from "store/initiation/actions/FirstAnalysisValues.action";
import AnalysisOutcomeBlock from "./AnalysisOutcomeBlock";
import AnalysisAccountBlock from "./AnalysisAccountBlock";
import AnalysisSummaryBlock from "./AnalysisSummaryBlock";
import { Paper, Grid, Typography, } from '@material-ui/core';


class FirstAnalysesOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstAnalysisData: {},

    };
  }

  componentDidMount() {
    this.getIndicatorData();

  }


  getIndicatorData = () => {
    const { contractId, desiredPrincipleAmount } = this.props.smeLoanRequest;

    if (!contractId)
      return this.props.displayNotification(
        "Contract is not selected",
        "warning"
      );
      // contractId: "SBF122362",

    this.props.getFirstAnalysisIndicators({ contractId }).then((response) => {
      if (response && response.length > 0) {
        const { contractId, customerId, industry, numberOfBankAccounts, numberOfDaysInMainBankFile, revenueAmount, dateOfAutomatedAnalysis, lastBankFileDate,
          revenueAmountPercentage, revenueAmountOnYearlyBase, calculatedExpectedLoanAmount, expectedSuccessDDPercentage, incomeAmount, incomeAmountOnYearlyBase,
          lastBankFileDateIndicator, legalEntityIndicator, legalEntity, riskProfileOrganizationIndicator, riskProfileOrganization, riskProfilePersonIndicator, riskProfilePerson,
          numberOfDaysInMainBankFileIndicator, revenueAmountIndicator, expectedSuccessDDIndicator, firstAnalysisOutcomeIndicator, firstAnalysisOutcome, firstAnalysisParameter
        } = response[0];
        const data = {
          contractId,
          customerId,
          industry,
          numberOfBankAccounts,
          numberOfDaysInMainBankFile,
          revenueAmount,
          dateOfAutomatedAnalysis,
          lastBankFileDate,
          revenueAmountPercentage,
          revenueAmountOnYearlyBase,
          calculatedExpectedLoanAmount,
          expectedSuccessDDPercentage,
          incomeAmount,
          incomeAmountOnYearlyBase,
          desiredPrincipleAmount: desiredPrincipleAmount,
          lastBankFileDateIndicator: lastBankFileDateIndicator ? lastBankFileDateIndicator.value : null,
          legalEntityIndicator: legalEntityIndicator ? legalEntityIndicator.value : null,
          legalEntity,
          riskProfileOrganizationIndicator: riskProfileOrganizationIndicator ? riskProfileOrganizationIndicator.value : null,
          riskProfileOrganization: riskProfileOrganization ? riskProfileOrganization.value : null,
          riskProfilePersonIndicator: riskProfilePersonIndicator ? riskProfilePersonIndicator.value : null,
          riskProfilePerson: riskProfilePerson ? riskProfilePerson.value : null,
          numberOfDaysInMainBankFileIndicator: numberOfDaysInMainBankFileIndicator ? numberOfDaysInMainBankFileIndicator.value : null,
          revenueAmountIndicator: revenueAmountIndicator ? revenueAmountIndicator.value : null,
          expectedSuccessDDIndicator: expectedSuccessDDIndicator ? expectedSuccessDDIndicator.value : null,
          firstAnalysisOutcomeIndicator: firstAnalysisOutcomeIndicator ? firstAnalysisOutcomeIndicator.value : null,
          firstAnalysisOutcome: firstAnalysisOutcome ? firstAnalysisOutcome.value : null,
          higherBalancePercentage: firstAnalysisParameter ? firstAnalysisParameter.higherBalancePercentage : null,
          maxNumberOfWorkingDaysBankFile: firstAnalysisParameter ? firstAnalysisParameter.maxNumberOfWorkingDaysBankFile : null,
          minimalNumberOfDaysInBankFile: firstAnalysisParameter ? firstAnalysisParameter.minimalNumberOfDaysInBankFile : null,
          minimalTurnOverAmount: firstAnalysisParameter ? firstAnalysisParameter.minimalTurnOverAmount : null,
        }

        this.setState({
          firstAnalysisData: data,
        });
      } else {
        this.props.displayNotification('First analysis data not found', 'warning');
      }
    }).catch(() => {
      this.props.displayNotification('Error occurred in get first analysis data!', 'error');
    });
  };



  render() {
    const { classes } = this.props;
    const { firstAnalysisData } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={6} sm={6} lg={6}>
            <AnalysisSummaryBlock
              dataList={firstAnalysisData}
            />
          </GridItem>
          <GridItem xs={6} sm={6} lg={6}>
            <ParameterValuesBlock dataList={firstAnalysisData} />
          </GridItem>
        </GridContainer>

        <GridContainer>
          <GridItem xs={12} sm={12} lg={12}>
            <Paper variant="outlined" className={classes.highRiskContainer} >

              <Grid item>
                <Typography variant="h5" gutterBottom className={classes.transactionContainerTitleGrid}>Analysis Outcome</Typography>
              </Grid>
              <Grid container>
                <GridItem xs={6} sm={6} lg={6}>
            <AnalysisOutcomeBlock dataList={firstAnalysisData} />
          </GridItem>
          <GridItem xs={6} sm={6} lg={6}>
            <AnalysisAccountBlock dataList={firstAnalysisData} />
          </GridItem>
              </Grid>
            </Paper>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

FirstAnalysesOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  firstAnalysisData: PropTypes.object,
  smeLoanRequest: PropTypes.object,
  displayNotification: PropTypes.func,
  getFirstAnalysisIndicators: PropTypes.func,
};

const mapStateToProp = (state) => ({
  smeLoanRequest: state.lmglobal.overviewData,
});

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, type) =>
    dispatch(displayNotification(message, type)),

  getFirstAnalysisIndicators: (requestParams) =>
    dispatch(getFirstAnalysisIndicators(requestParams)),

});

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(withStyles(styles)(FirstAnalysesOverview));
