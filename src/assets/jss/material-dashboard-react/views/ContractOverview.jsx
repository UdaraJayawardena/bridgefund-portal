import { createStyles } from "@material-ui/core";
import { infoColor } from "assets/jss/material-dashboard-react";

const style = () => createStyles({
  header: {
    margin: '0px -30px',
    padding: '0px 30px',
    backgroundColor: '#F9FAFC',
    borderBottom: '2px solid #e3e3e3',
    borderTop: '2px solid #e3e3e3',
    minHeight: 90,
  },
  headerTitle: {
    paddingTop: 25,
    paddingBottom: 25,
  },
  content: {
    backgroundColor: '#fff',
    padding: '5px'
  },
  contractHTMLView: {
    width: '75%',
    padding: 5,
    minHeight: 800,
    overflowY: 'auto',
  },
  contractHtmlOptions: {
    width: '25%',
    padding: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  finalActions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    backgroundColor: infoColor[0],
    borderRadius: 10,
    margin: 5,
    color: '#fff',
    '&:hover': {
      backgroundColor: infoColor[2],
    }
  },
  errorBtn: {
    backgroundColor: 'red',
    color: '#fff',
    position: 'fixed',
    top: 'calc(50% - 240px)',
    width: '13%',
    "&:hover": {
      backgroundColor: '#b50202'
    }
  },
  buttonUpdateCRM: {
    position: 'fixed',
    top: 'calc(50% - 160px)',
    width: '13%',
    minWidth: '130px',
    backgroundColor: '#D5F3FE',
    color: '#53B2ED',
    borderRadius: 10,
    fontWeight: 'bold',
    margin: 5,
    '&:hover': {
      backgroundColor: infoColor[2],
      color: '#fff'
    },
  },
  buttonUpdateStakeholders:{
    position: 'fixed',
    top: 'calc(50% - 80px)',
    width: '13%',
    minWidth: '130px',
    backgroundColor: '#D5F3FE',
    color: '#53B2ED',
    borderRadius: 10,
    fontWeight: 'bold',
    margin: 5,
    '&:hover': {
      backgroundColor: infoColor[2],
      color: '#fff'
    },
  },
  buttonEditContract: {
    position: 'fixed',
    top: 'calc(50%)',
    width: '13%',
    minWidth: '130px',
    backgroundColor: '#D5F3FE',
    color: '#53B2ED',
    borderRadius: 10,
    fontWeight: 'bold',
    margin: 5,
    '&:hover': {
      backgroundColor: infoColor[2],
      color: '#fff'
    },
  },
  buttonEdit: {
    position: 'fixed',
    top: 'calc(50% + 80px)',
    width: '13%',
    minWidth: '130px',
    backgroundColor: '#D5F3FE',
    color: '#53B2ED',
    borderRadius: 10,
    fontWeight: 'bold',
    margin: 5,
    '&:hover': {
      backgroundColor: infoColor[2],
      color: '#fff'
    },
  },
  buttonRegenerate: {
    position: 'fixed',
    top: 'calc(50% + 160px)',
    width: '13%',
    minWidth: '130px'
  },
  buttonSendToStiply: {
    position: 'fixed',
    top: 'calc(50% + 240px)',
    width: '13%',
    minWidth: '130px'
  },
  buttonUploadSignedDoc: {
    position: 'fixed',
    top: 'calc(50% + 320px)',
    width: '13%',
    minWidth: '130px'
  },
  connectSignedContractBtn: {
    width: '13%',
    minWidth: '130px'
  },
  uploadBtn: {
    backgroundColor: infoColor[0],
  },
  buttonLoader: {
    color: '#fff',
  },
  smallBox: {
    paddingRight: '20px',
    width: '25%',
    paddingTop: '20px'
  },
  flexContainer: { display: 'flex' },
  inputProp: {
    fontSize: '12px',
    height: '40px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "15.08px",
    weight: 400
  },
  menuItem: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
  },
  inputLabel: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "7.77px",
    weight: 400
  },
});

export default style;