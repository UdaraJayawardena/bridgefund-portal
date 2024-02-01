import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import deburr from 'lodash/deburr';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import {
  changeCustomerDetails,
  clearSelectedCustomer
} from 'store/loanmanagement/actions/HeaderNavigation';
import { fade } from '@material-ui/core/styles/colorManipulator';

import { requestSmeMandates } from 'store/loanmanagement/actions/SmeMandates';
import { requestSmeLoans } from 'store/loanmanagement/actions/SmeLoans';
import { getCustomerByVTigerId, searchCustomer } from 'store/crm/actions/Customer.action';
import { createCustomersObject } from 'lib/loanmanagement/utility';

function renderInputComponent(inputProps) {
  // eslint-disable-next-line no-empty-function
  const { classes, inputRef = () => { }, ref, ...other } = inputProps;

  return (
    <FormControl>
      <TextField
        fullWidth
        InputProps={{
          inputRef: node => {
            ref(node);
            inputRef(node);
          },
          classes: {
            input: classes.input
          }
        }}
        {...other}
      />
    </FormControl>
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {

  let matches, parts;
  if (suggestion.company) {
    matches = match(suggestion.company, query);
    parts = parse(suggestion.company, matches);
  }
  if (suggestion.mandateNumber) {
    matches = match(suggestion.mandateNumber, query);
    parts = parse(suggestion.mandateNumber, matches);
  }
  if (suggestion.contractNumber) {
    matches = match(suggestion.contractNumber, query);
    parts = parse(suggestion.contractNumber, matches);
  }
  if (suggestion.sbiName) {
    matches = match(suggestion.sbiName, query);
    parts = parse(suggestion.sbiName, matches);
  }

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) =>
          part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )
        )}
      </div>
    </MenuItem>
  );
}

const styles = theme => createStyles({
  root: {
    flexGrow: 1
  },
  container: {
    position: 'relative'
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
    width: '100%' //Change on Responsive Requirements
  },
  suggestion: {
    display: 'block'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  divider: {
    height: theme.spacing(2)
  },

  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.75),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
  },
});

class CustomAutosuggest extends Component {
  state = {
    single: '',
    popper: '',
    suggestions: []
  };

  dataList = [];

  handleSuggestionsFetchRequested = ({ value }) => {
    this.getSuggestions(value, this.props[this.props.entity], this.props.sugg_field);
  };

  handleSuggestionsClearRequested = () => {
    if (this.state.single === '' && this.props.onResult) {
      this.props.onResult('');
    }
    this.setState({
      suggestions: []
    });
  };

  handleChange = name => (event, { newValue }) => {
    this.setState({
      [name]: newValue
    });

    if (newValue.trim() === '') {
      this.props.clearSelectedCustomer();
    }
  };

  getSuggestions = (value, data, sugg_field) => {
    if (this.props.entity === 'customers') {
      if (value && value.length > 2) {
        this.props.searchCustomer(sugg_field, value, null, null).then(customers => {
          this.setState({ suggestions: createCustomersObject(customers) });
        }).catch(err => {
          console.log(err);
        });
      }
      return;
    }

    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    const regex = new RegExp(inputValue, 'gi');
    const suggestions = inputLength === 0 || data === undefined
      ? []
      : data.filter(suggestion => {
        const keep = count < 5 && regex.test(suggestion[sugg_field]);

        if (keep) {
          count += 1;
        }

        return keep;
      });

    this.setState({ suggestions });
  }

  updateParent(newValues) {
    if (this.props.onResult) {
      this.props.onResult(newValues);
    }
  }

