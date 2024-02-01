import React from 'react';
import PropTypes from 'prop-types'
import {
  FormGroup, FormLabel, FormControl, TextField
} from "@material-ui/core";

const today = new Date()
const DEFAULT_DATE =
  today.getFullYear() + '-' +
  ('0' + (today.getMonth() + 1)).slice(-2) + '-' +
  ('0' + today.getDate()).slice(-2);

class CustomDateRange extends React.Component {

  handleDatePickers = event => {
    if (this.props.onChange)
      this.props.onChange(event);
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
      disabled
    } = this.props
    return (
      <FormGroup style={{ marginTop: 2 }}>
        <FormLabel style={{ fontSize: 12 }}>{title ? title : 'Date Range'}</FormLabel>
        <FormControl style={{ marginTop: 2, flexDirection: 'row' }}>
          <TextField style={{ paddingRight: 5, width: 150 }}
            name={startDateFieldName ? startDateFieldName : "startDate"}
            label={startDateLabel ? startDateLabel : ''}
            type="date"
            value={startDateValue ? startDateValue : DEFAULT_DATE}
            InputLabelProps={{
              shrink: true
            }}
            disabled={disabled}
            onChange={this.handleDatePickers}
          />
          <TextField style={{ paddingRight: 5, width: 150 }}
            name={endDateFieldName ? endDateFieldName : "endDate"}
            label={endDateLabel ? endDateLabel : ''}
            type="date"
            value={endDateValue ? endDateValue : DEFAULT_DATE}
            InputLabelProps={{
              shrink: true
            }}
            disabled={disabled}
            onChange={this.handleDatePickers}
          />
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
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

export default CustomDateRange;