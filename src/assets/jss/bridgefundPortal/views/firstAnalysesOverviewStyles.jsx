import { createStyles } from "@material-ui/core";
import {
    tableContainer, table, tableHeadCell, tableHeadColor
} from "assets/jss/bridgefundPortal/components/tableStyle";
import { addIconButton } from "../components/ButtonStyle";

const colorGreen = {
    backgroundColor: '#b3e7bd'
};

const colorRed = {
    backgroundColor: '#fd9ea1'
};

const colorOrange = {
    backgroundColor: '#febf87'
};

const dashboardStyle = theme => createStyles({
    highRiskContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        overflow: 'overlay'
    },
    transactionContainerTitle: {
        fontFamily: 'Roboto',
        fontSize: '18px',
        fontWeight: 600,
        padding: '5px',
        paddingLeft: '10px'
    },
    transactionContainerTitleGrid: {
        fontFamily: 'Roboto',
        fontWeight: 600,
        fontSize: '18px',
        padding: '5px',
        paddingLeft: '20px'
    },
    table: table,
    tableHeadCell: tableHeadCell,
    addIconButton: addIconButton,
    tableContainer: tableContainer,
    parameterTableContainer: {
        marginTop: '67px'
    },
    tableHeadColor: {
        ...tableHeadColor,
        background: '#d9d9d9'
    },
    parameterGreen: {
        ...colorGreen,
        width: '15%'
    },
    parameterPlan: {
        height: '22px',
        width: '15%'
    },
    parameterOrange: {
        ...colorOrange,
        width: '15%'
    },
    parameterRed: {
        ...colorRed,
        width: '15%'
    },
    analysisSummaryGreen: {
        ...colorGreen,
        width: '38%'
    },
    analysisSummaryOrange: {
        ...colorOrange,
        width: '38%'
    },
    analysisSummaryRed: {
        ...colorRed,
        width: '38%'
    },
    analysisSummaryPlain: {
        width: '38%'
    },
    outcomeRed: {
        ...colorRed,
        width: '40%',
        
    },
    outcomeGreen: {
        ...colorGreen,
        width: '40%'
    },
    outcomeOrange: {
        ...colorOrange,
        width: '40%'
    },
    outcomePlain: {
        width: '40%'
    },
    AnalysesAccountGreen: {
        ...colorGreen,
        width: '40%'
    },
    AnalysesAccountRed: {
        ...colorRed,
        width: '35%'
    },
    AnalysesAccountOrange: {
        ...colorOrange,
        width: '35%'
    },
    AnalysesAccountPlain: {
        width: '35%'
    },
    decisionProcessButton: {
        ...addIconButton,
        width: '200px',
        height: '30px'
    }
});

export default dashboardStyle;