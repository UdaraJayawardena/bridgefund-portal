import { createStyles } from "@material-ui/core";
import { lightBlue } from "assets/jss/material-dashboard-react";

const smsOverviewStyle = (theme) =>
  createStyles({
    columnContainer: {
      paddingTop: "100px",
      display: "column",
      justifyContent: "center",
      alignItems: "center",
    },

    smallBox: {
      width: "33%",
      paddingLeft: 10,
      minWidth: 220,
      [theme.breakpoints.between(0, 600)]: {
        width: "100%",
        padding: 0,
      },
      [theme.breakpoints.between(600, 805)]: {
        width: "50%",
        padding: 10,
      },
    },

    phoneNumberFeild: {
      marginBottom: "10px",
    },

    blueIconButton: {
      color: "#fff",
      backgroundColor: lightBlue,
      borderRadius: 20,
      width: "100px",
      border: "none",
      position: "relative",
      padding: "12px 30px",
      margin: ".3125rem 1px",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0",
      height: "40px",
    },

    sendButtonWapper: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
    },
  });

export default smsOverviewStyle;
