/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-const */
// @ts-nocheck
import React from "react";
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/smeLoanRecoveryAppointmentStyles.jsx";

import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, MenuItem, FormControl, Select, Drawer, TableSortLabel, TextField,
  TablePagination, Dialog, DialogContent, DialogActions, DialogTitle, DialogContentText, RadioGroup,
  FormControlLabel, Radio , TableContainer
} from "@material-ui/core";

import { EditOutlined, AddAlert, RotateLeft, Update, Style, PlayCircleFilled } from "@material-ui/icons";

import Button from 'components/loanmanagement/CustomButtons/Button.jsx';

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';

import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import LoanSetDefault from "components/loanmanagement/SetDefault/LoanSetDefault.jsx";

import {
  switchAddNewLoanAppointmentPopupState,
  getLoanAppointmentsByLoanId,
  setLoanRecoveryAppointmentData, getSmeLoanTransactionsOverview, smeLoanSetInDefault, getAllFilteredLoanAppointments
} from "store/loanmanagement/actions/LoanRecoveryApointments.js";
import { showInterestPaneltyModel } from 'store/loanmanagement/actions/InterestPenalty';
import { selectLoan , requestSmeLoans , claimLoanByLoanId, clearSelectedLoan, getCalculatedDataOfLoanTransactions, startStopSmeLoanInterestPenalty, getPlatformParameters } from "store/loanmanagement/actions/SmeLoans";
import { clearDirectDebits } from 'store/loanmanagement/actions/SmeLoanTransaction';
import { clearSelectedSme } from 'store/loanmanagement/actions/Smes';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import Util from 'lib/loanmanagement/utility';

import AddNewLoanRecoveryAppointment from "./AddNewLoanRecoveryAppointment";
import ClaimLoan from '../SingleLoanOverview/ClaimLoan';
import InterestPenaltyOverview from "views/loanmanagement/InterestPenaltyOverview";
import { Autocomplete } from '@material-ui/lab';
import { changeCustomerDetails, clearSelectedCustomer, clearHeaderDisplaySubData } from 'store/loanmanagement/actions/HeaderNavigation';
import { getLocales, getFieldNameValues } from 'store/initiation/actions/Configuration.action';
import CustomSearch from "components/crm/CustomInput/CustomSearch";
import { getCustomerListPerPage } from "store/crm/actions/Customer.action";
const currency = Util.multiCurrencyConverter();

export const MessageType = { All:'All' , INTERNAL: 'IN', EXTERNAL: 'EX' };
export let AppointmentStatus = { All:'All' , OPEN: 'Open', CLOSED: 'Close' };

