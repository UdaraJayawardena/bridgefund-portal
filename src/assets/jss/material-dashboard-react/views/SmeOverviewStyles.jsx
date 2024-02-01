import { createStyles } from "@material-ui/core";
import { container, defaultIconColor, lightBlue } from '../../material-dashboard-react';

const style = theme => createStyles({
  header: {
    margin: '0px -30px',
    padding: '0px 30px',
    backgroundColor: '#F9FAFC',
    borderBottom: '2px solid #e3e3e3',
    borderTop: '2px solid #e3e3e3',
  },
  tabIndicator: {
    backgroundColor: lightBlue,
    height: 4
  },
  tabFont: {
    color: '#000'
  },
  selectedTabFont: {
    color: '#000',
    fontWeight: 'bold'
  },
  smeOverviewBackground: {
    backgroundColor: '#fff',
    padding: 20
  },
  container,
  flexContainer: { display: 'flex' },
  smallBox: {
    width: '33%',
    paddingLeft: 10,
    minWidth: 220,
    [theme.breakpoints.between(0, 600)]: {
      width: '100%',
      padding: 0,
    },
    [theme.breakpoints.between(600, 805)]: {
      width: '50%',
      padding: 10,
    }
  },
  smeOverviewHeader: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  deleteCompanyBtn: {
    color: defaultIconColor,
    borderRadius: 20
  },
  saveChangesBtn: {
    position: 'fixed',
    bottom: theme.spacing(5),
    right: theme.spacing(2),
    color: "#fff",
    backgroundColor: lightBlue,
    zIndex: 10
  },
  blueIconButton: {
    color: "#fff",
    backgroundColor: lightBlue,
    borderRadius: 20,
  },
  personBlueIconButton: {
    color: "#fff",
    backgroundColor: lightBlue,
    borderRadius: 20,
    marginRight: 20,
  },
  loanRequestWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  loanRequestButtonContainer: {
    paddingTop: "40px",
    marginLeft: "80px"
  },
  loanRequestRefreshIconContainer: {
    paddingTop: "50px",
    marginLeft: "80px"
  },
  searchButtonWrapper: {
    display: 'flex', 
    paddingTop: '10px',
    justifyContent: 'flex-end'
  },

  //styles for initiation history 
  heading: {
    fontSize: '1.2rem',
    fontWeight: 500,
  },
  secondaryHeading: {},
  statusLabel: {
    backgroundColor: '#e4e4e4',
    margin: '0 5px',
    padding: '3px 10px',
    borderRadius: '5px',
    fontSize: '0.9rem',
    width: 'fit-content',
  },
  labelsWrapper: {
    float: 'left',
    width: '100%',
  },
  labels: {
    float: 'left',
    marginRight: '20px',
  },
  marginLeft_30: {
    marginLeft: '30px'
  },
  timeLabel: {
    float: 'left',
    marginRight: '5px',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  processStatusWrapper: {
    position: 'relative',
    width: '250px',
  },
  latestAttempt: {
    backgroundColor: 'green',
    color: 'white',
    fontWeight: 500,
    padding: '2px 10px',
    borderRadius: '5px',
  },
  activityStatus: { float: 'left' },
  floatLeft: { float: 'left' },
  activityStatusLoader: {
    float: 'left',
    marginLeft: '10px'
  },
  errorViewIcon: {
    float: 'left',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  displayBlock: { display: 'block' },
  processStatus_ACTIVE: { color: '#03a016' },
  processStatus_COMPLETED: { color: '#0351a0' },
  processStatus_INTERNALLY_TERMINATED: { color: 'red' },
  processStatus_EXTERNALLY_TERMINATED: { color: '#d45b05' },
  subFlowWrapper : {
    border: '1px solid gray',
    borderRadius: '5px',
    marginBottom: '10px',
    backgroundColor: 'white',
  },

  activeSectionHeader: {
    backgroundColor: 'rgba(43,56,65,0.25)',
    borderRadius: '5px 5px 0 0',
  },
  activeSectionBody: {
    backgroundColor: '#efefef',
  },
  subActivitiesHeader : {
    fontSize: '1rem',
    fontWeight: 500,
    textDecoration: 'underline',
    margin: '5px 25px',
  },
  whiteBackgroundColor: { backgroundColor: 'white' },
  borderRadius_5: { borderRadius: '5px' },
  identifierBox: {
    paddingTop: 20,
    width: '33%',
    paddingLeft: 10,
    minWidth: 220,
    [theme.breakpoints.between(0, 600)]: {
      width: '100%',
      padding: 0,
    },
    [theme.breakpoints.between(600, 805)]: {
      width: '50%',
      padding: 10,
    }
  },
  rootheader:{
    width: '97%',
    paddingLeft: '10px'
  },
  noDataHeader:{
    //width: '5%',
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    //justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    border: '1px solid gray',
    height: '100px',
    paddingRight: 5,
    paddingLeft:  5
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
    width: '65%',
    paddingRight: 10,
    paddingLeft: 10,
  },
});

export default style;