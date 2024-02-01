// @ts-nocheck
import moment from 'moment';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay';
import tasksStyle from 'assets/jss/material-dashboard-react/components/tasksStyle.jsx';

import {
  Table, TableRow, TableBody, TableCell, TableHead, IconButton, //Icon
} from '@material-ui/core';
import PermContactCalendar from '@material-ui/icons/PermContactCalendar';

import withStyles from '@material-ui/core/styles/withStyles';

import { Stop, Pause } from '@material-ui/icons';

import Card from 'components/loanmanagement/Card/Card.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
// import Button from 'components/CustomButtons/Button.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import { setLoanStopHistoryOrigin, showHideTemporaryLoanStop } from "store/loanmanagement/actions/SmeLoanTemporaryLoanStop";
import { getLocales } from "store/initiation/actions/Configuration.action";
import Utility from 'lib/loanmanagement/utility';

import Drawer from '@material-ui/core/Drawer';
import Paper from "@material-ui/core/Paper";

import { requestLoan } from 'store/loanmanagement/actions/Loans';
import { selectLoan, showTerminateSmeLoanModal } from 'store/loanmanagement/actions/SmeLoans';
import { requestLoanContracts } from 'store/loanmanagement/actions/LoanContracts';
import { requestSmeMandates, requestDirectDebits } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { displayNotification } from 'store/initiation/actions/Notifier';

import history from "./../../../history";
import { setNavigationInDashboards } from "store/initiation/actions/login";

const currency = Utility.multiCurrencyConverter();

