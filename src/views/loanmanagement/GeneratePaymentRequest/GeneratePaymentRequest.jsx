import moment from 'moment';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStyles, withStyles } from "@material-ui/core/styles";
import Card from 'components/loanmanagement/Card/Card.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import CardFooter from 'components/loanmanagement/Card/CardFooter.jsx';
import Button from 'components/loanmanagement/CustomButtons/Button.jsx';
import ConfirmationDialog from 'components/loanmanagement/ConfirmationDialog/ConfirmationDialog';
import { Paper, Table, TableBody, TableRow, TableCell, TextField } from '@material-ui/core';
import CustomFormatInput from 'components/loanmanagement/CustomFormatInput/CustomFormatInput.jsx';
import Util from 'lib/loanmanagement/utility';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import { getNextWorkingDate } from 'store/loanmanagement/actions/Holidays';
import { showGeneratePaymentRequest, sendTikkiePayment, getTikkieMaximumAmount } from 'store/loanmanagement/actions/GeneratePaymentRequest';

const currency = Util.currencyConverter();

const genereatePaymentOverviewStyles = createStyles({

  OddTableCell: {
    fontWeight: 500,
    borderRight: '1px solid rgba(224,224,224,1)',
    padding: '3px',
  },
  NormalOddTableCell: {
    fontWeight: 200,
    borderRight: '1px solid rgba(224,224,224,1)',
    padding: '3px',
  },
  TitleTableCell: {
    fontWeight: 500,
    borderRight: '1px solid rgba(224,224,224,1)',
    textAlignLast: 'center',
    background: 'gold',
    padding: '3px',
  },

  cellBorderStyle: {
    borderRight: '1px solid rgba(224,224,224,1)',
    padding: '3px',
  },
  SpecialCellBorderStyle: {
    borderRight: '1px solid rgba(224,224,224,1)',
    padding: '3px',
    fontWeight: 500,
  }
});

