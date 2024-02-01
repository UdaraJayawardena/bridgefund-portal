import React from 'react';
import clx from "classnames";
import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';
import NumberFormat from 'react-number-format';

import { LockOutlined, AddOutlined, DeleteOutline, PublishRounded, GetAppOutlined } from '@material-ui/icons';
import withStyles from "@material-ui/core/styles/withStyles";
import { FormControl, TextField, createStyles, InputLabel, Select, MenuItem, InputAdornment, IconButton, Divider, Button } from '@material-ui/core';

import { matchInputTypeToPattern, formatInput } from './util';

const Styles = createStyles({
  formControl: {
    marginBottom: '20px',
    height: '40px',
  },
  txtfld: {
    "& input::placeholder": {
      fontSize: "12px"
    },
     height: '40px'
  },
  iconButtonStyle: {
    // padding: 0
  },
  divider: {
    // height: 28,
    // margin: 5
  },
  uploadButton: {
    // height: 40,
    height: '25px',
    background: '#707070',
    color: '#fff',
    border: 'none',
    '&:hover': {
      background: '#707070',
      color: '#fff',
    }
  },
  fileUploadInput: {
    display: 'none'
  },
  inputProp: {
    fontSize: '12px', 
    height: '40px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "15.08px",
    weight: 400
  },
  menuItem: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
  },
  inputLabel: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "7.77px",
    weight: 400
  },
  inputSubProp: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "7.77px",
    weight: 400,
  },
  inputLabelStyle:  {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "7.77px",
    weight: 400
  },
// root: {
//   '&$disabled $PrivateNotchedOutline': {
//      borderColor: 'orange'
//   }
// },
});

const iconColor = "rgba(0, 0, 0, 0.38)";

//#region /* Mask Input Component (3rd Party) */
function TextMaskCustom(props) {
  const { inputRef, mask, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={mask}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  mask: PropTypes.array.isRequired,
};

//#endregion /* ***END*** */

//#region Number Formatter Component (3rd Party)
function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      decimalSeparator=","
      thousandSeparator="."
      isNumericString={true}
      prefix="€ "
      decimalScale={2}
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
//#endregion

function PercentageFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: Number(values.value),
          },
        });
      }}
      decimalSeparator=","
      isAllowed={(values) => (Number(values.value) > 100 ? false : true)}
      // isNumericString={true}
      suffix=" %"
      allowNegative={false}
      decimalScale={2}
    />
  );
}

PercentageFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function CustomInputBox(props) {

  const {
    classes, id, label, type, value, name, onChange, dropDownValues, mask, pattern, inputValuePatternType,
    helperText, placeholder, readOnly, disabled, defaultValue, onAdd, onRemove, subType, changeToFormatType, fieldName, isNoneInDropDownList, onFocus, onBlur } = props;

  const [error, setError] = React.useState(false);

  const formControlStyle = clx({
    [classes.formControl]: true,
    [props.formControlStyle]: props.formControlStyle !== undefined
  });

  const textFieldStyle = clx({
    [classes.txtfld]: error
  });

  const inputPropsStyle = clx({
    [classes.inputProp]: true
  });
  const menuItemStyle = clx({
    [classes.menuItem]: true
  });
  const inputLabelStyle = clx({
    [classes.inputLabel]: true
  });
  const inputSubPropsStyle = clx({
    [classes.inputSubProp]: true
    });
    const rootStyle = clx({
      [classes.root]: true
      });
      const notchedOutlineStyle = clx({
        [classes.notchedOutline]: true
      });
  
  const isLocked = readOnly || disabled;

  const handleChange = (key, value, subTypeValue) => {
    // console.log('customInput', { key, value });

    if (changeToFormatType) {
      value = formatInput(changeToFormatType, value);
    }
    if (pattern !== undefined && value !== '') {
      value = matchInputTypeToPattern(inputValuePatternType, value);
      setError(!new RegExp(pattern).test(value));
    } else {
      setError(false);
    }

    onChange(key, value, subTypeValue);
  };

  const handleFile = (key, file) => {

    if (!file) return;

    const obj = {
      fieldName: fieldName,
      fileName: file.name,
      size: file.size,
      type: file.type,
      dataUrl: null
    };

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      obj.dataUrl = reader.result;
      onChange(key, obj);
    };
  };

  const downloadFile = () => {

    const element = document.createElement('a');
    element.setAttribute('href', value.dataUrl);
    element.setAttribute('download', value.fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  if (type === 'text') return (
    <FormControl variant="outlined" className={formControlStyle} fullWidth>
      <TextField
        id={id}
        label={label}
        variant="outlined"
        value={value}
        name={name}
        placeholder={placeholder}
        className={textFieldStyle}
        onChange={(e) => handleChange(name, e.target.value)}
        onFocus={(e => onFocus(name, e.target.value))}
        onBlur={(e => onBlur(name, e.target.value))}
        error={error}
        helperText={error === true && helperText}
        InputProps={{
          readOnly: readOnly,
          className: inputPropsStyle,
          startAdornment: subType && (
            <InputAdornment position="start">
              <Select
                id={`${id}-subtype`}
                value={subType.value}
                placeholder='Type'
                displayEmpty
                onChange={(e) => handleChange(name, value, e.target.value)}
                inputProps={{
                  name: name,
                  id: `${id}-subtype-label`,
                  readOnly: readOnly,
                  className: inputSubPropsStyle
                  // className: rootStyle
                //   classes: {
                //     root: classes.rootStyle,
                //     notchedOutline: classes.notchedOutline,
                //     inputSubPropsStyle: classes.inputSubPropsStyle
                //  }
                }}
                defaultValue=''
                disabled={disabled}
              >
                <MenuItem className={menuItemStyle} value='' disabled><em>Type</em></MenuItem>
                {subType.dropDownValues.map((item, index) => (
                  <MenuItem className={menuItemStyle}key={item.key + index} value={item.value}>{item.key}</MenuItem>
                ))}
              </Select>
              <Divider orientation="vertical" className={classes.divider} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLocked && <LockOutlined htmlColor={iconColor} />}
              {onRemove && <IconButton className={classes.iconButtonStyle} onClick={onRemove}><DeleteOutline htmlColor={iconColor} /></IconButton>}
              {onAdd && <IconButton className={classes.iconButtonStyle} onClick={onAdd}><AddOutlined htmlColor={iconColor} /></IconButton>}
            </InputAdornment>
          )
        }}
        InputLabelProps={{
          className: inputLabelStyle,
          shrink: true,
          // margin: 'dense'
        }}
        disabled={disabled}
      />
    </FormControl>
  );
  else if (type === 'maskedInput') return (
    <FormControl variant="outlined" className={formControlStyle} fullWidth>
      <TextField
        value={value}
        onChange={(e) => handleChange(name, e.target.value)}
        name={name}
        placeholder={placeholder}
        label={label}
        variant="outlined"
        id={id}
        InputProps={{
          className: inputPropsStyle,
          inputComponent: TextMaskCustom,
          inputProps: { mask },
          readOnly: readOnly,
          startAdornment: subType && (
            <InputAdornment position="start">
              <Select
                id={`${id}-subtype`}
                value={subType.value}
                placeholder='Type'
                displayEmpty
                onChange={(e) => handleChange(name, value, e.target.value)}
                inputProps={{
                  name: name,
                  id: `${id}-subtype-label`,
                  readOnly: readOnly,
                }}
                defaultValue=''
                disabled={disabled}
              >
                <MenuItem className={menuItemStyle} value='' disabled><em>Type</em></MenuItem>
                {subType.dropDownValues.map((item, index) => (
                  <MenuItem className={menuItemStyle} key={item.key + index} value={item.value}>{item.key}</MenuItem>
                ))}
              </Select>
              <Divider orientation="vertical" className={classes.divider} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLocked && <LockOutlined htmlColor={iconColor} />}
              {onRemove && <IconButton className={classes.iconButtonStyle} onClick={onRemove}><DeleteOutline htmlColor={iconColor} /></IconButton>}
              {onAdd && <IconButton className={classes.iconButtonStyle} onClick={onAdd}><AddOutlined htmlColor={iconColor} /></IconButton>}
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          className: inputLabelStyle,
          shrink: true
        }}
        error={error}
        disabled={disabled}
      />
    </FormControl>
  );
  else if (type === 'dropdown') return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <InputLabel className={inputLabelStyle} htmlFor={`${id}-label`}>{label}</InputLabel>
      <Select
        id={id}
        value={value}
        onChange={(e) => handleChange(name, e.target.value)}
        label={label}
        className= {inputPropsStyle}
        inputProps={{
          name: name,
          id: `${id}-label`,
          readOnly: readOnly,
          className: inputSubPropsStyle,
        }}
        startAdornment={subType && (
          <InputAdornment position="start">
            <Select
              id={`${id}-subtype`}
              value={subType.value}
              placeholder='Type'
              displayEmpty
              onChange={(e) => handleChange(name, value, e.target.value)}
              inputProps={{
                name: name,
                id: `${id}-subtype-label`,
                readOnly: readOnly,
                className: inputSubPropsStyle,
              }}
              defaultValue=''
              disabled={disabled}
            >
              <MenuItem className={menuItemStyle} value='' disabled><em>Type</em></MenuItem>
              {subType.dropDownValues.map((item, index) => (
                <MenuItem className={menuItemStyle} key={item.key + index} value={item.value}>{item.key}</MenuItem>
              ))}
            </Select>
            <Divider orientation="vertical" className={classes.divider} />
          </InputAdornment>
        )}
        endAdornment={isLocked && (
          <InputAdornment position="end">
            <LockOutlined htmlColor={iconColor} />
          </InputAdornment>
        )}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        {isNoneInDropDownList && <MenuItem className={menuItemStyle} value=''><em>None</em></MenuItem>}
        {dropDownValues.map((item, index) => (
          <MenuItem className={menuItemStyle} key={item.key + index} value={item.value}>{item.key}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  else if (type === 'file') return (
    <FormControl variant="outlined" className={formControlStyle} fullWidth>
      <TextField
        id={id}
        label={label}
        placeholder={placeholder ? placeholder : 'Choose File'}
        variant="outlined"
        name={name}
        value={value ? value.fileName : ''}
        error={error}
        helperText={error === true && helperText}
        InputLabelProps={{
          shrink: true,
          className: inputLabelStyle
        }}
        InputProps={{
          className: inputPropsStyle,
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <input
                type="file"
                id={`${id}-input`}
                className={classes.fileUploadInput}
                onChange={(e) => handleFile(name, e.target.files[0])}
              />
              <label htmlFor={`${id}-input`}>
                <Button className={classes.uploadButton} variant='outlined' component='span'><PublishRounded /></Button>
              </label>
              <Divider orientation="vertical" className={classes.divider} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {value?.fileName && <IconButton className={classes.iconButtonStyle} onClick={downloadFile}><GetAppOutlined htmlColor={iconColor} /></IconButton>}
              {isLocked && <LockOutlined htmlColor={iconColor} />}
              {onRemove && <IconButton className={classes.iconButtonStyle} onClick={onRemove}><DeleteOutline htmlColor={iconColor} /></IconButton>}
              {onAdd && <IconButton className={classes.iconButtonStyle} onClick={onAdd}><AddOutlined htmlColor={iconColor} /></IconButton>}
            </InputAdornment>
          ),
        }}
      />
      {/* <TextField
        id={id}
        label={label}
        variant="outlined"
        value={value}
        name={name}
        type='file'
        placeholder={placeholder}
        className={classes.fileFieldStyle}
        error={error}
        helperText={error === true && helperText}
        // @ts-ignore
        onChange={(e) => handleFile(name, e.target.files[0])}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: readOnly,
          endAdornment: (
            <InputAdornment position="end">
              {isLocked && <LockOutlined htmlColor={iconColor} />}
              {onRemove && <IconButton className={classes.iconButtonStyle} onClick={onRemove}><DeleteOutline htmlColor={iconColor} /></IconButton>}
              {onAdd && <IconButton className={classes.iconButtonStyle} onClick={onAdd}><AddOutlined htmlColor={iconColor} /></IconButton>}
            </InputAdornment>
          ),
        }}
      /> */}
    </FormControl>
  );

  else if (type === 'money') return (
    <FormControl variant="outlined" className={formControlStyle} fullWidth>
      <TextField
        value={value}
        onChange={(e) => handleChange(name, e.target.value)}
        name={name}
        placeholder={placeholder}
        label={label}
        variant="outlined"
        id={id}
        InputProps={{
          className: inputPropsStyle,
          inputComponent: NumberFormatCustom,
          readOnly: readOnly,
          startAdornment: subType && (
            <InputAdornment position="start">
              <Select
                id={`${id}-subtype`}
                value={subType.value}
                placeholder='Type'
                displayEmpty
                onChange={(e) => handleChange(name, value, e.target.value)}
                inputProps={{
                  name: name,
                  id: `${id}-subtype-label`,
                  readOnly: readOnly
                }}
                defaultValue=''
                disabled={disabled}
              >
                <MenuItem className={menuItemStyle} value='' disabled><em>Type</em></MenuItem>
                {subType.dropDownValues.map((item, index) => (
                  <MenuItem className={menuItemStyle} key={item.key + index} value={item.value}>{item.key}</MenuItem>
                ))}
              </Select>
              <Divider orientation="vertical" className={classes.divider} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLocked && <LockOutlined htmlColor={iconColor} />}
              {onRemove && <IconButton className={classes.iconButtonStyle} onClick={onRemove}><DeleteOutline htmlColor={iconColor} /></IconButton>}
              {onAdd && <IconButton className={classes.iconButtonStyle} onClick={onAdd}><AddOutlined htmlColor={iconColor} /></IconButton>}
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          shrink: true,
          className: inputLabelStyle
        }}
        error={error}
        disabled={disabled}
      />
    </FormControl>
  );

  else if (type === 'percentage') return (
    <FormControl variant="outlined" className={formControlStyle} fullWidth>
      <TextField
        value={value}
        onChange={(e) => handleChange(name, e.target.value)}
        name={name}
        placeholder={placeholder}
        label={label}
        variant="outlined"
        id={id}
        InputProps={{
          className: inputPropsStyle,
          inputComponent: PercentageFormatCustom,
          readOnly: readOnly,
        }}
        InputLabelProps={{
          shrink: true,
          className: inputLabelStyle
        }}
        error={error}
        disabled={disabled}
      />
    </FormControl>
  );
  return (null);
}

CustomInputBox.defaultProps = {
  id: Math.random().toString(),
  type: 'text',
  onChange: () => { /*  */ },
  onBlur: () => { /*  */ },
  onFocus: () => { /*  */ },
  dropDownValues: [],
  mask: [],
  helperText: 'Incorrect input!',
  placeholder: '',
  readOnly: false,
  disabled: false,
  isNoneInDropDownList: true,
};

CustomInputBox.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.shape({
    fileName: PropTypes.string,
    size: PropTypes.number,
    type: PropTypes.string,
    dataUrl: PropTypes.string
  })]),
  name: PropTypes.string,
  fieldName: PropTypes.string,
  helperText: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  formControlStyle: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  type: PropTypes.oneOf(['text', 'dropdown', 'file', 'money', 'number', 'maskedInput', 'percentage']),
  inputValuePatternType: PropTypes.oneOf(['postalCode']),
  dropDownValues: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  mask: PropTypes.array,
  pattern: PropTypes.instanceOf(RegExp),
  changeToFormatType: PropTypes.oneOf(['CamelCase', 'UpperCase']),
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  subType: PropTypes.exact({
    value: PropTypes.string.isRequired,
    dropDownValues: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })),
  }),
  isNoneInDropDownList: PropTypes.bool,
};

export default withStyles(Styles)(CustomInputBox);