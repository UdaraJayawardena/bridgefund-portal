import React, { Component } from 'react';

// Externals
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Material helpers
import { withStyles } from '@material-ui/core';

// Material components
import { Typography, Divider } from '@material-ui/core';

import Tooltip from "@material-ui/core/Tooltip";


// Material icons
import Icon from '@material-ui/core/Icon';
import {
  AccessTime as AccessTimeIcon,
  // GetApp as GetAppIcon,
  Info as InfoIcon
} from '@material-ui/icons';

// Shared components
// import { Paper } from 'components';
import Paper from '../Paper';

// Component styles
import styles from './styles';

class ProductCard extends Component {
  render() {
    const { classes, className, setting } = this.props;

    const rootClassName = classNames(classes.root, className);
    console.log('setting :: ', setting)
    return (
      <Paper className={rootClassName}>
        <div className={classes.imageWrapper}>
          {/* <img
            alt="Setting"
            className={classes.image}
            src={setting.imageUrl}
          /> */}
          <Icon alt="Setting" color="primary" fontSize="large">{setting.materialIcon}</Icon>
        </div>
        <div className={classes.details}>
          <Typography
            className={classes.title}
            variant="h4"
          >
            {setting.title}
          </Typography>
          <Tooltip
            id="setting-tooltip"
            title={<div>
              <p>
                {setting.description}
              </p>
            </div>}
            placement="top"
            // classes={{ tooltip: classes.tooltip }}
            className={classes.description}
          >
            <Typography
              className={classes.description}
              variant="body1"
            >
              {setting.description}
            </Typography>
          </Tooltip>
        </div>
        <Divider />
        <div className={classes.stats}>
          <AccessTimeIcon className={classes.updateIcon} />
          <Typography
            className={classes.updateText}
            variant="body2"
          >
            Updated 2hr ago
          </Typography>
          {/* <GetAppIcon className={classes.downloadsIcon} /> */}
          <InfoIcon className={classes.downloadsIcon} />
          <Typography
            className={classes.downloadsText}
            variant="body2"
          >
            {setting.totalDownloads} Info
          </Typography>
        </div>
      </Paper>
    );
  }
}

ProductCard.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  setting: PropTypes.object.isRequired
};

export default withStyles(styles)(ProductCard);
