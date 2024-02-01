import {
  drawerWidth,
  drawerWidthHidden,
  container
} from "assets/jss/material-dashboard-react.jsx";
import { createStyles } from '@material-ui/styles';

const appStyle = theme => createStyles({
  wrapper: {
    position: "relative",
    top: "0",
    height: "90vh"
  },
  pad: {
    height: 56,
    [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
      height: 48
    },
    [theme.breakpoints.up("sm")]: {
      height: 64
    }
  },
  mainPanel: {
    width: `calc(100% - ${drawerWidthHidden}px)`,
    overflow: "auto",
    position: "relative",
    float: "right",
    transition: "all 0.5s ease-out",
    maxHeight: "fit-content",
    overflowScrolling: "touch"
  },
  mainPanelSmall: {
    width: `calc(100% - ${drawerWidth}px)`
  },
  content: {
    // marginTop: "42px",
    padding: "30px 15px",
    minHeight: "calc(100vh - 170px)",
    backgroundColor: '#fff'
  },
  container,
  map: {
    marginTop: "70px"
  },
  expandButton: {
    border: "2px solid black",
    borderRadius: "50%",
    position: "fixed",
    zIndex: 2,
    left: "40px",
    top: "90px",
    background: "#eee",
    minWidth: 0,
    padding: 0,
    width: "30px",
    height: "30px",
    transition: "all 0.5s ease-out",

    '&:hover': {
      background: "#eee",
    }
  },
  collapseButton: {
    border: "2px solid black",
    borderRadius: "50%",
    position: "fixed",
    zIndex: 2,
    // left: "245px",
    left: "40px",
    top: "90px",
    background: "#eee",
    minWidth: 0,
    padding: 0,
    width: "30px",
    height: "30px",
    transition: "all 0.5s ease-out",
    transform: "translateX(205px) rotate(180deg)",

    '&:hover': {
      background: "#eee",
    }
  }
});

export default appStyle;
