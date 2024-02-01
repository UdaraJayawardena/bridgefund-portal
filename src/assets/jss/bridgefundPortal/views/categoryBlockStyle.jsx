import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, leftBorderCell, rightBorderCell, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive, selectedRow,
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { confirmIconButton, cancelIconButton, visibilityIconButton, addIconButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const categoryBlockStyle = theme => createStyles({

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
    confirmIconButton: confirmIconButton,
    cancelIconButton: cancelIconButton,

    formControl: {
        margin: '0'
    },

    ruleTable: {
        marginTop: '30px'
    },
    ruleTableConditionalCell: {
        fontStyle: 'italic',
        fontFamily: 'Roboto',
        fontSize: '12px',
        //borderRight: '1px solid rgba(224, 224, 224, 1)' 
    },
    visibilityIconButton: visibilityIconButton,
    tableContainer: tableContainer,

    transactionTableRow: {
        "&:hover": {
            backgroundColor: "#F3F4F7 !important"
        }
    },

    table: table,
    tableHeadCell: tableHeadCell,
    tableCell: tableCell,
    tableResponsive: tableResponsive,
    transactionContainerTitle: {
        fontFamily: 'Roboto',
        fontSize: '18px',
        padding: '5px'
    },
    selectedRow: { ...selectedRow, cursor: 'pointer' },
    menuSelectStyles: {
        fontSize: '12px',
        fontFamily: 'Roboto',
    },
    rulePopupCell: {
        paddingRight: "10px",
        paddingLeft: "10px",
        paddingTop: "0px",
        paddingBottom: "0px",
        verticalAlign: "middle",
        fontFamily: 'Roboto',
        fontSize: '12px',
    },
    rulePopupRightBorderCell: {
        borderRight: '1px solid rgba(224, 224, 224, 1)',
        paddingRight: "10px",
        paddingLeft: "10px",
        paddingTop: "0px",
        paddingBottom: "0px",
        verticalAlign: "middle",
        fontFamily: 'Roboto',
        fontSize: '12px',
    },
    parameterClickableRow: { cursor: 'pointer' },
    transactionTableBody: { wordBreak: 'break-all' },
    switchStyle: {
        width: 50,
        height: 20,
        padding: 0,
        '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 1,
            transitionDuration: '300ms',
            '&.Mui-checked': {
                transform: 'translateX(30px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
                    opacity: 1,
                    border: 0,
                },
                '&.Mui-disabled + .MuiSwitch-track': {
                    opacity: 0.5,
                },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
                color: '#33cf4d',
                border: '6px solid #fff',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
                color:
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[600],
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
            },
        },
        '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 18,
            height: 18,
        },
        '& .MuiSwitch-track': {
            borderRadius: 22 / 2,
            backgroundColor: theme.palette.mode === 'light' ? '#65C466' : '#65C466',
            opacity: 1,
            transition: theme.transitions.create(['background-color'], {
                duration: 500,
            }),
        }
    },
    checkCategoriesBtn: {
        position: 'fixed',
        bottom: theme.spacing(15),
        right: theme.spacing(5),
        zIndex: 10,
        borderRadius: '51.5px',
        width: '200px',
        height: '30px',
        fontFamily: 'Roboto',
        fontSize: '12px',
        lineHeight: '14px',
        margin: '10px',
        color: "#FFFFFF",
        backgroundColor: '#2BC4EB',
        textTransform: 'none'
    },
    defaultRowStyle: {
        cursor: 'pointer',
        "&:hover,&:focus": {
            backgroundColor: "#F3F4F7"
        }
    },
    defaultRowStyleForLevelThree: {
        // cursor: 'pointer',
        "&:hover,&:focus": {
            backgroundColor: "#F3F4F7"
        }
    },
    selectedRowStyleForLevelThree: selectedRow,
    confirmButton: {
        ...addIconButton,
        margin: '5px',
    },
    tabIndicator: {
		backgroundColor: '#2bc4eb',
		height: 3
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
});

export default categoryBlockStyle;