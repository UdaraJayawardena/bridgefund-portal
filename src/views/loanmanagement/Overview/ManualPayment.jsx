// import moment from 'moment';
// import { connect } from 'react-redux';
// import React, { Component } from 'react';
// import { bindActionCreators } from "redux";

// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import TextField from '@material-ui/core/TextField';
// import InputLabel from '@material-ui/core/InputLabel';
// import FormControl from '@material-ui/core/FormControl';
// import withStyles from '@material-ui/core/styles/withStyles';
// import InputAdornment from '@material-ui/core/InputAdornment';

// import Card from 'components/Card/Card.jsx';
// import CardBody from 'components/Card/CardBody.jsx';
// import CardHeader from 'components/Card/CardHeader.jsx';
// import CardFooter from 'components/Card/CardFooter.jsx';
// import Button from 'components/CustomButtons/Button.jsx';

// import GridItem from 'components/Grid/GridItem.jsx';
// import GridContainer from 'components/Grid/GridContainer.jsx';

// import { saveNewPayment } from '../../store/actions/AddNewPayments';
// import { displayNotification } from '../../store/actions/Notifier';

// const styles = {
//   formControl: {
//     width: '100%',
//     margin: '10px',
//   }
// }

// class ManualPayment extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       selectedMandate: '',
//       selectedContract: '',
//       reference: '',
//       message: '',
//       paymentDate: moment().format('YYYY-MM-DD'),
//       lendedAmount: '',
//       interestAmount: '',
//       commissionAmount: '',
//       totalAmount: '',
//       status: 'PAID'
//     };
//   }

//   preventCharacters(evt) {
//     if (evt.which !== 8 && evt.which !== 0 && evt.which !== 46 && evt.which < 48 || evt.which > 57) {
//       evt.preventDefault();
//     }
//   }

//   preventPaste(e) {
//     e.preventDefault();
//   }

//   handleChange = event => {
//     let name = event.target.name;
//     if (name == 'paymentDate') {
//       this.setState({ [name]: moment(event.target.value).format('YYYY-MM-DD') });
//     } else {
//       this.setState({ [name]: event.target.value });
//     }
//   }

//   handleSavePayment() {

//     const obj = {
//       mandateId: this.state.selectedMandate,
//       contractId: this.state.selectedContract,
//       reference: this.state.reference,
//       message: this.state.message,
//       paymentDate: this.state.paymentDate,
//       lendedAmount: this.state.lendedAmount,
//       interestAmount: this.state.interestAmount,
//       commisionAmount: this.state.commissionAmount,
//       totalAmount: this.state.totalAmount,
//       status: this.state.status
//     };

//     if (obj.paymentDate === '' || obj.totalAmount === '') {
//       this.props.displayNotification('Payment Date or Total Amount is missing', 'warning')
//     } else if (this.props.customerId == null || this.props.customerId == '') {
//       this.props.displayNotification('Customer id is missing', 'warning')
//     } else {
//       this.props.saveNewPayment(obj, this.props.customerId);
//       this.clearTable();
//     }
//   }

//   clearTable = () => {
//     this.setState({
//       selectedMandate: '',
//       selectedContract: '',
//       reference: '',
//       message: '',
//       paymentDate: moment().format('YYYY-MM-DD'),
//       lendedAmount: '',
//       interestAmount: '',
//       commissionAmount: '',
//       totalAmount: '',
//       status: 'PAID'
//     })
//   }

