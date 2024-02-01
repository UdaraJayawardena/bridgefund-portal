
const customTabsStyle = {
  cardTitle: {
    float: "left",
    padding: "10px 10px 10px 0px",
    lineHeight: "24px"
  },
  cardTitleRTL: {
    float: "right",
    padding: "10px 0px 10px 10px !important"
  },
  displayNone: {
    display: "none !important"
  },
  tabsRoot: {
    minHeight: "unset !important",
    overflowX: "visible",
    "& $tabRootButton": {
      fontSize: "0.875rem"
    }
  },
  tabRootButton: {
    minHeight: "unset !important",
    minWidth: "unset !important",
    width: "unset !important",
    height: "unset !important",
    maxWidth: "unset !important",
    maxHeight: "unset !important",
    padding: "8px 15px",
    borderRadius: "5px 5px 0 0",
    lineHeight: "24px",
    borderBottom: "2px #eeeeee61 outset",
    background: "#FFF",
    opacity: "unset",
    color: "#7f8395",
    marginLeft: "10px",
  },
  tabLabelContainer: {
    padding: "0px"
  },
  tabLabel: {
    fontWeight: "500",
    fontSize: "12px"
  },
  tabSelected: {
    borderBottom: "2px #FFF solid"
  },
  tabWrapper: {
    display: "inline-block",
    minHeight: "unset !important",
    minWidth: "unset !important",
    width: "unset !important",
    height: "unset !important",
    maxWidth: "unset !important",
    maxHeight: "unset !important",
    "& > svg,& > .material-icons": {
      verticalAlign: "middle",
      margin: "-1px 5px 0 0"
    }
  },
  tabsCardHeader: {
    marginTop: "-55px"
  },
  tabsCard: {
    marginTop: "55px"
  },
  tabHeaderContainer: {
    // background: "red"
  }
};

export default customTabsStyle;
