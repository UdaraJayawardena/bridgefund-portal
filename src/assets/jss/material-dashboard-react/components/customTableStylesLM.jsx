import { rgbToHex } from "@material-ui/core/styles/colorManipulator";

export const tableContainer = {
  width: "100%",
  marginTop: 20,
  overflowX: "auto",
  overflowY: "auto"
};
export const tableHeaderCell = {
  backgroundColor: "#fff",
  position: "sticky",
  top: 0,
  padding: "5px 5px 5px 10px",
  margin: 0,
  textAlign: "start",
  fontWeight: "bold"
};
export const tableHeaderCellNumber = {
  backgroundColor: "#fff",
  position: "sticky",
  top: 0,
  padding: "5px 5px 5px 10px",
  margin: 0,
  textAlign: "end",
  fontWeight: "bold"
};
export const tableBodyCell = {
  margin: 0,
  padding: 3,
  textAlign: "start"
};
export const tableBodyCellNumber = {
  margin: 0,
  padding: 3,
  textAlign: "end"
};

export const tableHeaderRow = {
  height: "40px"
};

export const lessPaddingCell = {
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: 3,
  paddingRight: 2,
}

export const verticalTableContainer = {
  overflowX: "hidden",
  overflowY: "auto",
  padding: "15px",
  height: "calc( 100% - 30px )",
  borderRadius: "10px",
  backgroundColor: "white",
  minWidth: "16vw"
}
export const verticalTableCaption = {
  fontWeight: "bold",
  color: "#565c74",
  fontSize: "12pt",
  padding: "2px 2px 2px 10px"
}
export const verticalTableHeaderCell = {
  fontWeight: "bold",
  color: rgbToHex("rgb(98,104,126)"),
  border: "none",
  padding: "2px 2px 2px 10px",
  fontSize: "11pt",
};
export const verticalTableInnerContainer = {
  height: "100%",
}
export const verticalTableInnerContainerHeaderColumn = {
  backgroundColor: "rgb(245,246,250) !important",
  borderRadius: "10px !important"
}
export const verticalTableBodyCell = {
  border: "none",
  padding: "2px"
}
export const noBorder = {
  border: 'none'
}
export const headerSort = {
  paddingRight: 0,
  paddingLeft: 0,
}
export const bodySort = {
  paddingRight: 25,
  paddingLeft: 1,
}