import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import NumberFormat from 'react-number-format';
import MaskedInput from 'react-text-mask';
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
// @material-ui/icons
import Clear from "@material-ui/icons/Clear";
import Check from "@material-ui/icons/Check";
// core components
import customInputStyle from "assets/jss/material-dashboard-react/components/customInputStyle.jsx";
import { FormHelperText, TextField } from "@material-ui/core";

// eslint-disable-next-line no-useless-escape
const NON_DIGIT = '/[^\d]/g';
const NL_IBAN_REGEX = /([A-Z]{2}\s?)([a-zA-Z0-9]{2}\s?)([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){2}([0-9]{2})\s?/i;

function TextMaskCustom(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[NL_IBAN_REGEX]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;
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
      decimalSeparator=","
      thousandSeparator="."
      isNumericString={true}
      prefix="€ "
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};


function PercentageFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;
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
      decimalSeparator=","
      thousandSeparator="."
      isNumericString={true}
      suffix=" %"
      decimalScale={2}
      fixedDecimalScale={true}
    />
  );
}

PercentageFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

function CustomInput({ ...props }) {
  const {
    classes,
    formControlProps,
    labelText,
    id,
    labelProps,
    error,
    success,
    errmsg,
    inputHelperText,
    type,
  } = props;

  let { inputProps } = props;

  const labelClasses = classNames({
    [" " + classes.labelRootError]: error,
    [" " + classes.labelRootSuccess]: success && !error
  });
  const underlineClasses = classNames({
    [classes.underlineError]: error,
    [classes.underlineSuccess]: success && !error,
    [classes.underline]: true
  });
  const marginTop = classNames({
    [classes.marginTop]: labelText === undefined
  });
  const helperText = classNames({
    [classes.errorMessage]: error,
    [classes.helperText]: !error
  });

  const onChange = (e) => {
    switch (type) {

      case "number":
        e.target.value = parseFloat(e.target.value.toString().replace(NON_DIGIT, ''));
        break;
      default:
        break;
    }
    e.target["name"] = e.target.name || props.inputProps.name;
    props.inputProps.onChange(e);
  }

  if (type === "money")
    return (
      <FormControl
        {...formControlProps}
        className={formControlProps.className + " " + classes.formControl}
      >
        <TextField
          label={labelText}
          value={props.value}
          name={props.name}
          onChange={(e) => onChange(e)}
          id="formatted-numberformat-input"
          InputProps={{
            inputComponent: NumberFormatCustom,
          }}
        />
        {error ? (
          <Clear className={classes.feedback + " " + classes.labelRootError} />
        ) : success ? (
          <Check className={classes.feedback + " " + classes.labelRootSuccess} />
        ) : null}
        <FormHelperText className={helperText} id={id + "-error-text"}>{error ? errmsg : (inputHelperText || '')}</FormHelperText>
      </FormControl>
    );

  if (type === "percentage")
    return (
      <FormControl
        {...formControlProps}
        className={formControlProps.className + " " + classes.formControl}
      >
        <TextField
          label={labelText}
          value={props.value}
          name={props.name}
          onChange={(e) => onChange(e)}
          id="formatted-numberformat-input"
          InputProps={{
            inputComponent: PercentageFormatCustom,
          }}
          disabled={props.inputProps.disabled === undefined ? false : props.inputProps.disabled}
        />
        {error ? (
          <Clear className={classes.feedback + " " + classes.labelRootError} />
        ) : success ? (
          <Check className={classes.feedback + " " + classes.labelRootSuccess} />
        ) : null}
        <FormHelperText className={helperText} id={id + "-error-text"}>{error ? errmsg : (inputHelperText || '')}</FormHelperText>
      </FormControl>
    );

  return (
    <FormControl
      {...formControlProps}
      className={formControlProps.className + " " + classes.formControl}
    >
      {labelText !== undefined ? (
        <InputLabel
          className={classes.labelRoot + labelClasses}
          htmlFor={id}
          {...labelProps}
        >
          {labelText}
        </InputLabel>
      ) : null}
      <Input
        classes={{
          root: marginTop,
          disabled: classes.disabled,
          underline: underlineClasses
        }}
        id={id}
        {...inputProps}
        onChange={(e) => onChange(e)}
      />
      {error ? (
        <Clear className={classes.feedback + " " + classes.labelRootError} />
      ) : success ? (
        <Check className={classes.feedback + " " + classes.labelRootSuccess} />
      ) : null}
      <FormHelperText className={helperText} id={id + "-error-text"}>{error ? errmsg : (inputHelperText || '')}</FormHelperText>
    </FormControl>
  );
}

CustomInput.propTypes = {
  classes: PropTypes.object.isRequired,
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  error: PropTypes.bool,
  success: PropTypes.bool,
  errmsg: PropTypes.string,
  inputHelperText: PropTypes.string,
  type: PropTypes.string,
};

export default withStyles(customInputStyle)(CustomInput);
