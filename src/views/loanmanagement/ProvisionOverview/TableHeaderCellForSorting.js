import React, { Component } from "react";

import { TableCell } from "@material-ui/core";
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';


class TableHeaderCellForSorting extends Component {

  render() {

    const {
      sorting,
      sortingHandler,
      provisionType,
      column,
      classes,
      children,
      align
    } = this.props;

    return (
        <TableCell align={ align ? align : 'right' } className={classes.head}
                   sortDirection={
                     sorting.orderBy === column ? sorting.order : false
                   }
        >
          <Tooltip
              title="Sort"
              placement="bottom-end"
              enterDelay={300}
          >
            <TableSortLabel
                active={ sorting.orderBy === column }
                direction={ sorting.order }
                onClick={ () => sortingHandler( provisionType, column ) }
            >

              { children }
            </TableSortLabel>
          </Tooltip>
        </TableCell>
    );

  }

}

export default TableHeaderCellForSorting;