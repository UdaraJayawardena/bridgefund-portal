import { createStyles } from "@material-ui/core";

const colorGreen = {
    backgroundColor: '#b3e7bd'
};

const loansGivenOverviewStyle = theme => createStyles({
    tableHeaderCell: {
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        padding: '5px 5px 5px 10px',
        margin: 0,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    tableHeaderCellCenter: {
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        padding: '5px 5px 5px 10px',
        margin: 0,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableBodyCell: {
        margin: 0,
        padding: 5,
        textAlign: 'start'
    },
    tableContainer: {
        width: '100%',
        marginTop: 10,
        overflowX: 'auto',
        overflowY: 'auto'
    },
    boldFont: {
        margin: 0,
        padding: 5,
        textAlign: 'start',
        fontWeight: 'bold'
    },
    boldFontCenter: {
        margin: 0,
        padding: 5,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    boldFontRight: {
        margin: 0,
        padding: 5,
        textAlign: 'right',
        fontWeight: 'bold'
    },
    noDataLabel: {
        alignContent: 'center'
    },
    height_100: {
        height: '100px'
    },
    header_center: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    height_50: {
        height: '50px'
    },
    tableBodyCellRight: {
        marginRight: '55%',
        padding: 5,
        textAlign: 'right'
    },
    tableBodyCellCenter: {
        margin: 0,
        padding: 5,
        textAlign: 'center'
    },
    sub_section_header: {
        fontWeight: 'bold'
    },
    filterItems: {
     paddingLeft: '4px',
     paddingRight: '4px',
     width: '130px',
    },
    filterItemsWeek: {
        paddingLeft: '4px',
        paddingRight: '4px',
        width: '80px',
    },
    filterText: {
     paddingTop: '5px', 
     paddingRight: '10px',
     color: '#555555',
     fontSize : '16px',
     fontWeight: 'bold'
    },
    filterButton: {
     borderRadius: '20px', 
     width: '100px',
     textAlign: 'center'
    },
    menuPaper: {
        maxHeight: 400
    },
    buttonLoader: {
        color: '#fff',
        marginLeft: '5px'
    }
});

export default loansGivenOverviewStyle;