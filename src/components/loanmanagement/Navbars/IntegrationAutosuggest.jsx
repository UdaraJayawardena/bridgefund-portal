// import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import deburr from 'lodash/deburr';
// import Autosuggest from 'react-autosuggest';
// import match from 'autosuggest-highlight/match';
// import parse from 'autosuggest-highlight/parse';
// import TextField from '@material-ui/core/TextField';
// import Paper from '@material-ui/core/Paper';
// import MenuItem from '@material-ui/core/MenuItem';
// import { withStyles, createStyles } from '@material-ui/core/styles';
// import FormControl from '@material-ui/core/FormControl';
// import {
//   changeCustomerDetails,
//   clearSelectedCustomer
// } from 'store/loanmanagement/actions/HeaderNavigation';
// import { fade } from '@material-ui/core/styles/colorManipulator';
// import SearchIcon from '@material-ui/icons/Search';


// function renderInputComponent(inputProps) {
//   const { classes, inputRef = () => { }, ref, ...other } = inputProps;

//   return (
//     <FormControl style={{ width: "90%" }}>
//       <TextField
//         fullWidth
//         InputProps={{
//           inputRef: node => {
//             ref(node);
//             inputRef(node);
//           },
//           classes: {
//             input: classes.input
//           }
//         }}
//         {...other}
//       />
//     </FormControl>
//   );
// }

// function renderSuggestion(suggestion, { query, isHighlighted }) {
//   const matches = match(suggestion.company, query);
//   const parts = parse(suggestion.company, matches);

//   return (
//     <MenuItem selected={isHighlighted} component="div">
//       <div>
//         {parts.map((part, index) =>
//           part.highlight ? (
//             <span key={String(index)} style={{ fontWeight: 500 }}>
//               {part.text}
//             </span>
//           ) : (
//               <strong key={String(index)} style={{ fontWeight: 300 }}>
//                 {part.text}
//               </strong>
//             )
//         )}
//       </div>
//     </MenuItem>
//   );
// }

// function getSuggestions(value, customers) {
//   const inputValue = deburr(value.trim()).toLowerCase();
//   const inputLength = inputValue.length;
//   let count = 0;

//   let regex = new RegExp(inputValue, 'gi');
//   return inputLength === 0
//     ? []
//     : customers.filter(suggestion => {
//       let keep = false;
//       if(suggestion.company){
//          keep = count < 5 && regex.test(deburr(suggestion.company.trim()).toLowerCase());
//       }
      

//       if (keep) {
//         count += 1;
//       }

//       return keep;
//     });
// }

// const styles = theme => createStyles({
//   root: {
//     flexGrow: 1
//   },
//   container: {
//     position: 'relative'
//   },
//   suggestionsContainerOpen: {
//     position: 'absolute',
//     zIndex: 1,
//     marginTop: theme.spacing(1),
//     left: 0,
//     right: 0,
//     width: '100%' //Change on Responsive Requirements
//   },
//   suggestion: {
//     display: 'block'
//   },
//   suggestionsList: {
//     margin: 0,
//     padding: 0,
//     listStyleType: 'none'
//   },
//   divider: {
//     height: theme.spacing(2)
//   },

//   search: {
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: fade(theme.palette.common.white, 0.75),
//     '&:hover': {
//       backgroundColor: fade(theme.palette.common.white, 0.25),
//     },
//     marginRight: theme.spacing(2),
//     marginLeft: 0,
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//       marginLeft: theme.spacing(3),
//       width: 'auto',
//     },
//   },
//   searchIcon: {
//     width: theme.spacing(75),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   }

// });

// class IntegrationAutosuggest extends Component {
//   state = {
//     single: '',
//     popper: '',
//     suggestions: []
//   };

//   customerList = [];

//   handleSuggestionsFetchRequested = ({ value }) => {
//     this.setState({
//       suggestions: getSuggestions(value, this.props.customers)
//     });
//   };

//   handleSuggestionsClearRequested = () => {
//     this.setState({
//       suggestions: []
//     });
//   };

//   handleChange = name => (event, { newValue }) => {
//     this.setState({
//       [name]: newValue
//     });

//     if (newValue.trim() === '') {
//       this.props.clearSelectedCustomer();
//     }
//   };

//   getSuggestionValue(suggestion) {
//     if (suggestion) {
//       const customerDetails = {
//         name: suggestion.firstName + ' ' + suggestion.lastName,
//         company: suggestion.company,
//         email: suggestion.email,
//         phone: suggestion.phone,
//         id: suggestion.id,
//         firstName: suggestion.firstName,
//       };

//       this.props.changeCustomerInformation(customerDetails);
//     }

//     return suggestion.company;
//   }

//   updateCustomerListLocal() {
//     const nameList = [];
//     this.props.customers.forEach(customer => {
//       const customerItem = {
//         id: customer.id,
//         company: customer.company
//       };
//       nameList.push(customerItem);
//     });

//     this.setState({ customers: nameList });
//   }

//   sortCustomers(a, b) {
//     const nameA = a.label.toUpperCase();
//     const nameB = b.label.toUpperCase();

//     let comparison = 0;

//     if (nameA > nameB) {
//       comparison = 1;
//     } else if (nameA < nameB) {
//       comparison = -1;
//     }

//     return comparison;
//   }

//   componentDidMount() {
//     this.setState({
//       customers: this.props.customers
//     });
//   }

//   render() {
//     const {
//       classes,
//       inputProps,
//       customers
//     } = this.props;

//     this.customerList = customers;

//     const autosuggestProps = {
//       ...inputProps,
//       renderInputComponent,
//       suggestions: this.state.suggestions,
//       onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
//       onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
//       getSuggestionValue: event => this.getSuggestionValue(event),
//       renderSuggestion
//     };

//     return (
//       <div className={classes.search}>
//         <div className={classes.searchIcon}>
//           <SearchIcon />
//         </div>
//         <Autosuggest
//           {...autosuggestProps}
//           inputProps={{
//             classes,
//             placeholder: 'Search',
//             value: this.state.single,
//             onChange: this.handleChange('single')
//           }}
//           theme={{
//             container: classes.container,
//             suggestionsContainerOpen: classes.suggestionsContainerOpen,
//             suggestionsList: classes.suggestionsList,
//             suggestion: classes.suggestion
//           }}
//           renderSuggestionsContainer={options => (
//             <Paper {...options.containerProps} square>
//               {options.children}
//             </Paper>
//           )}
//         />
//       </div>
//     );
//   }
// }

// IntegrationAutosuggest.propTypes = {
//   inputProps: PropTypes.object,
//   customerDetails: PropTypes.object,
//   classes: PropTypes.object.isRequired,
//   customers: PropTypes.array,
//   changeCustomerInformation: PropTypes.func.isRequired,
//   clearSelectedCustomer: PropTypes.func.isRequired,
// };

// const mapStateToProps = state => {
//   return {
//     customers: state.lmglobal.customers,
//     customerDetails: state.lmglobal.customerDetails
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     changeCustomerInformation: customerDetails => {
//       dispatch(changeCustomerDetails(customerDetails));
//     },
//     clearSelectedCustomer: () => {
//       dispatch(clearSelectedCustomer());
//     },
//   };
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(styles)(IntegrationAutosuggest));
