/* eslint-disable no-empty-function */
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { TextField, FormControl, Select,MenuItem } from '@material-ui/core';

import Style from "assets/jss/bridgefundPortal/views/mandateOverviewStyles";
import GridContainer from 'components/crm/Grid/GridContainer';
import GridItem from 'components/crm/Grid/GridItem';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import { getCustomerListByCommonSearch } from 'store/crm/actions/Customer.action';

import Autocomplete from "@material-ui/lab/Autocomplete";
import { displayNotification } from 'store/crm/actions/Notifier';
import { updateMandate, getBankAccounts } from "store/loanmanagement/actions/MandateApproval";
import { getBicFrmIban } from 'store/loanmanagement/actions/BicIban';
import { exit } from 'process';

class NewMandate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      legalName: '',
      customers: [],
      customerIbans: [],
      IBAN: '',
      selectedCustomer: null,
      selectedCustomerId : '',
      selectedvTigerAccountNumber : '',
      loanRequestId : '',
      limit : '',
      mandateType: 'B2B',
      bankBic: '',
      isSaving: false,
      processText:'Process',
    };
  }

  componentDidMount() {
    this.setState({
      open: true,     
    });   
  }

  componentDidUpdate(nextProps) {
    if (nextProps.mandates && this.props.mandates !== nextProps.mandates) {
      this.setState({ mandates: nextProps.mandates });
    }
  }
 
  handleCustomerChange = (customer) => {
    this.setState({ 'customerIbans': []}); 
    if (customer){
      const customerId = customer.id;
      this.setState({ 'selectedCustomer': customer });  
      this.setState({ 'selectedCustomerId': customerId});  
      this.setState({ 'selectedvTigerAccountNumber': customer.vTigerAccountNumber});  
      this.getCustomerIbanList(customerId);
    }else{
      this.setState({ 'selectedCustomer': null}); 
      this.setState({ 'selectedCustomerId': ''}); 
      this.setState({ 'selectedvTigerAccountNumber': ''}); 
      this.setState({ 'IBAN': ''}); 
    }    
  };

  handleChange = (name, value) => {
    this.setState({ [name]: value } );    
  };

  searchCustomers = ( value ) => { 
    this.props.getCustomerListByCommonSearch(value)
    .then(res => {
      this.setState({ customers: res });
    })
    .catch(err => console.log("err in get all customers ", err));
  };

  handleIbanChange = (value) => {
    const { getBicNo } = this.props;
    if(value!==''){
      getBicNo(value)      
      .then(res => {        
        this.setState({ bankBic: res.bic_no.bankBic });
			});     
    } 
  };

  clearMandate = () => { 
    this.setState({ 
      'legalName': '',
      'IBAN': '',
      'selectedCustomer': null,
      'selectedCustomerId' : '',
      'selectedvTigerAccountNumber' : '',
      'loanRequestId' : '',
      'limit' : '',
      'bankBic': '',
      'customerIbans': [],
      'isSaving': false,
      'processText':'Process',
    });
  };

  handleProcess = () => {    
    const { bankBic, limit, IBAN, mandateType, loanRequestId,    
      selectedCustomerId,selectedvTigerAccountNumber } = this.state;
    const { updateMandate } = this.props;
   
    if (selectedCustomerId === "") {
      return this.props.displayNotification('Please select a Customer', 'warning');
    }
    if (loanRequestId === "") {
      return this.props.displayNotification('Please enter Loan Request Id', 'warning');
    }
    if (IBAN === "") {
      return this.props.displayNotification('Please enter IBAN number', 'warning');
    }
    if (bankBic === "") {
      return this.props.displayNotification('Bank code not found', 'warning');
    }
    if (limit === "") {
      return this.props.displayNotification('Please enter limit', 'warning');
    }
   
    const eMandateApprovedBanks = ['ABNANL2A','INGBNL2A','RABONL2U'];
    const eMandate=eMandateApprovedBanks.includes(bankBic);

    const param = {
      "action"    : 'add',      
      "smeId"     : selectedvTigerAccountNumber,     
      "ibanNumber": IBAN,      
      "eMandate"  : eMandate,      
      "bicCode"   : bankBic,      
      "type"      : mandateType,
    };
    
    this.setState({ 'isSaving': true, 'processText':'Saving'});
    updateMandate(param)
    .then(res => {  
      this.clearMandate();
      this.props.handleCancel();    
      return this.props.displayNotification('New Mandate Saving Success', 'success');
    })
    .catch(e => {
      console.log('error in mandate create ', e);
    });

  }; 

  getCustomerIbanList = (customerId) => { 
    const param = {
      action: "get",
      mandateIndicator: '1',
      customerId: customerId,      
    };    

    this.props.getBankAccounts(param)
    .then(res => {
      this.setState({ 'IBAN': ''});
      const ibans = res.data.map(data => ({ iban: data.perBankAccount.iban_number}));
      this.setState({ 'customerIbans': ibans});
      if(res.data.length===1){
        this.setState({ 'IBAN': res.data[0].perBankAccount.iban_number});        
      }      
    });
            
  };

  render() {
    const { classes } = this.props;
    const { customers, customerIbans } = this.state;    
    return (
      <div>
        <Dialog
          id="confirm-dialog"
          open={this.props.open}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">ADD NEW MANDATE {this.state.legalName!==''?' - '+this.state.legalName:''}</DialogTitle>
        <DialogContent>          
          <GridContainer >
          <GridItem className={classes.smallBox}>
            <Autocomplete
              size="small"
              className={classes.itemStyles}
              ListboxProps={{
                className: classes.autoSuggestListStyle
              }}
              value={this.state.legalName}
              onChange={(event, newValue) => {
                if (newValue) {
                  this.setState({ legalName: newValue });
                }
              }}

              onInputChange={(event, newInputValue) => {                
                 if(newInputValue!==''){
                  this.searchCustomers(newInputValue);
                  this.setState({ legalName: newInputValue });
                  this.handleCustomerChange(customers.find(c => c.legalName === newInputValue));
                 }
              }}

              id='customer-search'
              options={customers.map(c => c.legalName)}
              renderInput={(params) => (
                <TextField {...params} label={'Customer *'} variant="outlined"
                  InputLabelProps={{
                    className: classes.autoSuggestTextLabelStyle,
                  }}
                  InputProps={{
                    ...params.InputProps,
                    className: classes.autoSuggestTextStyle,
                  }} />
              )}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='customerId'
              label='Customer ID'
              name='customerId'
              changeToFormatType='CamelCase' 
              value={this.state.selectedCustomerId}             
              placeholder='Customer ID' />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='loanRequestId'
              label='Loan Request ID'
              name='loanRequestId'
              value={this.state.loanRequestId}
              changeToFormatType='CamelCase'
              onChange={this.handleChange.bind(this)}
              placeholder='Loan Request ID' />
          </GridItem>
          <GridItem className={classes.smallBox}>  
          <FormControl className={classes.formControl}>       
            {/* <CustomInputBox
              id='IBAN'
              name='IBAN'
              label='IBAN'
              value={this.state.IBAN}
              onChange={
                //this.handleChange.bind(this)
                //onChange={(e) => props.changeValue(event.target.value, name)}
                //console.log('ddd')
                (name, value) => this.handleIbanChange(name, value)
              }
							//onChange={(name, value) => this.handleChange(name, value, 'companyStructure')}

              placeholder='IBAN'
              /> */}

            <Autocomplete
              size="small"
              className={classes.itemStyles}
              ListboxProps={{
                className: classes.autoSuggestListStyle
              }}
              value={this.state.IBAN}
              onChange={(event, newValue) => {
                if (newValue) {
                  this.setState({ IBAN: newValue });
                }
              }}

              onInputChange={(event, newInputValue) => {
                this.setState({ IBAN: newInputValue });
                this.handleIbanChange(newInputValue);
              }}

              id='customer-search'
              options={customerIbans.map(i => i.iban)}
              renderInput={(params) => (
                <TextField {...params} label={'IBAN *'} variant="outlined"
                  InputLabelProps={{
                    className: classes.autoSuggestTextLabelStyle,
                  }}
                  InputProps={{
                    ...params.InputProps,
                    className: classes.autoSuggestTextStyle,
                  }} />
              )}
            />
              </FormControl>   
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='limit'
              label='Limit'
              name='limit'
              value={this.state.limit}
              changeToFormatType='CamelCase'
              onChange={this.handleChange.bind(this)}
              placeholder='Limit' />
          </GridItem>   
        </GridContainer>
        </DialogContent>
        <DialogActions>
          <Button id="confirm-dialog-cancel-button" 
          onClick={this.props.handleCancel}           
          >
            Cancel
          </Button>
          <Button id="confirm-dialog-ok-button" 
          onClick={this.handleProcess} 
          //color="primary" 
          className={classes.confirmIconButton}
          disabled={this.state.isSaving} 
          //autoFocus
          >          
            {this.state.processText}
          </Button>
        </DialogActions>
        </Dialog>
      </div>
    );
  }
}

NewMandate.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string,
    content: PropTypes.any,    
    dialogContent: PropTypes.any,
    customerList: PropTypes.array.isRequired,
    searchCustomers: PropTypes.func.isRequired,
    displayNotification: PropTypes.func,
    selectedCustomer : PropTypes.object,
    selectedCustomerId : PropTypes.any,
    loanRequestId : PropTypes.any,
    limit : PropTypes.any,
    updateMandate : PropTypes.func.isRequired,
    getBicNo: PropTypes.func.isRequired,
    bicNum: PropTypes.object,
    handleCancel: PropTypes.func,
};


const mapStateToProps = (state) => ({  
  customerList: state.customer.customerList,
});

const mapDispatchToProps = (dispatch) => ({  
  getCustomerListByCommonSearch: (value) => dispatch(getCustomerListByCommonSearch(value)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  updateMandate:  (data) => dispatch(updateMandate(data)),
  getBicNo: iban => dispatch(getBicFrmIban(iban)),
  getBankAccounts: (requestQuery) => dispatch(getBankAccounts(requestQuery)),

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(NewMandate));