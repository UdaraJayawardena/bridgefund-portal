import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, leftBorderCell, rightBorderCell, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive, selectedRow
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { addIconButton, cancelIconButton, defaultButton } from "../components/ButtonStyle";

const crmChartsStyles = theme => createStyles({
    container: {
        //marginLeft: theme.spacing(2),
        paddingRight: "15px",
        paddingLeft: "15px",
        marginRight: "auto",
        marginLeft: "auto"
    },
    inputBoxStyle: {
        fontSize: '12px ',
        fontFamily: 'Source Sans Pro',
        lineHeight: "15.08px",
        weight: 400
        // height: '40px'
    },
    inputContainer: {
        paddingLeft: 10,
        paddingBottom: '20px',
        // marginTop: '20px',
        borderRadius: '10px',
    },
    smallBox: {
        paddingRight: 10,
        width: '20%'
    },
    chartContainer: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        overflow: 'auto',
        borderRadius: '10px',
    },
    chartTitle: {
        marginLeft: theme.spacing(2),
    },
    chartRangeButton: {
        marginLeft: theme.spacing(3),
        width: theme.spacing(10)
    },

    transactionContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        overflow: 'overlay'
    },
    popUpContainer: {
        margin: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
    },
    leftBorderCell: leftBorderCell,
    rightBorderCell: { borderRight: '1px solid rgba(224, 224, 224, 1)', },
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
    tableContainer: { ...tableContainer, marginTop: theme.spacing(4), overflow: 'hidden', marginBottom: theme.spacing(4) },
    table: table,
    tableHeadCell: tableHeadCell,
    tableCell: tableCell,
    tableResponsive: tableResponsive,
    transactionContainerTitle: {
        fontFamily: 'Roboto',
        fontSize: '18px',
        padding: '5px'
    },
    selectedRow: selectedRow,
    menuSelectStyles: {
        fontSize: '12px',
        fontFamily: 'Roboto',
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
    autoSuggestTextLabelStyle: {
        fontFamily: 'Source Sans Pro',
        fontSize: '12px',
        // marginLeft: '5px',
        lineHeight: "7.77px",
        weight: 400
    },
    autoSuggestTextStyle: {
        fontSize: '12px',
        height: '40px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "15.08px",
        weight: 400
    },

    currencyInputBox: {
        fontSize: '12px',
        height: '0px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "15.08px",
        weight: 400
    },
    currencyLabel: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
        lineHeight: "7.77px",
        weight: 400
    },
    flexContainer: { display: 'flex' },
    itemStyles: {
        marginTop: '20px'
    },
    addIconButton: {
        ...addIconButton,
        // marginTop: '25px',
        textTransform: 'none'
    },
    defaultIconButton: {
        ...defaultButton,
        // marginTop: '25px',
        textTransform: 'none',
    },
    menuItem: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro',
    },
    tabHeaderLabel: {
        position: 'relative',
        float: 'left',
        paddingBottom: 0,
        paddingTop: '10px',
        fontSize: '20px',
        fontWeight:'bold',
        fontFamily: 'Roboto',
        weight: 400
    },
    tabsFormat:{
        float: 'right'
    },
    tabIndicator: {
		backgroundColor: '#2bc4eb',
		height: 3
	},
});

export default crmChartsStyles;