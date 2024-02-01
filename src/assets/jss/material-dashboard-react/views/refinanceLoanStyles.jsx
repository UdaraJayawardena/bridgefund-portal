import { createStyles } from "@material-ui/core";


const styles = createStyles({

  tableCellLessPadding: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    paddingRight: 2,
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
  alignCenter: {
    textAlign: 'center'
  },
  fontSizeSmall: {
    fontSize: '9pt'
  },
  newLoanHeadingBlock: {
    padding: 10,
    display: 'flex',
    justifyContent: 'center'
  },
  gridContainer: {
    display: 'flex',
    padding: 10,
  },
  marginLeft: {
    marginLeft: 5
  },
  block: {
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 10,
    borderColor: '#f5f5f5',
    margin: 5,
    padding: 10,
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
  footer: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  percentageInput: {
    minWidth: 50.5,
    width: 50.5
  }
});

export default styles;