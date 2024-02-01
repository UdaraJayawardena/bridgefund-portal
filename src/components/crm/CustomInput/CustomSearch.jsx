import React from 'react';
import clx from "classnames";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, createStyles, InputAdornment } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { matchInputTypeToPattern, formatInput } from './util';
import { LockOutlined } from '@material-ui/icons';

import { searchCustomer } from 'store/crm/actions/Customer.action';
import { searchPerson } from 'store/crm/actions/Person.action';

const Styles = createStyles({

  listBox: {
    fontFamily: 'Source Sans Pro',
    fontSize: '12px',
    padding: 0,
    lineHeight: "15.08px",
    weight: 400
  },
  formControl: {
    marginBottom: '20px',
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

const restricedSearchTypes = ['customer', 'person'];
function CustomSearch(props) {

  const {
    classes, id, value, label, placeholder, name, onChange, onSearchResult, readOnly, disabled,
    changeToFormatType, pattern, inputValuePatternType, asyncSearchType, SearchOptions,
  } = props;

  const [options, setOptions] = React.useState([]);
  const [error, setError] = React.useState(false);
  const isLocked = readOnly || disabled;

  const getPromiseReq = () => {

    let asyncCall = Promise.resolve([]);;

    if (restricedSearchTypes.includes(asyncSearchType) && value.length < 3) {
      return asyncCall;
    }

    switch (asyncSearchType) {
      case 'customer':
        asyncCall = props.searchCustomer(name, value, SearchOptions.criteria, SearchOptions.customerId, SearchOptions.regexOption);
        break;
      case 'person':
        asyncCall = props.searchPerson(name, value, SearchOptions.criteria, SearchOptions.customerId, SearchOptions.regexOption);
        break;
      default:
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
      renderInput={(params) => 
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
      // )
    }
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
  searchCustomer: PropTypes.func,
  searchPerson: PropTypes.func,
  pattern: PropTypes.instanceOf(RegExp),
  asyncSearchType: PropTypes.oneOf(['customer', 'person']),
  changeToFormatType: PropTypes.oneOf(['CamelCase', 'FirstCap']),
  inputValuePatternType: PropTypes.oneOf(['postalCode']),
  SearchOptions: PropTypes.shape({
    criteria: PropTypes.oneOf(['in', 'out']),
    customerId: PropTypes.string,
    regexOption: PropTypes.string
  })
};


const mapDispatchToProps = (dispatch) => ({
  searchCustomer: (key, value, criteria, customerId, option) => dispatch(searchCustomer(key, value, criteria, customerId, option)),
  searchPerson: (key, value, criteria, customerId, option) => dispatch(searchPerson(key, value, criteria, customerId, option)),
});

export default connect(null, mapDispatchToProps)(withStyles(Styles)(CustomSearch));
