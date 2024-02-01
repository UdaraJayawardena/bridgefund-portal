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
  doubleBox: {
    display: 'flex',
    paddingLeft: 10,
    width: '33%',
  },
  personOverviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  addressHeader: {
    display: 'flex',
    paddingTop: 15,
  },
  address: {
    float: 'left',
    width: '33%'
  },
  contact: {
    float: 'left',
    width: '33%'
  },
  deleteCompanyBtn: {
    color: defaultIconColor,
    borderRadius: 20
  },
  formControl: {
    margin: 1,
    marginTop: 25,
    minWidth: 200,
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
    borderRadius: 20
  },
  signingContract: {
    width: 'calc(50% - 2px)',
    paddingLeft: 10,
    minWidth: 50
  },
  signingGuarantee: {
    width: 'calc(50% - 2px)',
    paddingLeft: 10,
    minWidth: 50,
  },
  isUpdating: {
    fontSize: 15,
    fontStyle: 'italic',
    color: "rgba(0, 0, 0, 0.38)",
  }
});

export default style;