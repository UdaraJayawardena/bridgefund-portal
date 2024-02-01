import React from 'react';
import PropTypes from 'prop-types';
import classNames from "classnames";
import MaskedInput from 'react-text-mask';
import NumberFormat from 'react-number-format';

import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import withStyles from "@material-ui/core/styles/withStyles";

import customInputStyle from "assets/jss/material-dashboard-react/components/customInputStyle.jsx";

function TextMaskCustom({ ...props }) {
  const { inputRef, ...other } = props;
  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

function NumberFormatCustom(props) {
  const { symbol, decimalSeparator, thousandSeparator, inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      decimalSeparator={decimalSeparator}
      thousandSeparator={thousandSeparator}
      isNumericString={true}
      prefix={`${symbol} `}
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  symbol: PropTypes.string,
};

function FormattedInputs({ ...props }) {
  const {
    classes,
    labelText,
    formControlProps,
    readOnly,
    type,
    id,
    name,
    error,
    success
  } = props;

  const NON_DIGIT = '/[^\\d]/g';

  const labelClasses = classNames({
    [" " + classes.labelRootError]: error,
    [" " + classes.labelRootSuccess]: success && !error
  });
  const marginTop = classNames({
    [classes.marginTop]: labelText === undefined
  });

  const disableEdit = readOnly ? readOnly : false;

  const onChange = (value, name) => {
    if (readOnly || !props.changeValue) return;
    props.changeValue(value, name);
  };

  return (
    <FormControl
      {...formControlProps}
      className={formControlProps ? formControlProps.className : classes.formControl + " " + props.className ? props.className : ''}
    >
      {type === "text" ?  /* this section only for formatting numbers with decimals, thousand seperator, currency symbol */
        <TextField
          classes={{
            root: marginTop,
          }}
          className={props.className ? props.className : ''}
          label={props.labelText}
          value={props.numberformat}
          id={id}
          name={name}
          inputProps={{
            symbol: props.symbol,
            decimalSeparator: props.decimalSeparator,
            thousandSeparator: props.thousandSeparator,
          }}
          InputProps={{
            readOnly: disableEdit,
            inputComponent: NumberFormatCustom,
            onBlur: props.onBlur ? (e) => props.onBlur(e.target.value, name) : () => {/*  */ }
          }}
          InputLabelProps={{
            classes: {
              root: classes.labelRoot + labelClasses
            },
          }}
          onChange={(e) => onChange(e.target.value, name)}
        />
        : /* this section only for numbers not allowed for decimals */
        <TextField
          classes={{
            root: marginTop,
          }}
          className={props.className ? props.className : ''}
          type="number"
          label={props.labelText}
          value={props.numberformat}
          id={id}
          name={name}
          InputLabelProps={{
            classes: {
              root: classes.labelRoot + labelClasses
            },
          }}
          onChange={(e) => onChange(parseInt(e.target.value.toString().replace(NON_DIGIT, '')), name)}
        />
      }
    </FormControl>
  );
}

FormattedInputs.propTypes = {
  classes: PropTypes.object.isRequired,
  labelText: PropTypes.node,
  textmask: PropTypes.node,
  numberformat: PropTypes.node,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  className: PropTypes.string,
  id: PropTypes.string,
  changeValue: PropTypes.func,
  onBlur: PropTypes.func,
  readOnly: PropTypes.bool,
  type: PropTypes.string,
  name: PropTypes.string,
  error: PropTypes.bool,
  success: PropTypes.bool,
  symbol: PropTypes.string,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string,
};

export default withStyles(customInputStyle)(FormattedInputs);