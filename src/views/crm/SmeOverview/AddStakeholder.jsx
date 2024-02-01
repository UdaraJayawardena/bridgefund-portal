import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
// import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';
import GridItem from 'components/crm/Grid/GridItem';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import { StakeholderConstants, CustomerConstants, PersonConstants } from 'constants/crm/index';
import GridContainer from 'components/crm/Grid/GridContainer';
import { Typography, Button, Grid } from '@material-ui/core';
import { cloneDeep } from 'lodash';
import { updateQueryStringParameter, compareObject, isNullOrEmpty } from 'lib/crm/utility';
import CustomSearch from 'components/crm/CustomInput/CustomSearch';
import { CUDStakeholder } from 'store/crm/actions/StakeholderOverview.action';
import { displayNotification } from 'store/crm/actions/Notifier';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';

class AddStakeholder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customer: cloneDeep(CustomerConstants.emptyObj),
      stakeholder: cloneDeep(StakeholderConstants.emptyObj),
      person: cloneDeep(PersonConstants.emptyObj),
      personId: null,
    };
  }

  handleChange = (name, value, componentName) => {
    const _state = {};

    if (componentName) {
      const component = cloneDeep(this.state[componentName]);
      component[name] = value;
      _state[componentName] = component;
    }
    else {
      _state[name] = value;
    }

    this.setState(_state);
  };

  handleOnCustomerSearchResult = (result) => {
    if (result && typeof result !== 'string') {
      this.setCustomerIdInUrl(result.id);
    }
  }

  handleOnPersonSearchResult = (value) => {

    if (value && typeof value !== 'string') {
      this.setState({ personId: value._id });
    }
  }

  setCustomerIdInUrl = (id) => {

    let URL = document.location.origin + document.location.pathname;
    if (id)
      URL = updateQueryStringParameter(
        document.location.href,
        "customerId",
        id
      );
    window.history.pushState({ path: URL }, "", URL);
  };

  saveStakeholder = () => {

    const { personId } = this.state;

    const changedData = cloneDeep(this.getStakeholderChanges());

    changedData.customerId = this.props.selectedCustomer._id;
    changedData.personId = personId;
    const personSurname = this.state.person.surname;

    if (personSurname === "") {
      return this.props.displayNotification('Please select a contract name', 'warning');
    }

    if (isNullOrEmpty(changedData.personId)) {
      return this.props.displayNotification('Please select a contract name', 'warning');

    }
    if (isNullOrEmpty(changedData.customerId)) {
      return this.props.displayNotification('Please fill the customerId', 'warning');

    }
    if (isNullOrEmpty(changedData.role)) {
      return this.props.displayNotification('Please fill the role', 'warning');

    }
    if (isNullOrEmpty(changedData.signingContractIndicator)) {
      return this.props.displayNotification('Please fill the signingContractIndicator', 'warning');

    }
    if (isNullOrEmpty(changedData.signingGuaranteeIndicator)) {
      return this.props.displayNotification('Please fill the signingGuaranteeIndicator', 'warning');

    }
    if (changedData.sharePercentage <= 0) {
      return this.props.displayNotification('Please fill the sharePercentage', 'warning');

    }

    const requestData = {
      "stakeholders": {
        "data": [
          changedData
        ]
      }
    };

    // console.log(requestData, "stakeholder");



    this.props.CUDStakeholder(requestData)
      .then(response => this.props.onSave(response.stakeholders))
      .catch(() => { /*  */ })
      .finally(() => { this.setState({ isLoading: false }); this.props.onClose(); });

  }


  getStakeholderChanges = () => {

    let returnObj = {};
    let comparedObj;
    let changeCount = 0;

    if (this.state.stakeholder._id) {

      comparedObj = compareObject(this.props.personStakeholder.value, this.state.stakeholder, StakeholderConstants.schemaKeysToCompare);
    }
    else {
      comparedObj = compareObject(StakeholderConstants.emptyObj, this.state.stakeholder, StakeholderConstants.schemaKeysToCompare);
    }

    changeCount = Object.keys(comparedObj).length;

    if (changeCount > 0 && this.state.stakeholder._id) {

      returnObj = {
        ...comparedObj,
        action: 'update',
        _id: this.state.stakeholder._id
      };

    } else if (changeCount > 0) {
      returnObj = { ...this.state.stakeholder, action: 'create' };
    }

    return returnObj;
  }

  render() {
    const { classes } = this.props;
    // console.log('this.state in render :>> ', this.state);

    return (
      <>
        <div className={classes.personOverviewHeader}>
          <Typography className={classes.textFieldStyle}>Add Stakeholder</Typography>
        </div>
        <GridContainer >
          <GridItem className={classes.smallBox}>
            <CustomSearch
              id='company-name-search'
              label='Contract Name'
              placeholder='Person sur name'
              changeToFormatType='CamelCase'
              name='surname'
              value={this.state.person.surname}
              onSearchResult={this.handleOnPersonSearchResult}
              SearchOptions={{
                criteria: 'out',
                customerId: this.props.selectedCustomer._id,
              }}
              onChange={(name, value) => this.handleChange(name, value, 'person')}
              asyncSearchType='person'
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomSearch
              id='company-name-search'
              label='Sme legal name'
              placeholder='Beer in the Box BV'
              changeToFormatType='CamelCase'
              name='legalName'
              value={this.props.selectedCustomer.legalName}
              onSearchResult={this.handleOnCustomerSearchResult}
              onChange={(name, value) => this.handleChange(name, value, 'customer')}
              asyncSearchType='customer'
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='stakeholder-role'
              type='dropdown'
              name='role'
              label='Stakeholder role'
              value={this.state.stakeholder.role}
              onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
              dropDownValues={Object.keys(StakeholderConstants.role).map(key => { return { key: key, value: StakeholderConstants.role[key] }; })} />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="signing-contract"
              name='signingContractIndicator'
              formControlStyle={classes.signingContract}
              value={this.state.stakeholder.signingContract}
              onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
              label="Signing Contract"
              dropDownValues={Object.keys(StakeholderConstants.signingContract).map(key => { return { key: key, value: StakeholderConstants.signingContract[key] }; })}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              type='dropdown'
              id="signing-guarantee"
              formControlStyle={classes.signingGuarantee}
              value={this.state.stakeholder.signingGuarantee}
              onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
              label="Signing Guarantee"
              name='signingGuaranteeIndicator'
              dropDownValues={Object.keys(StakeholderConstants.signingGuarantee).map(key => { return { key: key, value: StakeholderConstants.signingGuarantee[key] }; })}
            />
          </GridItem>
          <GridItem className={classes.smallBox}>
            <CustomInputBox
              id='share'
              label='Share'
              placeholder='100%'
              type="percentage"
              value={this.state.stakeholder.sharePercentage}
              name="sharePercentage"
              onChange={(name, value) => this.handleChange(name, value, 'stakeholder')}
            />
          </GridItem>
        </GridContainer>
        <Grid
          justify="flex-end"
          container
        >
          <Grid item >
            <Button
              variant="outlined"
              className={classes.cancelIconButton}
              onClick={this.props.onClose}
            >Cancel</Button>
            <Button
              variant='contained'
              className={classes.confirmIconButton}
              disabled={this.state.disabled}
              onClick={this.saveStakeholder}
            >Create</Button>
          </Grid>
        </Grid>
      </>
    );
  }
}
AddStakeholder.defaultProps = {
};

AddStakeholder.propTypes = {
  classes: PropTypes.object.isRequired,
  origin: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  getCustomerAddressContact: PropTypes.func,
  selectedCustomer: PropTypes.object,
  personStakeholder: PropTypes.object,
  CUDStakeholder: PropTypes.func.isRequired,
  serchedPerson: PropTypes.array,
  displayNotification: PropTypes.func,
  onSave: PropTypes.func,
};


const mapStateToProps = (state) => ({
  selectedCustomer: state.lmglobal.selectedCustomer,
  personStakeholder: state.stakeholder.personStakeholder,
  serchedPerson: state.person.serchedPerson,
});

const mapDispatchToProps = (dispatch) => ({
  CUDStakeholder: (requestBody) => dispatch(CUDStakeholder(requestBody)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(AddStakeholder));
