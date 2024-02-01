// import moment from 'moment';
// import classNames from 'classnames';
// import { connect } from 'react-redux';
// import React, { Component } from 'react';

// import Input from '@material-ui/core/Input';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import TextField from '@material-ui/core/TextField';
// import InputLabel from '@material-ui/core/InputLabel';
// import FormControl from '@material-ui/core/FormControl';
// import withStyles from '@material-ui/core/styles/withStyles';

// import Button from 'components/CustomButtons/Button.jsx';
// import CustomInput from 'components/CustomInput/CustomInput.jsx';
// import AutoSuggest from "components/CustomAutoSuggest/CustomAutoSuggest.jsx";
// import CustomFormatInput from 'components/CustomFormatInput/CustomFormatInput.jsx';

// import Card from 'components/Card/Card.jsx';
// import CardBody from 'components/Card/CardBody.jsx';
// import CardFooter from 'components/Card/CardFooter.jsx';
// import CardHeader from 'components/Card/CardHeader.jsx';

// import GridItem from 'components/Grid/GridItem.jsx';
// import GridContainer from 'components/Grid/GridContainer.jsx';

// import { displayNotification } from "../../store/actions/Notifier";

// import { processMandates } from '../../store/actions/Mandates';
// // import { getAllCustomers } from '../../store/actions/HeaderNavigation';
// import { addPayment, showHideSavePopup } from '../../store/actions/unidentifiedPayments';

// const styles = {
//   cardCategoryWhite: {
//     color: 'rgba(255,255,255,.62)',
//     margin: '0',
//     fontSize: '14px',
//     marginTop: '0',
//     marginBottom: '0'
//   },
//   cardTitleWhite: {
//     color: '#FFFFFF',
//     marginTop: '0px',
//     minHeight: 'auto',
//     fontWeight: '300',
//     fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
//     marginBottom: '3px',
//     textDecoration: 'none'
//   }
// };

// class CreateDirectDebit extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       selectedDate: moment().add(1, 'days').format('YYYY-MM-DD'),
//       mandateNumber: '',
//       contractNumber: '',
//       message: '',
//       amount: '',
//       payment: {},
//       customerId: '',
//       mandateId: '',
//       contractId: '',
//       reference: '',
//     };
//   }

//   componentWillMount() {
//     this.props.clearMandates();
//   }

//   componentDidMount() {
//     // this.props.getAllCustomers();
//     if (this.props.id) {
//       let id = this.props.id;
//       let payment = this.props.UIFDPayments.find(pm => pm._id == id);
//       this.setState({ payment: payment });
//     }
//   }

//   handleAddTransaction() {
//     if (!this.props.customerDetails.id) {
//       this.props.displayNotification('Please select a customer', 'warning')
//     } else if (this.state.mandateNumber === '') {
//       this.props.displayNotification('Please select a mandate', 'warning')
//     } else if (this.state.contractNumber === '') {
//       this.props.displayNotification('Please select a contract', 'warning')
//     } else {
//       let payment = this.state.payment;
//       let mandate = this.props.mandates.find(
//         mandate => mandate._id === this.state.mandateNumber
//       );
//       let contract = this.props.contracts.find(
//         contract => contract._id === this.state.contractNumber
//       );
//       payment.contractId.push({
//         id: contract._id,
//         contractNumber: contract.contractNumber
//       });
//       payment.mandateId.push({
//         id: mandate._id,
//         mandateNumber: mandate.mandateNumber
//       });
//       payment.status = 'PAID';
//       payment['reference'] = this.state.reference;

//       this.props.saveAsManualPayment({
//         contract: contract,
//         mandate: mandate,
//         payment: payment
//       });
//     }
//   }

//   handleSelectedDate(date) {
//     this.setState({
//       selectedDate: moment(date.target.value).format('YYYY-MM-DD')
//     });
//   }

//   handleChangeMandateNumber(e) {
//     this.setState({
//       [e.target.name]: e.target.value,
//     });
//   }

//   handleChangeContractNumber(e) {
//     this.setState({
//       [e.target.name]: e.target.value,
//       contractId: '',
//       mandateNumber: document.getElementById('mandateselector').value
//     });
//     // console.log('ref ' , document.getElementById('mandateselector').value)
//   }

//   handleCustomFormatInput = (val, name) => {
//     this.setState({
//       [name]: val
//     });
//   };

//   handleChange(val, name) {
//     this.setState({
//       [name]: val
//     });
//   };

//   render() {
//     const { classes, labelText, contracts, directDebitError, customers, mandates } = this.props;
//     const marginTop = classNames({
//       [classes.marginTop]: labelText === undefined
//     });
//     return (
//       <div>
//         <GridContainer>
//           <GridItem xs={12} sm={12} md={12}>
//             <Card>
//               <CardHeader color="rose">
//                 <h4 className={classes.cardTitleWhite}>Create Direct Debit</h4>
//               </CardHeader>
//               <CardBody>
//                 <GridContainer>
//                   <GridItem xs={12} sm={12} md={3}>
//                     <FormControl
//                       style={{
//                         marginTop: 27,
//                         display: 'inline-flex',
//                         position: 'relative'
//                       }}
//                     >
//                       <TextField
//                         id="collection-start-date"
//                         name="startDate"
//                         label="Collection Date"
//                         type="text"
//                         value={moment(this.state.payment.date).format('YYYY-MM-DD')}
//                         className={classes.textField}
//                         InputLabelProps={{
//                           shrink: true
//                         }}
//                         readOnly
//                       />
//                     </FormControl>
//                   </GridItem>
//                   {/* <GridItem xs={12} sm={12} md={3}>
//                     <CustomInput
//                       labelText="Reference"
//                       id="reference"
//                       name="reference"
//                       classNames="reference"
//                       formControlProps={{
//                         fullWidth: true
//                       }}

