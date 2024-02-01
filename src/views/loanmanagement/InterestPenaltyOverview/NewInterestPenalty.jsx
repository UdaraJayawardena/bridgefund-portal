import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';
import { TextField, Select, MenuItem } from '@material-ui/core';
import AmountField from 'components/loanmanagement/CustomFormatInput/CustomFormatInput.jsx';
import { showInterestPaneltyModel, changeInterestPenaltyDescription, confirmInterestPenaltyProcess } from 'store/loanmanagement/actions/InterestPenalty';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import Util from "lib/loanmanagement/utility";
import MultiCurrencyCustomFormatInput from 'components/loanmanagement/MultiCurrencyCustomFormatInput/MultiCurrencyCustomFormatInput';
const currency = Util.multiCurrencyConverter();

const paneltyStyles = {
  table: {
    width: "100%"
  },
  boldTableCell: {
    fontWeight: 500,
    border: '1px solid rgba(224,224,224,1)',
    padding: '8px!important',
  },

  cellBorderStyle: {
    border: '1px solid rgba(224,224,224,1)',
    padding: '8px!important',
  },
};
class NewInterestPenalty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newInterestPenaltyAmount: '',
      isStopInterestPenaltyProcess: 'yes',
      isConfirmButtonClicked: false,
    };
  }

  handleAmountField = (value, name) => {
    this.setState({
      [name]: value,
      isConfirmButtonClicked: false
    });
  };

  handleIsStopInterestPenalty = (event) => {
    this.setState({
      isStopInterestPenaltyProcess: event.target.value,
      isConfirmButtonClicked: false
    });
  }

  handlePenaltyConfirmation = () => {
    const { newInterestPenaltyAmount, isStopInterestPenaltyProcess } = this.state;
    const { penaltyDescription, contractId , loan, interestPaneltyCount, sumInterestPaneltyAmount, paidSpecialDDTransactions} = this.props;
    // @ts-ignore
    if ((newInterestPenaltyAmount === '' || newInterestPenaltyAmount <= 0) && isStopInterestPenaltyProcess === 'no') {
      this.props.displayNotification('Please fill new interest penalty amount', 'warning');
      return;
    }

    if (penaltyDescription === '') {
      this.props.displayNotification('Please fill description', 'warning');
      return;
    }

    // @ts-ignore
    if (newInterestPenaltyAmount < 0) {
      this.props.displayNotification('New interest penalty amount should not be negative ', 'warning');
      return;
    }

    if ( newInterestPenaltyAmount === '' || newInterestPenaltyAmount === null) {
      this.props.displayNotification('New interest penalty amount should contain a value ', 'warning');
      return;
    }
    
    //interst panelty count
    const spDDCount = interestPaneltyCount;
   
    //total interest panelty amount
    const spDDSum = Number(sumInterestPaneltyAmount);
    
    //per panelty amount
    const perAmountForSDD = Number(spDDSum) / Number(spDDCount);
  
    const differanceOfAmounts = sumInterestPaneltyAmount - Number(newInterestPenaltyAmount);

    const calculatedInputAmountValue = (Number(differanceOfAmounts) / Number(perAmountForSDD));
    const calculatedInputAmount = Number(calculatedInputAmountValue.toFixed(2));

    if (calculatedInputAmount%1 !== 0) {
      return this.props.displayNotification('New amount can not be matched to created special-dd ', 'warning');
    }
    
    if (differanceOfAmounts < 0) {
      return this.props.displayNotification('New interest penalty amount should not be negative ', 'warning', 'warning');
    }
    const countOfNotApplicables = Math.round((Number(differanceOfAmounts)/ perAmountForSDD));
   
    const allTransactionIds = paidSpecialDDTransactions && paidSpecialDDTransactions.lenth !==0 ? paidSpecialDDTransactions.map(item=>item._id).sort() : [];

    const transactionIds = countOfNotApplicables === 0 ? [] : allTransactionIds.slice(-countOfNotApplicables);
 
    const reqData = {
      stopChangePenalty: {
        contractId: contractId,
        newInterestPaymentAmount: Number(newInterestPenaltyAmount),
        newInterestPaymentDescription: penaltyDescription,
        stopPaymentInterestIndicator: isStopInterestPenaltyProcess,
        loanId: loan._id,
        smeLoanType: loan.type,
        country : loan.country,
        currency : loan.currency,
        currentInterestPenaltyAmount: Number(sumInterestPaneltyAmount),
        transactionIds: transactionIds
      }
      
    };
    this.props.confirmInterestPenaltyProcess(reqData);
    // console.log("reqData ", reqData);

    this.setState({ isConfirmButtonClicked: false });
  }

  render() {
    const { classes, penaltyDescription, interestPaneltyCount, sumInterestPaneltyAmount , loan , locale, symbol, decimalSeparator, thousandSeparator} = this.props;
    const {newInterestPenaltyAmount  } = this.state;
    
    //differance
  const differance = sumInterestPaneltyAmount - Number(newInterestPenaltyAmount);
    //interestpanelty count
    const spDDCount = interestPaneltyCount;
    
    //per interest panelty amount
    const perAmountForSDD = Number(sumInterestPaneltyAmount) / Number(spDDCount);
    
    //check differance multiply by peramount
    const calculatedInputAmountValue = Number(newInterestPenaltyAmount) / Number(perAmountForSDD);
    
    const calculatedInputAmount = Number(calculatedInputAmountValue.toFixed(2));
    let highAmount;
    let lowAmount;
    if (calculatedInputAmount === Math.floor(calculatedInputAmountValue)) {
      
      highAmount = 0;
      lowAmount = 0;
     
    } else {
      lowAmount = (Math.floor(calculatedInputAmount) * perAmountForSDD).toFixed(2);
      if (lowAmount> sumInterestPaneltyAmount) {
        lowAmount = 0;
      }
      
      highAmount = (Math.floor(calculatedInputAmount + 1) * perAmountForSDD).toFixed(2);
      if (highAmount > sumInterestPaneltyAmount) {
        highAmount = sumInterestPaneltyAmount;
      }
     
    }


    return (
      <React.Fragment>
        <TableRow>
          <TableCell align="center" className={classes.boldTableCell} colSpan={11}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center" className={classes.boldTableCell} colSpan={11}>{'New Interest Penalty'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.boldTableCell}>{'New Interest Penalty'}</TableCell>
          <TableCell className={classes.cellBorderStyle}>
            <MultiCurrencyCustomFormatInput
                      readOnly={this.props.usage === 'EDIT'}
                      className={classes.textField}
                      type="text"
                      id="newInterestPenaltyAmount"
                      name="newInterestPenaltyAmount"
                      numberformat={this.state.newInterestPenaltyAmount}
                      formControlProps={{
                        fullWidth: false
                      }}
                      changeValue={this.handleAmountField.bind(this)}
                      symbol={symbol}
                      decimalSeparator={decimalSeparator}
                      thousandSeparator={thousandSeparator}
                    />
          </TableCell>
          {newInterestPenaltyAmount !== '' && (calculatedInputAmount%1 !== 0) ? 
          <TableCell className={classes.cellBorderStyle}colSpan={9} > {'New amount can not be matched to created special-dd '+ currency(lowAmount ,  locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR') + ' or ' + currency(highAmount ,  locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR') + ' are valid values'}
          </TableCell>: null} 
        </TableRow>
        
        <TableRow>
          <TableCell className={classes.boldTableCell}>{'Check'}</TableCell>
          <TableCell className={classes.cellBorderStyle} align="right">{currency(differance.toFixed(2) ,  locale ? locale : 'nl-NL', loan.currency ? loan.currency : 'EUR')}  
          </TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={9}>&nbsp;</TableCell>
        </TableRow>

        <TableRow>
          <TableCell className={classes.boldTableCell}>{'New Description'}</TableCell>
          <TableCell colSpan={6} className={classes.cellBorderStyle}>
            <TextField style={{ width: '100%' }} InputProps={{ readOnly: true, }} id="new-penalty-description" name="newPenaltyDescription" value={penaltyDescription} onChange={(event) => { this.props.changeInterestPenaltyDescription(event.target.value); }} />
          </TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={3}>&nbsp;</TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.boldTableCell}>{'Stop Interest Penalty process'}</TableCell>
          <TableCell className={classes.cellBorderStyle}>
            <Select
              id="stop-interest-penalty-process"
              value={this.state.isStopInterestPenaltyProcess}
              onChange={this.handleIsStopInterestPenalty}
            >
              <MenuItem value={'yes'}>Yes</MenuItem>
              <MenuItem value={'no'}>No</MenuItem>
            </Select>
          </TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={9}>&nbsp;</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={7} className={classes.cellBorderStyle}>&nbsp;</TableCell>
          <TableCell className={classes.cellBorderStyle}>
            <Button onClick={this.props.showInterestPaneltyModel}>cancel</Button>
          </TableCell>
          <TableCell className={classes.cellBorderStyle}>
            <Button onClick={this.handlePenaltyConfirmation} disabled={this.state.isConfirmButtonClicked}>confirm</Button>
          </TableCell>
          <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
}

