import { createStyles } from "@material-ui/core";
import * as TableStyles from "../components/customTableStylesLM";
import {
  whiteColor,
  grayColor,
} from "assets/jss/material-dashboard-react.jsx";

const smeLoanRecoveryApointmentStyles = createStyles({
  ...JSON.parse(JSON.stringify(TableStyles)),
  cardTitleWhite: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
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
  tableCellAppointment: {
    ...TableStyles.tableBodyCell,
    width: '30%'
  },
  addNewButton: {
    float: 'right',
    borderRadius: '50px'
  },
  formControl: {
    margin: 1,
    minWidth: 175,
  },
  selectEmpty: {
    marginTop: 2,
  },
  basicCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    border: '1px solid #e0e0e0',
    width: '25%'
  },
  contentCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    border: '1px solid #e0e0e0',
  },
  headCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    border: '1px solid #e0e0e0',
    fontWeight: '500'
  },
  numberCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    textAlign: 'right',
    border: '1px solid #e0e0e0',
    width: '15%'
  },
  spaceCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    textAlign: 'right',
    border: '1px solid #e0e0e0',
    width: '8%'
  },
  basicClearCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    width: '20%'
  },
  spaceClearCell: {
    paddingTop: '1%',
    paddingBottom: '1%',
    textAlign: 'right',
    width: '8%'
  },
  autoSuggestTextStyle: {
    fontSize: '12px',
    height: '40px',
    fontFamily: 'Source Sans Pro',
  },
  autoSuggestTextLabelStyle: {
    fontFamily: 'Source Sans Pro',
    fontSize: '12px',
  },
  autoSuggestListStyle: {
    fontFamily: 'Source Sans Pro',
    fontSize: '12px',
    padding: 0,
    maxHeight: 200,
    overflow: 'overlay'
},
});

export default smeLoanRecoveryApointmentStyles;