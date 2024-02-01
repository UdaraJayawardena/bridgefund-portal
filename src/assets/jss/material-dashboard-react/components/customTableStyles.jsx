import { createStyles } from '@material-ui/core/styles';
import { rgbToHex } from "@material-ui/core/styles/colorManipulator";

export default createStyles({
  tableContainer: {
    width: "100%",
    marginTop: 20,
    overflowX: "auto",
    overflowY: "auto"
  },
  tableHeaderCell: {
    backgroundColor: "#fff",
    position: "sticky",
    top: 0,
    padding: "5px 5px 5px 10px",
    margin: 0,
    textAlign: "start",
    fontWeight: "bold"
  },
  tableHeaderCellNumber: {
    backgroundColor: "#fff",
    position: "sticky",
    top: 0,
    padding: "5px 5px 5px 10px",
    margin: 0,
    textAlign: "end",
    fontWeight: "bold"
  },
  tableBodyCell: {
    margin: 0,
    padding: 3,
    textAlign: "start"
  },
  tableBodyCellNumber: {
    margin: 0,
    padding: 3,
    textAlign: "end"
  },
  tableHeaderRow: {
    height: "40px"
  },
  verticalTableContainer: {
    overflowX: "hidden",
    overflowY: "auto",
    padding: "15px",
    height: "calc( 100% - 30px )",
    borderRadius: "10px",
    backgroundColor: "white",
    minWidth: "16vw"
  },
  verticalTableCaption: {
    fontWeight: "bold",
    color: "#565c74",
    fontSize: "12pt",
    padding: "2px 2px 2px 10px"
  },
  verticalTableHeaderCell: {
    fontWeight: "bold",
    color: rgbToHex("rgb(98,104,126)"),
    border: "none",
    padding: "2px 2px 2px 10px",
    fontSize: "11pt",
  },
  verticalTableInnerContainer: {
    height: "100%",
  },
  verticalTableInnerContainerHeaderColumn: {
    backgroundColor: "rgb(245,246,250) !important",
    borderRadius: "10px !important"
  },
  verticalTableBodyCell: {
    border: "none",
    padding: "2px"
  }
});