NewInterestPenalty.propTypes = {
  classes: PropTypes.object.isRequired,
  contractId: PropTypes.string.isRequired,
  penaltyDescription: PropTypes.string.isRequired,
  changeInterestPenaltyDescription: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  confirmInterestPenaltyProcess: PropTypes.func.isRequired,
  showInterestPaneltyModel: PropTypes.func.isRequired,
  usage: PropTypes.string,
  totalOutstandingOnClaimDate:  PropTypes.number.isRequired,
  paidSpecialDDTransactions: PropTypes.array,
  filteredTransactionsForClaimDate: PropTypes.array,
  interestPaneltyCount: PropTypes.number.isRequired,
  sumInterestPaneltyAmount: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  return {
    penaltyDescription: state.interestPenalty.penaltyDescription,
    loan: state.lmglobals.selectedLoan,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showInterestPaneltyModel: () => {
      dispatch(showInterestPaneltyModel());
    },
    changeInterestPenaltyDescription: (description) => {
      dispatch(changeInterestPenaltyDescription(description));
    },
    displayNotification: (msg, type) => {
      dispatch(displayNotification(msg, type));
    },
    confirmInterestPenaltyProcess: (reqData) => {
      dispatch(confirmInterestPenaltyProcess(reqData));
    },
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(paneltyStyles)(NewInterestPenalty));