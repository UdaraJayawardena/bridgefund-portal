import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import { createStyles, LinearProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import LogoBridgeFund from 'assets/icons/logo-BF.svg';


const Styles = createStyles({
  root: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundImage: 'linear-gradient(to right top,#051937,#00466e,#00799b,#00afb7,#02e5be)'
  },
  imgBackground: {
    width: '500px',
    height: '100px',
  },
  leftProgressBar: {
    transform: 'rotateZ(-90deg)',
    position: 'absolute',
    marginLeft: 0,
    left: -106,
    width: 209,
    top: 102,
  },
  rightProgressBar: {
    transform: 'rotateZ(90deg)',
    position: 'absolute',
    marginLeft: 0,
    right: -106,
    width: 209,
    top: 102,
  },
  bottomProgressBar: {
    transform: 'rotateZ(180deg)',
  },
  message: {
    fontSize: '29pt',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 600,
  }
});

class ComingSoon extends React.Component {

  render () {

    const { classes } = this.props;

    return (
      <div>
        <div className={classes.root}>
          <LinearProgress className={classes.leftProgressBar} />
          <LinearProgress />
          <p className={classes.message}>Coming Soon...</p>
          <div className={classes.imgBackground}>
            <img width={500} height={70} src={LogoBridgeFund} />
          </div>
          <LinearProgress className={classes.rightProgressBar} />
          <LinearProgress className={classes.bottomProgressBar} />
        </div>
      </div>);
  }
}

ComingSoon.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(Styles)(ComingSoon);