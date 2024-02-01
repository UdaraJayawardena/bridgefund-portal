import { hexToRgb, whiteColor, grayColor, warningColor } from "assets/jss/material-dashboard-react.jsx";
import { createStyles } from "@material-ui/core";

const multipleLoanOverviewStyle = createStyles({
   cardCategoryWhite: {
      color: "rgba(" + hexToRgb(whiteColor) + ",.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
   },
   cardTitleWhite: {
      color: whiteColor,
      marginTop: "15px",
      minHeight: "auto",
      fontWeight: 300,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      marginBottom: "3px",
      textDecoration: "none",
      "& small": {
         color: grayColor[1],
         fontWeight: 400,
         lineHeight: "1"
      }
   },
   formControl: {
      margin: 1,
      minWidth: 175,
   },
   selectEmpty: {
      marginTop: 2,
   },
   tableContainer: {
      width: '100%',
      marginTop: 10,
      overflowX: 'auto',
      overflowY: 'auto'
   },
   tableHeaderCell: {
      backgroundColor: "#fff",
      position: "sticky",
      top: 0,
      padding: '5px 5px 5px 10px',
      margin: 0,
      textAlign: 'start',
      fontWeight: 'bold',
   },
   tableHeaderCellNumber: {
      backgroundColor: "#fff",
      position: "sticky",
      top: 0,
      padding: '5px 5px 5px 10px',
      margin: 0,
      textAlign: 'end',
      fontWeight: 'bold',
   },
   tableBodyCell: {
      margin: 0,
      padding: 3,
      textAlign: 'start'
   },
   tableBodyCellNumber: {
      margin: 0,
      padding: 3,
      textAlign: 'end'
   },
   errorDiv: {
      position: "relative",
    },
    errorSpanPosition: {
      position: "absolute",
      bottom: -4,
    },
    errorWarningIcon: {
      cursor: "pointer",
      fontSize: "20px !important",
      color: warningColor[0],
    },
   noRecordsFoundText: {
      textAlign: "center",
      color: grayColor[1]
   }
});

export default multipleLoanOverviewStyle;
