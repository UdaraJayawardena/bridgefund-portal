import React from 'react';
import clx from "classnames";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, createStyles, InputAdornment } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { matchInputTypeToPattern, formatInput } from './util';
import { LockOutlined } from '@material-ui/icons';
import { searchContract } from 'store/initiation/actions/Contracts.action';
import { searchProcess } from 'store/initiation/actions/workflowManagement.action';
import { searchBaiBank } from 'store/initiation/actions/Bank.action';
import { searchCustomer } from 'store/initiation/actions/BankAccount.action';
import { searchRequestId } from 'store/initiation/actions/CreditRiskOverview.action';

const Styles = createStyles({
  listBox: {
    fontFamily: 'Source Sans Pro',
    fontSize: '12px',
    padding: 0,
    lineHeight: "15.08px",
    weight: 400
  },
  formControl: {
    marginTop: '20px',
    height: '40px',
  },
  txtfld: {
    "& input::placeholder": {
      fontSize: "11px"
    }
  },
  inputProp: {
    fontSize: '12px',
    height: '40px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "15.08px",
    weight: 400
  },
  inputLabel: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "7.77px",
    weight: 400
  }
});

const iconColor = "rgba(0, 0, 0, 0.38)";

function CustomSearch(props) {

  const {
    classes, id, value, label, placeholder, name, onChange, onSearchResult, readOnly, disabled,
    changeToFormatType, pattern, inputValuePatternType, asyncSearchType, SearchOptions,
  } = props;

  const [options, setOptions] = React.useState([]);
  const [error, setError] = React.useState(false);
  const isLocked = readOnly || disabled;

  const getPromiseReq = () => {

    let asyncCall = null;
    switch (asyncSearchType) {
      case 'contract':
        asyncCall = props.searchContract({
          key: name,
          value,
          criteria: SearchOptions.criteria,
          contractId: SearchOptions.id,
          options: SearchOptions.regexOption
        });
        break;
      case 'bank':
        asyncCall = props.searchBaiBank({
          bank_full_name: value
        });
        break;
      case 'requestId':
        asyncCall = props.searchRequestId({
          contractId: value
        });
        break;
      case 'requestId_risk_dashboard':

        if (value && (value.trim().substring(0, 3) === 'SBF' || value.trim().substring(0, 3) === 'sbf')) {
          if (value.trim().length >= 6) asyncCall = props.searchRequestId({ contractId: value });
          else asyncCall = Promise.resolve([]);

        } else if (value && value.trim().length >= 3 && value.trim().match(/^[0-9]*$/) !== null) {
          const contractValue = 'SBF'.concat(value.trim());
          asyncCall = props.searchRequestId({ contractId: contractValue });

        } else asyncCall = Promise.resolve([]);

        break;

      case 'customer':
        asyncCall = props.searchCustomer(name, value, SearchOptions.criteria, SearchOptions.id, SearchOptions.regexOption);
        break;
      case 'process':
        //   asyncCall = props.searchProcess({
        //     //processDefinitionKey: SearchOptions.processDefinitionKey
        // });
        asyncCall = Promise.resolve(['contract-management']);
        break;
      case 'contractId':
        asyncCall = Promise.resolve([]);
        break;
      default:
        asyncCall = Promise.resolve([]);
        break;
    }
    return asyncCall;
  };

  React.useEffect(() => {
    let active = true;

    if (asyncSearchType === null || asyncSearchType === undefined) {
      return undefined;
    }
    if (value === '' || value === null || value === undefined) {
      setOptions([]);
      return undefined;
    }

    const asyncCall = getPromiseReq();

    if (active) {
      asyncCall
        .then(results => setOptions(results))
        .catch(() => {/*  */ });
    }
    return () => {
      active = false;
    };
  }, [
    value, asyncSearchType
  ]);


  const handleSearchValue = (event, searchValue) => {
    onSearchResult(searchValue);
  };

  const handleSearchInputValue = (event, searchValue) => {

    if (changeToFormatType) {
      searchValue = formatInput(changeToFormatType, searchValue);
    }
    if (pattern !== undefined && searchValue !== '') {
      searchValue = matchInputTypeToPattern(inputValuePatternType, searchValue);
      setError(!new RegExp(pattern).test(searchValue));
    } else {
      setError(false);
    }
    if (event)
      onChange(name, searchValue);
  };

  const formControlStyle = clx({
    [classes.formControl]: true,
    [props.formControlStyle]: props.formControlStyle !== undefined
  });

  const textFieldStyle = clx({
    [classes.txtfld]: error
  });

  const listBoxStyle = clx({
    [classes.listBox]: true
  });
  const inputPropsStyle = clx({
    [classes.inputProp]: true
  });
  const inputLabelStyle = clx({
    [classes.inputLabel]: true
  });

  return (
    <Autocomplete
      ListboxProps={
        {
          className: listBoxStyle
        }}
      freeSolo
      id={id}
      disableClearable
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option[name];
      }}
      inputValue={value}
      onChange={handleSearchValue}
      onInputChange={handleSearchInputValue}
      disabled={disabled}
      className={formControlStyle}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          id={id + '-textfield'}
          name={name}
          label={label}
          placeholder={placeholder}
          className={textFieldStyle}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            className: inputPropsStyle,
            type: 'search',
            readOnly: readOnly,
            endAdornment: isLocked && (
              <InputAdornment position="end">
                <LockOutlined htmlColor={iconColor} />
              </InputAdornment>
            )
          }}
          InputLabelProps={{
            shrink: true,
            className: inputLabelStyle
          }}
        />
      )}
    />
  );
}

CustomSearch.defaultProps = {
  SearchOptions: {
  }
};

CustomSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  formControlStyle: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onSearchResult: PropTypes.func,
  searchContract: PropTypes.func,
  searchProcess: PropTypes.func,
  searchBaiBank: PropTypes.func,
  searchRequestId: PropTypes.func,
  pattern: PropTypes.instanceOf(RegExp),
  asyncSearchType: PropTypes.oneOf(['contract', 'bank', 'customer', 'requestId']),
  changeToFormatType: PropTypes.oneOf(['CamelCase', 'FirstCap', 'DashSeperated', 'UpperCaseWithNoSpace']),
  inputValuePatternType: PropTypes.oneOf(['postalCode']),
  SearchOptions: PropTypes.shape({
    criteria: PropTypes.oneOf(['in', 'out']),
    id: PropTypes.string,
    regexOption: PropTypes.string
  }),
  searchCustomer: PropTypes.func,
};


const mapDispatchToProps = (dispatch) => ({
  searchContract: ({ key, value, criteria, contractId, options }) => dispatch(searchContract({ key, value, criteria, contractId, options })),
  searchProcess: ({ processDefinitionKey }) => dispatch(searchProcess({ processDefinitionKey })),
  searchBaiBank: ({ bank_full_name }) => dispatch(searchBaiBank({ bank_full_name })),
  searchRequestId: (queryData) => dispatch(searchRequestId(queryData)),
  searchCustomer: (key, value, criteria, id, option) => dispatch(searchCustomer(key, value, criteria, id, option)),
});

export default connect(null, mapDispatchToProps)(withStyles(Styles)(CustomSearch));
