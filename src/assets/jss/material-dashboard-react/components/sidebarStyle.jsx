import {
  drawerWidth,
  drawerWidthHidden,
  // transition,
  boxShadow,
  defaultFont,
  primaryColor,
  primaryBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  grayColor,
  blackColor,
  // darkPurple,
  hexToRgb
} from "assets/jss/material-dashboard-react.jsx";
import { createStyles } from "@material-ui/core";

const sidebarStyle = theme => createStyles({
  drawerPaper: {
    border: "none",
    position: "fixed",
    top: "0",
    bottom: "0",
    left: "0",
    zIndex: 1,
    ...boxShadow,
    width: drawerWidth,
    backgroundColor: '#2B3841',
    '&::-webkit-scrollbar': {
      width: 9
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#2B3841'
    },
    '&::-webkit-scrollbar-track:hover': {
      backgroundColor: '#babac0'
    },
    /* scrollbar itself */
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#babac0',
      borderRadius: 16,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#a0a0a5',
    },
    /* set button(top and bottom of the scrollbar) */
    '&::-webkit-scrollbar-button': {
      display: 'none'
    }

    // [theme.breakpoints.up("md")]: {
    //   width: drawerWidth,
    //   position: "fixed",
    //   height: "100%"
    // },
    // [theme.breakpoints.down("sm")]: {
    //   width: drawerWidth,
    //   ...boxShadow,
    //   position: "fixed",
    //   display: "block",
    //   top: "0",
    //   height: "100vh",
    //   right: "0",
    //   left: "auto",
    //   zIndex: "1032",
    //   visibility: "visible",
    //   overflowY: "visible",
    //   borderTop: "none",
    //   textAlign: "left",
    //   paddingRight: "0px",
    //   paddingLeft: "0",
    //   transform: `translate3d(${drawerWidth}px, 0, 0)`,
    //   ...transition
    // }
  },
  drawerPaperRTL: {
    // [theme.breakpoints.up("md")]: {
    left: "auto !important",
    right: "0 !important"
    // },
    // [theme.breakpoints.down("sm")]: {
    //   left: "0  !important",
    //   right: "auto !important"
    // }
  },
  logo: {
    position: "relative",
    padding: "15px 15px",
    margin: "10px 15px 10px 0",
    zIndex: 4,
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: "0",

      height: "1px",
      right: "15px",
      width: "calc(100% - 30px)",
      backgroundColor: "rgba(" + hexToRgb(grayColor[6]) + ", 0.3)"
    }
  },
  logoLink: {
    ...defaultFont,
    textTransform: "uppercase",
    padding: "5px 0",
    display: "block",
    fontSize: "18px",
    textAlign: "left",
    fontWeight: 400,
    lineHeight: "30px",
    textDecoration: "none",
    backgroundColor: "transparent",
    "&,&:hover": {
      color: whiteColor
    }
  },
  logoLinkRTL: {
    textAlign: "right"
  },
  logoImage: {
    width: "30px",
    display: "inline-block",
    maxHeight: "30px",
    marginLeft: "10px",
    marginRight: "15px"
  },
  img: {
    width: "35px",
    top: "22px",
    position: "absolute",
    verticalAlign: "middle",
    border: "0"
  },
  background: {
    position: "absolute",
    zIndex: 1,
    height: "100%",
    width: "100%",
    display: "block",
    top: "0",
    left: "0",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    "&:after": {
      position: "absolute",
      zIndex: "3",
      width: "100%",
      height: "100%",
      content: '""',
      display: "block",
      background: '#27323A',
      // background: blackColor,
      opacity: ".8"
    }
  },
  list: {
    marginTop: "20px",
    paddingLeft: "0",
    paddingTop: "0",
    paddingBottom: "0",
    marginBottom: "0",
    listStyle: "none",
    position: "unset"
  },
  item: {
    position: "relative",
    display: "block",
    textDecoration: "none",
    "&:hover,&:focus,&:visited,&": {
      color: whiteColor
    }
  },
  itemLink: {
    width: "auto",
    transition: "all 300ms linear",
    margin: "10px 0px 0 0",
    borderRadius: "3px",
    position: "relative",
    // display: "block",
    padding: "10px 15px",
    backgroundColor: "transparent",
    ...JSON.parse(JSON.stringify(defaultFont))
  },
  itemLinkCollapsed: {
    transition: "all 0.5s ease-out",
    height: 50
  },
  itemIcon: {
    width: "24px",
    height: "30px",
    fontSize: "24px",
    lineHeight: "30px",
    float: "left",
    marginRight: "15px",
    textAlign: "center",
    verticalAlign: "middle",
    color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)"
  },
  itemIconRTL: {
    marginRight: "3px",
    marginLeft: "15px",
    float: "right"
  },
  itemText: {
    // paddingLeft: "40px",
    ...JSON.parse(JSON.stringify(defaultFont)),
    margin: "0",
    // lineHeight: "30px",
    fontSize: "14px",
    color: whiteColor
  },
  itemTextRTL: {
    textAlign: "right"
  },
  whiteFont: {
    color: whiteColor
  },
  purple: {
    backgroundColor: primaryColor[0],
    ...primaryBoxShadow,
    "&:hover": {
      backgroundColor: primaryColor[0],
      ...primaryBoxShadow
    }
  },
  blue: {
    backgroundColor: infoColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(infoColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(infoColor[0]) +
      ",.2)",
    "&:hover": {
      backgroundColor: infoColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(infoColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(infoColor[0]) +
        ",.2)"
    },
    borderRadius: "50px 0px 0px 50px"
  },
  green: {
    backgroundColor: successColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(successColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(successColor[0]) +
      ",.2)",
    "&:hover": {
      backgroundColor: successColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(successColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(successColor[0]) +
        ",.2)"
    }
  },
  orange: {
    backgroundColor: warningColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(warningColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(warningColor[0]) +
      ",.2)",
    "&:hover": {
      backgroundColor: warningColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.2)"
    }
  },
  red: {
    backgroundColor: dangerColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(dangerColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(dangerColor[0]) +
      ",.2)",
    "&:hover": {
      backgroundColor: dangerColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.2)"
    }
  },
  sidebarWrapper: {
    position: "relative",
    // height: "calc(100vh - 75px)",
    overflow: "auto",
    width: "260px",
    zIndex: 4,
    overflowScrolling: "touch",
    backgroundColor: '#2B3841'
  },
  activePro: {
    // [theme.breakpoints.up("md")]: {
    position: "absolute",
    width: "100%",
    bottom: "13px"
    // }
  },
  //================
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    overflowX: 'hidden',
    // transition: theme.transitions.create('width', {
    //   easing: theme.transitions.easing.sharp,
    //   duration: theme.transitions.duration.enteringScreen,
    // }),
    transition: "all 0.5s ease-out",

  },
  drawerClose: {
    // transition: theme.transitions.create('width', {
    //   easing: theme.transitions.easing.sharp,
    //   duration: theme.transitions.duration.leavingScreen,
    // }),
    overflowX: 'hidden',
    width: drawerWidthHidden,
    transition: "all 0.5s ease-out",
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  intendSubRoutes: {
    paddingLeft: 10,
    transition: "all 0.5s ease-out",
  },
  subRoutes: {
    paddingLeft: 0,
    transition: "all 0.5s ease-out",
  },
  routesExpandBtn: {
    backgroundColor: '#fff',
    borderRadius: '50%'
  },
  openGroups: {
    backgroundColor: 'rgb(0 0 0 / 18%)'
  }
});

export default sidebarStyle;
