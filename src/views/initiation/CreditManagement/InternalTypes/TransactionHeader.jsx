import React from 'react';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import { TableCell, TableHead, TableRow, TableSortLabel } from '@material-ui/core';

function TransactionHeader({ ...props }) {

    const { valueToOrderBy, orderDirection, handleRequestSort, classes } = props;

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    return (
        <TableHead >
            <TableRow>

                <TableCell className={classes.transactionTableCell} key="transaction_date">
                    <TableSortLabel
                        active={valueToOrderBy === "transaction_date"}
                        direction={valueToOrderBy === "transaction_date" ? orderDirection : "asc"}
                        onClick={createSortHandler("transaction_date")}
                    >
                        TRANS. DATE
                </TableSortLabel>
                </TableCell>

                <TableCell className={classes.transactionTableCell} align="right" key="amount" >
                    <TableSortLabel
                        active={valueToOrderBy === "amount"}
                        direction={valueToOrderBy === "amount" ? orderDirection : "asc"}
                        onClick={createSortHandler("amount")}
                    >
                        AMOUNT
                </TableSortLabel>
                </TableCell>

                <TableCell className={classes.transactionTableCell} key="counterparty_name" align="center" >
                    <TableSortLabel
                        active={valueToOrderBy === "counterparty_name"}
                        direction={valueToOrderBy === "counterparty_name" ? orderDirection : "asc"}
                        onClick={createSortHandler("counterparty_name")}
                    >
                        COUNTERPARTY
                </TableSortLabel>
                </TableCell>

                <TableCell className={classes.transactionTableCell} style={{maxWidth:'50px'}} key="description" align="left">
                    DESCRIPTION
                </TableCell>

            </TableRow>
        </TableHead>
    );
}

TransactionHeader.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TransactionHeader);