import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  DialogTitle, DialogContent, DialogActions, Popover,
  Table, TableRow, TableCell,
} from "@material-ui/core";


function DirectDebitStatusHover(props) {
  const { open, statusHistory, ...other } = props;

  return (
    <Popover
      id="mouse-over-popover"
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">Action</DialogTitle>
      <DialogContent >
        <Table>
          {statusHistory.map((dd, key) => (
            <TableRow key={key}>
              <TableCell >{moment().format('YYYY-MM-DD')}</TableCell>
              <TableCell >{'XXXXXXXXXXXXXXX'}</TableCell>
              <TableCell >{'###############'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </DialogContent>
      <DialogActions>
      </DialogActions>
    </Popover>
  );
}

DirectDebitStatusHover.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.string,
  classes: PropTypes.object,
  statusHistory: PropTypes.array,
  onClose: PropTypes.func,
};

export default DirectDebitStatusHover;