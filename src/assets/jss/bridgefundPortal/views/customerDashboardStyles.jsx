import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive,
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { visibilityIconButton, confirmIconButton, cancelIconButton, deleteIconButton, addIconButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const customerDashboardStyles = theme => createStyles({

    tableHeadColor: tableHeadColor,
    visibilityIconButton: visibilityIconButton,
    tableContainer: tableContainer,
    table: table,
    tableHeadCell: tableHeadCell,
    tableCell: tableCell,
    tableResponsive: tableResponsive,
    inputContainer: {
        paddingLeft: '20px',
        paddingBottom: '20px',
        marginTop: '20px',
        borderRadius: '10px',
    },
    confirmIconButton: confirmIconButton,
    cancelIconButton: cancelIconButton,
    deleteIconButton: deleteIconButton,
    addIconButton: addIconButton,
    
    container :{
        paddingRight: "15px",
        paddingLeft: "15px",
        marginRight: "auto",
        marginLeft: "auto"
      },
    smeOverviewHeader: {
        display: 'flex',
        justifyContent: 'space-between'
      },
      flexContainer: { display: 'flex' },
      smallBox: {
        width: '33%',
        paddingLeft: 10,
        minWidth: 220,
        [theme.breakpoints.between(0, 600)]: {
          width: '100%',
          padding: 0,
        },
        [theme.breakpoints.between(600, 805)]: {
          width: '50%',
          padding: 10,
        }
      },
      doubleBox: {
        width: '25%',
        paddingLeft: 10,
        [theme.breakpoints.between(0, 600)]: {
          width: '100%',
          padding: 0,
        },
        [theme.breakpoints.between(600, 805)]: {
          width: '50%',
          padding: 10,
        }
      },
      partnerBox: {
        paddingTop: '15px',
        width: '33%',
        paddingLeft: 10,
        minWidth: 220,
        [theme.breakpoints.between(0, 600)]: {
          width: '100%',
          padding: 0,
        },
        [theme.breakpoints.between(600, 805)]: {
          width: '50%',
          padding: 10,
        }
      },
      saveChangesBtn: {
        position: 'fixed',
        bottom: theme.spacing(5),
        right: theme.spacing(2),
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
      },

      personOverviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        // paddingTop: 15,
        paddingLeft: "10px",
        paddingBottom:'10px'
      },
      addressHeader: {
        display: 'flex',
        // paddingTop: 15,
        paddingBottom:'10px'
      },
      address: {
        float: 'left',
        width: '33%',
        paddingLeft: "10px"
      },
      contact: {
        float: 'left',
        width: '33%'
      },
      isUpdating: {
        fontFamily: 'Roboto',
        fontSize: '16px',
        fontStyle: 'italic',
        color: "rgba(0, 0, 0, 0.38)",
      },

      margin_5: {
        paddingRight: '20px',
        paddingBottom: '20px',
        width: '25%',
        [theme.breakpoints.between(0, 600)]: {
          width: '100%',
          padding: 0,
        },
        [theme.breakpoints.between(600, 805)]: {
          width: '50%',
          padding: 10,
        }
      },
      textFieldStyle: {
        fontFamily: 'Roboto',
        fontSize: '19px'
      },
      actionButtons: {
        float: 'left',
        padding: '0 5px',
      },
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
      formHeader: {
        width: '100%'
      },
      memoButtonWrapper: {
        float: "right"
      },
      TwoBox: {
        width: '50%',
        paddingBottom: '10px'
      },
      tableActionButton: {
        width: "27px",
        height: "27px",
        padding: "0"
      },
      tableActionButtonIcon: {
        width: "22px",
        height: "22px"
      },
      autoSuggestListStyle: {
        fontFamily: 'Source Sans Pro',
        fontSize: '12px',
        padding: 0,
        maxHeight: 200,
        overflow: 'overlay'
    },
    autoSuggestTextLabelStyle: {
        fontFamily: 'Source Sans Pro',
        fontSize: '12px',
    },
    autoSuggestTextStyle: {
        fontSize: '12px',
        height: '40px',
        fontFamily: 'Source Sans Pro',
    },
  
});

export default customerDashboardStyles;