//   render() {
//     const {
//       classes,
//       mandates,
//       contracts
//     } = this.props;
//     return (
//       <div>
//         <Card>
//           <CardHeader color="info">
//             <h4 className={classes.cardTitleWhite}>Incoming Manual Payment</h4>
//           </CardHeader>
//           <CardBody>
//             <GridContainer>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <InputLabel htmlFor="mandate-filter">Mandate Number</InputLabel>
//                   <Select
//                     value={this.state.selectedMandate}
//                     onChange={this.handleChange}
//                     inputProps={{
//                       name: 'selectedMandate',
//                       id: 'mandate-filter',
//                     }}
//                     className={classes.selectEmpty}
//                   >
//                     <MenuItem value="" disabled>
//                       Mandate Number
//                 </MenuItem>
//                     {mandates.map((mandate, i) =>
//                       <MenuItem key={i} value={mandate._id}>{mandate.mandateNumber}</MenuItem>
//                     )}
//                   </Select>
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <InputLabel htmlFor="contract-filter">Contract</InputLabel>
//                   <Select
//                     value={this.state.selectedContract}
//                     onChange={this.handleChange.bind(this)}
//                     inputProps={{
//                       name: 'selectedContract',
//                       id: 'contract-filter',
//                     }}
//                     className={classes.selectEmpty}
//                   >
//                     <MenuItem value="">
//                       Contract Number
//                     </MenuItem>
//                     {contracts.map((contract, i) =>
//                       <MenuItem key={i} value={contract._id}>{contract.contractNumber}</MenuItem>
//                     )}
//                   </Select>
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="paymentReference"
//                     label="Reference"
//                     name='reference'
//                     className={classes.textField}
//                     value={this.state.reference}
//                     onChange={this.handleChange.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="paymentMessage"
//                     label="Message"
//                     name='message'
//                     className={classes.textField}
//                     value={this.state.message}
//                     onChange={this.handleChange.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="paymentDate"
//                     name="paymentDate"
//                     label="Payment Date"
//                     type="date"
//                     value={this.state.paymentDate}
//                     className={classes.textField}
//                     InputLabelProps={{
//                       shrink: true
//                     }}
//                     onChange={this.handleChange.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="lendedAmount"
//                     name="lendedAmount"
//                     label="Lended Amount"
//                     placeholder='0.00'
//                     value={this.state.lendedAmount}
//                     className={classes.textField}
//                     InputLabelProps={{
//                       shrink: true
//                     }}
//                     InputProps={{
//                       name: 'lendedAmount',
//                       startAdornment: <InputAdornment position="start">€</InputAdornment>,
//                     }}
//                     onChange={this.handleChange.bind(this)}
//                     onKeyPress={this.preventCharacters.bind(this)}
//                     onPaste={this.preventPaste.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="interestAmount"
//                     name="interestAmount"
//                     label="Interest Amount"
//                     value={this.state.interestAmount}
//                     placeholder='0.00'
//                     className={classes.textField}
//                     InputLabelProps={{
//                       shrink: true
//                     }}
//                     InputProps={{
//                       startAdornment: <InputAdornment position="start">€</InputAdornment>,
//                     }}
//                     onChange={this.handleChange.bind(this)}
//                     onKeyPress={this.preventCharacters.bind(this)}
//                     onPaste={this.preventPaste.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="commissionAmount"
//                     name="commissionAmount"
//                     label="Commission Amount"
//                     value={this.state.commissionAmount}
//                     placeholder='0.00'
//                     className={classes.textField}
//                     InputLabelProps={{
//                       shrink: true
//                     }}
//                     InputProps={{
//                       startAdornment: <InputAdornment position="start">€</InputAdornment>,
//                     }}
//                     onChange={this.handleChange}
//                     onKeyPress={this.preventCharacters.bind(this)}
//                     onPaste={this.preventPaste.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="totalAmount"
//                     label="Total Amount"
//                     value={this.state.totalAmount}
//                     placeholder='0.00'
//                     className={classes.textField}
//                     InputLabelProps={{
//                       shrink: true
//                     }}
//                     InputProps={{
//                       name: 'totalAmount',
//                       startAdornment: <InputAdornment position="start">€</InputAdornment>,
//                     }}
//                     onChange={this.handleChange.bind(this)}
//                     onKeyPress={this.preventCharacters.bind(this)}
//                     onPaste={this.preventPaste.bind(this)}
//                   />
//                 </FormControl>
//               </GridItem>
//               <GridItem xs={12} sm={6} md={3}>
//                 <FormControl className={classes.formControl}>
//                   <TextField
//                     id="status"
//                     label="Status"
//                     className={classes.textField}
//                     InputProps={{
//                       name: 'status',
//                       readOnly: true,
//                     }}
//                     value={this.state.status}
//                   />
//                 </FormControl>
//               </GridItem>
//             </GridContainer>
//           </CardBody>
//           <CardFooter>
//             <Button color="danger" size="sm" onClick={() => { this.clearTable() }}>Clear</Button>
//             <Button color="info" size="sm" onClick={() => {
//               this.handleSavePayment();
//             }}>Save Manual Payment</Button>
//           </CardFooter>
//         </Card>
//       </div>
//     )
//   }
// }

// ManualPayment.propTypes = {
// };

// const mapStateToProps = state => {
//   return {
//     mandates: state.mandates.mandates,
//     contracts: state.contracts.contracts,
//     customerId: state.lmglobal.customerDetails.id
//   };
// };

// const mapDispatchToProps = dispatch =>
//   bindActionCreators({ saveNewPayment, displayNotification }, dispatch);

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(styles)(ManualPayment));