class SmeLoanRecoveryAppointment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedMessageType: 'All',
      selectedStatus: 'All',
      newAppointmentProps: {},

      order: 'asc',
      orderBy: 'appointmentDate',
      page: 0,
      rowsPerPage: 25,
      selectedLoanForSetDefault: null,
      loanSeInDefault: null,
      reason: 0,
      provisionPercentage: 100,
      inDefaultLoans: [],
      ShowClaimLoanDrawer: false,
      selectedPenaltyTransaction: null,
      showStartStopInterestPaneltyDrawer: false,
      interestPenaltyIndicator: '',
      sendMessage: 'no',
      contact: '',
      loan: {},
      locale: '',
      decimalSeparator: '',
      symbol: '',
      thousandSeparator: '',
      countries: {},
      selectedCountry: '',
      allLocales : [],
      updatesBanksmeLoanRecoveryAppointments: [],
      companyNameValue: ''
    };
  }

  componentDidMount() {
    const { origin, loanId, isDashboardContent, lmContractMongoId , smeDetails } = this.props;
    this.props.getLocales()
    .then((localeData) => {
      if(localeData) {
        this.setState({
          allLocales : localeData
        });
      }
    });
    //if (origin === "SingleLoanOverview") return this.props.getLoanAppointmentsByLoanId(loanId);
    this.getFieldNameValues();
    let searchOptions = {};
    if (lmContractMongoId !== "") {
      searchOptions = {
        smeId: smeDetails.id,
        smeLoanId: lmContractMongoId,
        status: this.state.selectedStatus,
        internalExternalSwitch: this.state.selectedMessageType,
        rowsPerPage: this.state.rowsPerPage,
        pageNumber: this.state.page,
        orderBy:this.state.orderBy,
        order: this.state.order,
       country: this.state.selectedCountry
      };
      this.setState({companyNameValue : smeDetails.company});
      return this.props.getAllFilteredLoanAppointments(searchOptions);
    } 
    if(smeDetails.id !== ""){
      searchOptions = {
        smeId: smeDetails.id,
        status: this.state.selectedStatus,
        internalExternalSwitch: this.state.selectedMessageType,
        rowsPerPage: this.state.rowsPerPage,
        pageNumber: this.state.page,
        orderBy:this.state.orderBy,
        order: this.state.order,
        country: this.state.selectedCountry
      };
      this.setState({companyNameValue : smeDetails.company});
      this.setState({customerId : smeDetails.id});
      return this.props.getAllFilteredLoanAppointments(searchOptions);
    }
    
    if((smeDetails.id === '') && (lmContractMongoId ==='')){
      searchOptions = {
        smeId: this.state.companyNameValue,
        status: this.state.selectedStatus,
        internalExternalSwitch: this.state.selectedMessageType,
        rowsPerPage: this.state.rowsPerPage,
        pageNumber: this.state.page,
        orderBy:this.state.orderBy,
        order: this.state.order,
       country: this.state.selectedCountry
      };
      return this.props.getAllFilteredLoanAppointments(searchOptions);
    }
  }

  componentDidUpdate(prevProps) {
		if (prevProps.smeLoanRecoveryAppointments !== this.props.smeLoanRecoveryAppointments) {
			this.updateAppoinmetWithLocale(this.props.smeLoanRecoveryAppointments);
	 	}
     if (prevProps.stateOfGetNewLoanRecoveryData === false && this.props.stateOfGetNewLoanRecoveryData === true){
      const searchOptions = {
        smeId: this.props.smeDetails.id,
        smeLoanId: this.props.lmContractMongoId,
        status: this.state.selectedStatus,
        internalExternalSwitch: this.state.selectedMessageType,
        rowsPerPage: this.state.rowsPerPage,
        pageNumber: this.state.page,
        orderBy:this.state.orderBy,
        order: this.state.order,
       country: this.state.selectedCountry
      };
       this.props.getAllFilteredLoanAppointments(searchOptions);
     }
	};

  updateAppoinmetWithLocale = (smeLoanRecoveryAppointments) => {
		const { allLocales } = this.state;
		const updatesBanksmeLoanRecoveryAppointments = smeLoanRecoveryAppointments;
		if(updatesBanksmeLoanRecoveryAppointments && updatesBanksmeLoanRecoveryAppointments.length > 0 && allLocales && allLocales.length > 0){
			updatesBanksmeLoanRecoveryAppointments.find((Appointment) => {
				const currencyCode = (Appointment.smeLoan && Appointment.smeLoan.currency) ? Appointment.smeLoan.currency : 'EUR';
        const countryCode = (Appointment.smeLoan && Appointment.smeLoan.country) ? Appointment.smeLoan.country : 'NL';
				allLocales.find((item) => {
					if(item.currencyCode === currencyCode && item.countryCode === countryCode){
						Appointment.locale = item.locale;	
					}	
				});
			});
		}

		this.setState({
			updatesBanksmeLoanRecoveryAppointments : updatesBanksmeLoanRecoveryAppointments
		});		
	};

  componentWillUnmount() {
    this.props.clearLoanRecoveryAppointments();
    if (this.props.origin === "ADMIN") {
      this.props.clearSelectedLoan();
      this.props.clearDirectDebits();
      this.props.clearSelectedSme();
    }
  }

  getFieldNameValues = () => {

    const requestObj = {fieldName: 'country'};
   
      this.props.getFieldNameValues(requestObj)
        .then((response) => {
          
          if (Array.isArray(response)) {
            
            if (response.length > 0) {
              const fieldNameValues = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES');
              let obj = { All: "All"};
              fieldNameValues.map((fieldNameValue) => {
                obj[fieldNameValue.fieldNameValue] = fieldNameValue.fieldNameValue
              });
              this.setState({ countries: obj });
            }
          }
          
        });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };


  handleChangePage = (event, page) => {
    const {  lmContractMongoId  } = this.props;
    this.setState({ page: page });
    const searchOptions = {
      smeId: this.props.smeDetails.id,
      smeLoanId: lmContractMongoId,
      status: this.state.selectedStatus,
      internalExternalSwitch: this.state.selectedMessageType,
      rowsPerPage: this.state.rowsPerPage,
      pageNumber: page,
      orderBy:this.state.orderBy,
      order: this.state.order,
     country: this.state.selectedCountry
    };
    return this.props.getAllFilteredLoanAppointments(searchOptions);
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    const {  lmContractMongoId  } = this.props;
    this.setState({ page: 0 });
    const searchOptions = {
      smeId: this.props.smeDetails.id,
      smeLoanId: lmContractMongoId,
      status: this.state.selectedStatus,
      internalExternalSwitch: this.state.selectedMessageType,
      rowsPerPage: event.target.value,
      pageNumber: 0,
      orderBy:this.state.orderBy,
      order: this.state.order,
     country: this.state.selectedCountry
    };
    return this.props.getAllFilteredLoanAppointments(searchOptions);
  };

  handleInterestPenaltyButtonClick = (recoveryAppointment) => {

    this.props.requestSmeLoans(recoveryAppointment.smeId)
      .then(res => {
        
        res.forEach((element) => {
        if(element._id === recoveryAppointment.smeLoan._id ){
          this.props.getLocales({countryCode: (recoveryAppointment.smeLoan && recoveryAppointment.smeLoan.country) ? recoveryAppointment.smeLoan.country : 'NL', currencyCode: (recoveryAppointment.smeLoan && recoveryAppointment.smeLoan.currency) ? recoveryAppointment.smeLoan.currency : 'EUR'})
            .then(res => {
              if (!res || res.length == 0) {             
             return this.props.displayNotification('Country and currency doesnt fit', 'warning');
            }
            this.setState({ 
                locale: res[0].locale,
                decimalSeparator: res[0].decimalSeparator,
                symbol: res[0].currencySymbol,
                thousandSeparator: res[0].thousandSeparator, 
        });

        this.props.selectLoan(element);
          this.props.getCalculatedDataOfLoanTransactions(element.contractId)
          .then(() => {
            const penaltyTransaction = this.props.directdebits.find(dd => (dd.type === 'interest-penalty'));
            if (penaltyTransaction) {
              this.setState({ selectedPenaltyTransaction: penaltyTransaction },
                () => {
                  this.props.showInterestPaneltyModel();
                });
            } else {
              this.props.displayNotification('There is no interest-penalty found for this loan', 'warning');
            }
          });      
        })
        .catch(err => { console.log('getLocales err ', err); });          
        }
        });
      })
      .catch(e => {
        console.log('error in requestSmeLoans ', e);
        this.setLoading(false);
      });
  }

  getLocales = async (country , currency) => {
    const { loan } = this.props;

    if (loan.country && loan.currency) {
        this.props.getLocales({countryCode: loan.country, currencyCode: loan.currency})
            .then(res => {
        if (!res || res.length == 0) {             
          return this.props.displayNotification('Country and currency doesnt fit', 'warning');
        }
        this.setState({ 
            locale: res[0].locale,
            decimalSeparator: res[0].decimalSeparator,
            symbol: res[0].currencySymbol,
            thousandSeparator: res[0].thousandSeparator, 
        });
       
        })
        .catch(err => { console.log('getLocales err ', err); });
    }    
  }

  handleChangeAppointment = (usage, appointment) => {

    const createdAtDay = moment(appointment.createdAt).format('YYYY-MM-DD HH:mm:ss');
    let curruntTime = '';
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
       const  time = new Date().toLocaleTimeString();
       const day = moment(this.props.configurations.simulations.systemDate).format('YYYY-MM-DD');
       curruntTime = moment(day + " " + time);
       
    } else {

      curruntTime = moment();
    }
    const duration = moment.duration(curruntTime.diff(createdAtDay));
    const hours = parseInt(duration.asHours());
  
    if(usage === 'EDIT'){

      if(hours < 24){
        
        let props = {
          usage: usage,
          appointment: appointment,
          origin: this.props.origin
        };
        this.setState({ newAppointmentProps: props });
        this.props.switchAddNewLoanAppointmentPopupState();
      }else{
        this.props.displayNotification('Change can be done only withing one day', 'warning');
      }
    }else{
      let props = {
        usage: usage,
        appointment: appointment,
        origin: this.props.origin
      };
      this.setState({ newAppointmentProps: props });
      this.props.switchAddNewLoanAppointmentPopupState();
    }
    
    
  }

  handleClaimLoanScreen = (appointment) => {

    this.props.claimLoanByLoanId(appointment.smeLoan._id , appointment.smeId)
      .then(() => {
        this.handleClaimScreen(true);
      });
  }

  handleClaimScreen = () => {
    this.setState({ ShowClaimLoanDrawer: !this.state.ShowClaimLoanDrawer });
  }

  handleRequestSort = (property, event) => {
    const orderBy = property;
    
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
    const {  lmContractMongoId  } = this.props;
    const searchOptions = {
      smeId: this.props.smeDetails.id,
      smeLoanId: lmContractMongoId,
      status: this.state.selectedStatus,
      internalExternalSwitch: this.state.selectedMessageType,
      rowsPerPage: this.state.rowsPerPage,
      pageNumber: this.state.page,
      orderBy: orderBy,
      order: order,
     country: this.state.selectedCountry
    };
    
    return this.props.getAllFilteredLoanAppointments(searchOptions);
  };

  get filteredData() {
    let appointments = this.props.smeLoanRecoveryAppointments;

    if (this.state.selectedStatus) {
      appointments = appointments.filter(appointment => appointment.status === this.state.selectedStatus);
    }
    return appointments;
  }

  loanSetInDefaultGetData = (appointment) => {
    this.setState({ selectedLoanForSetDefault: appointment.smeLoan._id  }, () => {

      this.props.getDataForLoanSettingDefault({ loanId: appointment.smeLoan._id  })
        .then((response) => {

          let data = null;

          if (response && response.transactions.length > 0) {

            const { overview, transactions } = response;

            let { totalLoanAmount } = overview;

            let plannedNormalDds = 0;
            for (let trans of transactions) {
              if (trans && trans.type === 'normal-dd' && trans.termNumber !== 0) plannedNormalDds++;
            }

            /* Transactions Filter */
            /* type=normal && status=open||sent-to-bank */
            let normalOutstandingTransactions = this._filterTransactions(transactions, ['open', 'sent-to-bank'], ['normal-dd'], true, true);

            /* type=normal && status=failed||frequently-failed||rejected||frequently-rejected */
            let normalMissedTransactions = this._filterTransactions(transactions, ['failed', 'frequently-failed', 'rejected', 'frequently-rejected'], ['normal-dd'], true, true);

            /* type=special && status=special||sent-to-bank */
            let specialOutstandingTransactions = this._filterTransactions(transactions, ['special', 'sent-to-bank'], ['special-dd'], true, true);

            /* type=special && status=failed||frequently-failed||rejected||frequently-rejected */
            let specialMissedTransactions = this._filterTransactions(transactions, ['failed', 'frequently-failed', 'rejected', 'frequently-rejected'], ['special-dd'], true, true);

            /* type=partial-payment */
            let partialPaymentTransactions = this._filterTransactions(transactions, null, ['partial-payment'], true, true);

            /* status=sent-to-bank */
            let sentToBankTransactions = this._filterTransactions(transactions, ['sent-to-bank'], null, true, true);


            let _loanTotalCost = specialOutstandingTransactions.amount + specialMissedTransactions.amount;

            let _numberOfSpecialDd = specialOutstandingTransactions.transactions.length + specialMissedTransactions.transactions.length;

            /* 'plannedNormalDDLength' in 'overview' includes eMandate transactions also. so count is incorrect */
            // let dailyAmountNormalDirectDebits = Number(plannedNormalDDLength) > 0 ? Math.abs(Number(totalLoanAmount) / plannedNormalDDLength) : 0;
            let dailyAmountNormalDirectDebits = Number(plannedNormalDds) > 0 ? Math.abs(Number(totalLoanAmount) / plannedNormalDds) : 0;

            let dailyAmountSpecialDirectDebits = _numberOfSpecialDd ? Math.abs(Number(_loanTotalCost) / _numberOfSpecialDd) : 0;

            let outstandingAmountNormalDirectDebits = dailyAmountNormalDirectDebits * normalMissedTransactions.transactions.length;

            let outstandingAmountSpecialDirectDebits = dailyAmountSpecialDirectDebits * specialMissedTransactions.transactions.length;

            let totalOutstandingAmount = outstandingAmountNormalDirectDebits + outstandingAmountSpecialDirectDebits;

            let partialPaymentAmount = -Number(partialPaymentTransactions.amount);

            data = {
              contractId: transactions[0].contractId,
              /* normal */
              numberOfOutstandingNormalDirectDebits: normalOutstandingTransactions.transactions.length,
              numberOfMissedNormalDirectDebits: normalMissedTransactions.transactions.length,
              dailyAmountNormalDirectDebits,
              outstandingAmountNormalDirectDebits,
              /* special */
              numberOfOutstandingSpecialDirectDebits: specialOutstandingTransactions.transactions.length,
              numberOfMissedSpecialDirectDebits: specialMissedTransactions.transactions.length,
              dailyAmountSpecialDirectDebits,
              outstandingAmountSpecialDirectDebits,

              totalOutstandingAmount,
              partialPaymentAmount,
              amountToBePaid: totalOutstandingAmount + partialPaymentAmount,
              directDebitsSetToBank: sentToBankTransactions.transactions.length,
            };

          }

          this.setState({ loanSeInDefault: data });

        })
        .catch((error) => console.log(error));

    });

  }

  _filterTransactions = (transactions, status, types, isStatusIncludes, isTypesIncludes) => {

    let filteredTransactions = [];

    let transactionsAmount = 0;

    transactions.forEach((trans) => {

      let statusCondition = status ? (isStatusIncludes ? status.includes(trans.status) : !status.includes(trans.status)) : true;
      let typesCondition = types ? (isTypesIncludes ? types.includes(trans.type) : !types.includes(trans.type)) : true;

      if (statusCondition && typesCondition) {

        filteredTransactions.push(trans);

        transactionsAmount += trans.amount;

      }

    });

    return { "amount": transactionsAmount, "transactions": filteredTransactions };

  }

  handleCloseLoanSetInDefaultData = () => {
    this.setState({ "loanSeInDefault": null, "selectedLoanForSetDefault": null });
  }

  handleLoanSetInDefaultConfirm = () => {
    this.props.smeLoanSetInDefault({
      loanId: this.state.selectedLoanForSetDefault,
      reason: this.state.reason,
      provisionPercentage: this.state.provisionPercentage,
    })
      .then(() => {
        let { inDefaultLoans } = this.state;
        inDefaultLoans.push(this.state.selectedLoanForSetDefault);
        this.setState({ "loanSeInDefault": null, "selectedLoanForSetDefault": null, inDefaultLoans });
      });
  }

  handleProvisionPercentageChanges = (event) => {

    let value = Number(event.target.value);

    if ((value >= 0) && (value <= 100)) this.setState({ "provisionPercentage": value });
  }

  handleChangeReason = (event) => {

    let value = event.target.value;

    this.setState({ "reason": value });
  }

  handleInterestPaneltyStatusDrawer = (data) => {
    const interestPenaltyIndicator =  this.props.loan && this.props.loan.interestPenaltyIndicator;
    this.setState({ showStartStopInterestPaneltyDrawer: !this.state.showStartStopInterestPaneltyDrawer, interestPenaltyIndicator: interestPenaltyIndicator, sendMessage: 'no' });
}

  handleSendEmail = (val) => {
    this.setState({sendMessage: val});
  }

  get handleGetCustomerListPerPage() {
    return getCustomerListPerPage(1, 1, { legalName: this.state.companyNameValue });
  }

  handleCustomerSelection = (customer) => {
    if (customer) {
      this.handleGetCustomerListPerPage().then((res) => {
        const { customersList } = res;
        if (customersList && customersList.length > 0) {
          const selectedCustomer = customersList[0];
          this.props.clearSelectedLoan();
          this.props.requestSmeLoans(selectedCustomer.id);
          this.setState({ customerId: selectedCustomer.id });
          this.props.changeCustomerInformation(selectedCustomer);
          this.props.getAllFilteredLoanAppointments({
            smeId: selectedCustomer.id,
            status: this.state.selectedStatus,
            internalExternalSwitch: this.state.selectedMessageType,
            country: this.state.selectedCountry,
            rowsPerPage: this.state.rowsPerPage,
            pageNumber: this.state.page,
            orderBy: this.state.orderBy
          });
        }
      });
      return;
    }
    this.props.getAllFilteredLoanAppointments({
      status: this.state.selectedStatus,
      internalExternalSwitch: this.state.selectedMessageType,
      country: this.state.selectedCountry,
      rowsPerPage: this.state.rowsPerPage,
      pageNumber: this.state.page,
      orderBy: this.state.orderBy,
      order: this.state.order
    });

    return;
  }

  changeInterestPaneltyState = () => {
    
    const loanData = {
        contractId: this.props.loan.contractId,
        loanId: this.props.loan._id,
        data: { interestPenaltyIndicator: (this.state.interestPenaltyIndicator === 'stopped' || this.state.interestPenaltyIndicator === 'not-applicable') ? 'active' : 'stopped' },
        dailyInterestPenaltyAmount: this.props.loan.dailyInterestPenaltyAmount,
        sendMessage: this.state.sendMessage,
        smeDetail: {
            id: this.props.smeDetails.id,
            email: this.props.smeDetails.email,
            firstName: this.props.smeDetails.firstName,
            lastName: this.props.smeDetails.lastName
          },
        contact: this.state.contact
    };

    this.props.startStopSmeLoanInterestPenalty(loanData)
    .then(() => {
        
            if (this.state.interestPenaltyIndicator === 'stopped') {
                this.props.displayNotification('Interest Penalty started !', 'success');
            }
            else {
                this.props.displayNotification('Interest Penalty stopped !', 'success');
            }
        
        this.setState({ showStartStopInterestPaneltyDrawer: false, sendMessage: 'no' });
        this.getOverviewData(this.state.selectedSmeLoan.contractId);
    })
    .catch((err) => {
         this.props.displayNotification('Interest panelty start/stop Error', 'error');
    });
    
}

  render() {

    const { loanSeInDefault, inDefaultLoans , locale, symbol, decimalSeparator, thousandSeparator, countries , updatesBanksmeLoanRecoveryAppointments, companyNameValue} = this.state;
    
    const LoanSetInDefaultConfirmation = this.state.loanSeInDefault ? <LoanSetDefault loanSeInDefault={loanSeInDefault} /> : null;

    let open = !!LoanSetInDefaultConfirmation;

    const { classes, origin, isOpenInterestPaneltyDrawer , loan , fullAmountOfData} = this.props;

    const interestPenaltyIndicator =  loan && loan.interestPenaltyIndicator;
    return (
      <div>
        
        <Card id="recovery-appointment-card">
          {
            origin === "ADMIN" ? (
              <CardHeader color='info'>
                <h4 className={classes.cardTitleWhite}>SME Loan Recovery Appointments Overview</h4>
              </CardHeader>
            ) : false
          }
          <CardBody>
            <GridContainer>
            <GridItem xs={12} sm={3} md={3} style={{marginTop: '20px'}} >
                <CustomSearch
                  id='company-name-search'
                  label='Company Name *'
                  placeholder='Dream Beers B.V.'
                  changeToFormatType='FirstCap'
                  name='legalName'
                  asyncSearchType='customer'
                  value={companyNameValue}
                  onChange={(event, newInputValue) => {
                    if (!newInputValue || newInputValue === '') {
                      this.props.clearSelectedCustomer();
                      this.setState({ customerId: '', companyNameValue: '' },
                        () => this.handleCustomerSelection(null));
                      return;
                    }
                    this.setState({ companyNameValue: newInputValue });
                  }}
                  onSearchResult={(newValue) => {
                    if (newValue) {
                      this.setState({ companyNameValue: newValue.legalName, customerId: '' },
                        () => this.handleCustomerSelection(newValue));
                    }
                    else {
                      this.props.clearSelectedCustomer();
                      this.setState({ customerId: '', companyNameValue: '' },
                        () => this.handleCustomerSelection(null));
                    }
                  }}
                />
            </GridItem>
              <GridItem xs={12} sm={3} md={2}>
              <CustomInputBox
								type='dropdown'
								id='Message-type'
								label='Message Type'
                defaultValue = 'All'
                onChange={(event, newValue) => {
                  if (newValue) {
                    this.setState({ selectedMessageType: newValue });
                    if (newValue !== '') {
                      this.props.getAllFilteredLoanAppointments({
                        smeId: this.state.customerId, 
                        status: this.state.selectedStatus,
                        internalExternalSwitch: newValue,
                        country: this.state.selectedCountry,
                        rowsPerPage: this.state.rowsPerPage,
                        pageNumber: this.state.page,
                        orderBy:this.state.orderBy,
                        order: this.state.order
                      });
                    }
                  }
                }}
                dropDownValues={Object.keys(MessageType).map(key => { return { key: key, value: MessageType[key] }; })}
								isNoneInDropDownList={false}
							/>
              </GridItem>
              <GridItem xs={12} sm={4} md={2}>
                <CustomInputBox
								type='dropdown'
								id='Status'
								label='Status'
                defaultValue = 'All'
                onChange={(event, newValue) => {
                  if (newValue !== '') {
                    this.setState({ selectedStatus: newValue });
                    this.props.getAllFilteredLoanAppointments({
                      smeId: this.state.customerId, 
                      status: newValue,
                      internalExternalSwitch: this.state.selectedMessageType,
                      country: this.state.selectedCountry,
                      rowsPerPage: this.state.rowsPerPage,
                      pageNumber: this.state.page,
                      order: this.state.order
                    });
                  }
                }}
                dropDownValues={Object.keys(AppointmentStatus).map(key => { return { key: key, value: AppointmentStatus[key] }; })}
								isNoneInDropDownList={false}
							/>
              </GridItem>
              <GridItem xs={12} sm={4} md={2}>
              <CustomInputBox
								type='dropdown'
								id='Country'
								label='Country'
                defaultValue = 'All'
                onChange={(event, newValue) => {
                  if (newValue !== '') {
                    this.setState({ selectedCountry: newValue });
                    this.props.getAllFilteredLoanAppointments({
                      smeId: this.state.customerId, 
                      status: this.state.selectedStatus,
                      internalExternalSwitch: this.state.selectedMessageType,
                      rowsPerPage: this.state.rowsPerPage,
                      pageNumber: this.state.page,
                      order: this.state.order,
                      country: newValue
                    });
                  }
                }}
                dropDownValues={Object.keys(countries).map(key => { return { key: key, value: countries[key] }; })}
								isNoneInDropDownList={false}
							/>
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
              {
              this.props.origin === "SingleLoanOverview" ?
                (<Button  style={{float: 'right'}} id="add-new-appointment-slo-button" className={classes.addNewButton} color='rose' onClick={() => this.handleChangeAppointment('NEW', {})} >Add New Appointment</Button>)
                :
                (<Button id="add-new-appointment-button" className={classes.addNewButton} color='rose' onClick={() => this.handleChangeAppointment('', {})} >Add New Appointment</Button>)

            }
            </GridItem>
            
            </GridContainer>
            
						<TableContainer TableContainer component={Paper} className={classes.tableContainer} style= {{marginTop: '19px'}}>
            <Table className={classes.table} aria-label="simple table">
              <Table id="apointment-table">
                <TableHead id="apointment-table-head" className={classes.tableHeadColor}>
                  <TableRow id="apointment-table-header-row">
                    <TableCell className={classes.tableCell} >
                      <TableSortLabel
                        active={this.state.orderBy === 'appointmentDate'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'appointmentDate')}>
                        Due Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell} >
                      <TableSortLabel
                        active={this.state.orderBy === 'createdAt'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'createdAt')}>
                        Creation Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell} title='External / Internal'>
                      <TableSortLabel
                        active={this.state.orderBy === 'internalExternalSwitch'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'internalExternalSwitch')}>
                        Ex/In
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'status'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'status')}>
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'smeCompany'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'smeCompany')}>
                        SME Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell} style ={{width: '25%'}}>
                      <TableSortLabel
                        active={this.state.orderBy === 'message'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'message')}>
                        Appointment
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'overdue'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'overdue')}>
                        Overdue
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'amount'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'amount')}>
                        Amount Agreed
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'smeStakeholderName'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'smeStakeholderName')}>
                        SME Contact
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <TableSortLabel
                        active={this.state.orderBy === 'bridgefundEmployee'}
                        direction={this.state.order}
                        onClick={this.handleRequestSort.bind(this, 'bridgefundEmployee')}>
                        Employee
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.tableCell}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    // // stableSort(this.filteredData, getSorting(this.state.order, this.state.orderBy))
                    // Util.stableSort(this.props.smeLoanRecoveryAppointments, Util.getSorting(this.state.order, this.state.orderBy))
                    //   .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                    updatesBanksmeLoanRecoveryAppointments.map(appointment => (
                        <TableRow id={appointment._id} key={appointment._id}>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.appointmentDate} >{moment(appointment.appointmentDate).format('DD-MM-YYYY')}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.createdAt} >{appointment.createdAt ? moment(appointment.createdAt).format('DD-MM-YYYY') : ''}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.internalExternalSwitch} >{appointment.internalExternalSwitch}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.status} >{appointment.status}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.smeCompany} >{appointment.smeCompany}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.message} >{appointment.message}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.overdue} >{currency(appointment.overdue , appointment.locale , (appointment.smeLoan && appointment.smeLoan.currency) ? appointment.smeLoan.currency : 'EUR' )}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.amount} >{currency(appointment.amount , appointment.locale , (appointment.smeLoan && appointment.smeLoan.currency) ? appointment.smeLoan.currency : 'EUR' )}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.smeStakeholderName} >{appointment.smeStakeholderName}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-' + appointment.bridgefundEmployee} >{appointment.bridgefundEmployee}</TableCell>
                          <TableCell className={classes.tableCell} key={appointment._id + '-action-button-cell'} style ={{width: '18%'}}>
                            <IconButton
                              id="edit-appointment-button"
                              title='Change'
                              onClick={() => this.handleChangeAppointment('EDIT', appointment)}
                              disabled={appointment.status === AppointmentStatus.CLOSED}
                            >
                              <EditOutlined />
                            </IconButton>
                            <IconButton id="loan-set-in-default-button" title='Loan set in-Default' disabled={inDefaultLoans.includes(appointment.smeLoan && appointment.smeLoan._id )} onClick={() => this.loanSetInDefaultGetData(appointment)}><RotateLeft /></IconButton>
                            <IconButton id="add-new-appointment-button" title='Add New Appointment' onClick={() => this.handleChangeAppointment('NEW', appointment)}><AddAlert /></IconButton>
                            <IconButton disabled= {Object.keys(loan).length === 0 ? true: false} id="claim-loan-button" title='Claim loan' onClick={() => { this.handleClaimLoanScreen(appointment); }}><Update /></IconButton>
                            <IconButton id="edit-interest-penalty-button" title='Stop / Change Interest Panelty' onClick={() => { this.handleInterestPenaltyButtonClick(appointment); }}><Style /></IconButton>
                            <IconButton disabled ={Object.keys(loan).length === 0 ? true: false} id="start-stop-interest-penalty-button" title='Start / Stop Interest-Penalty' onClick={() => { this.handleInterestPaneltyStatusDrawer(appointment); }}><PlayCircleFilled /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  }
                </TableBody>
              </Table>
              <TablePagination
                id="apointment-table-pagination-bottom"
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={fullAmountOfData}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                backIconButtonProps={{
                  'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page',
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            
            </Table>
						</TableContainer>
          </CardBody>
        </Card>

        <Drawer
          id="add-appointment-drawer"
          anchor="bottom"
          open={this.props.addNewLoanAppointmentPopupState}
          onClose={this.props.switchAddNewLoanAppointmentPopupState.bind()}
        >
          <div
            tabIndex={0}
            role="button"
          >
            <AddNewLoanRecoveryAppointment key="add-appointment-drawer-content" {...this.state.newAppointmentProps} />
          </div>
        </Drawer>

        <Dialog
          id="show-claim-drawer"
          fullWidth
          maxWidth={'lg'}
          open={this.state.ShowClaimLoanDrawer}
          onClose={() => this.handleClaimScreen(false)}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <ClaimLoan
              key="show-claim-drawer-content"
              smeLoan={this.props.loan}
              smeLoanTransactions={this.props.directdebits}
              smeDetails={this.props.smeDetails}
              onClose={() => this.handleClaimScreen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          id="loan-set-in-default-drawer"
          open={open}
          onClose={this.handleCloseLoanSetInDefaultData}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth={true}
        >
          {LoanSetInDefaultConfirmation}
          <Table id="set-in-default-table">
            <TableBody id="set-in-default-table-body">
              <TableRow>
                <TableCell className={classes.basicClearCell}>Reason : </TableCell>
                <TableCell className={classes.basicClearCell}>
                  <FormControl className={classes.formControl}>
                    <Select
                      value={this.state.reason}
                      onChange={this.handleChangeReason}
                      inputProps={{
                        name: 'setDefaultReason',
                        id: 'setDefaultReason',
                      }}
                      className={classes.selectEmpty}
                    >
                      <MenuItem id="bankrupt" value={0}>Bankrupt</MenuItem>
                      <MenuItem id="wsnp" value={1}>WSNP</MenuItem>
                      <MenuItem id="other" value={2}>Other</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell className={classes.spaceClearCell}></TableCell>
                <TableCell className={classes.basicClearCell}>Provision Percentage ( % )</TableCell>
                <TableCell className={classes.basicClearCell}>
                  <TextField
                    id="provisionPercentage"
                    name="provisionPercentage"
                    type="text"
                    value={this.state.provisionPercentage}
                    className={classes.textField}
                    onChange={this.handleProvisionPercentageChanges}
                    InputLabelProps={{
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <DialogActions>
            <Button id="loan-set-in-default-cancel-button" onClick={this.handleCloseLoanSetInDefaultData}>Cancel</Button>
            <Button id="loan-set-in-default-confirm-button" onClick={this.handleLoanSetInDefaultConfirm} color="rose" autoFocus>Confirm</Button>
          </DialogActions>
        </Dialog>

        {/* Interest penalty model */}
        <Dialog
          id="interest-penalty-dialog"
          fullWidth
          maxWidth={'md'}
          open={isOpenInterestPaneltyDrawer}
          onClose={() => this.props.showInterestPaneltyModel()}
          style={{ margin: 0 }}
        >
          <DialogContent>
            <InterestPenaltyOverview
              key="interest-penalty-dialog-content"
              origin={origin}
              penaltyTransaction={this.state.selectedPenaltyTransaction}
              locale={locale} 
              symbol={symbol} 
              decimalSeparator={decimalSeparator} 
              thousandSeparator={thousandSeparator}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          id="start-stop-loan-confirm-drawer"
          open={this.state.showStartStopInterestPaneltyDrawer}
          aria-labelledby="form-dialog-title">
          {(interestPenaltyIndicator === 'not-applicable' || interestPenaltyIndicator === 'stopped') ?
            <DialogTitle id="form-dialog-title">Do you want to START Interest penalty?</DialogTitle> :
            <DialogTitle id="form-dialog-title">Do you want to STOP Interest penalty?</DialogTitle>}
          {interestPenaltyIndicator === 'active' ? null :
            <DialogContent >
              <DialogContentText>Do you want to notify via an email ?</DialogContentText>
              <RadioGroup aria-label="chartType" name="chartType" row value={this.state.sendMessage} onChange={(e) => this.handleSendEmail(e.target.value)}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" labelPlacement="end" />
                <FormControlLabel value="no" control={<Radio />} label="No" labelPlacement="end" />
              </RadioGroup>
            </DialogContent>
          }
          <DialogActions>
            <Button id="start-stop-loan-confirm-drawer-back-button" onClick={this.handleInterestPaneltyStatusDrawer}>
              CANCEL
            </Button>
            {(interestPenaltyIndicator === 'not-applicable' || interestPenaltyIndicator === 'stopped') ?
              <Button id="start-stop-loan-confirm-drawer-confirm-button" onClick={this.changeInterestPaneltyState}>
                START
              </Button> :
              <Button id="start-stop-loan-confirm-drawer-confirm-button" onClick={this.changeInterestPaneltyState}>
                STOP
              </Button>
            }
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

SmeLoanRecoveryAppointment.defaultProps = {
  origin: 'ADMIN'
};
SmeLoanRecoveryAppointment.propTypes = {
  origin: PropTypes.string,
  loanId: PropTypes.string,
  fullAmountOfData: PropTypes.number,
  switchAddNewLoanAppointmentPopupState: PropTypes.func,
  addNewLoanAppointmentPopupState: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  smeLoanSetInDefault: PropTypes.func,
  smeLoanRecoveryAppointments: PropTypes.array,
  getDataForLoanSettingDefault: PropTypes.func,
  clearLoanRecoveryAppointments: PropTypes.func,
  getLoanAppointmentsByLoanId: PropTypes.func,
  getAllLoanAppointments: PropTypes.func,
  claimLoanByLoanId: PropTypes.func.isRequired,
  smeDetails: PropTypes.object,
  loan: PropTypes.object,
  directdebits: PropTypes.array,
  clearSelectedLoan: PropTypes.func,
  clearDirectDebits: PropTypes.func.isRequired,
  clearSelectedSme: PropTypes.func.isRequired,
  isOpenInterestPaneltyDrawer: PropTypes.bool,
  showInterestPaneltyModel: PropTypes.func.isRequired,
  getCalculatedDataOfLoanTransactions: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
  lmContractMongoId: PropTypes.string,
  clearSelectedCustomer: PropTypes.func,
  getAllFilteredLoanAppointments: PropTypes.func,
  getFieldNameValues: PropTypes.func,
  requestSmeLoans: PropTypes.func,
  selectLoan: PropTypes.func,
  getLocales: PropTypes.func,
  configurations: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    addNewLoanAppointmentPopupState: state.loanRecoveryAppointments.addNewLoanAppointmentPopupState,
    smeLoanRecoveryAppointments: state.loanRecoveryAppointments.smeLoanRecoveryAppointments,
    loan: state.lmglobal.selectedLoan,
    directdebits: state.smeLoanTransaction.directdebits,
    smeDetails: state.lmglobal.customerDetails,
    isOpenInterestPaneltyDrawer: state.interestPenalty.isOpenInterestPaneltyDrawer,
    isDashboardContent: state.user.isDashboardContent,
    lmContractMongoId: state.lmglobal.selectedLoan._id,
    fullAmountOfData: state.lmglobal.fullAmountOfData,
    configurations: state.configurations,
    stateOfGetNewLoanRecoveryData: state.loanRecoveryAppointments.stateOfGetNewLoanRecoveryData
  };
};

const bindActions = (dispatch, actionMethod) => {
  return (params) =>
    new Promise((resolve, reject) =>
      dispatch(actionMethod(params))
        .then(response => resolve(response))
        .catch(error => reject(error))
    );
};

const mapDispatchToProps = dispatch => {
  return {
    switchAddNewLoanAppointmentPopupState: () => {
      dispatch(switchAddNewLoanAppointmentPopupState());
    },
    getAllLoanAppointments: () => {
      dispatch(getAllLoanAppointments());
    },
    claimLoanByLoanId: (smeLoan, smeId) => {
      return dispatch(claimLoanByLoanId(smeLoan, smeId));
    },
    getLoanAppointmentsByLoanId: (loanId) => {
      dispatch(getLoanAppointmentsByLoanId(loanId));
    },
    clearSelectedLoan: () => {
      dispatch(clearSelectedLoan());
    },
    clearDirectDebits: () => {
      dispatch(clearDirectDebits());
    },
    clearSelectedSme: () => {
      dispatch(clearSelectedSme());
    },
    clearLoanRecoveryAppointments: () => {
      dispatch(setLoanRecoveryAppointmentData([]));
    },
    getDataForLoanSettingDefault: bindActions(dispatch, getSmeLoanTransactionsOverview),
    smeLoanSetInDefault: bindActions(dispatch, smeLoanSetInDefault),
    showInterestPaneltyModel: () => {
      dispatch(showInterestPaneltyModel());
    },
    getCalculatedDataOfLoanTransactions: (loanId) => {
      return dispatch(getCalculatedDataOfLoanTransactions(loanId));
    },
    displayNotification: (msg, type) => {
      dispatch(displayNotification(msg, type));
    },
    getAllFilteredLoanAppointments:(searchOption) => dispatch(getAllFilteredLoanAppointments(searchOption)),
    // startStopSmeLoanInterestPenalty: (requestBody) => {
    //   dispatch(startStopSmeLoanInterestPenalty(requestBody));
    // },
    // getPlatformParameters: (data) => {
    //   dispatch(getPlatformParameters(data));
    // },
    startStopSmeLoanInterestPenalty: (requestBody) => {
      return dispatch(startStopSmeLoanInterestPenalty(requestBody));
    },
    getPlatformParameters: (data) => {
      return dispatch(getPlatformParameters(data));
    },
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    requestSmeLoans: (smeId) => dispatch(requestSmeLoans(smeId)),
    selectLoan: (loan) => dispatch(selectLoan(loan)),
    // startStopSmeLoanInterestPenalty: (requestBody) => dispatch(startStopSmeLoanInterestPenalty(requestBody)),
    // getPlatformParameters: (data) => dispatch(getPlatformParameters(data)),
    changeCustomerInformation: customerDetails => {
      dispatch(changeCustomerDetails(customerDetails));
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    getLocales: (requestBody) => dispatch(getLocales(requestBody)),
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SmeLoanRecoveryAppointment));
