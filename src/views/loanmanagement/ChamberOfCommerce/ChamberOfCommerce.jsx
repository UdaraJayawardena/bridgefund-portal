import moment from 'moment';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from "react";

import styles from "assets/jss/material-dashboard-react/views/chamberOfCommerceStyle.jsx";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import withStyles from "@material-ui/core/styles/withStyles";

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";

import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';

import CustomTable from "components/loanmanagement/Table/Table.jsx";

import { clearCustomerDetails, getCustomerDetails } from "store/loanmanagement/actions/CustomerDetails";
import { clearSelectedCustomer } from "store/loanmanagement/actions/HeaderNavigation";
import { isNullOrUndefined } from 'util';


class ChamberOfCommerce extends Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  getInitialData() {
    const customerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : this.props.match.params.customerId;
    if (customerId) this.props.getCustomerDetails(customerId);//TODO
  }
  componentDidMount() {
    this.props.clearLoadedCustomerDetails();
    this.getInitialData();
  }
  componentDidUpdate(prevProps) {
    const preCustomerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : prevProps.match.params.customerId;
    const customerId = this.props.isDashboardContent ? this.props.lmCustomerSysId : this.props.match.params.id;
    if (preCustomerId && customerId && preCustomerId !== customerId) {
      this.props.clearCustomerDetails();
      this.getInitialData();
    }
  }

  componentWillUnmount() {
    this.props.clearLoadedCustomerDetails();
  }

  get companyDetails() {
    const { customerDetails } = this.props;
    let name = customerDetails.name;
    let legalForm = ''
    let startDate = ''
    let activities = ''
    let workingPeople = ''

    if (customerDetails.owner) {
      let owner = customerDetails.owner;
      legalForm = owner.legalForm;
      startDate = owner.incorporation ?
        moment(owner.incorporation.incorporationDate).format('MM-DD-YYYY') :
        startDate;
    }

    if (customerDetails.activities && customerDetails.activities.length > 0) {
      activities = customerDetails.activities[0].description;
    }

    if (customerDetails.employees) {
      workingPeople = customerDetails.employees.total;
    }

    return {
      name: name,
      legalForm: legalForm,
      startDate: startDate,
      activities: activities,
      workingPeople: workingPeople
    };
  }

  get ownerDetails() {
    const { customerDetails } = this.props;
    if (customerDetails.owner && customerDetails.owner.firstName) {
      let owner = customerDetails.owner;
      return {
        fullName: owner.fullName,
        dateOfBirth: owner.dateOfBirth ?
          moment(owner.dateOfBirth).format('DD-MM-YYYY') + ' ' + owner.placeOfBirth : '',
        visitAddress: owner.visitAddress ?
          owner.visitAddress.fullAddress + ' ' + owner.visitAddress.postCodeAndMunicipality : ''
      }
    } else {
      return false;
    }
  }

  filterNaturalPersonObjects(object, Naturalpersons, naturalPersonObjects) {
    if (Array.isArray(object)) {
      for (let i = 0; i < object.length; i++) {
        const obj = object[i];
        if (obj.person) {
          Naturalpersons = this.filterNaturalPersonObjects(obj.person, Naturalpersons, naturalPersonObjects);
        }
      }
    }

    const functionArray = object.functions;

    if (functionArray && functionArray.length > 0) {
      Naturalpersons = this.filterNaturalPersonObjects(object.functions, Naturalpersons, naturalPersonObjects);
    } else {
      if (!Array.isArray(object) && !naturalPersonObjects.includes(object._id)) {
        Naturalpersons.push(object);
        naturalPersonObjects.push(object._id)
      }
    }

    return Naturalpersons;
  }

  get naturalPersons() {
    const { customerDetails } = this.props;
    if (customerDetails.owner && customerDetails.owner.functions) {
      let naturalPersonArray = [];  //new Array();
      let naturalPersonObjects = [];  //new Array();
      let functions = customerDetails.owner.functions;

      for (let functionElement of functions) {
        const person = functionElement.person ? functionElement.person : {};
        this.filterNaturalPersonObjects(person, naturalPersonArray, naturalPersonObjects);
      }
      return naturalPersonArray
    } else {
      return false;
    }
  }

  render() {
    const { customerDetails, classes } = this.props;
    const companyLocations = customerDetails.locations ?
      customerDetails.locations : [];

    return (
      <div>
        {
          isNullOrUndefined(customerDetails.name) ?
            (
              <Card>
                <CardHeader color='info'>
                  <h4 className={classes.cardTitleWhite}>Chamber Of Commerce</h4>
                </CardHeader>
                <CardBody>
                  <h4 style={{ textAlign: "center" }}>No Details Available !!</h4>
                </CardBody>
              </Card>
            )
            :
            (
              <Card>
                <CardHeader color='info'>
                  <h4 className={classes.cardTitleWhite}>{customerDetails.name} ({customerDetails.cocNumber})</h4>
                  <p className={classes.cardCategoryWhite}>KvK-nummer {customerDetails.cocNumber}</p>
                </CardHeader>
                <CardBody>
                  <GridContainer>

                    {/* COMPANY DETAILS */}
                    <GridItem xs={12} sm={12} md={6}>
                      <Card>
                        <CardHeader color='primary'>
                          <h4 className={classes.cardTitleWhite}>Company</h4>
                        </CardHeader>
                        <CardBody>
                          <CustomTable
                            tableData={[
                              ['Trade Name', this.companyDetails.name],
                              ['Legal Form', this.companyDetails.legalForm],
                              ['Start Date', this.companyDetails.startDate],
                              ['Activities', this.companyDetails.activities],
                              ['No of Employees', this.companyDetails.workingPeople]
                            ]}
                          />
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* COMPANY LOCATIONS */}
                    {companyLocations.map((location, index) => (
                      <GridItem key={index} xs={12} sm={12} md={6}>
                        <Card>
                          <CardHeader color="warning">
                            <h4 className={classes.cardTitleWhite}>Company Location {companyLocations.length > 0 ? index + 1 : ''}</h4>
                          </CardHeader>
                          <CardBody>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell>Location Number</TableCell>
                                  <TableCell>{location.nlLocationId}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Trade Name</TableCell>
                                  <TableCell style={{ lineHeight: 0.5 }}>
                                    {location.tradeNames.map((tradeName, i) =>
                                      (<p key={i}>{tradeName.name}</p>)
                                    )}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Visiting Address</TableCell>
                                  <TableCell>
                                    {
                                      location.visitAddress ?
                                        location.visitAddress.fullAddress
                                        + ' ' +
                                        location.visitAddress.postCodeAndMunicipality
                                        :
                                        ''
                                    }
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Phone Numbers</TableCell>
                                  <TableCell style={{ lineHeight: 0.5 }}>
                                    {location.phone.map((phone, i) =>
                                      (<p key={i}>{phone.countryCode + ' ' + phone.number}</p>)
                                    )}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Web Address</TableCell>
                                  <TableCell style={{ lineHeight: 0.5 }}>
                                    {
                                      location.webDomain ? location.webDomain.map((domain, i) =>
                                        (<p key={i}><a href={'http://' + domain} target="_blank" rel="noopener noreferrer">{domain}</a></p>))
                                        :
                                        ''
                                    }
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>E-Mail</TableCell>
                                  <TableCell>{location.email}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardBody>
                        </Card>
                      </GridItem>
                    ))}

                    {/* IF OWNERS DETAIL IS AVAILABLE */}
                    {this.ownerDetails ?
                      <GridItem xs={12} sm={12} md={6}>
                        <Card>
                          <CardHeader color="success">
                            <h4 className={classes.cardTitleWhite}>Natural Person</h4>
                          </CardHeader>
                          <CardBody>
                            <CustomTable
                              tableData={[
                                ['Name', this.ownerDetails.fullName],
                                ['Date of birth and Place', this.ownerDetails.dateOfBirth],
                                ['Address', this.ownerDetails.visitAddress]
                              ]}
                            />
                          </CardBody>
                        </Card>
                      </GridItem>
                      :
                      false
                    }

                    {/* Details of Other Natural Persons details or Legal persons details (Get it verified how legal person comes) */}
                    {
                      this.naturalPersons ?
                        this.naturalPersons.map((person, index) => (
                          <GridItem key={index} xs={12} sm={12} md={6}>
                            <Card>
                              <CardHeader color='success'>
                                <h4 className={classes.cardTitleWhite}>Natural Person {index + 1}</h4>
                              </CardHeader>
                              <CardBody>
                                <CustomTable
                                  tableData={[
                                    ['Name', person.fullName],
                                    ['Date of birth and Place',
                                      moment(person.dateOfBirth).format('DD-MM-YYYY') + ' ' + person.placeOfBirth],
                                    ['Address', person.visitAddress ?
                                      person.visitAddress.fullAddress + ' ' + person.visitAddress.postCodeAndMunicipality : '']
                                  ]}
                                />
                              </CardBody>
                            </Card>
                          </GridItem>
                        ))
                        :
                        false
                    }
                  </GridContainer>
                </CardBody>
              </Card>
            )
        }
      </div>
    );
  }
}

ChamberOfCommerce.propTypes = {
  match: PropTypes.object,
  customerDetails: PropTypes.object,
  classes: PropTypes.object.isRequired,
  getCustomerDetails: PropTypes.func.isRequired,
  clearLoadedCustomerDetails: PropTypes.func.isRequired,
  clearCustomerDetails: PropTypes.func.isRequired,
  isDashboardContent: PropTypes.bool,
};

const mapStateToProps = state => {
  return {
    customerDetails: state.lmglobal.customerDetails,
    isDashboardContent: state.user.isDashboardContent,
    lmCustomerSysId: state.lmglobal.customerDetails.id,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getCustomerDetails: customerID => {
      dispatch(getCustomerDetails(customerID));
    },
    clearLoadedCustomerDetails: () => {
      dispatch(clearCustomerDetails());
      dispatch(clearSelectedCustomer());
    },
    clearCustomerDetails: () => {
      dispatch(clearCustomerDetails());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ChamberOfCommerce));