//                       inputProps={{
//                         onChange: (event) => this.handleChange(event.target.value, "reference")
//                       }}
//                     />
//                   </GridItem> */}
//                   <GridItem xs={12} sm={12} md={3}>
//                     <CustomFormatInput
//                       type="text"
//                       labelText="Amount"
//                       id="amount"
//                       name="amount"
//                       numberformat={this.state.payment.totalAmount}
//                       formControlProps={{
//                         fullWidth: true
//                       }}
//                       changeValue={this.handleCustomFormatInput.bind(this)}
//                       readOnly
//                     />
//                   </GridItem>
//                 </GridContainer>

//                 <GridContainer>
//                   <GridItem xs={12} sm={12} md={9}>
//                     <CustomInput
//                       labelText="Message"
//                       id="message"
//                       name="message"
//                       formControlProps={{
//                         fullWidth: true
//                       }}
//                       inputProps={{
//                         multiline: true,
//                         rows: 1,
//                         value: this.state.payment.message
//                       }}
//                       labelProps={{
//                         shrink: true
//                       }}
//                     />
//                   </GridItem>
//                 </GridContainer>

//                 <GridContainer>
//                   <GridItem xs={12} sm={12} md={3}>
//                     <FormControl
//                       style={{
//                         marginTop: 38,
//                         display: 'inline-flex',
//                         position: 'relative'
//                       }}
//                     >
//                       <AutoSuggest
//                         name="customer"
//                         id="customer"
//                         inputProps={{
//                           placeholder: "Customer",
//                           inputProps: {
//                             "aria-label": "Customer"
//                           }
//                         }}
//                         entity="customers"
//                         sugg_field="company"
//                         label="Customer"
//                       />
//                     </FormControl>
//                   </GridItem>
//                   <GridItem xs={12} sm={12} md={3}>
//                     <FormControl
//                       style={{
//                         marginTop: 27,
//                         display: 'inline-flex',
//                         position: 'relative'
//                       }}
//                     >
//                       <InputLabel shrink htmlFor="mandate-number">
//                         Mandate
//                       </InputLabel>
//                       <Select
//                         ref="mandateselector"
//                         id="mandateselector"
//                         readOnly
//                         // value={this.state.mandateNumber}
//                         value={mandates.length > 0 ? mandates[0]._id : ''}
//                         onChange={this.handleChangeMandateNumber.bind(this)}
//                         input={
//                           <Input
//                             name="mandateNumber"
//                             id="mandate-number"
//                             style={{
//                               fontWeight: 100,
//                               fontSize: 14,
//                               width: 300
//                             }}
//                           />
//                         }
//                       >
//                         {
//                           mandates.map((mandate, key) => mandate &&
//                             <MenuItem key={key} value={mandate._id}>{mandate.mandateNumber}</MenuItem>
//                           )
//                         }
//                       </Select>
//                     </FormControl>
//                   </GridItem>
//                   <GridItem xs={12} sm={12} md={3}>
//                     <FormControl
//                       style={{
//                         marginTop: 27,
//                         display: 'inline-flex',
//                         position: 'relative'
//                       }}
//                     >
//                       <InputLabel shrink htmlFor="contract-number">
//                         Contract
//                       </InputLabel>
//                       <Select
//                         value={this.state.contractNumber}
//                         onChange={this.handleChangeContractNumber.bind(this)}
//                         input={
//                           <Input
//                             name="contractNumber"
//                             id="contract-number"
//                             style={{
//                               fontWeight: 100,
//                               fontSize: 14,
//                               width: 300
//                             }}
//                           />
//                         }
//                       >
//                         {
//                           contracts.map((contract, key) => contract &&
//                             <MenuItem key={key} value={contract._id}>{contract.contractNumber}</MenuItem>
//                           )
//                         }
//                       </Select>
//                     </FormControl>
//                   </GridItem>
//                 </GridContainer>
//               </CardBody>
//               <CardFooter>
//                 <Button
//                   color="danger"
//                   size="sm"
//                   onClick={() => this.props.showHideSavePopup()}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   color="info"
//                   size="sm"
//                   onClick={this.handleAddTransaction.bind(this)}
//                 >
//                   Add Transaction
//                 </Button>
//               </CardFooter>
//             </Card>
//           </GridItem>
//         </GridContainer>
//       </div>
//     );
//   }
// }

// CreateDirectDebit.propTypes = {};

// const mapStateToProps = state => {
//   return {
//     selectedMandate: state.mandates.selectedMandate,
//     // addTransactionError: state.payments.addTransactionError,
//     directDebitError: state.smeLoanTransaction.directDebitError,
//     customers: state.lmglobal.customers,
//     UIFDPayments: state.unidentifiedPayments.payments,
//     mandates: state.mandates.mandates,
//     contracts: state.contracts.contracts
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     clearMandates: () => {
//       dispatch(processMandates([]));
//     },
//     saveAsManualPayment: data => {
//       dispatch(addPayment(data));
//     },
//     // getAllCustomers: () => {
//     //   dispatch(getAllCustomers());
//     // },
//     displayNotification: (message, type) => {
//       dispatch(displayNotification(message, type));
//     },
//     showHideSavePopup: () => {
//       dispatch(showHideSavePopup());
//     },
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(styles)(CreateDirectDebit));
