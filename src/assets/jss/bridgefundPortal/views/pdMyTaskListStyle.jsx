import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, leftBorderCell, rightBorderCell, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive, selectedRow
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { showErrorLogButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const pdMyTaskListStyle = theme => createStyles({

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

    taskCount: { textTransform: 'none', marginTop: '15px' },

    formControl: {
        // marginTop: theme.spacing(3),
        // marginRight: theme.spacing(3),
        // minWidth: 320,
        width: '100%',
        marginTop: '10px'
    },
    searchBox: {
        marginRight: theme.spacing(3),
        minWidth: 320,
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
        width: '33%',
        paddingRight: '10px'
    },
    flexContainer: { display: 'flex' },
    inputProp: {
        fontSize: '12px', 
        height: '40px',
        fontFamily: 'Source Sans Pro',
      },
      menuItem: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "15.08px",
        weight: 400
      },
      inputLabel: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "7.77px",
        weight: 400
      },
      tabNavigationLink: {
        cursor: 'pointer'
      }
});

export default pdMyTaskListStyle;