class Contracts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      top: false,
      left: false,
      bottom: false,
      right: false,
      selectedContract: [],
      panelType: '',
      locales: []
    };
  }

  componentDidMount() {
    this.getLocales();
  }

  getLocales = async () => {

        this.props.getLocales({})
            .then(respose => {

        this.setState({ locales: respose });
        })
        .catch(err => { console.log('getLocales err ', err); });
    }    

  bindLocaleToContract = (contract) => {
    const { locales } = this.state;
    if (!contract.country || !contract.currency) return 'nl-NL';
      const selectedLocale = locales.find(locale => locale.countryCode === contract.country && locale.currencyCode === contract.currency);
      return selectedLocale ? selectedLocale.locale : 'nl-NL';
  }
 
  handleTerminateContracts(contract) {
    this.props.selectLoan(contract);
    this.props.showHideTerminateContract();
  }

  handleTemporaryLoanStop(contract) {
    this.props.selectLoan(contract);
    this.props.showHideTemporaryLoanStop();
    this.props.setLoanStopHistoryOrigin('CONTRACTS');
  }

  toggleDrawer = (type, container, side, open) => {

    this.setState({
      bottom: open,
      panelType: type
    });

    if (open) {
      switch (type) {
        case 'Loans':
          if (container) {
            this.props.getLoanByContractId(container);
            // this.props.getLoanContractByContractId(container)
            this.props.getDirectDebits(container);
          }
          break;
        case 'DirectDebits':
          this.props.getSmeMandates(container);
          this.props.getDirectDebits(container);
          break;
        default:
          break;
      }
    }

  };

  redirectToSLO = (contract) => {
    this.props.selectLoan(contract);
    this.props.setNavigationInDashboards('SingleLoanOverview')
      .then(res => {
        if (res) {
          history.push(res);
          }
      });
  };

  render() {
    const {
      contracts,
      classes,
      rtlActive,
      tableHeaderColor,
      loan,
      directdebits,
      isDashboardContent
    } = this.props;
    
    const tableCellClasses = classnames(classes.tableCell, {
      [classes.tableCellRTL]: rtlActive
    });
    return (
      <LoadingOverlay
        active={this.props.createSmeLoanIsBusy}
        spinner
        text='Registering All Payments...'>
        <div>
          <GridContainer>
            <GridItem md={12}>
              <Card>
                <CardHeader color="newInfo" >
                  <div style={{ position: 'relative', float: 'left' }}>
                    <h5>Loans</h5>
                  </div>
                </CardHeader>
                <CardBody>
                  <Table className={classes.table}>
                    <TableHead className={classes.tableRow}>
                      <TableRow key={'tasks_header'} className={classes.tableRow}>
                        <TableCell className={tableCellClasses}>
                          {'View'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Contract Number'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Amount'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Interest'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Fees'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Terms'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Collection Start Date'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Status'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Partial Payment'}
                        </TableCell>
                        <TableCell className={tableCellClasses}>
                          {'Action'}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contracts && (
                        contracts.map((contract, key) => contract && (
                          <TableRow key={key} className={classes.tableRow}>
                            <TableCell className={tableCellClasses}>
                              {isDashboardContent ?
                                <IconButton
                                  className={classes.tableActionButton}
                                  onClick={() => this.redirectToSLO(contract)}
                                >
                                  <PermContactCalendar
                                    className={
                                      classes.tableActionButtonIcon + " " + classes.info
                                    }
                                  />
                                </IconButton>
                                :
                                <Link to={`/user/${contract.type === 'fixed-loan' ? 'singleLoanOverview' : 'flexLoanOverview'}/${contract.contractId}`} >
                                  <IconButton
                                    className={classes.tableActionButton}
                                  >
                                    <PermContactCalendar
                                      className={
                                        classes.tableActionButtonIcon + " " + classes.info
                                      }
                                    />
                                  </IconButton>
                                </Link>
                              }
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
                                <Link to={'#'} onClick={this.toggleDrawer.bind(this, 'Loans', contract.contractId, 'bottom', true)}>
                                  {contract.contractId}
                                </Link>
                              }
                              {(process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') &&
                                contract.contractId
                              }
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {currency(contract.principleAmount, this.bindLocaleToContract(contract), contract.currency ? contract.currency : 'EUR')}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {currency(contract.interestAmount, this.bindLocaleToContract(contract), contract.currency ? contract.currency : 'EUR')}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {currency(contract.initialCostAmount, this.bindLocaleToContract(contract), contract.currency ? contract.currency : 'EUR')}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {contract.plannedNumberOfDirectDebit}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {moment(contract.startDate).format('DD-MM-YYYY')}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {contract.status}
                            </TableCell>
                            <TableCell className={tableCellClasses}>
                              {currency(contract.partialPaymentAmount, this.bindLocaleToContract(contract), contract.currency ? contract.currency : 'EUR')}
                            </TableCell>
                            <TableCell className={tableCellClasses}>

                              <IconButton
                                title='Terminate Contract'
                                onClick={() => { this.handleTerminateContracts(contract); }}
                                // disabled={contract.status === 'Deleted' || contract.status === 'Finished' ? true : false}
                                disabled={contract.status === 'default-settled' || contract.status === 'loan-in-default' || contract.status === 'loan-refinanced' || contract.status === 'loan-early-redeemed' || contract.status === 'loan-normally-settled' ? true : false}
                                style={{ color: '#333', padding: 0, margin: 0 }}
                              >
                                <Stop
                                  // color={contract.status === 'Active' || contract.status === 'Remaining' ? 'inherit' : 'disabled'}
                                  color={contract.status === 'outstanding' || contract.status === 'loan-in-backlog' ? 'inherit' : 'disabled'}
                                />
                              </IconButton>
                              <IconButton
                                title='Temporary Loan Stop'
                                onClick={() => { this.handleTemporaryLoanStop(contract); }}
                                // disabled={contract.status === 'Active' || contract.status === 'Remaining' ? false : true}
                                disabled={contract.status === 'outstanding' || contract.status === 'loan-in-backlog' ? false : true}
                                style={{ color: '#333', padding: 0, margin: 0 }}
                              >
                                <Pause
                                  // color={contract.status === 'Active' || contract.status === 'Remaining' ? 'inherit' : 'disabled'}
                                  color={contract.status === 'outstanding' || contract.status === 'loan-in-backlog' ? 'inherit' : 'disabled'}
                                />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )))
                      }
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </GridItem>
          </GridContainer>

          <Drawer
            anchor="bottom"
            open={this.state.bottom && this.state.panelType === 'Loans'}
            onClick={this.toggleDrawer.bind(this, 'Loans', [], 'bottom', false)}
          >
            <Paper className={classes.tableMain}>
              <GridContainer>

                <GridItem>
                  <Card>
                    <CardHeader color="rose">
                      Sme-Loan
                    </CardHeader>
                    <CardBody>
                      <Table className={classes.table}>
                        <TableHead className={classes[tableHeaderColor + "primary"]}>
                          <TableRow key={'smeloan_header'}>
                            <TableCell>contractId</TableCell>
                            <TableCell>type</TableCell>
                            <TableCell>smeId</TableCell>
                            <TableCell>status</TableCell>
                            <TableCell>startDate</TableCell>
                            <TableCell>maturityDate</TableCell>
                            <TableCell>principleAmount</TableCell>
                            <TableCell>interestAmount</TableCell>
                            <TableCell>initialCostAmount</TableCell>
                            <TableCell>recurringCostAmount</TableCell>
                            <TableCell>totalMarginAmount</TableCell>
                            <TableCell>totalLoanAmount</TableCell>
                            <TableCell>interestPercentageTotal</TableCell>
                            <TableCell>interestPercentageBasePerMonth</TableCell>
                            <TableCell>interestPercentageRiskSurchargePerMonth</TableCell>
                            <TableCell>interestAnnualPercentageRate</TableCell>
                            <TableCell>riskCategory</TableCell>
                            <TableCell>firstDirectDebitDate</TableCell>
                            <TableCell>directDebitFrequency</TableCell>
                            <TableCell>plannedNumberOfDirectDebit</TableCell>
                            <TableCell>idRefinancedLoan</TableCell>
                            <TableCell>discountAmount</TableCell>
                            <TableCell>closingPaymentAmount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            loan.contractId ? (
                              <TableRow key={loan._id} >
                                <TableCell>{loan.contractId}</TableCell>
                                <TableCell>{loan.type}</TableCell>
                                <TableCell>{loan.smeId}</TableCell>
                                <TableCell>{loan.status}</TableCell>
                                <TableCell>{loan.startDate}</TableCell>
                                <TableCell>{loan.maturityDate}</TableCell>
                                <TableCell>{loan.principleAmount}</TableCell>
                                <TableCell>{loan.interestAmount}</TableCell>
                                <TableCell>{loan.initialCostAmount}</TableCell>
                                <TableCell>{loan.recurringCostAmount}</TableCell>
                                <TableCell>{loan.totalMarginAmount}</TableCell>
                                <TableCell>{loan.totalLoanAmount}</TableCell>
                                <TableCell>{loan.interestPercentageTotal}</TableCell>
                                <TableCell>{loan.interestPercentageBasePerMonth}</TableCell>
                                <TableCell>{loan.interestPercentageRiskSurchargePerMonth}</TableCell>
                                <TableCell>{loan.interestAnnualPercentageRate}</TableCell>
                                <TableCell>{loan.riskCategory}</TableCell>
                                <TableCell>{loan.firstDirectDebitDate}</TableCell>
                                <TableCell>{loan.directDebitFrequency}</TableCell>
                                <TableCell>{loan.plannedNumberOfDirectDebit}</TableCell>
                                <TableCell>{loan.idRefinancedLoan}</TableCell>
                                <TableCell>{loan.discountAmount}</TableCell>
                                <TableCell>{loan.closingPaymentAmount}</TableCell>
                              </TableRow>
                            ) : null
                          }
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                </GridItem>
              </GridContainer>
            </Paper>

            <Paper className={classes.tableMain}>
              <GridContainer>
                <GridItem>
                  <Card>
                    <CardHeader color="warning">
                      Direct Debits
                    </CardHeader>
                    <CardBody>
                      <Table className={classes.table}>
                        <TableHead className={classes[tableHeaderColor + "primary"]}>
                          <TableRow key={'directdebits_header'}>
                            <TableCell>contractId</TableCell>
                            <TableCell>mandateId</TableCell>
                            <TableCell>termNumber</TableCell>
                            <TableCell>description</TableCell>
                            <TableCell>plannedDate</TableCell>
                            <TableCell>transactionDate</TableCell>
                            <TableCell>amount</TableCell>
                            <TableCell>loanStatus</TableCell>
                            {/* <TableCell>statusHistory</TableCell> */}
                            <TableCell>directDebitCounter</TableCell>
                            <TableCell>ourReference</TableCell>
                            <TableCell>externalReferenceId</TableCell>
                            <TableCell>batchId</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {directdebits.map((dd, idx) => {
                            return dd._id ? (
                              <TableRow key={idx} >
                                <TableCell>{dd.contractId}</TableCell>
                                <TableCell>{dd.mandateId}</TableCell>
                                <TableCell>{dd.termNumber}</TableCell>
                                <TableCell>{dd.description}</TableCell>
                                <TableCell>{moment(dd.plannedDate).format('DD-MM-YYYY')}</TableCell>
                                <TableCell>{moment(dd.transactionDate).format('DD-MM-YYYY')}</TableCell>
                                <TableCell>{currency(dd.amount)}</TableCell>
                                <TableCell>{dd.loanStatus}</TableCell>
                                <TableCell>{dd.directDebitCounter}</TableCell>
                                <TableCell>{dd.ourReference}</TableCell>
                                <TableCell>{dd.externalReferenceId}</TableCell>
                                <TableCell>{dd.batchId}</TableCell>
                              </TableRow>
                            ) : null;
                          })}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                </GridItem>
              </GridContainer>
            </Paper>
          </Drawer>
        </div>
      </LoadingOverlay>
    );
  }
}

