import {
  container,
  defaultFont,
  primaryColor,
  defaultBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  grayColor
} from "assets/jss/material-dashboard-react.jsx";
import { createStyles } from "@material-ui/core/styles";

const headerStyle = createStyles({
  appBar: {
    backgroundColor: "transparent",
    boxShadow: "none",
    borderBottom: "0",
    marginBottom: "0",
    position: "absolute",
    width: 'calc(100% - 55px)',
    paddingTop: "10px",
    zIndex: 1,
    color: grayColor[7],
    border: "0",
    borderRadius: "3px",
    padding: "10px 0",
    // transition: "all 0.5s ease-out",
    minHeight: "75px",
    display: "block",
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
  },
  container: {
    ...container,
    minHeight: "50px"
  },
  flex: {
    flex: 1
  },
  // @ts-ignore
  title: {
    ...defaultFont,
    lineHeight: "30px",
    fontSize: "18px",
    borderRadius: "3px",
    textTransform: "none",
    color: "inherit",
    margin: "0",
    "&:hover,&:focus": {
      background: "transparent"
    }
  },
  appResponsive: {
    top: "8px"
  },
  primary: {
    backgroundColor: primaryColor[0],
    color: whiteColor,
    ...defaultBoxShadow
  },
  info: {
    backgroundColor: infoColor[0],
    color: whiteColor,
    ...defaultBoxShadow
  },
  success: {
    backgroundColor: successColor[0],
    color: whiteColor,
    ...defaultBoxShadow
  },
  warning: {
    backgroundColor: warningColor[0],
    color: whiteColor,
    ...defaultBoxShadow
  },
  danger: {
    backgroundColor: dangerColor[0],
    color: whiteColor,
    ...defaultBoxShadow
  },
  smallHeaderBar: {
    width: 'calc(100% - 260px)',
    minHeight: "75px",
  },
});

export default headerStyle;
