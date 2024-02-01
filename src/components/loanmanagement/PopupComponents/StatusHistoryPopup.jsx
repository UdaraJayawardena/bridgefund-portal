import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types'
import { createStyles } from '@material-ui/core';
import withStyles from "@material-ui/core/styles/withStyles";

const Styles = createStyles({
  toolTipTable: {
    border: '1px solid white',
    borderCollapse: 'collapse'
  },
  toolTipHead: {
    border: '1px solid white',
    fontSize: '12pt',
    fontWeight: 'bold',
    padding: 3,
    textAlign: 'center'

  },
  toolTipCell: {
    border: '1px solid white',
    fontSize: '10pt',
    padding: 3,
  },
});

const StatusHistoryPopup = ({ classes, statusHistory }) => {

  return (
    <React.Fragment>
      <table className={classes.toolTipTable}>
        <thead>
          <tr>
            <th className={classes.toolTipHead}>Planned Date</th>
            <th className={classes.toolTipHead}>Status</th>
            <th className={classes.toolTipHead}>Reason</th>
            <th className={classes.toolTipHead}>Statement</th>
          </tr>
        </thead>
        <tbody>
          {statusHistory.map((history, i) =>
            <tr key={i}>
              <td className={classes.toolTipCell}>{moment(history.createdAt).format('DD-MM-YYYY')}</td>
              <td className={classes.toolTipCell}>{history.status}</td>
              <td className={classes.toolTipCell}>{history.reason}</td>
              <td className={classes.toolTipCell}>{history.statement}</td>
            </tr>
          )}
        </tbody>
      </table>
    </React.Fragment>
  );
}

StatusHistoryPopup.defaultProps = {
  statusHistory: []
}

StatusHistoryPopup.propTypes = {
  classes: PropTypes.object.isRequired,
  statusHistory: PropTypes.array.isRequired,
};

export default (withStyles(Styles)(StatusHistoryPopup));