import { hexToRgb, whiteColor, grayColor } from "assets/jss/material-dashboard-react.jsx";
import { createStyles } from "@material-ui/core";

const chamberOfCommerceStyle = createStyles({
   cardCategoryWhite: {
      color: "rgba(" + hexToRgb(whiteColor) + ",.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
   },
   cardTitleWhite: {
      color: whiteColor,
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
   }
});

export default chamberOfCommerceStyle;
