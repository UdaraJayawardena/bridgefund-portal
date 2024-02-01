import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, tableContainer, table, tableHeadCell,
    tableCell, tableResponsive,
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { visibilityIconButton, confirmIconButton, cancelIconButton, deleteIconButton, addIconButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const MandateOverviewStyles = theme => createStyles({

    tableHeadColor: tableHeadColor,
    visibilityIconButton: visibilityIconButton,
    tableContainer: tableContainer,
    table: table,
    tableHeadCell: tableHeadCell,
    tableCell: tableCell,
    tableResponsive: tableResponsive,
    
    confirmIconButton: confirmIconButton,
    cancelIconButton: cancelIconButton,
    deleteIconButton: deleteIconButton,
    addIconButton: addIconButton,

       

    darkBlueButtonSM: {
      width:'50px',
      size:'small',
      height:'20px',
      backgroundColor: '#13294B'
    },

    darkBlueButtonMD: {
      width:'100px',
      size:'small',
      height:'20px',
      backgroundColor: '#13294B'
    },

    darkBlueButtonLG: {
      width:'150px',
      size:'small',
      height:'20px',
      backgroundColor: '#13294B'
    },

    purpleButtonSM: { 
      width:'50px',
      size:'small',
      height:'20px',
      backgroundColor: '#8a69d4'
    },
    purpleButtonMD: { 
      width:'100px',
      size:'small',
      height:'20px',
      backgroundColor: '#8a69d4'
    },
    purpleButtonLG: { 
      width:'150px',
      size:'small',
      height:'20px',
      backgroundColor: '#8a69d4'
    },

    greenButtonSM: { 
      width:'50px',
      size:'small',
      height:'20px', 
      backgroundColor: '#00B388'   
    },
       
    greenButtonMD: { 
      width:'100px',
      size:'small',
      height:'20px', 
      backgroundColor: '#00B388'   
    },    

    greenButtonLG: { 
      width:'150px',
      size:'small',
      height:'20px', 
      backgroundColor: '#00B388'   
    },    
    

    tableHeaderCell: {
      backgroundColor: '#D3D3D3',
      //backgroundColor: '#ffebcf',
      position: "sticky",
      top: 0,
      padding: "0px 2px 0px 2px",
      margin: 0,
      textAlign: "start",
      fontWeight: "bold"
    },
    tableHeaderCellRightAlign: {
      backgroundColor: '#D3D3D3',
      //backgroundColor: '#ffebcf',
      position: "sticky",
      top: 0,
      padding: "0px 2px 0px 2px",
      margin: 0,
      fontWeight: "bold",
      textAlign: 'right',
    },

    tableBodyCell:{      
      height: '30px', 
      padding: '0px 2px 0px 2px',
      textAlign: 'left',
      backgroundColor: '#F1F1F1',
      //backgroundColor: '#ffebcf',
    },
    tableBodyCellRightAlign:{      
      height: '30px', 
      padding: '0px 2px 0px 2px',
      textAlign: 'right',
      backgroundColor: '#F1F1F1',
      //backgroundColor: '#ffebcf',
    },
    signingGuarantee: {
      width: 'calc(50% - 2px)',
      paddingLeft: 10,
      minWidth: 50,
    },
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
    itemStyles: {
      marginTop: '0px'
    },
    autoSuggestListStyle: {
      fontFamily: 'Source Sans Pro',
      fontSize: '12px',
      padding: 0,
      maxHeight: 200,
      overflow: 'overlay'
    },
    alginCenter: {textAlign: 'center'},

            
});

export default MandateOverviewStyles;