  getSuggestionValue(suggestion) {
    if (suggestion) {

      switch (this.props.entity) {
        case 'customers': {

          this.props.getCustomerByVTigerId(suggestion.vTigerAccountNumber).then(customer => {
            const customerDetails = {
              name: customer.firstName + ' ' + customer.lastName,
              company: customer.company,
              email: customer.email,
              phone: customer.phone,
              id: customer.id,
              firstName: customer.firstName,
            };

            this.props.changeCustomerInformation(customerDetails);

            this.updateParent(customerDetails);
          }).catch(err => {
            console.log(err);
          });

          this.props.getMandatesForCustomer(suggestion.vTigerAccountNumber);

          this.props.getContractsForCustomer(suggestion.vTigerAccountNumber);

          return suggestion[this.props.sugg_field];
        }
        case 'mandates':
          break;
        case 'contracts':
          break;
        case 'sbiParents':
          this.updateParent(suggestion);
          return suggestion[this.props.sugg_field];
        default:
          break;
      }
    }
  }

  // no usage

  // updateCustomerListLocal() {
  //   const nameList = [];
  //   this.props[this.props.entity].forEach(customer => {
  //     const customerItem = {
  //       id: customer.id,
  //       company: customer.company
  //     };
  //     nameList.push(customerItem);
  //   });

  //   this.setState({ [this.props.entity]: nameList });
  // }

  // sortCustomers(a, b) {
  //   const nameA = a.label.toUpperCase();
  //   const nameB = b.label.toUpperCase();

  //   let comparison = 0;

  //   if (nameA > nameB) {
  //     comparison = 1;
  //   } else if (nameA < nameB) {
  //     comparison = -1;
  //   }

  //   return comparison;
  // }

  componentDidMount() {
    this.setState({
      [this.props.entity]: this.props[this.props.entity],
      single: this.props.value ? this.props.value : ''
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.value === '' && this.state.single === '' && this.props.value !== '') {
      this.setState({ single: this.props.value });
    }
  }

  render() {
    const {
      classes,
      inputProps,
      entity,
      label,
      id,
    } = this.props;

    this.dataList = entity;

    const autosuggestProps = {
      ...inputProps,
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue: event => this.getSuggestionValue(event),
      renderSuggestion
    };

    return (
      <div className={classes.search}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            id: id,
            placeholder: label,
            value: this.state.single,
            onChange: this.handleChange('single')
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />
      </div>
    );
  }
}

CustomAutosuggest.propTypes = {
  classes: PropTypes.object.isRequired,
  customerDetails: PropTypes.object,
  inputProps: PropTypes.object,
  mandates: PropTypes.array,
  contracts: PropTypes.array,
  sbiParents: PropTypes.array,
  onResult: PropTypes.func,
  clearSelectedCustomer: PropTypes.func.isRequired,
  getMandatesForCustomer: PropTypes.func.isRequired,
  getContractsForCustomer: PropTypes.func.isRequired,
  changeCustomerInformation: PropTypes.func.isRequired,
  id: PropTypes.string,
  value: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  entity: PropTypes.string.isRequired,
  sugg_field: PropTypes.string.isRequired,
  searchCustomer: PropTypes.func,
  getCustomerByVTigerId: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    customerDetails: state.lmglobal.customerDetails,
    mandates: state.smemandates.smemandates,
    contracts: state.lmglobal.smeLoans,
    sbiParents: state.sbi.SbiParentList
  };
};

const mapDispatchToProps = dispatch => {
  return {

    changeCustomerInformation: customerDetails => {
      dispatch(changeCustomerDetails(customerDetails));
    },

    getMandatesForCustomer: customerId => {
      dispatch(requestSmeMandates(customerId));
    },

    getContractsForCustomer: customerId => {
      dispatch(requestSmeLoans(customerId));
    },
    clearSelectedCustomer: () => {
      dispatch(clearSelectedCustomer());
    },
    searchCustomer: (key, value, criteria, customerId) => dispatch(searchCustomer(key, value, criteria, customerId)),
    getCustomerByVTigerId: (vTigerAccountNumber) => dispatch(getCustomerByVTigerId(vTigerAccountNumber))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CustomAutosuggest));
