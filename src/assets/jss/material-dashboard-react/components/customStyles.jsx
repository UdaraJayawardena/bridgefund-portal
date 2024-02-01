
import { blue } from '@material-ui/core/colors';
import { createStyles } from '@material-ui/core';

const customStyles = createStyles({
  basicAlign: {
    position: 'relative',
    float: 'left',
    width: '100%',
  },
  headerButtons: {
    position: 'relative',
    float: 'left',
    width: '48%',
    textAlign: 'center',
    border: '1px solid black',
    cursor: 'pointer',
    padding: '0.25%',
  },
  activeButton: {
    borderBottom: 'none',
  },
  inactiveButton: {
    backgroundColor: '#81818126'
  },
  noPadding: {
    padding: '0 !important'
  },
  fontPoint75em: {
    fontSize: '0.75em',
  },
  fontPoint75emWithOpacity: {
    fontSize: '0.75em',
    opacity: '0.6'
  },
  zeroMargin: {
    margin: '0 !important'
  },
  marginTop5: {
    marginTop: '5% !important'
  },
  marginTop1: {
    marginTop: '1% !important'
  },
  marginLeft1: {
    marginLeft: '1% !important'
  },
  pointerCursor: {
    cursor: 'pointer'
  },
  bottomAlignSelector: {
    top: '30% !important',
    right: '27% !important',
    width: '53% !important',
    left: '20% !important'
  },
  positionRelative: {
    position: 'relative'
  },
  fullWidth: {
    width: '100%'
  },
  justifyLeft: {
    justifyContent: 'flex-start',
    marginLeft: '1%',
  },
  actionButtonMargins: {
    margin: '0 1% 1% 0'
  },
  labelColors: {
    color: '#b7b7b7 !important',
    fontSize: '0.85em',
  },
  cardMarginTop: {
    marginTop: 'unset !important'
  },
  borderTopFlat: {
    borderTopRightRadius: '0 !important',
    borderTopLeftRadius: '0 !important',
  },
  cardMarginBottom: {
    marginBottom: 'unset !important'
  },
  zIndexHigh: {
    zIndex: 100
  },
  buttonProgress: {
    color: blue[500],
    position: 'absolute',
    bottom: '36%',
    right: '4%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonProgressForSme: {
    color: blue[500],
    position: 'absolute',
    bottom: '22%',
    right: '3%',
    marginTop: -12,
    marginLeft: -12,
  },
  actionIcons: {
    cursor: 'pointer',
    margin: '0 5% 0 0',
  },
  datePicker: {
    marginTop: 0
  },
  paddingBottomUnset: {
    paddingBottom: "0 !important"
  },
  paddingPoint5: {
    paddingTop: '0.5% !important',
    paddingBottom: '0.5% !important',
  },
  customTableHeader: {
    "position": "relative",
    "margin": "1% 2%",
    "width": "10%",
    "fontWeight": 500,
    "fontSize": "1.25em",
  },
  basicCardHeader: {
    fontWeight: 500,
    fontSize: '1.25em'
  },
  noBorder: {
    border: 'none'
  },
  formControl_4: {
    marginTop: '4%'
  },
  floatRight: {
    position: 'relative',
    float: 'right'
  },
  marginBottom_1: {
    marginBottom: '1%'
  },
  footerBtn: {
    textAlign: "center",
    display: "none"
  },
  gridAlign: {
    position: 'relative',
    float: 'left',
  },
  padding3: {
    padding: '3% !important'
  },
  paddingTop2: {
    paddingTop: '2% !important'
  },
  fontSizePont8: {
    fontSize: '0.8em !important'
  },
  selectionsWrapper: {
    position: 'absolute',
    zIndex: 9999,
    backgroundColor: 'white',
  },
  companySelectionLi: {
    paddingLeft: '3% !important',
    fontSize: '1em',
    minHeight: 'fit-content'
  },
  progressOnInput: {
    position: 'absolute',
    right: 0,
    bottom: '30%',
    width: '15px !important',
    height: '15px !important'
  }
});

export default customStyles;