Contracts.propTypes = {
  loan: PropTypes.object,
  classes: PropTypes.object,
  smemandates: PropTypes.array,
  directdebits: PropTypes.array,
  loanContracts: PropTypes.array,
  contracts: PropTypes.array.isRequired,
  rtlActive: PropTypes.bool,
  createSmeLoanIsBusy: PropTypes.bool,
  tableHeaderColor: PropTypes.string,
  showHideTerminateContract: PropTypes.func.isRequired,
  showHideTemporaryLoanStop: PropTypes.func.isRequired,
  setLoanStopHistoryOrigin: PropTypes.func.isRequired,
  getLoanByContractId: PropTypes.func.isRequired,
  getLoanContractByContractId: PropTypes.func.isRequired,
  getSmeMandates: PropTypes.func.isRequired,
  getDirectDebits: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
  setHeaderDisplaySubData: PropTypes.func,
  selectedDashboardItems: PropTypes.array,
  selectLoan: PropTypes.func.isRequired,
  setNavigationInDashboards: PropTypes.func,
  getLocales: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    contracts: state.lmglobal.smeLoans,
    createSmeLoanIsBusy: state.smeLoans.createSmeLoanIsBusy,
    loan: state.loans.loan,
    loanContracts: state.loancontracts.loancontracts,
    smemandates: state.smemandates.smemandates,
    directdebits: state.smeLoanTransaction.directdebits,
    isDashboardContent: state.user.isDashboardContent,
    selectedDashboardItems: state.user.selectedDashboardItems,

  };
};

const mapDispatchToProps = dispatch => {
  return {
    showHideTerminateContract: () => {
      dispatch(showTerminateSmeLoanModal());
    },
    showHideTemporaryLoanStop: () => {
      dispatch(showHideTemporaryLoanStop());
    },
    selectLoan: (loan) => {
      dispatch(selectLoan(loan));
    },
    setLoanStopHistoryOrigin: origin => {
      dispatch(setLoanStopHistoryOrigin(origin));
    },
    getLoanByContractId: contractId => {
      dispatch(requestLoan(contractId));
    },
    getLoanContractByContractId: contractId => {
      dispatch(requestLoanContracts(contractId));
    },
    getSmeMandates: mandateId => {
      dispatch(requestSmeMandates(mandateId));
    },
    getDirectDebits: mandateId => {
      dispatch(requestDirectDebits(mandateId));
    },
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(tasksStyle)(Contracts));
