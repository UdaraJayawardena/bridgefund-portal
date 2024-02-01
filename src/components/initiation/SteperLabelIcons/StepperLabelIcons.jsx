
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AdjustIcon from '@material-ui/icons/Adjust';
import ErrorIcon from '@material-ui/icons/Error';

const StepperLabelIconsStyles = makeStyles({
  root: {
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 30,
    height: 30,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  },
  completed: {
    backgroundImage:
      'linear-gradient( 136deg, rgb(44 196 235) 0%, rgb(23 129 156) 50%, rgb(8 48 58) 100%)',
  },
  active: {
    backgroundImage:
      'linear-gradient( 136deg, rgb(11 199 194) 0%, rgb(17 206 179) 50%, rgb(34 226 135) 100%)',
  },
});

const StepperLabelIcons = (props) => {
  const classes = StepperLabelIconsStyles();
  // eslint-disable-next-line no-unused-vars
  const { active, completed } = props;

  const icons = {
    'startEvent': <PlayCircleFilledWhiteIcon />,
    'serviceTask': <SettingsIcon />,
    'callActivity': <AccountTreeIcon />,
    'userTask': <AccountCircleIcon />,
    'endEvent': <AdjustIcon />,
    'terminateEndEvent': <ErrorIcon />,
    'errorEndEvent': <ErrorIcon />,
  };
  
  const styleClasses = `${classes.root} ${classes[props.status]}`;

  return (
    <div className={styleClasses} >
      {icons[String(props.type)]}
    </div>
  );
};

StepperLabelIcons.propTypes = {
  /**
   * Whether this step is active.
   */
  active: PropTypes.bool,
  /**
   * Mark the step as completed. Is passed to child components.
   */
  completed: PropTypes.bool,
  /**
   * The label displayed in the step icon.
   */
  icon: PropTypes.node,
  /**
   * for icon type.
   */
  type: PropTypes.string,
  /**
   * for icon color.
   */
  status: PropTypes.string,
};

export default StepperLabelIcons;