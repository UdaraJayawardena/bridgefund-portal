import { createStyles } from "@material-ui/core";

export default createStyles({

  tableCell: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    paddingRight: 2,
    border: 'none'
  },
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
    margin: '15px 0'
  },
  gridItem:{
    margin: '7.5px 0'
  },
  marginLeft: {
    marginLeft: 5
  },
  amountInput: {
    minWidth: 100,
    width: 100,
    margin: 0
  },
  numberInput: {
    minWidth: 50,
    width: 50
  },
  requestButton: {
    float: "right"
  },
  errorContainer: {
    color: "red"
  }
});