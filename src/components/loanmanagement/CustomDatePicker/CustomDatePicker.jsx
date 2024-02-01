import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types'
import classnames from "classnames";
import { connect } from 'react-redux';
import DateFnsUtils from "@date-io/date-fns";
import { IconButton, createStyles } from '@material-ui/core';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import withStyles from "@material-ui/core/styles/withStyles";
import { displayNotification } from "store/loanmanagement/actions/Notifier";
import { getNextWorkingDate, getPreviousWorkingDate } from 'store/loanmanagement/actions/Holidays';

const Styles = createStyles({
  datePickerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    width: 235,
    minWidth: 235
  }
});

const CustomDatePicker = ({
  value, displayFormat, onChange, name, label, datePickerContainerStyle, classes, hideSideButtons,
  checkHoliday, getNextWorkingDay, getPreviousWorkingDay, displayNotification, readOnly
}) => {
  const containerStyle = classnames({
    [classes.datePickerContainer]: datePickerContainerStyle === undefined,
    [datePickerContainerStyle]: datePickerContainerStyle !== undefined
  })

  const handleHoliday = (name, selectedDate, direction) => {
    let finalResult = null;

    if (selectedDate === null) return onChange(name, finalResult);
    if (!moment(selectedDate).isValid()) return;
    if (checkHoliday === false && direction === 'next') finalResult = moment(selectedDate).add(1, 'd');
    else if (checkHoliday === false && direction === 'selected') finalResult = selectedDate;
    else if (checkHoliday === false && direction === 'previous') finalResult = moment(selectedDate).subtract(1, 'd');
    else if (checkHoliday === false) return onChange(name, finalResult);

    let getWorkingDate = null;
    if (direction === 'selected') {
      getWorkingDate = getNextWorkingDay(moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'), 1)
    }
    else if (direction === 'next') {
      getWorkingDate = getNextWorkingDay(moment(selectedDate).format('YYYY-MM-DD'), 1)
    }
    else {
      getWorkingDate = getPreviousWorkingDay(moment(selectedDate).format('YYYY-MM-DD'), 1)
    }

    getWorkingDate
      .then(result => {
        finalResult = result;
      })
      .catch(() => {
        displayNotification('Error in holiday checking, Cannot select the date', 'error');
      })
      .finally(() => {
        return onChange(name, finalResult);
      })
  };

  return (
    <div className={containerStyle}>
      {!hideSideButtons && <IconButton
        onClick={() => handleHoliday(name, value, 'previous')}>
        <ArrowLeft></ArrowLeft>
      </IconButton>}
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format={displayFormat}
          margin="normal"
          autoOk={true}
          id={name}
          label={label}
          value={value}
          readOnly={readOnly}
          disabled={readOnly}
          onChange={(selectedDate) => handleHoliday(name, selectedDate, 'selected')}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </MuiPickersUtilsProvider>
      {!hideSideButtons && <IconButton onClick={() => handleHoliday(name, value, 'next')}>
        <ArrowRight></ArrowRight>
      </IconButton>}
    </div>
  );
}

CustomDatePicker.defaultProps = {
  displayFormat: 'dd-MM-yyyy',
  label: 'Select date',
  hideSideButtons: false,
  checkHoliday: false,
  onChange: () => { },
  readOnly: false
}

CustomDatePicker.propTypes = {
  displayFormat: PropTypes.string,
  readOnly: PropTypes.bool,
  checkHoliday: PropTypes.bool,
  hideSideButtons: PropTypes.bool,
  value: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  datePickerContainerStyle: PropTypes.string,
  onChange: PropTypes.func,
  getNextWorkingDay: PropTypes.func.isRequired,
  getPreviousWorkingDay: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  classes: PropTypes.object,
  className: PropTypes.object,
};

const mapDispatchToProps = (dispatch) => ({
  getNextWorkingDay: (startDate, noOfDaysAhead) => dispatch(getNextWorkingDate(startDate, noOfDaysAhead)),
  getPreviousWorkingDay: (startDate, noOfDaysAhead) => dispatch(getPreviousWorkingDate(startDate, noOfDaysAhead)),
  displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
});

export default connect(null, mapDispatchToProps)(withStyles(Styles)(CustomDatePicker));