class GeneratePaymentRequest extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tikkieAmount: 0,
      tikkieDescription: '',
      isShowWarning: false,
      isShowTikkeRequestCopy: false,
      tikkieRequestUrl: '',
      isUrlCopied: false,
      expiryDate: moment().format('YYYY-MM-DD'),
      maxAmount: 0
    };
  }

  componentDidMount() {

    const tikkieAmount = this.props.tikkieData.tikkieAmount || 0;
    const tikkieDescription = this.props.tikkieData.tikkieDescription || '';

    this.setState({ tikkieAmount, tikkieDescription });

    this.props.getNextWorkingDay(moment(this.props.systemDate).format('YYYY-MM-DD'), 3)
      .then((result) => {
        this.setState({ expiryDate: result });
      });

    this.props.getTikkieMaxAmount('max-amount')
      .then((result) => {
        this.setState({ maxAmount: result.configData.maxAmount });
      });
  }

  handleInputChange = (event) => {

    if (event.target) {
      this.setState({ [event.target.name]: event.target.value });
    } else {
      this.setState({ tikkieAmount: Number(event) });
    }
  }

  validateTikkieAmount = () => {

    if (this.state.tikkieAmount > this.state.maxAmount) {
      this.props.displayNotification(`Tikkie amount cannot exceed ${this.state.maxAmount}`, 'warning');
      return false;
    }

    const isMultiple = (this.state.tikkieAmount % Number(this.props.tikkieData.amountNormalDirectDebits.toFixed(2))) === 0 ? true : false;
    this.setState({ isShowWarning: !isMultiple });
    return isMultiple;
  };

  confirmPayment = () => {

    if (this.validateTikkieAmount()) this.sendPaymentRequest();
  };

  sendPaymentRequest = () => {

    if (this.state.tikkieAmount === 0) return this.props.displayNotification('Tikkie payment amount cannot be zero', 'warning');

    // @ts-ignore
    const convertAmountInCents = (this.state.tikkieAmount*100).toFixed(2);

    const requestBody = {
      amountInCents: Number(convertAmountInCents.toString().split('.')[0]),
      expiryDate: this.state.expiryDate,
      description: this.state.tikkieDescription,
      referenceId: this.props.tikkieData.contractId
    };

    this.props.sendTikkiePayment(requestBody)
      .then(response => {
        if (!response.success) throw response;
        this.setState({ tikkieRequestUrl: response.data.url, isShowTikkeRequestCopy: true, isShowWarning: false });
        this.props.displayNotification('Tikkie payment request sent', 'success');
      })
      .catch((error) => {
        console.error('Tikkie Payment Error', error);
        this.props.displayNotification('Tikkie payment request failed', 'error');
      });
  };

  copyUrlToClipboard = () => {
    const element = document.getElementById('tikkie-url');
    // @ts-ignore
    element.select();
    const result = document.execCommand('copy');
    if (result) {

      this.setState({ isUrlCopied: true });
      this.props.displayNotification('Tikkie Request URL successfully coppied to the clipboard', 'success');
    }
  };

  tikkieUrldialogContent = () => {

    return (
      <TextField
        id="tikkie-url"
        name="tikkieUrl"
        type="text"
        value={this.state.tikkieRequestUrl}
        fullWidth
        contentEditable={false}
      />
    );
  };

  render() {

    const { classes, tikkieData } = this.props;

    return (
      <div>
        <Card>
          <CardBody>
            <Paper style={{ width: '80%', margin: 'auto', }}>
              <Table id="generate-payment-request-table">
                <TableBody id="generate-payment-request-table-body">
                  <TableRow>
                    <TableCell className={classes.TitleTableCell} colSpan={4}>TIKKIE-PAYMENT</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} colSpan={4}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell}>Principle Amount</TableCell>
                    <TableCell id="principle" className={classes.cellBorderStyle} >{currency(tikkieData.principle)} </TableCell>
                    <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} colSpan={4}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.OddTableCell} colSpan={2}>Outstanding Normal DD</TableCell>
                    <TableCell className={classes.OddTableCell} colSpan={2}>Outstanding Special DD</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} >Number of Outstanding DD</TableCell>
                    <TableCell id="outstanding-normal-dd" className={classes.cellBorderStyle}>{tikkieData.outstandingNormalDirectDebits}</TableCell>
                    <TableCell className={classes.NormalOddTableCell} >Number of Outstanding DD</TableCell>
                    <TableCell id="outstanding-special-dd" className={classes.cellBorderStyle}>{tikkieData.outstandingSpecialDirectDebits}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} >Missed DD</TableCell>
                    <TableCell id="missed-normal-dd" className={classes.cellBorderStyle}>{tikkieData.missedNormalDirectDebits}</TableCell>
                    <TableCell className={classes.NormalOddTableCell} >Missed DD Amount</TableCell>
                    <TableCell id="missed-special-dd" className={classes.cellBorderStyle}>{currency(tikkieData.missedSpecialDirectDebits)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} >DD-amount</TableCell>
                    <TableCell id="amount-normal-dd" className={classes.cellBorderStyle}>{currency(tikkieData.amountNormalDirectDebits)}</TableCell>
                    <TableCell className={classes.NormalOddTableCell} >{/* DD-amount */}</TableCell>
                    <TableCell id="amount-normal-dd" className={classes.cellBorderStyle}>{/* {currency(tikkieData.amountSpecialDirectDebits)} */}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.OddTableCell} >Outstanding amount</TableCell>
                    <TableCell id="outstanding-amount-normal-dd" className={classes.SpecialCellBorderStyle}>{currency(tikkieData.outstandingAmountNormalDirectDebits)}</TableCell>
                    <TableCell className={classes.OddTableCell} >Outstanding amount</TableCell>
                    <TableCell id="outstanding-amount-special-dd" className={classes.SpecialCellBorderStyle}>{currency(tikkieData.missedSpecialDirectDebits)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} colSpan={4}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} >Total Outstanding</TableCell>
                    <TableCell id="total-outstanding-amount" className={classes.cellBorderStyle}>{currency(tikkieData.totalOutstandingAmount)}</TableCell>
                    <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} >Partial Payment</TableCell>
                    <TableCell id="partial-payment-amount" className={classes.cellBorderStyle} >{currency(tikkieData.partialPaymentAmount)}</TableCell>
                    <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableCell className={classes.NormalOddTableCell} colSpan={4}>&nbsp;</TableCell>
                  </TableRow> */}
                  <TableRow>
                    <TableCell className={classes.TitleTableCell} colSpan={4}>TIKKIE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} colSpan={4}>&nbsp;</TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableCell className={classes.NormalOddTableCell}>Number of DD for Tikkie	</TableCell>
                    <TableCell id="tikkie-dd-number" className={classes.cellBorderStyle} >{tikkieData.tikkieDdNumber} </TableCell>
                    <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
                  </TableRow> */}
                  <TableRow>
                    <TableCell className={classes.OddTableCell}>TIKKIE-amount</TableCell>
                    <TableCell className={classes.SpecialCellBorderStyle} >
                      <CustomFormatInput
                        type="text"
                        // labelText="Amount"
                        id="tikkieAmount"
                        name="tikkieAmount"
                        numberformat={this.state.tikkieAmount}
                        formControlProps={{
                          fullWidth: true
                        }}
                        changeValue={(event) => this.handleInputChange(event)}
                      />
                    </TableCell>

                    <TableCell className={classes.cellBorderStyle} colSpan={2}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell}>Description</TableCell>
                    <TableCell className={classes.cellBorderStyle} colSpan={3}>
                      <TextField
                        id="tikkie-description"
                        name="tikkieDescription"
                        // label="Description"
                        type="text"
                        value={this.state.tikkieDescription}
                        fullWidth
                        onChange={(event) => this.handleInputChange(event)}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.NormalOddTableCell} colSpan={4}>&nbsp;</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.OddTableCell} colSpan={2} >&nbsp;</TableCell>
                    <TableCell className={classes.cellBorderStyle}>
                      <Button id="generate-payment-cancel-button" color="danger" size="sm" onClick={this.props.showGeneratePaymentRequest}
                      > Cancel </Button>
                    </TableCell>
                    <TableCell className={classes.cellBorderStyle}>
                      <Button id="generate-payment-confirm-button" color="info" size="sm" onClick={this.confirmPayment}
                      > Confirm </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </CardBody>
          <CardFooter>

          </CardFooter>
        </Card>

        <ConfirmationDialog
          key="tikkie-amount-confirm-dialog"
          title='Tikkie Amount Confirmation'
          ok='confirm'
          cancel='cancel'
          open={this.state.isShowWarning}
          handleOk={this.sendPaymentRequest}
          handleCancel={() => { this.setState({ isShowWarning: false }); }}
          content='Tikke amount is not a multiple of the normal direct debit amount'
        />

        <ConfirmationDialog
          key="tikkie-url-request-dialog"
          title='Tikkie Request URL'
          ok='copy'
          cancel='close'
          open={this.state.isShowTikkeRequestCopy}
          handleOk={this.copyUrlToClipboard}
          handleCancel={() => {
            this.setState({ isShowTikkeRequestCopy: false });
            if (this.state.isUrlCopied) this.props.showGeneratePaymentRequest();
          }}
          dialogContent={this.tikkieUrldialogContent()}
        />
      </div>
    );
  }
}

GeneratePaymentRequest.propTypes = {
  classes: PropTypes.object,
  tikkieData: PropTypes.object,

  getNextWorkingDay: PropTypes.func.isRequired,
  sendTikkiePayment: PropTypes.func.isRequired,
  getTikkieMaxAmount: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  showGeneratePaymentRequest: PropTypes.func.isRequired,
  systemDate: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    systemDate: state.configurations.simulations.systemDate,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showGeneratePaymentRequest: () => {
      return dispatch(showGeneratePaymentRequest());
    },
    sendTikkiePayment: (reqData) => {
      return dispatch(sendTikkiePayment(reqData));
    },
    displayNotification: (msg, type) => {
      dispatch(displayNotification(msg, type));
    },
    getNextWorkingDay: (expiryDate, noOfDaysAhead) => {
      return dispatch(getNextWorkingDate(expiryDate, noOfDaysAhead));
    },
    getTikkieMaxAmount: (type) => {
      return dispatch(getTikkieMaximumAmount(type));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(genereatePaymentOverviewStyles)(GeneratePaymentRequest));