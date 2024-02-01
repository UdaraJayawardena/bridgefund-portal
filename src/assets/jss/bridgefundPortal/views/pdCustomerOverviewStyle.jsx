import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, leftBorderCell, rightBorderCell, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive, selectedRow
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { showErrorLogButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const pdCustomerOverveiwStyle = theme => createStyles({

    leftBorderCell: leftBorderCell,
    rightBorderCell: rightBorderCell,
    leftAndRightBorderCell: {
        borderRight: '1px solid rgba(224, 224, 224, 1)',
        borderLeft: '1px solid rgba(224, 224, 224, 1)',
    },
    transactionTableCell: {
        fontSize: "10px",
        height: 10,
        minHeight: 5,
        borderBottom: "none",
        padding: '0px'
    },
    tableHeadColor: tableHeadColor,
    tableContainer: tableContainer,
    table: table,
    tableHeadCell: tableHeadCell,
    tableCell: tableCell,
    tableResponsive: tableResponsive,

    selectedRow: { ...selectedRow, cursor: 'pointer' },

    clickableRow: {
        cursor: 'pointer',
        "&:hover": {
            backgroundColor: "#F3F4F7"
        }
    },

    showErrorLogButton: showErrorLogButton,

    taskCount: { textTransform: 'none', marginTop: '15px' },

    formControl: {
        // marginTop: theme.spacing(3),
        // marginRight: theme.spacing(3),
        // minWidth: 320,
    },
    searchBox: {
        // marginTop: theme.spacing(3),
        // marginRight: theme.spacing(3),
        // minWidth: 320,
        width: '100%'
    },
    container: {
        // marginLeft: theme.spacing(2),
        // marginBottom: theme.spacing(3),
        paddingRight: "15px",
        paddingLeft: "15px",
        marginRight: "auto",
        marginLeft: "auto"
    },
    smallBox: {
        // paddingLeft: '0px',
        // paddingRight: '20px',
        // width: '20%',
        paddingRight: '20px',
        width: '25%',
        paddingTop: '20px'
    },
    flexContainer: { display: 'flex' },
    inputProp: {
        fontSize: '12px',
        height: '40px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "15.08px",
        weight: 400
    },
    menuItem: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
    },
    inputLabel: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "7.77px",
        weight: 400
    },
    autoSuggestListStyle: {
        fontFamily: 'Source Sans Pro',
        fontSize: '12px',
        padding: 0,
        lineHeight: "15.08px",
        weight: 400,
        maxHeight: 200,
        overflow: 'auto'
    },
});

export default pdCustomerOverveiwStyle;