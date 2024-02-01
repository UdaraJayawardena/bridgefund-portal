import React from 'react';
import PropTypes from 'prop-types'
import {
  FormGroup, FormLabel, FormControl
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

const today = new Date()
const DEFAULT_DATE =
  today.getFullYear() + '-' +
  ('0' + (today.getMonth() + 1)).slice(-2) + '-' +
  ('0' + today.getDate()).slice(-2);

class CustomDateRange extends React.Component {

  handleDatePickers = (date, name) => {
    if (this.props.onChange)
      this.props.onChange({ target: { value: date, name: name } });
  }

  render() {
    const {
      title,
      startDateFieldName,
      endDateFieldName,
      startDateLabel,
      endDateLabel,
      startDateValue,
      endDateValue,
    } = this.props
    return (
      <FormGroup style={{ marginTop: 2 }}>
        <FormLabel style={{ fontSize: 12 }}>{title ? title : 'Date Range'}</FormLabel>
        <FormControl style={{ marginTop: 2, flexDirection: 'row' }}>
          <MuiPickersUtilsProvider utils={MomentUtils}  >
            <KeyboardDatePicker style={{ paddingRight: 5, width: 150 }}
              disableToolbar
              name={startDateFieldName ? startDateFieldName : "startDate"}
              autoOk
              variant="inline"
              label={startDateLabel ? startDateLabel : ''}
              format="DD-MM-YYYY"
              value={startDateValue ? startDateValue : DEFAULT_DATE}
              InputAdornmentProps={{ position: "start" }}
              onChange={date => this.handleDatePickers(date, startDateFieldName ? startDateFieldName : "startDate")}
            />
          </MuiPickersUtilsProvider>
          <MuiPickersUtilsProvider utils={MomentUtils} >
            <KeyboardDatePicker
              style={{ paddingRight: 5, width: 150 }}
              disableToolbar
              name={endDateFieldName ? endDateFieldName : "endDate"}
              autoOk
              variant="inline"
              label={endDateLabel ? endDateLabel : ''}
              format="DD-MM-YYYY"
              value={endDateValue ? endDateValue : DEFAULT_DATE}
              InputAdornmentProps={{ position: "start" }}
              onChange={date => this.handleDatePickers(date, endDateFieldName ? endDateFieldName : "endDate")}
            />
          </MuiPickersUtilsProvider>
        </FormControl>
      </FormGroup>
    )
  }
}

CustomDateRange.propTypes = {
  title: PropTypes.string,
  startDateFieldName: PropTypes.string,
  endDateFieldName: PropTypes.string,
  startDateLabel: PropTypes.string,
  endDateLabel: PropTypes.string,
  startDateValue: PropTypes.string,
  endDateValue: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default CustomDateRange;