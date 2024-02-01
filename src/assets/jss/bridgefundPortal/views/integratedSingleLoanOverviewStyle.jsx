import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, leftBorderCell, rightBorderCell, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive,
} from "assets/jss/bridgefundPortal/components/tableStyle";

const integratedSingleLoanOverviewStyle = theme => createStyles({

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
    ////////////////

    bottomPaper: {
        borderRadius: "10px",
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },
    ddPaper: {
        borderRadius: "10px",
        margin: theme.spacing(1),
        marginTop: theme.spacing(2),
        padding: theme.spacing(1),
    },
    topPaper: {
        borderRadius: "10px",
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },
    textInput: {
        padding: '10px'
    },
    boxMargin: {
        padding: theme.spacing(1),
    },
    SectionTitleStyle: {
        padding: theme.spacing(1),
        fontSize: '14px',
        fontFamily: 'Roboto',
        fontWeight: 700
    },
    borderRightCell: {
        borderRight: '1px solid rgba(224, 224, 224, 1)'
    },
    borderLeftCell: {
        borderLeft: '1px solid rgba(224, 224, 224, 1)',
    },
    tooltipTable: {
        border: '1px solid white',
        borderCollapse: 'collapse'
    },
    tooltipTableHeadCell: {
        border: '1px solid white',
        fontSize: '12pt',
        fontWeight: 'bold',
        padding: theme.spacing(1),
        textAlign: 'center'
    },
    tooltipTableBodyCell: {
        border: '1px solid white',
        fontSize: '10pt',
        padding: theme.spacing(1),
    },
    autoSuggestListStyle: {
        fontFamily: 'Source Sans Pro',
        fontSize: '12px',
        padding: 0,
        maxHeight: 300,
        overflow: 'overlay'
    },
    autoSuggestTextLabelStyle: {
        fontFamily: 'Source Sans Pro',
        fontSize: '12px !important',
    },
    autoSuggestTextStyle: {
        fontSize: '12px !important',
        height: '40px',
        fontFamily: 'Source Sans Pro',
    },
    customActionButton_Blue: {
        backgroundColor: "#24c4d8",
        borderRadius: "15px",
        height: "30px",
        padding: '6px 30px',
        margin: '10px 20px 10px 20px'
    },
    ///// fixed loan button content

    middleButtonContainer: {
        justifyContent: "space-between"
    },

    button: {
        // width: "100%",
        minWidth: "200px",
        padding: "5px 15px",
        textTransform: "uppercase",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "12pt"
    },

    leftIcon: {
        marginRight: theme.spacing(3) + "px !important"
    },
    creditLimitSecondRow: {
        marginTop: '30px'
    },

    //drop down styles
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
    inputSubProp: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "7.77px",
        weight: 400
    },
    inputLabelStyle: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "7.77px",
        weight: 400
    },
    // drop down styles

    directDebitRow_Green: {
        backgroundColor: "#27862b",
    },
    directDebitRow_Orange: {
        backgroundColor: "orange",
    },
    directDebitRow_Blue: {
        backgroundColor: "#226a94;",
    },
    transactionContainerTableStyle: {
        borderRadius: "10px",
        margin: theme.spacing(1),
        // padding: theme.spacing(1),
    },
});

export default integratedSingleLoanOverviewStyle;