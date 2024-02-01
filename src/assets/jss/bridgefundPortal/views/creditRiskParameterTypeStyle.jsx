import { createStyles } from "@material-ui/core";
import {
    tableHeadColor, tableContainer,
    tableCell
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { confirmIconButton, cancelIconButton } from "assets/jss/bridgefundPortal/components/ButtonStyle";

const creditRiskParameterTypeStyle = theme => createStyles({

      floatRight: {
        float: 'right',
      },
      actionButtons: {
        // position: 'relative',
        float: 'left',
        padding: '0 5px',
      },
      cursorPointer: {
        cursor: 'pointer',
      }, 
      tableContainer: tableContainer,
      tableHeadColor: tableHeadColor,
      tableCell: tableCell,
      cancelIconButton:cancelIconButton,
      confirmIconButton:confirmIconButton
});

export default creditRiskParameterTypeStyle;