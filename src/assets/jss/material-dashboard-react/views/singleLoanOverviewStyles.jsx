import * as TableStyles from "../components/customTableStylesLM";
import { whiteColor, grayColor } from "assets/jss/material-dashboard-react.jsx";
import { rgbToHex } from "@material-ui/core/styles/colorManipulator";
import { createStyles } from "@material-ui/core";


const singleLoanOverviewStyles = theme => createStyles({
  ...JSON.parse(JSON.stringify(TableStyles)),
  card: {
    borderRadius: "10px !important",
  },
  cardHead: {
    marginBottom: "20px !important",
    borderRadius: "10px !important"
  },
  cardTitleWhite: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: 500,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  btnBack: {
    borderRadius: "10px",
    letterSpacing: "5px",
    fontSize: "15pt",
    fontWeight: "bold"
  },
  startLoanBtn: {
    borderRadius: "10px",
    letterSpacing: "5px",
    fontSize: "15pt",
    fontWeight: "bold",
    marginLeft: theme.spacing(3) + "px !important",
    // backgroundColor: '#007bff',
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
  verticalTableBodyCell: {
    border: "none",
    padding: "15px 2px 0px 10px",
  },
  leftIcon: {
    marginRight: theme.spacing(3) + "px !important"
  },
  rightIcon: {
    marginLeft: theme.spacing(3) + "px !important"
  },
  gridItem: {
    paddingTop: theme.spacing(2) + "px !important",
    width: "100%",
    paddingBottom: "16px !important"
  },
  tableHeaderCell: {
    border: "none",
    fontWeight: "bold",
    backgroundColor: rgbToHex("rgb(245,246,250)"),
    "&:first-child": {
      borderRadius: "40px 0 0 40px",
    },
    "&:last-child": {
      borderRadius: "0 40px 40px 0",
    }
  },
  tableContainer: {
    width: "calc( 100% - 30px )",
    overflowX: "auto",
    overflowY: "auto",
    padding: "15px",
    borderRadius: "10px",
    maxHeight: '400px !important'
  },
  tableContainerDS: {
    width: "calc( 100% - 30px )",
    overflowX: "auto",
    overflowY: "auto",
    padding: "15px",
    borderRadius: "10px",
    maxHeight: 'calc(100vh - 300px)'
  },
  tableBodyCell: {
    border: "none",
    padding: "10px"
  },
  loanFeeTable: {
    minWidth: "450px"
  },
  loanFeeHeaderCell: {
    backgroundColor: rgbToHex("rgb(245,246,250)"),
    border: "none",
    fontWeight: "bold",
    padding: "0px 5px 10px 8px",
    textAlign: "right"
  },
  loanFeeBodyCell: {
    textAlign: "right",
    border: "none",
    "&:first-child": {
      fontWeight: "bold",
      color: "grey",
      backgroundColor: rgbToHex("rgb(245,246,250)"),
      padding: "0px 5px 10px 15px"
    },
    padding: "0px 5px 10px 8px"
  },
  tableHeading: {
    backgroundColor: rgbToHex("rgb(245,246,250)"),
    border: "none",
    fontWeight: "bold",
  },
  verticalTableInnerContainer: {
    height: "100% !important",
    margin: "0 !important",
    minWidth: "260px"
  },
  formControl: {
    margin: 1,
    minWidth: 175,
  },
  selectEmpty: {
    marginTop: 2,
  },
  directDebitRow_Green: {
    // backgroundImage: "radial-gradient(#145f01, #2e5d17)",
    backgroundColor: "#27862b",
  },
  directDebitRow_Orange: {
    backgroundColor: "orange",
  },
  directDebitRow_Blue: {
    backgroundColor: "#226a94;",
  },
  directdebitRowCell: {
    // border: "none",
    // "&:first-child": {
    //   borderRadius: "15px 0 0 15px"
    // },
    // "&:last-child": {
    //   borderRadius: "0 15px 15px 0"
    // }
  },
  whiteFont: {
    color: "white"
  },
  blackFont: {
    color: "black"
  },
  tooltipTable: {
    border: '1px solid white',
    borderCollapse: 'collapse'
  },
  popOverTable: {
    border: '1px solid black',
    borderCollapse: 'collapse'
  },
  tooltipTableHeadCell: {
    border: '1px solid white',
    fontSize: '12pt',
    fontWeight: 'bold',
    padding: 3,
    textAlign: 'center'
  },
  tooltipTableBodyCell: {
    border: '1px solid white',
    fontSize: '10pt',
    padding: 3,
  },
  popOverTableBodyCell: {
    border: '1px solid black',
    fontSize: '10pt',
    padding: 3,
  },
  middleButtonContainer: {
    justifyContent: "space-between"
  },
  rightTablesContainer: {
    height: "100%"
  },
  loanDetailContainer: {
    justifyContent: "space-between"
  },
  loanDetailLeftContainer: {
    width: "50%",
    flexDirection: "column",
    // minWidth: "27vw",
  },
  loanDetailRightContainer: {
    width: "50%",
    flexDirection: "row",
    // minWidth: "27vw",
  },
  smallButton: {
    marginRight: '5%',
    padding: '3% 7%'
  },
  infoLabel: {
    color: 'green',
    fontWeight: 500,
    textAlign: 'center',
  },
  iconButtonMargin: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
  noRecordsFoundText: {
    textAlign: "center",
    color: grayColor[1]
  },
  dialogErrorContentOverlay: {
    filter: "blur(3px)"
  },
  dialogErrorContentOverlayText: {
    position: 'absolute',
    left: '8%',
    top: '48%'
  },
  dialogErrorContentOverlayTextContent: {
    fontSize: '22px',
    fontWeight: '500'
  },
  dialogErrorContentOverlayTextSpan: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#0000EE',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: "underline",
   },
  }
});

export default singleLoanOverviewStyles;
