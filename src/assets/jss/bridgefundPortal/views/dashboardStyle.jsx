import { createStyles } from "@material-ui/core";
import { confirmIconButton, cancelIconButton, deleteIconButton, addIconButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";
import {tableHeadColor, tableContainer, table, tableHeadCell,tableCell, leftAndRightBorderCell} from "assets/jss/bridgefundPortal/components/tableStyle";

const dashboardStyle = theme => createStyles({

    header: {
		borderBottom: '1px solid #D0D3D9',
	},
	tabIndicator: {
		backgroundColor: '#2BC4EB',
		height: 2
	},
	tabFont: {
		color: '#000',
    textTransform: 'none',
    fontFamily: 'Roboto',
    fontSize: '14px',
    lineHeight: '16px',
	},
	selectedTabFont: {
		color: '#000',
		fontWeight: 'bold'
  },
  tabHeaderTitle: {
    lineHeight: '22px', 
    fontFamily:'Roboto', 
    fontSize: '22px',
    paddingTop: '10px'
  },
  tabHeaderTopTitle: {
    lineHeight: '22px', 
    fontFamily:'Roboto', 
    fontSize: '22px'
  },
	container: {
		paddingRight: "15px",
		paddingLeft: "15px",
		marginRight: "auto",
		marginLeft: "auto"
	},
	dashboardTopPain: {
		paddingTop: '15px'
	  },
	  smallBox: {
		width: '33%',
		paddingLeft: 10,
	  },
	  userAssignButtonWrapper: {
		float: "right", 
		paddingBottom: '5px'
	  },
	tableContainer: tableContainer,
    table: table,
    tableHeadCell: tableHeadCell,
    tableCell: tableCell,
    tableHeadColor: tableHeadColor,
    confirmIconButton: confirmIconButton,
    cancelIconButton: cancelIconButton,
    deleteIconButton: deleteIconButton,
    addIconButton: addIconButton,
	leftAndRightBorderCell: leftAndRightBorderCell,
	inputProp: {
		fontSize: '12px', 
		height: '40px',
		fontFamily: 'Source Sans Pro',
	  },
	  menuItem: {
		fontSize: '12px',
		fontFamily: 'Source Sans Pro',
	  },
	  inputLabel: {
		fontSize: '12px',
		fontFamily: 'Source Sans Pro',
	  },
	  formStyle: {
		paddingBottom: '15px'
	  },
	  checkboxStyle: {
		  transform: "scale(0.9)",
		  padding:'0px',
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

});

export default dashboardStyle;