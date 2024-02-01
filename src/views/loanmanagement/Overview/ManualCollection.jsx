import moment from 'moment';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';

import {
  FormControl, TextField, MenuItem, Select, Input, createStyles, InputLabel
} from '@material-ui/core';

import Card from 'components/loanmanagement/Card/Card.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import CardFooter from 'components/loanmanagement/Card/CardFooter.jsx';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import CustomInput from 'components/loanmanagement/CustomInput/CustomInput.jsx';
import CustomFormatInput from 'components/loanmanagement/CustomFormatInput/CustomFormatInput.jsx';

import { showAddTransaction } from 'store/loanmanagement/actions/Mandates';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { addManualCollectionDirectDebit, clearDirectDebitError } from 'store/loanmanagement/actions/SmeLoanTransaction';

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

class ManualCollections extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDate: moment().add(2, 'days').format('YYYY-MM-DD'),
      contract: {},
      reference: '',
      message: '',
      amount: '',
      term: ''
    };
  }

  handleAddTransaction() {
    const mandateNumber = this.props.selectedMandate;

    const selectedDate = this.state.selectedDate;

    this.props.createTransaction(mandateNumber, selectedDate, this.state);

    this.props.clearTable();

    if (this.props.directDebitError !== '') {

      this.props.clearDirectDebitError();

      this.props.toggleDrawer();
    }
  }

  handleSelectedDate(date) {
    this.setState({
      selectedDate: moment(date.target.value).format('YYYY-MM-DD')
    });
  }

  handleChangeContractId(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleCustomFormatInput = (val, name) => {
    this.setState({
      [name]: val
    });
  };

  handleChange(val, name) {
    this.setState({
      [name]: val
    });
  }

  handleTermNumberInput(val, name) {
    this.setState({
      [name]: val
    });
  }

  render() {
    const {
      classes, smeLoans,
    } = this.props;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="rose">
                <h4 className={classes.cardTitleWhite}>Add Collection</h4>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <FormControl
                      style={{
                        marginTop: 27,
                        display: 'inline-flex',
                        position: 'relative'
                      }}
                    >
                      <InputLabel shrink htmlFor="contract-number">
                        Contract Number
                      </InputLabel>
                      <Select
                        value={this.state.contract}
                        onChange={this.handleChangeContractId.bind(this)}
                        input={
                          <Input
                            name="contract"
                            id="contract-id"
                            style={{
                              fontWeight: 100,
                              fontSize: 14,
                              width: 300
                            }}
                          />
                        }
                      >
                        {
                          smeLoans.map((contract, key) => contract &&
                            <MenuItem key={key} value={contract}>{contract.contractId}</MenuItem>
                          )
                        }
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <FormControl
                      style={{
                        marginTop: 27,
                        display: 'inline-flex',
                        position: 'relative'
                      }}
                    >
                      <TextField
                        id="collection-start-date"
                        name="startDate"
                        label="Planned Date"
                        type="date"
                        value={this.state.selectedDate}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        // inputProps={{ min: moment().add(2, 'days').format('YYYY-MM-DD') }}
                        onChange={this.handleSelectedDate.bind(this)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <CustomInput
                      labelText="Reference"
                      id="reference"
                      name="reference"
                      classNames="reference"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        onChange: (event) => this.handleChange(event.target.value, "reference")
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <CustomFormatInput
                      type="text"
                      labelText="Amount"
                      id="amount"
                      name="amount"
                      numberformat={this.state.amount}
                      formControlProps={{
                        fullWidth: true
                      }}
                      changeValue={this.handleCustomFormatInput.bind(this)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <CustomFormatInput
                      type="text"
                      labelText="Term Number"
                      id="term"
                      name="term"
                      numberformat={this.state.term}
                      formControlProps={{
                        fullWidth: true
                      }}
                      changeValue={this.handleTermNumberInput.bind(this)}
                    />
                  </GridItem>
                </GridContainer>

                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Message"
                      id="message"
                      name="message"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        multiline: true,
                        rows: 1,
                        onChange: (event) => this.handleChange(event.target.value, "message")
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter>
                <Button
                  color="danger"
                  size="sm"
                  onClick={this.props.toggleDrawer}
                >
                  Cancel
                </Button>
                <Button
                  color="info"
                  size="sm"
                  onClick={this.handleAddTransaction.bind(this)}
                >
                  Add Transaction
                </Button>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

ManualCollections.propTypes = {
  classes: PropTypes.object,
  selectedMandate: PropTypes.object,
  smeLoans: PropTypes.array,
  directDebitError: PropTypes.string,
  toggleDrawer: PropTypes.func.isRequired,
  createTransaction: PropTypes.func.isRequired,
  clearTable: PropTypes.func.isRequired,
  hideAddTransactionTable: PropTypes.func.isRequired,
  clearDirectDebitError: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    smeLoans: state.lmglobal.smeLoans,
    selectedMandate: state.mandates.selectedMandate,
    directDebitError: state.smeLoanTransaction.directDebitError
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createTransaction: (mandateNumber, selectedDate, state) => {

      const date = moment(selectedDate).format('YYYY-MM-DD');

      const obj = {
        mandateId: mandateNumber,
        contractId: state.contract.contractId,
        collectionDate: date,
        description: state.message,
        // @ts-ignore
        ourReference: document.getElementById('reference').value,
        amount: state.amount,
        loan: state.contract,
        termNumber: state.term
      };

      if (obj.collectionDate !== '' && obj.amount !== '' && obj.termNumber !== '' && obj.description !== '' && obj.ourReference !== '') {
        dispatch(addManualCollectionDirectDebit(obj));
      } else {
        dispatch(displayNotification('Please fill all the fields', 'warning'))
      }
    },

    clearTable: () => {
      // @ts-ignore
      document.getElementById("message").value = "";
      // @ts-ignore
      document.getElementById("reference").value = "";
      // @ts-ignore
      document.getElementById("amount").value = "";
    },

    hideAddTransactionTable: () => {
      dispatch(showAddTransaction())
    },

    clearDirectDebitError: () => {
      dispatch(clearDirectDebitError())
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ManualCollections));
