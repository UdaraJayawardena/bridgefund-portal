import moment from 'moment';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from 'react';

import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles } from "@material-ui/core";

import Card from 'components/loanmanagement/Card/Card.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import CardFooter from 'components/loanmanagement/Card/CardFooter.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import { terminateSmeLoan, showTerminateSmeLoanModal } from 'store/loanmanagement/actions/SmeLoans';
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays'

import util from 'lib/loanmanagement/utility'
import { smeLoanTerminateStatus } from "constants/loanmanagement/sme-loan";

const styles = createStyles({
  cardCategoryWhite: {
    color: 'rgba(255,255,255,.62)',
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '0'
  },
  cardTitleWhite: {
    color: '#FFFFFF',
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: 300,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none'
  }
});

class TerminateContract extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteContractIsTrue: false,
      showDeleteConfirmationDiv: true,
      deleteContactLastPaymentDate: '',
      deleteContractClosingAmount: '',
      deleteContractDiscount: '',
      selectedDate: '',
      status: ''
    };
  }

  componentDidMount() {
    this.props.getNextWorkingDate(moment().format('YYYY-MM-DD'), 3)
      .then((result) => {
        this.setState({ selectedDate: result })
      })
  }

  handleDeleteContractCheckBox = () => event => {
    this.setState({
      deleteContractIsTrue: event.target.checked
    });
  }

  handleTerminateContract(selectedContract, customerId, selectedDate, closingAmount, deleteContractDiscount, status) {

    // @ts-ignore
    const closingPaymentAmount = document.getElementById('closingAmount').value;
    // @ts-ignore
    const discount = document.getElementById('discount').value;

    this.props.terminateContract(selectedContract, customerId, selectedDate, closingPaymentAmount, discount, status)
  }

  handleDeleteContractCancel() {
    this.setState({
      showDeleteConfirmationDiv: true,
      deleteContractIsTrue: false
    });
  }

  handleDeleteContractButton(contractId, date, amount, discount, status) {
    if (util.isNullOrEmpty(status)) {
      this.props.displayNotification('Please fill all the fields', 'warning');
      return;
    }
    console.error('This function is not usable anymore');
  }

  preventCharacters(evt) {
    if (evt.which !== 8 && evt.which !== 0 && evt.which !== 46 && (evt.which < 48 || evt.which > 57)) {
      evt.preventDefault();
    }
  }

  preventPaste(e) {
    e.preventDefault();
  }

  handleSelectedDate(date) {
    this.setState({
      selectedDate: moment(date.target.value).format('YYYY-MM-DD').toString()
    });
  }

  handleChangeStatus(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    const { classes } = this.props;
    const { payments, selectedContract, customerId } = this.props;
    let totalTerminateAmount = payments
      .filter(payment =>
        (payment.status === 'OPEN' || payment.status === 'ERROR') &&
        payment.paymentContracts.contractNumber === selectedContract)
      .reduce((a, cv) => { return a + cv.totalAmount }, 0)

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            {this.state.showDeleteConfirmationDiv ?
              <Card>
                <CardHeader color="rose">
                  <h4 className={classes.cardTitleWhite}>Terminate Contract</h4>
                </CardHeader>
                <CardBody>
                  <GridContainer>
                    <GridItem>
                      <TextField
                        id="lastPaymentDate"
                        name="lastPaymentDate"
                        label="Last Payment Date"
                        type="date"
                        value={this.state.selectedDate}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={this.handleSelectedDate.bind(this)}
                      />
                    </GridItem>
                    <GridItem>
                      <TextField
                        id="closingAmount"
                        name="closingAmount"
                        label="Closing payment amount"
                        defaultValue={totalTerminateAmount.toFixed(2)}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                        }}
                        onKeyPress={this.preventCharacters.bind(this)}
                        onPaste={this.preventPaste.bind(this)}
                      />
                    </GridItem>
                    <GridItem>
                      <TextField
                        id="discount"
                        name="discount"
                        label="Discount"
                        defaultValue={0.00}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                        }}
                        onKeyPress={this.preventCharacters.bind(this)}
                        onPaste={this.preventPaste.bind(this)}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={6} md={3}>
                      <FormControl
                        style={{
                          //   // marginTop: 27,
                          display: 'inline-flex',
                          position: 'relative', width: '50%'
                        }}
                      >
                        <InputLabel shrink htmlFor="type">
                          Status
                      </InputLabel>
                        <Select
                          value={this.state.status}
                          onChange={this.handleChangeStatus.bind(this)}
                          input={
                            <Input
                              name="status"
                              id="status"
                              style={{
                                fontWeight: 100,
                                fontSize: 14,
                              }}
                            />
                          }
                        >
                          {Object.keys(smeLoanTerminateStatus).map((key, index) => (
                            <MenuItem key={index} value={smeLoanTerminateStatus[key]}>{key}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>
                    {/* <GridItem>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={this.state.deleteContractIsTrue}
                            onChange={this.handleDeleteContractCheckBox()}
                          />
                        }
                        label="Delete Contract"
                      />
                    </GridItem> */}
                  </GridContainer>
                </CardBody>
                <CardFooter>
                  <Button color="danger" size="sm" onClick={this.props.toggleDrawer}>Cancel</Button>
                  <Button color="info" size="sm"
                    onClick={() => {
                      this.handleTerminateContract(selectedContract, customerId, this.state.selectedDate, this.state.deleteContractClosingAmount, this.state.deleteContractDiscount, this.state.status)
                    }}>Terminate Contract
                </Button>
                </CardFooter>
              </Card>
              :
              <Card>
                <CardHeader color="rose">
                  <h4 className={classes.cardTitleWhite}>Do you really want to delete this contract ?</h4>
                </CardHeader>
                <CardBody></CardBody>
                <CardFooter>
                  <Button color="danger" size="sm"
                    onClick={this.handleDeleteContractCancel.bind(this)}>Cancel
                  </Button>
                  <Button color="info" size="sm"
                    onClick={() => {
                      this.handleDeleteContractButton(selectedContract, this.state.selectedDate, this.state.deleteContractClosingAmount, this.state.deleteContractDiscount, this.state.status)
                    }}>Delete Contract
                </Button>
                </CardFooter>
              </Card>
            }
          </GridItem>
        </GridContainer>
      </div>
    )
  }
}

TerminateContract.propTypes = {
  classes: PropTypes.object.isRequired,
  customerId: PropTypes.string,
  selectedContract: PropTypes.string,
  payments: PropTypes.array.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  terminateContract: PropTypes.func.isRequired,
  getNextWorkingDate: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  hideTerminateContractModal: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    payments: /* state.payments.payments */[],
    selectedContract: state.lmglobal.selectedLoan.contractId,
    customerId: state.lmglobal.customerDetails.id,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideTerminateContractModal: () => {
      dispatch(showTerminateSmeLoanModal());
    },

    terminateContract: (contractId, customerId, selectedDate, closingAmount, deleteContractDiscount, status) => {
      const date = moment(selectedDate).format('YYYY-MM-DD');
      const obj = {
        contractId: contractId,
        lastPaymentDate: date,
        closingAmount: closingAmount,
        discount: deleteContractDiscount,
        status: status
      };
      dispatch(terminateSmeLoan(obj, customerId));
    },
    getNextWorkingDate: (startDate, numberOfDays) => {
      return dispatch(getNextWorkingDate(startDate, numberOfDays))
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TerminateContract));
