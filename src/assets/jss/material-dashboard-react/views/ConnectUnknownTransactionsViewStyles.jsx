import { createStyles } from "@material-ui/core";
import * as TableStyles from "../components/customTableStyles";

export default createStyles({
  ...JSON.parse(JSON.stringify(TableStyles)),

  zeroMargin: {
    margin: 0
  },
  noBorder: {
    border: 'none'
  },
  bold: {
    fontWeight: 'bold'
  },
  block: {
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 10,
    borderColor: '#f5f5f5',
    margin: 5,
    padding: 10,
  },
  gridContainer: {
    display: 'flex',
  },
  marginLeft: {
    marginLeft: 5
  },
  marginRight: {
    marginRight: 5
  },
  loanDetailsContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  amountsWarning: {
    color: '#d93814'
  },
  buttonContainer: {
    float: "right",
    padding: 15
  }
});