import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// Externals
import PropTypes from 'prop-types';

// Material helpers
import { withStyles } from '@material-ui/core';

// Material components
import {
  IconButton,
  CircularProgress,
  Grid,
  Typography
} from '@material-ui/core';

// Material icons
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon
} from '@material-ui/icons';

// Shared layouts
// import { Dashboard as DashboardLayout } from 'layouts';

// Shared services
// import { getProducts } from 'lib/product';
import { getSettings } from 'lib/loanmanagement/setting';

// Custom components
import { ProductsToolbar, ProductCard } from './components';

// Component styles
import styles from './styles';

class Settings extends Component {
  signal = true;

  state = {
    isLoading: false,
    limit: 3,
    settings: [],
    settingsTotal: 0,
    error: null
  };

  async getSettings(limit) {
    try {
      this.setState({ isLoading: true });

      const { settings, settingsTotal } = await getSettings(limit);

      if (this.signal) {
        this.setState({
          isLoading: false,
          settings,
          settingsTotal,
          limit
        });
      }
    } catch (error) {
      if (this.signal) {
        this.setState({
          isLoading: false,
          error
        });
      }
    }
  }

  componentDidMount() {
    this.signal = true;

    const { limit } = this.state;

    this.getSettings(limit);
  }

  componentWillUnmount() {
    this.signal = false;
  }

  renderProducts() {
    const { classes } = this.props;
    const { isLoading, settings } = this.state;

    if (isLoading) {
      return (
        <div className={classes.progressWrapper}>
          <CircularProgress />
        </div>
      );
    }

    if (settings.length === 0) {
      return (
        <Typography variant="h6">There are no settings available</Typography>
      );
    }

    return (
      <Grid
        container
        spacing={8}
      >
        {settings.map(setting => (
          <Grid
            item
            key={setting.id}
            lg={4}
            md={6}
            xs={12}
          >
            <Link to={setting.routeUrl}>
              <ProductCard setting={setting} />
            </Link>
          </Grid>
        ))}
      </Grid>
    );
  }

  render() {
    const { classes } = this.props;
    const { limit,
      // settings, 
      settingsTotal } = this.state

    return (
      <div className={classes.root}>
        <ProductsToolbar />
        <div className={classes.content}>{this.renderProducts()}</div>
        <div className={classes.pagination}>
          {/* <Typography variant="caption">1-6 of 20</Typography> */}
          <Typography variant="caption">1-{limit} of {settingsTotal}</Typography>
          <IconButton>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton>
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Settings);
