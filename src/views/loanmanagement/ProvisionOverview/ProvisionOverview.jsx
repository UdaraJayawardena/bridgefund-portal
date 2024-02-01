import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Table, TableBody, TableCell, TableHead, TableRow, createStyles, ExpansionPanelSummary,
  ExpansionPanelDetails,
  TableContainer,
  Button, FormControl
} from "@material-ui/core";
import {  InputLabel, Select, MenuItem, TextField} from '@material-ui/core';
import Paper from "@material-ui/core/Paper";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { connect } from "react-redux";
import moment from "moment";
import qs from "querystring";
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';
import { getAllProvisionDetails, updateProvisionPercentage, getDefaultLoanProvisionDetails } from 'store/loanmanagement/actions/ProvisionOverview';
import { getFieldNameValues} from "store/initiation/actions/Configuration.action";
import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import Notifier from "components/loanmanagement/Notification/Notifier";
import Utility, { createUrl } from "lib/loanmanagement/utility";
import Input from "@material-ui/core/Input/Input";
import Link from "@material-ui/core/Link/Link";

import Drawer from '@material-ui/core/Drawer';

// import { Link } from 'react-router-dom';

import TableHeaderCellForSorting from "./TableHeaderCellForSorting";
import ENV from '../../../config/env';

import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import ProvisionLoansTable from './ProvisionLoansTable';
import history from "./../../../history";
import { setNavigationInDashboards } from "store/initiation/actions/login";
import { changeCustomerDetails, clearHeaderDisplaySubData } from "store/loanmanagement/actions/HeaderNavigation";
import { getLocales } from "store/initiation/actions/Configuration.action";

import Cookies from 'universal-cookie';

const cookies = new Cookies();

const currency = Utility.currencyConverter();
const CURRENCY = Utility.multiCurrencyConverter();
const currencyPercentage = Utility.multiCurrencyPercentage;

/*** sort functionality */
function desc(a, b, orderBy) {

  let value1 = a[orderBy];
  let value2 = b[orderBy];

  // If the orderBy field contains a dot, we should sort by a field one lever deeper
  if (orderBy.match(/\./)) {
    const splitKeys = orderBy.split('.');

    value1 = a[splitKeys[0]][splitKeys[1]];
    value2 = b[splitKeys[0]][splitKeys[1]];
  }

  if (typeof value1 === 'string' && typeof value2 === 'string') {
    value1 = value1.toLowerCase();
    value2 = value2.toLowerCase();
  }

  if (value2 < value1) {
    return -1;
  }
  if (value2 > value1) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const styles = createStyles({
  root: {
    width: "100%",
    overflowX: "auto"
  },

  normalDiv: {
    display: "grid"
  },

  normalDivRight: {
    width: "27%",
    display: "grid",
    textAlign: "right"
  },

  mainDiv: {

    display: "flex"

  },

  table: {
    width: '100vw'
  },

  span: {
    marginLeft: "5%"
  },

  head: {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    width: "20px",
    padding: '0px 1px 0px 5px'
  },

  tableMain: {
    display: "flex",
    overflowY: "scroll",
    maxHeight: "300px",
    width: "auto"
  },

  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "2%",
    minHeight: "auto",
    fontWeight: 300,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  },

  button: {
    backgroundColor: 'rgb(233, 30, 99)',
    borderRadius: '14.2em',
    border: '0',
    color: 'white',
    width: 'auto',
    padding: '0.6vw'
  },

  cell: {
    display: 'table-cell',
    borderBottom: '1 solid',
    verticalAlign: 'inherit',
    padding: '0px 1px 0px 5px'
  },
});

class ProvisionOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editProvision: new Map(),
      selectedDate: moment().add(-1, 'days').format('YYYY-MM-DD'),

      top: false,
      left: false,
      bottom: false,
      right: false,
      selectedProvision: [],
      sortings: {
        Normal: {
          order: 'desc',
          orderBy: 'totalOverduePercentage',
        },
        Severe: {
          order: 'desc',
          orderBy: 'totalOverduePercentage',
        },
        Extended: {
          order: 'desc',
          orderBy: 'totalOverduePercentage',
        },
        Tailored: {
          order: 'desc',
          orderBy: 'totalOverduePercentage',
        },
        Default: {
          order: 'desc',
          orderBy: 'totalOverduePercentage',
        }

      },
      countries: [],
      selectedCountry: 'ALL',
      locale: 'nl-NL',
      currencyCode: "EUR"
    };
  }


  handleEditProvisionButton = (i, provision) => {

    if (this.state.editProvision.get(i)) {

      const updateProvision = {
        _id: provision._id,
        provisionPercentage: provision.provisionPercentage,
        totalLoanAmount: provision.totalLoanAmount

      };

      if (provision.ProvisionUpdated) {

        this.props.updateProvisions(updateProvision);
      }

    }

    this.state.editProvision.get(i) ? this.state.editProvision.set(i, false) : this.state.editProvision.set(i, true);

    this.setState({ editProvision: this.state.editProvision });

  };

  getFieldNameValues = () => {

    const requestObjs = [{
      fieldName: 'country'
    }];

    for (let i = 0; i < requestObjs.length; i++) {
      this.props.getFieldNameValues(requestObjs[i])
        .then((response) => {
          if (Array.isArray(response)) {
            if (response.length > 0) {
              const fieldNameValues = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES')
                .map(fieldNameValue => fieldNameValue.fieldNameValue);
              if (requestObjs[i].fieldName == 'country') this.setState({ countries: fieldNameValues });
             

            }
          }

        });
    }
  }

  getLocales = async () => {
        const country  = this.state.selectedCountry=='ALL'?'NL':this.state.selectedCountry;
      
        this.props.getLocales({ countryCode: country })
          .then(res => {
            if (!res || res.length == 0) {
              return this.props.displayNotification('Invalid Country', 'warning');
            }
          
            this.setState({
              locale: res[0].locale,
              currencyCode: res[0].currencyCode
            });
          })
          .catch(err => { console.log('getLocales err ', err); });
    
       }

   handleChangeCountry = event => {
      this.setState({ selectedCountry: event.target.value }, function () {
        this.props.getAllProvisions(this.state.selectedDate, this.state.selectedCountry);
        this.props.getDefaultLoanProvisionDetails(this.state.selectedDate, this.state.selectedCountry);
           this.getLocales();
        });
      };

  handleDatePickers = date => {
    const value = moment(date).format('YYYY-MM-DD');
    if (moment(value).isValid()) {
      this.setState({ selectedDate: value });
      this.props.getAllProvisions(value, this.state.selectedCountry);
      this.props.getDefaultLoanProvisionDetails(value, this.state.selectedCountry);
    }
  }

  componentDidMount() {
    this.props.clearHeaderDisplaySubData();
    this.props.getAllProvisions(this.state.selectedDate, this.state.selectedCountry);
    this.props.getDefaultLoanProvisionDetails(this.state.selectedDate, this.state.selectedCountry);
    this.getFieldNameValues();
  }

  toggleDrawer = (provisionType, container, side, open) => {

    let selectedProvisionType, selectedProvision = [];
    switch (provisionType) {
      case 'Normal':
        selectedProvisionType = this.props.provisions.filter(provison => provison.provisionType === 'Normal');
        break;
      case 'Severe':
        selectedProvisionType = this.props.provisions.filter(provison => provison.provisionType === 'Severe');
        break;
      case 'Extended':
        selectedProvisionType = this.props.provisions.filter(provison => provison.provisionType === 'Extended');
        break;
      default:
        break;
    }

    selectedProvision = selectedProvisionType[0].provisions.filter(provison => provison._id === container);
    this.setState({
      bottom: open,
      selectedProvision: selectedProvision
    });
  };

  handleRequestSort = (provisionType, property) => {

    const orderBy = property;
    let order = 'desc';

    if (this.state.sortings[provisionType].orderBy === property &&
      this.state.sortings[provisionType].order === 'desc') {

      order = 'asc';
    }

    const newSortings = Object.assign({}, this.state.sortings);
    newSortings[provisionType] = {
      orderBy,
      order
    };

    this.setState({ sortings: newSortings });
  };

  handleNavigate = (url) => {
    return createUrl(ENV.LM_PORTAL_URL)(`${url}`);
  };

  redirectToSMEO= (sme) => { 
    this.props.changeCustomerDetails(sme);
    this.props.setNavigationInDashboards('Overview')
    .then(res => {
      if (res) {
        history.push(res);
        }
    });
  }

  getLinkOrButttonForSME = (sme) => {
    const { isDashboardContent } = this.props;
    return isDashboardContent ?
      <Button size="small" color="primary" onClick={() => this.redirectToSMEO(sme)}>{sme.company}</Button>
      :
      <Link href={this.handleNavigate(`/user/smeProfile/${sme.id}`)} target="_blank">{sme.company}</Link>;
  }

  render() {

    const {
      classes,
      provisions,
      // tableHeaderColor,
      loanInDefaultProvisions,
      defaultSettledProvisions,
    } = this.props;

    const {
      selectedProvision,
      sortings,
      locale,
      currencyCode
    } = this.state;
  
    let normalProvisionData = {};
    let extendedProvisionData = {};
    let severeProvisionData = {};
    let tailoredProvisionData = {};
    // let defaultProvisionData = {};
    let totalProvisionAmount = 0;

    provisions.forEach(provision => {

      totalProvisionAmount += provision.provisionAmount;

      if (provision.provisionType === "Normal") {

        normalProvisionData = provision;

      }

      if (provision.provisionType === "Extended") {

        extendedProvisionData = provision;
      }

      if (provision.provisionType === "Severe") {

        severeProvisionData = provision;
      }

      if (provision.provisionType === "Tailored") {

        tailoredProvisionData = provision;
      }

      // if (provision.provisionType === "Default") {

      //   defaultProvisionData = provision;
      // }


    });

    const changeProvisionPercentageInNormal = (i, value) => {

      normalProvisionData.provisions[i].provisionPercentage = value;

      normalProvisionData.provisions[i].ProvisionUpdated = true;
    };

    const changeProvisionPercentageInExtended = (i, value) => {

      extendedProvisionData.provisions[i].provisionPercentage = value;

      extendedProvisionData.provisions[i].ProvisionUpdated = true;
    };

    const changeProvisionPercentageInSevere = (i, value) => {

      severeProvisionData.provisions[i].provisionPercentage = value;

      severeProvisionData.provisions[i].ProvisionUpdated = true;
    };

    const changeProvisionPercentageInTailored = (i, value) => {

      tailoredProvisionData.provisions[i].provisionPercentage = value;

      tailoredProvisionData.provisions[i].ProvisionUpdated = true;
    };

    return (
      <div>
        <Notifier />
        <Card>
          <CardHeader color="info">
            <div style={{ width: '100%', display: 'flex' }}>
              <h3 className={classes.cardTitleWhite} style={{ width: '60%' }}>Provision Overview Per {moment(this.state.selectedDate).format('DD-MM-YYYY')}</h3>


              <GridContainer>
							<GridItem xs={12} sm={6} md={6} className={classes.smallBox}>
              <FormControl fullWidth>
              <InputLabel htmlFor="mandate-selcetor">Country</InputLabel>
              <Select
                value={this.state.selectedCountry}

                onChange={this.handleChangeCountry}
                className={classes.inputFields}
              >
                <MenuItem value="ALL">
                  <em>ALL</em>
                </MenuItem>
                {this.state.countries?.map((country, index) =>
                  <MenuItem key={index} value={country}>{country}</MenuItem>
                )}
              </Select>
            </FormControl>
								{/* <CustomInputBox
									type='dropdown'
									id='Status'
									label='Bank Account'
									onChange={(event, newValue) => {
										if (newValue) {
											this.setState({ selectedBankAccount: newValue });
											this.props.getAllBankTransactions(this.state.transactionDate, this.state.selectedStatus, newValue);
										}
									}}
									 dropDownValues={Object.keys(this.state.countries).map(country, key => { return { key: key, value: {country} }; })}
									isNoneInDropDownList={false}
								/> */}
							</GridItem>
						
							<GridItem xs={12} sm={6} md={6}className={classes.smallBox}>
							<FormControl size="small" variant="outlined" className={classes.searchBox} style= {{marginTop: '19px'}}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    id="collection-start-date"
                    name="startDate"
                    autoOk
                    variant="inline"
                    inputVariant="outlined"
                    label="Change Date"
                    format="DD-MM-YYYY"
                    value={this.state.selectedDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={date => this.handleDatePickers(date)}
                  />
                </MuiPickersUtilsProvider>
							</FormControl>
							</GridItem>
						</GridContainer>



              {/* <div style={{ display: 'flex', marginTop: '1%' }}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    id="collection-start-date"
                    name="startDate"
                    autoOk
                    variant="inline"
                    inputVariant="outlined"
                    label="Change Date"
                    format="DD-MM-YYYY"
                    value={this.state.selectedDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={date => this.handleDatePickers(date)}
                  />
                </MuiPickersUtilsProvider>
              </div> */}

            </div>



            <h5>Total Provision  {CURRENCY(totalProvisionAmount, locale, currencyCode)}</h5>
          </CardHeader>

          <CardBody>



            {provisions.length === 0 && defaultSettledProvisions.loanList.length === 0 && loanInDefaultProvisions.loanList.length === 0 ?
              <h2 style={{ textAlign: 'center' }}>No data to show on the selected date...!</h2>
              :

              <>
                {/*Normal provision part*/}
                {
                  Object.keys(normalProvisionData).length > 0 ?

                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>

                        <div className={classes.root}>
                          <h4>Normal Provision</h4>
                          <div className={classes.mainDiv}>

                            <div className={classes.normalDiv}>
                              <span>Percentage</span>
                              <span>Provision</span>
                              <span>Number of Outstanding Loans</span>
                              <span>Total Loan</span>
                              <span>Outstanding</span>
                              <span>Overdue</span>
                              <span>% Overdue</span>
                            </div>

                            <div className={classes.normalDivRight}>
                              <span className={classes.normalDiv}>{currencyPercentage(normalProvisionData.provisionPercentage, locale)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(normalProvisionData.provisionAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{normalProvisionData.numberOfLoans}</span>
                              <span className={classes.normalDiv}>{CURRENCY(normalProvisionData.totalLoanAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(normalProvisionData.overallOutstandingTotalAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(normalProvisionData.overallTotalOverdueAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{currencyPercentage(normalProvisionData.averageOverallTotalOverduePercentage.toFixed(2), locale)}</span>
                            </div>

                          </div>

                        </div>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                      <TableContainer component={Paper} className={classes.tableContainer}>
                        {/* <Paper className={classes.tableMain}> */}
                          <Table className={classes.table}>
                            <TableHead>
                              <TableRow>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  align="left"
                                  provisionType="Normal"
                                  column="sme.company"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  SME Name
                            </TableHeaderCellForSorting>

                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="totalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Total Loan
                            </TableHeaderCellForSorting>

                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="outstandingTotalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="outstandingPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="totalOverdueAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="totalOverduePercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="provisionAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision Amount
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  provisionType="Normal"
                                  column="provisionPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision %
                            </TableHeaderCellForSorting>

                                <TableCell align="right" className={classes.head}></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>

                              {stableSort(normalProvisionData.provisions,
                                getSorting(sortings['Normal'].order, sortings['Normal'].orderBy))
                                .map((provision, i) => {
                                  return (
                                    <TableRow key={provision._id}>
                                      {/* <TableCell className={classes.cell}>{provision.customer.company}</TableCell> */}
                                      {/* eslint-disable-next-line react/jsx-no-target-blank */}
                                      <TableCell className={classes.cell}> 
                                        {this.getLinkOrButttonForSME(provision.sme)}
                                      </TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.totalLoanAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{currencyPercentage(provision.overallOutstandingPercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{currencyPercentage(provision.overallTotalOverduePercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.provisionAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">
                                        {
                                          this.state.editProvision.get(provision._id) ?
                                            <Input type='number' name="editProvision" id="changeProvision" style={{ fontWeight: 100, fontSize: 14, width: '2vw' }}
                                              onChange={(e) => changeProvisionPercentageInNormal(i, e.target.value)}
                                            /> :
                                            provision.provisionPercentage + '%'

                                        }
                                      </TableCell>
                                      <TableCell className={classes.cell} align="right" style={{ width: '2%' }}>
                                        <button className={classes.button}
                                          onClick={this.toggleDrawer.bind(this, 'Normal', provision._id, 'bottom', true)}
                                        >{'Display'}</button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}

                            </TableBody>
                          </Table>
                          </TableContainer>
                        {/* </Paper> */}
                      </ExpansionPanelDetails>
                    </ExpansionPanel> :

                    false
                }

                {/*Extended provision part*/}
                {
                  Object.keys(extendedProvisionData).length > 0 ?

                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>

                        <div className={classes.root}>
                          <h4>Extended Provision</h4>
                          <div className={classes.mainDiv}>

                            <div className={classes.normalDiv}>
                              <span>Percentage</span>
                              <span>Provision</span>
                              <span>Number of Outstanding Loans</span>
                              <span>Total Loan</span>
                              <span>Outstanding</span>
                              <span>Overdue</span>
                              <span>% Overdue</span>
                            </div>

                            <div className={classes.normalDivRight}>
                              <span className={classes.normalDiv}>{currencyPercentage(extendedProvisionData.provisionPercentage, locale)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(extendedProvisionData.provisionAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{extendedProvisionData.numberOfLoans}</span>
                              <span className={classes.normalDiv}>{CURRENCY(extendedProvisionData.totalLoanAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(extendedProvisionData.overallOutstandingTotalAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(extendedProvisionData.overallTotalOverdueAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{currencyPercentage(extendedProvisionData.averageOverallTotalOverduePercentage.toFixed(2), locale)}</span>
                            </div>

                          </div>

                        </div>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        {/* <Paper className={classes.tableMain}> */}
                        <TableContainer component={Paper} className={classes.tableContainer}>
                          <Table className={classes.table}>
                            <TableHead>
                              <TableRow>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  align="left"
                                  provisionType="Extended"
                                  column="sme.company"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  SME Name
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="totalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Total Loan
                            </TableHeaderCellForSorting>

                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="outstandingTotalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="outstandingPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="totalOverdueAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="totalOverduePercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="provisionAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision Amount
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Extended} classes={classes}
                                  provisionType="Extended"
                                  column="provisionPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision %
                            </TableHeaderCellForSorting>
                                <TableCell align="right" className={classes.head}></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>

                              {stableSort(extendedProvisionData.provisions,
                                getSorting(sortings['Extended'].order, sortings['Extended'].orderBy))
                                .map((provision, i) => {
                                  return (
                                    <TableRow key={provision._id}>
                                      {/* <TableCell className={classes.cell}>{provision.customer.company}</TableCell> */}
                                      {/* eslint-disable-next-line react/jsx-no-target-blank */}
                                      <TableCell className={classes.cell}>
                                      {this.getLinkOrButttonForSME(provision.sme)}
                                      </TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.totalLoanAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{currencyPercentage(provision.overallOutstandingPercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{currencyPercentage(provision.overallTotalOverduePercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.provisionAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">
                                        {
                                          this.state.editProvision.get(provision._id) ?
                                            <Input type='number' name="editProvision" id="changeProvision" style={{ fontWeight: 100, fontSize: 14, width: '2vw' }}
                                              onChange={(e) => changeProvisionPercentageInExtended(i, e.target.value)} /> :
                                            provision.provisionPercentage + '%'

                                        }
                                      </TableCell>
                                      {/* <TableCell align="right" style={{ width: '2%' }}>
                                  <button className={classes.button}
                                    onClick={(e) => this.handleEditProvisionButton(provision._id, provision, e)}>
                                    {this.state.editProvision.get(provision._id) ? 'Save' : 'Change'}</button>
                                </TableCell> */}
                                      <TableCell className={classes.cell} align="right" style={{ width: '2%' }}>
                                        <button className={classes.button}
                                          onClick={this.toggleDrawer.bind(this, 'Extended', provision._id, 'bottom', true)}
                                        >{'Display'}</button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}

                            </TableBody>
                          </Table>
                         </TableContainer>
                        {/* </Paper> */}
                      </ExpansionPanelDetails>
                    </ExpansionPanel> :

                    false
                }

                {/*severe provision part*/}
                {
                  Object.keys(severeProvisionData).length > 0 ?

                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>

                        <div className={classes.root}>
                          <h4>Severe Provision</h4>
                          <div className={classes.mainDiv}>

                            <div className={classes.normalDiv}>
                              <span>Percentage</span>
                              <span>Provision</span>
                              <span>Number of Outstanding Loans</span>
                              <span>Total Loan</span>
                              <span>Outstanding</span>
                              <span>Overdue</span>
                              <span>% Overdue</span>
                            </div>


                            <div className={classes.normalDivRight}>
                              <span className={classes.normalDiv}>{currencyPercentage(severeProvisionData.provisionPercentage, locale)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(severeProvisionData.provisionAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{severeProvisionData.numberOfLoans}</span>
                              <span className={classes.normalDiv}>{CURRENCY(severeProvisionData.totalLoanAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(severeProvisionData.overallOutstandingTotalAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(severeProvisionData.overallTotalOverdueAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{currencyPercentage(severeProvisionData.averageOverallTotalOverduePercentage.toFixed(2), locale)}</span>
                            </div>

                          </div>

                        </div>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        {/* <Paper className={classes.tableMain}> */}
                        <TableContainer component={Paper} className={classes.tableContainer}>
                          <Table className={classes.table}>
                            <TableHead>
                              <TableRow>
                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  align="left"
                                  provisionType="Severe"
                                  column="sme.company"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  SME Name
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="totalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Total Loan
                            </TableHeaderCellForSorting>

                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="outstandingTotalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="outstandingPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="totalOverdueAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="totalOverduePercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="provisionAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision Amount
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Severe} classes={classes}
                                  provisionType="Severe"
                                  column="provisionPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision %
                            </TableHeaderCellForSorting>
                                <TableCell align="right" className={classes.head}></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>

                              {stableSort(severeProvisionData.provisions,
                                getSorting(sortings['Severe'].order, sortings['Severe'].orderBy))
                                .map((provision, i) => {
                                  return (
                                    <TableRow key={provision._id}>
                                      {/* <TableCell className={classes.cell}>{provision.customer.company}</TableCell> */}
                                      {/* eslint-disable-next-line react/jsx-no-target-blank */}
                                      <TableCell className={classes.cell}>
                                      {this.getLinkOrButttonForSME(provision.sme)}
                                      </TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.totalLoanAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{currencyPercentage(provision.overallOutstandingPercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{currencyPercentage(provision.overallTotalOverduePercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell className={classes.cell} align="right">{CURRENCY(provision.provisionAmount, locale, currencyCode)}</TableCell>
                                      <TableCell className={classes.cell} align="right">
                                        {
                                          this.state.editProvision.get(provision._id) ?
                                            <Input type='number' name="editProvision" id="changeProvision" style={{ fontWeight: 100, fontSize: 14, width: '2vw' }}
                                              onChange={(e) => changeProvisionPercentageInSevere(i, e.target.value)}
                                            /> :
                                            provision.provisionPercentage + '%'

                                        }
                                      </TableCell>
                                      {/* <TableCell align="right" style={{ width: '2%' }}>
                                  <button className={classes.button}
                                    onClick={(e) => this.handleEditProvisionButton(provision._id, provision, e)}
                                  >{this.state.editProvision.get(provision._id) ? 'Save' : 'Change'}</button>
                                </TableCell> */}
                                      <TableCell align="right" style={{ width: '2%' }}>
                                        <button className={classes.button}
                                          onClick={this.toggleDrawer.bind(this, 'Severe', provision._id, 'bottom', true)}
                                        >{'Display'}</button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}

                            </TableBody>
                          </Table>
                        {/* </Paper> */}
                       </TableContainer>
                      </ExpansionPanelDetails>
                    </ExpansionPanel> :

                    false
                }

                {/*Tailored provision part*/}
                {
                  Object.keys(tailoredProvisionData).length > 0 ?

                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>

                        <div className={classes.root}>
                          <h4>Tailored Provision</h4>
                          <div className={classes.mainDiv}>

                            <div className={classes.normalDiv}>
                              {/*<span>Percentage</span>*/}
                              <span>Provision</span>
                              <span>Number of Outstanding Loans</span>
                              <span>Total Loan</span>
                              <span>Outstanding</span>
                              <span>Overdue</span>
                              <span>% Overdue</span>
                            </div>


                            <div className={classes.normalDivRight}>
                              {/*<span className={classes.normalDiv}>{tailoredProvisionData.provisionPercentage}%</span>*/}
                              <span className={classes.normalDiv}>{CURRENCY(tailoredProvisionData.provisionAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{tailoredProvisionData.numberOfLoans}</span>
                              <span className={classes.normalDiv}>{CURRENCY(tailoredProvisionData.totalLoanAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(tailoredProvisionData.overallOutstandingTotalAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(tailoredProvisionData.overallTotalOverdueAmount, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{currencyPercentage(tailoredProvisionData.averageOverallTotalOverduePercentage.toFixed(2), locale)}</span>
                            </div>

                          </div>

                        </div>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        {/* <Paper className={classes.tableMain}> */}
                        <TableContainer component={Paper} className={classes.tableContainer}>
                          <Table className={classes.table}>
                            <TableHead>
                              <TableRow>

                                <TableHeaderCellForSorting sorting={sortings.Normal} classes={classes}
                                  align="left"
                                  provisionType="Tailored"
                                  column="sme.company"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  SME Name
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="totalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Total Loan
                            </TableHeaderCellForSorting>

                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="outstandingTotalLoanAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="outstandingPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Outstanding %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="totalOverdueAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="totalOverduePercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Overdue %
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="provisionAmount"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision Amount
                            </TableHeaderCellForSorting>
                                <TableHeaderCellForSorting sorting={sortings.Tailored} classes={classes}
                                  provisionType="Tailored"
                                  column="provisionPercentage"
                                  sortingHandler={this.handleRequestSort.bind(this)}>
                                  Provision %
                            </TableHeaderCellForSorting>
                                <TableCell align="right" className={classes.head}></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>

                              {stableSort(tailoredProvisionData.provisions,
                                getSorting(sortings['Tailored'].order, sortings['Tailored'].orderBy))
                                .map((provision, i) => {
                                  return (
                                    <TableRow key={provision._id}>
                                      {/* <TableCell>{provision.customer.company}</TableCell> */}
                                      {/* eslint-disable-next-line react/jsx-no-target-blank */}
                                      <TableCell className={classes.cell}>
                                      {this.getLinkOrButttonForSME(provision.sme)}
                                      </TableCell>
                                      <TableCell align="right">{CURRENCY(provision.totalLoanAmount, locale, currencyCode)}</TableCell>
                                      <TableCell align="right">{CURRENCY(provision.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                                      <TableCell align="right">{currencyPercentage(provision.overallOutstandingPercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell align="right">{CURRENCY(provision.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                                      <TableCell align="right">{currencyPercentage(provision.overallTotalOverduePercentage.toFixed(2), locale)}</TableCell>
                                      <TableCell align="right">{CURRENCY(provision.provisionAmount, locale, currencyCode)}</TableCell>
                                      <TableCell align="right">
                                        {
                                          this.state.editProvision.get(provision._id) ?
                                            <Input type='number' name="editProvision" id="changeProvision" style={{ fontWeight: 100, fontSize: 14, width: '2vw' }}
                                              onChange={(e) => changeProvisionPercentageInTailored(i, e.target.value)}
                                            /> :
                                            provision.provisionPercentage + '%'

                                        }
                                      </TableCell>
                                      {/* <TableCell align="right" style={{ width: '2%' }}>
                                  <button className={classes.button}
                                    onClick={(e) => this.handleEditProvisionButton(provision._id, provision, e)}
                                  >{this.state.editProvision.get(provision._id) ? 'Save' : 'Change'}</button>
                                </TableCell> */}
                                      <TableCell align="right" style={{ width: '2%' }}>
                                        <button className={classes.button}
                                          onClick={this.toggleDrawer.bind(this, '', provision._id, 'bottom', true)}
                                        >{'Display'}</button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}

                            </TableBody>
                          </Table>
                        {/* </Paper> */}
                        </TableContainer>
                      </ExpansionPanelDetails>
                    </ExpansionPanel> :

                    false
                }

                {/*defaults part*/}

                <ExpansionPanel>
                  <ExpansionPanelSummary disabled={loanInDefaultProvisions.loanList.length > 0 ? false : true} expandIcon={<ExpandMoreIcon />}>

                    <div className={classes.root}>
                      {loanInDefaultProvisions.loanList.length > 0 ?
                        <>
                          <h4>Loans loan-in-default</h4>

                          <div className={classes.mainDiv}>

                            <div className={classes.normalDiv}>
                              <span>Number of Loans In Default</span>
                              <span>Total Loan</span>
                              <span>Outstanding</span>
                              <span>Overdue</span>
                              <span>% Overdue</span>
                            </div>
                            {/* loanInDefaultProvisions */}

                            <div className={classes.normalDivRight}>
                              <span className={classes.normalDiv}>{loanInDefaultProvisions.numberOfLoansInDefault}</span>
                              <span className={classes.normalDiv}>{CURRENCY(loanInDefaultProvisions.totalLoan, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(loanInDefaultProvisions.outstanding, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(loanInDefaultProvisions.overdue, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{currencyPercentage((loanInDefaultProvisions.overduePercentage).toFixed(2), locale)}</span>
                            </div>

                          </div>
                        </>
                        :
                        <h4>No Loans Found In  loan-in-default </h4>
                      }

                    </div>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Paper style={{ width: '100%' }}>
                      <ProvisionLoansTable defaultLoans={loanInDefaultProvisions.loanList} locale={locale} currencyCode={currencyCode}/>
                    </Paper>
                  </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel>
                  <ExpansionPanelSummary disabled={defaultSettledProvisions.loanList.length > 0 ? false : true} expandIcon={<ExpandMoreIcon />}>

                    <div className={classes.root}>
                      {defaultSettledProvisions.loanList.length > 0 ?
                        <>
                          <h4>Loans default-settled</h4>
                          <div className={classes.mainDiv}>

                            <div className={classes.normalDiv}>
                              <span>Number of Loans In Default</span>
                              <span>Total Loan</span>
                              <span>Outstanding</span>
                              <span>Overdue</span>
                              <span>% Overdue</span>
                            </div>

                            {/* defaultSettledProvisions */}

                            <div className={classes.normalDivRight}>
                              <span className={classes.normalDiv}>{defaultSettledProvisions.numberOfLoansInDefault}</span>
                              <span className={classes.normalDiv}>{CURRENCY(defaultSettledProvisions.totalLoan, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(defaultSettledProvisions.outstanding, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{CURRENCY(defaultSettledProvisions.overdue, locale, currencyCode)}</span>
                              <span className={classes.normalDiv}>{currencyPercentage(defaultSettledProvisions.overduePercentage.toFixed(2), locale)}</span>
                            </div>

                          </div>
                        </>
                        :
                        <h4>No Loans Found In default-settled</h4>
                      }

                    </div>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Paper style={{ width: '100%' }}>
                      <ProvisionLoansTable defaultLoans={defaultSettledProvisions.loanList} locale={locale} currencyCode={currencyCode}/>
                    </Paper>
                  </ExpansionPanelDetails>
                </ExpansionPanel>

              </>}

          </CardBody>

        </Card>


        <Drawer
          anchor="bottom"
          open={this.state.bottom}
          onClick={this.toggleDrawer.bind(this, 'Normal', [], 'bottom', false)}
        >
          <Paper >
            <Card >
              <CardBody>
                <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table>
                    <TableHead >
                      <TableRow key={'tasks_header'}>
                        <TableCell>created-date</TableCell>
                        <TableCell>stage</TableCell>
                        <TableCell>repayment-category</TableCell>
                        <TableCell>severity-level</TableCell>
                        <TableCell>provision-percentage</TableCell>
                        <TableCell>provision-amount</TableCell>
                        <TableCell>outstanding-principle-amount</TableCell>
                        <TableCell>outstanding-total-margin-amount</TableCell>
                        <TableCell>outstanding-total-loan-amount</TableCell>
                        <TableCell>planned-direct-debit-amount</TableCell>
                        <TableCell>total-overdue-amount</TableCell>
                        <TableCell>overdue-percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProvision.map((provision, idx) => {
                        return provision._id ? (
                          <TableRow key={idx} >
                            <TableCell>{moment(provision.createdAt).format('DD-MM-YYYY')}</TableCell>
                            <TableCell>{provision.stage}</TableCell>
                            <TableCell>{provision.repaymentCategory}</TableCell>
                            <TableCell>{''}</TableCell>
                            <TableCell>{currencyPercentage(provision.provisionPercentage, locale)}</TableCell>
                            <TableCell>{CURRENCY(provision.provisionAmount, locale, currencyCode)}</TableCell>
                            <TableCell>{CURRENCY(provision.outstandingPrincipalAmount, locale, currencyCode)}</TableCell>
                            <TableCell>{CURRENCY(provision.outstandingTotalMarginAmount, locale, currencyCode)}</TableCell>
                            <TableCell>{CURRENCY(provision.overallOutstandingTotalAmount, locale, currencyCode)}</TableCell>
                            <TableCell>{CURRENCY(provision.plannedDirectDebitsAmount, locale, currencyCode)}</TableCell>
                            <TableCell>{CURRENCY(provision.overallTotalOverdueAmount, locale, currencyCode)}</TableCell>
                            <TableCell>{currencyPercentage(provision.averageOverallTotalOverduePercentage, locale)}</TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </Paper>
        </Drawer>
      </div>
    );
  }
}

ProvisionOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  provisions: PropTypes.array,
  tableHeaderColor: PropTypes.string,
  getAllProvisions: PropTypes.func.isRequired,
  updateProvisions: PropTypes.func.isRequired,
  getDefaultLoanProvisionDetails: PropTypes.func.isRequired,
  loanInDefaultProvisions: PropTypes.object,
  defaultSettledProvisions: PropTypes.object,
  isDashboardContent: PropTypes.bool,
  setNavigationInDashboards: PropTypes.func,
  changeCustomerDetails: PropTypes.func,
  clearHeaderDisplaySubData: PropTypes.func,
  getFieldNameValues: PropTypes.func,
  locale: PropTypes.string,
  currencyCode: PropTypes.string
};

const mapStateToProps = state => {
  return {
    provisions: state.provisionOverview.provisions,
    loanInDefaultProvisions: state.provisionOverview.loanInDefaultProvisions,
    defaultSettledProvisions: state.provisionOverview.defaultSettledProvisions,
    isDashboardContent: state.user.isDashboardContent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAllProvisions: (date, country) => {
      dispatch(getAllProvisionDetails(date, country));
    },
    updateProvisions: (provision) => {
      dispatch(updateProvisionPercentage(provision));
    },
    getDefaultLoanProvisionDetails: (date, country) => {
      dispatch(getDefaultLoanProvisionDetails(date, country));
    },
    setNavigationInDashboards: (wireframeName) => dispatch(setNavigationInDashboards(wireframeName)),
    changeCustomerDetails: customerDetails => {
      dispatch(changeCustomerDetails(customerDetails));
    },
    clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
    getFieldNameValues: (requestBody) => dispatch(getFieldNameValues(requestBody)),
    getLocales: (requestBody) => dispatch(getLocales(requestBody))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ProvisionOverview));


