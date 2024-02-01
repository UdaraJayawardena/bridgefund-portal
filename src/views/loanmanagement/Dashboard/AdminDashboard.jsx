import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import Styles from 'assets/jss/material-dashboard-react/views/AdminDashboard';

import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import Loader from 'components/loanmanagement/CustomLoader/Loader';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import Card from 'components/loanmanagement/Card/Card.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import Notifier from 'components/loanmanagement/Notification/Notifier';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';

import { smeLoanMaturityProcess, generateDailyLoanHistory, dailyLiquidityOverview,
         processAndReceiveBankTransactions, directDebitBatchProcess } from 'store/loanmanagement/actions/Schedulers';

class AdminDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  /**
   * Run SME loan maturity process
   */
  smeLoanMarutiryProcess = () => {
    this.setState({ isLoading: true });
    this.props.smeLoanMaturityProcess()
      .then(() => {
        this.setState({ isLoading: false });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  /**
   * Run generate daily loan history process
   */
  generateDailyLoanHistory = () => {
    this.setState({ isLoading: true });
    this.props.generateDailyLoanHistory()
      .then(() => {
        this.setState({ isLoading: false });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  /**
   * Run daily liquidity overview process
   */
  dailyLiquidityOverview = () => {
    this.setState({ isLoading: true });
    this.props.dailyLiquidityOverview()
      .then(() => {
        this.setState({ isLoading: false });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  /**
   * Run process and receive bank transactions
   */
  processAndReceiveBankTransactions = () => {
    this.setState({ isLoading: true });

    const body = {
      transactionDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    };
    this.props.processAndReceiveBankTransactions(body)
      .then(() => {
        this.setState({ isLoading: false });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  /**
   * Run direct debit batch process
   */
  directDebitBatchProcess = () => {
    this.setState({ isLoading: true });

    const body = {
      batchCreationDate: moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD'),
    };
    
    this.props.directDebitBatchProcess(body)
      .then(() => {
        this.setState({ isLoading: false });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  render() {
    const {
      classes
    } = this.props;

    return (
      <div>
        <Loader open = {this.state.isLoading}/>
        <Notifier />
        <GridContainer> 
          <GridItem xs={12} sm={12} md={12}> 
            <Card> 
              <CardHeader color='info'> 
                <h4 className={classes.cardTitleWhite}>Schedulers</h4> 
              </CardHeader> 
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <Card>
                      <CardBody>
                        <GridContainer>
                          <GridItem xs={9} sm={9} md={9}>
                            <h4>SME-Loan-Matury Process</h4>
                          </GridItem>
                          <GridItem xs={3} sm={3} md={3}>
                            <Button color="success" className={classes.rightMostButton} onClick={this.smeLoanMarutiryProcess}>Process</Button>
                          </GridItem>
                        </GridContainer>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <GridContainer>
                          <GridItem xs={9} sm={9} md={9}>
                            <h4>Generate Daily-Loan-History</h4>
                          </GridItem>
                          <GridItem xs={3} sm={3} md={3}>
                            <Button color="success" className={classes.rightMostButton} onClick={this.generateDailyLoanHistory}>Process</Button>
                          </GridItem>
                        </GridContainer>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <GridContainer>
                          <GridItem xs={9} sm={9} md={9}>
                            <h4>Daily-Liquidity-Overview</h4>
                          </GridItem>
                          <GridItem xs={3} sm={3} md={3}>
                            <Button color="success" className={classes.rightMostButton} onClick={this.dailyLiquidityOverview}>Process</Button>
                          </GridItem>
                        </GridContainer>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <GridContainer>
                          <GridItem xs={9} sm={9} md={9}>
                            <h4>Process & Receive Bank Transactions</h4>
                          </GridItem>
                          <GridItem xs={3} sm={3} md={3}>
                            <Button color="success" className={classes.rightMostButton} onClick={this.processAndReceiveBankTransactions}>Process</Button>
                          </GridItem>
                        </GridContainer>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <GridContainer>
                          <GridItem xs={9} sm={9} md={9}>
                            <h4>Direct Debits Batch Process</h4>
                          </GridItem>
                          <GridItem xs={3} sm={3} md={3}>
                            <Button color="success" className={classes.rightMostButton} onClick={this.directDebitBatchProcess}>Process</Button>
                          </GridItem>
                        </GridContainer>
                      </CardBody>
                    </Card>
                  </GridItem>
                </GridContainer>
              </CardBody>
            </Card> 
          </GridItem> 
        </GridContainer>
      </div>
    );
  }
}

AdminDashboard.propTypes = {
  classes: PropTypes.object.isRequired,

  smeLoanMaturityProcess: PropTypes.func.isRequired,
  dailyLiquidityOverview: PropTypes.func.isRequired,
  generateDailyLoanHistory: PropTypes.func.isRequired,
  processAndReceiveBankTransactions: PropTypes.func.isRequired,
  directDebitBatchProcess: PropTypes.func.isRequired,
  configurations: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    configurations: state.configurations,
  };
};

const mapDispatchToProps = (dispatch) => ({
  smeLoanMaturityProcess: () => dispatch(smeLoanMaturityProcess()),
  dailyLiquidityOverview: () => dispatch(dailyLiquidityOverview()),
  generateDailyLoanHistory: () => dispatch(generateDailyLoanHistory()),
  processAndReceiveBankTransactions: (body) => dispatch(processAndReceiveBankTransactions(body)),
  directDebitBatchProcess: (data) => dispatch(directDebitBatchProcess(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Styles)(AdminDashboard));
