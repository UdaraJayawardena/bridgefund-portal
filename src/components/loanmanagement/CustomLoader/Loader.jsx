import React from 'react';
import PropTypes from 'prop-types'
import { Dialog, DialogContent, CircularProgress } from '@material-ui/core';

const Loader = ({ open }) => {

  return (
    <Dialog open={open}><DialogContent><CircularProgress /></DialogContent></Dialog>
  );
}

Loader.defaultProps = {
  open: false
}

Loader.propTypes = {
  open: PropTypes.bool.isRequired
};

export default (Loader);