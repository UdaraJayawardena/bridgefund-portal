import {
  successColor,
  whiteColor,
  grayColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.jsx";
import { createStyles } from "@material-ui/core/styles";
import { tableHeadColor, table, tableHeadCell, tableCell, tableResponsive } from "assets/jss/bridgefundPortal/components/tableStyle";
import { confirmIconButton, cancelIconButton, deleteIconButton, addIconButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const dashboardStyle = createStyles({
  successText: {
    color: successColor[0]
  },
  upArrowCardCategory: {
    width: "16px",
    height: "16px"
  },
  stats: {
    color: grayColor[0],
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "22px",
    "& svg": {
      top: "4px",
      width: "16px",
      height: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    }
  },
  cardCategory: {
    color: grayColor[0],
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0"
  },
  cardCategoryWhite: {
    color: "rgba(" + hexToRgb(whiteColor) + ",.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitle: {
    color: grayColor[2],
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: 300,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  cardTitleWhite: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
    // @ts-ignore
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  avatar: {
    backgroundColor: whiteColor,
    color: grayColor[1],
    height: 56,
    width: 56
  },
  tableRightBorder: {
    borderWidth: 0,
    borderRightWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  // tableWrapper: {
  //   display: 'flex'
  // },
  // leftpane: {
  //   width: '20%',
  //   height: '100%',
  //   float: 'left',
  //   textAlign: 'center'
  // },
  // rightpane: {
  //   width: '78%',
  //   height: '100%',
  //   float: 'left',
  //   textAlign: 'center',
  //   paddingLeft: '20px'
  // },
  // tableRow: {
  //   "&$selected, &$selected:hover": {
  //     backgroundColor: "purple"
  //   }
  // },
  // tableCell: {
  //   "$selected &": {
  //     color: grayColor[0]
  //   }
  // },
  // hover: {},
  // selected: {},
  // blueIconButton: {
  //   color: "#fff",
  //   backgroundColor: 'blue',
  //   borderRadius: 0,
  // },
  // errorIconButton: {
  //   color: "#fff",
  //   backgroundColor: 'red',
  //   borderRadius: 0,
  // },
  // canselButtonWrappers: {
  //   textAlign: 'right'
  // },

  // Tables
  tableHeaders: {
    display: 'flow-root',
    color: 'white',
    backgroundColor: '#2b3841',
    // backgroundColor: '#24c4d8',
    borderRadius: '5px 5px 0 0',
    padding: '10px',
  },
  tableHeaderLabel: {
    position: 'relative',
    float: 'left',
    width: '80%',
  },
  floatRight: {
    float: 'right',
  },
  addButton: {
    backgroundColor: '#24c4d8',
  },
  emptySpace: {
    margin: '20px 0',
  },
  emptyRow: {
    backgroundColor: 'whitesmoke',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  width_10: {
    width: '10%',
  },
  margin_5: {
    margin: '5px',
  },
  width_15: {
    width: '15%',
  },
  width_17: {
    width: '17%',
  },
  width_20: {
    width: '20%',
  },
  width_25: {
    width: '25%',
  },
  width_60: {
    width: '60%',
  },
  fontWeight_600: {
    fontWeight: 600,
  },
  actionButtons: {
    position: 'relative',
    float: 'left',
    padding: '0 5px',
  },
  tableWrapper: {
    display: 'flex',
    paddingTop: '20px'
  },
  buttonUi: {
    display: 'flex',
    paddingTop: '2px',
    float: 'right',
    margin: "10px 4px 10px 4px",
  },
  leftpane: {
    width: '20%',
    height: '100%',
    float: 'left',
    textAlign: 'center'
  },
  rightpane: {
    width: '78%',
    height: '100%',
    float: 'left',
    textAlign: 'center',
    paddingLeft: '20px'
  },
  tableRow: {
    "&$hover:hover": {
      backgroundColor: "#ADD8E6"
    }
  },
  // tableCell: {
  //   "$hover:hover &": {
  //     color: "black"
  //   }
  // },
  hover: {},
  blueIconButton: {
    color: "#fff",
    backgroundColor: 'blue',
    borderRadius: 50,
  },
  errorIconButton: {
    color: "#fff",
    backgroundColor: 'red',
    borderRadius: 50,
  },
  canselButtonWrappers: {
    textAlign: 'right'
  },

  grayTableHeader: {
    background: "#DCDCDC"
  },
  infoTableHeader: {
    background: "#FFFFFF"
  },
  errorState: {
    color: "red"
  },
  completeState: {
    color: "blue"
  },
  activeState: {
    color: "green"
  },
  input: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif !important',
    fontSize: '0.875rem !important'
  },
  disabled: {
    '&:before': {
      borderBottomStyle: 'none !important',
    }
  },
  notchedOutline: {},
  padding_5: {
    padding: '5px'
  },
  popupCloseButton: {
    backgroundColor: 'gray',
    marginRight: '5px',
    color: 'white',
    '&:hover': {
      color: 'black',
      backgroundColor: '#cacaca'
    }
  },
  popupAddButton: {
    backgroundColor: '#24c4d8',
    color: 'white',
    '&:hover': {
      color: 'black',
      backgroundColor: '#8bebf7'
    }
  },

  tableHeadBorderLeft: {
    borderLeft: '1px solid #cecece'
  },
  tableHeadBorderRight: {
    borderRight: '1px solid #cecece'
  },
  tableHeadBorderBothSides: {
    borderRight: '1px solid #cecece',
    borderLeft: '1px solid #cecece'
  },

  noMargin: {
    margin: '0'
  },
  formControl: {
    margin: '0'
  },
  selectionLabel: {
    zIndex: 1,
    transform: 'translate(14px, 20px) scale(1)',
    pointerEvents: 'none',
  },
  shrinedSelectionLabel: {
    zIndex: 1,
    transform: 'translate(14px, -6px) scale(0.75);',
    pointerEvents: 'none',
    backgroundColor: 'white'
  },
  errorMessageDiv: {
    color: 'red'
  },
  BTCOTableCell: {
    paddingTop: "0px",
    paddingBottom: "0px",
    lineHeight: "1",
    fontSize: "12px"
  },
  BTCOButtonProcess: {
    margin: "1px 10px 1px 10px",
    fontSize: "12px"
  },
  debtTableHeaders: {
    // display: 'flow-root',
    // color: 'white',
    // backgroundColor: '#C0C0C0',
    // borderRadius: '5px 5px 0 0',
    // padding: '10px',
    paddingLeft: "5px"
  },
  debtTableHeaderLabel: {
    // position: 'relative',
    float: 'left',
    paddingBottom: 0,
    paddingTop: '10px',
    fontSize: '18px',
    fontFamily: 'Roboto',
    weight: 400
    // width: '80%',
  },
  debtFormAddButton: {
    backgroundColor: '#24c4d8',
  },
  sectionDevider: {
    paddingBottom: '20px',
    paddingLeft: '10px'
  },
  searchBoxPosition: {
    marginTop: '20px',
    marginBottom: '20px'
  },
  smallBox: {
    // overflow: 'auto',
    paddingRight: '20px',
    width: '25%',
  },
  toolTipMaxWidth: {
    maxWidth: 1000,
  },

  flexContainer: { display: 'flex' , paddingBottom: '10px'},
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
  indicatorBox: {
    // overflow: 'auto',
    paddingRight: '20px',
    width: '25%',
    paddingTop:  '20px'
  },
  firstAnalysesParameterLabel: {
    fontSize: '18px',
    fontWeight: 500,
  },
  tableHeadColor: tableHeadColor,
  // tableContainer: { ...tableContainer, marginTop: theme.spacing(4), overflow: 'hidden', marginBottom: theme.spacing(4) },
  table: table,
  tableHeadCell: tableHeadCell,
  tableCell: tableCell,
  tableResponsive: tableResponsive,
  confirmIconButton: confirmIconButton,
  cancelIconButton: cancelIconButton,
  deleteIconButton: deleteIconButton,
  addIconButton: addIconButton,

});

export default dashboardStyle;
