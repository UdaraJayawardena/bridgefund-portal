import { createStyles } from "@material-ui/core";
import * as TableStyles from "../components/customTableStyles";

export default createStyles({
  ...JSON.parse(JSON.stringify(TableStyles)),
  actionButton: {
    padding: 2
  },
  zeroMargin: {
    margin: 0
  },
  spaceBetween: {
    justifyContent: 'space-between'
  },
  inputFields: {
    minWidth: 200
  }
});