import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
// import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import { Fab, Button, Dialog, DialogContent, Badge, Grid } from '@material-ui/core';
import { CheckCircle, AddCircle } from '@material-ui/icons';
import EditableTable from 'components/crm/Table/EditableTable';
import AddStakeholder from './AddStakeholder';
import { StakeholderConstants } from 'constants/crm';

import { displayNotification } from 'store/crm/actions/Notifier';
import { getStakeholder, CUDStakeholder } from 'store/crm/actions/StakeholderOverview.action';
import { compareArrayOfObjects, isNullOrEmpty } from 'lib/crm/utility';
import { cloneDeep } from 'lodash';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';

const getLookupsUsingEnums = (enumObject) => Object.values(enumObject).reduce((a, cv) => { a[cv] = cv; return a; }, {});

const StakeholderSigningContractLookup = getLookupsUsingEnums(StakeholderConstants.signingContract);
const StakeholderSigningGuaranteeLookup = getLookupsUsingEnums(StakeholderConstants.signingGuarantee);
const StakeholderRoleLookup = getLookupsUsingEnums(StakeholderConstants.role);

class StakeholderOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      updateStatus: null,
      updatedStakehodler: [],
      showAddStakeholdersDrower: false,
      tableDataStakeholders: [],
      showTable: false,
      switchStakeholder: false,
      selected: { type: '', id: '' },
    };
  }

  componentDidMount() {

    const _state = {};
    let getData;
    const statkeholders = cloneDeep(this.props.stakeholders);

    if (this.props.selectedCustomer._id && statkeholders.length === 0) {
      getData = this.props.getStakeholder({ customerId: this.props.selectedCustomer._id });
    }
    else if (statkeholders.length > 0) {
      getData = this.props.getStakeholder({ customerId: this.props.selectedCustomer._id });
    }
    else getData = Promise.resolve([]);

    if (this.props.selectedCustomer._id) _state.selected = { type: 'customer', id: this.props.selectedCustomer._id };

    getData.then(result => { _state.tableDataStakeholders = result; }).catch({/*  */ }).finally(() => this.setState(_state));
  }

  handleChanges = (actionType, data) => {
    const updatedStakehodler = cloneDeep(this.state.tableDataStakeholders);
    const index = updatedStakehodler.findIndex(sthk => sthk._id === data._id);

    switch (actionType) {
      case 'update':
        updatedStakehodler[index] = { ...data, endDate: data.endDate === 'none' ? null : data.endDate };
        break;
      case 'delete':
        updatedStakehodler[index] = data;
        break;

      default:
        break;
    }

    this.setState({ tableDataStakeholders: updatedStakehodler });
  }

  addStakeholder = () => {
    this.setState({ showAddStakeholdersDrower: !this.state.showAddStakeholdersDrower });
  }

  saveStakeholder = () => {

    const { updateValues } = this.stakeholderChanges.finalObject;
    const setFinalObj = (value, action) => {
      const originalValue = this.props.stakeholders.find(stkh => stkh._id === value._id);
      const obj = {
        action,
        ...value,
        customerId: originalValue.customerId,
        personId: originalValue.personId,
        dataSource: originalValue.dataSource
      };
      delete obj._id;
      return obj;
    };

    const deletingValues = [];
    const updatedValues = [];
    updateValues.forEach(value => {
      !isNullOrEmpty(value.endDate) ?
        deletingValues.push(setFinalObj(value, 'delete')) :
        updatedValues.push(setFinalObj(value, 'update'));
    });

    const allValues = [].concat(updatedValues, deletingValues);
    // const test  = allValues.findIndex((obj => obj.sharePercentage))

    console.log(allValues)
    const requestData = {
      "stakeholders": {
        "data":
          allValues
      }
    };

    this.props.CUDStakeholder(requestData)
      .then(result => {
        this.setResponse(result.stakeholders);
      })
      .catch(() => {/*  */ });
  }

  setResponse = (stakeholders) => {
    const newStakeholders = cloneDeep(this.state.tableDataStakeholders);
    stakeholders.forEach(element => {
      const index = newStakeholders.findIndex(stkh => stkh.customerId === element.customerId && stkh.personId === element.personId);
      index === -1 ? newStakeholders.push(element) : newStakeholders[index] = element;
    });
    this.setState({ tableDataStakeholders: newStakeholders });
  };

  switchStakeholder = (stakeholder) => {
    const _state = {};

    let requestBody = {};
    let id = '';
    const { personId, customerId } = stakeholder;
    const newType = this.state.selected.type === 'customer' ? 'person' : 'customer';

    if (newType === 'customer') {
      requestBody = { customerId };
      id = customerId;
    } else {
      requestBody = { personId };
      id = personId;
    }

    this.props.getStakeholder(requestBody)
      .then(result => {
        _state.tableDataStakeholders = result;
        _state.selected = { type: newType, id };
      })
      .catch({/*  */ }).finally(() => this.setState(_state));
  }

  get stakeholderChanges() {
    // console.log(this.props.stakeholders, this.state.tableDataStakeholders)
    const { updateValues } = compareArrayOfObjects(this.props.stakeholders, this.state.tableDataStakeholders, StakeholderConstants.schemaKeysToCompare);

    const finalObject = {
      updateValues
    };
    const allValues = [].concat(updateValues);

    return { hasChanged: allValues.length > 0, finalObject, changeCount: allValues.length };
  }

  render() {
    const { classes } = this.props;
   
    return (
      <div className={classes.container} >
        <Grid
          justify="flex-end"
          container
        >
          <Button
            variant='contained'
            startIcon={<AddCircle />}
            className={classes.addIconButton}
            onClick={() => this.addStakeholder()}
            disabled={(this.props.selectedCustomer._id !== this.state.selected.id)}
          >Add Stakeholder</Button>
        </Grid>

        <div>{
          <EditableTable 
            origin={this.props.origin}
            columns={[
              { title: "Contract-name", field: "contractName" },
              { title: "SME Legal Name", field: "customerName" },
              { title: "Role", field: "role", lookup: StakeholderRoleLookup },
              { title: "Signing Contract", field: "signingContractIndicator", lookup: StakeholderSigningContractLookup },
              { title: "Signing Guarantee", field: "signingGuaranteeIndicator", lookup: StakeholderSigningGuaranteeLookup },
              { title: "Share %", field: "sharePercentage" },
              { title: "End DateRelationship", field: "endDate", type: 'date' },
              { title: "customer Id", field: "customerId", hidden: true },
              { title: "person Id", field: "personId", hidden: true },
              { title: "data Source", field: "dataSource", hidden: true },
              { title: "_id", field: "_id", hidden: true },
              { title: "id", field: "id", hidden: true },
              { title: "actionType", field: "action", hidden: true },
            ]}
            Actions={[
              {
                id: 'action-change-info',
                title: 'Change Info',
                materialTableActiontype: 'update',
                customActionType: 'update',
                editableFields: ['role', 'signingContractIndicator', 'signingGuaranteeIndicator', 'sharePercentage'],
                disableFunc: (row) => !isNullOrEmpty(row.endDate) || (this.props.selectedCustomer._id !== this.state.selected.id)
              },
              {
                id: 'action-delete',
                title: 'Delete',
                materialTableActiontype: 'update',
                customActionType: 'delete',
                editableFields: ['endDate'],
                disableFunc: (row) => !isNullOrEmpty(row.endDate) || (this.props.selectedCustomer._id !== this.state.selected.id)
              },
              {
                id: 'action-switch',
                title: 'Switch',
                materialTableActiontype: 'external',
                customActionType: 'switch',
                externalFunction: (row) => this.switchStakeholder(row)
              }
            ]}
            actionsHandler={this.handleChanges}
            options={{
              headerStyle: {
                background: '#F3F4F7',
                lineHeight: "40px",
                padding: "5px",
                verticalAlign: "middle",
                fontFamily: 'Roboto',
                fontSize: '12px',
              },
              cellStyle: {
                lineHeight: "40px",
                paddingRight: "10px",
                paddingLeft: "10px",
                paddingTop: "0px",
                paddingBottom: "0px",
                verticalAlign: "middle",
                fontFamily: 'Roboto',
                fontSize: '12px',
              },
              search: false,
              paging: false,
              sorting: false,
              toolbar: false
            }}
            localization={{
              body: {
                emptyDataSourceMessage: 'No Stakeholders to display',
              }
            }}
            style={{
              borderRadius: '10px',
            }}
            data={(this.state.tableDataStakeholders)}
            systemDate={this.props.systemDate}
            displayNotification={this.props.displayNotification}
          />
        }
          {this.stakeholderChanges.hasChanged &&
            <Fab variant='extended' className={classes.saveChangesBtn} onClick={this.saveStakeholder}><Badge badgeContent={this.stakeholderChanges.changeCount} color="primary"><CheckCircle /></Badge>&nbsp;&nbsp;Save changes</Fab>
          }
          <Dialog
            fullWidth
            maxWidth={'lg'}
            open={this.state.showAddStakeholdersDrower}
            onClose={() => this.addStakeholder()}
            style={{ margin: 0 }}
          >
            <DialogContent>
              <AddStakeholder
                onClose={() => this.addStakeholder()}
                onSave={this.setResponse}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }
}
StakeholderOverview.defaultProps = {
  origin: 'STAKEHOLDER'
};

StakeholderOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  origin: PropTypes.string,
  systemDate: PropTypes.string,
  selectedCustomer: PropTypes.object,
  stakeholders: PropTypes.array.isRequired,
  displayData: PropTypes.array,
  getStakeholder: PropTypes.func,
  CUDStakeholder: PropTypes.func,
  displayNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  systemDate: state.config.systemDate,
  stakeholders: state.stakeholder.stakeholders,
  selectedCustomer: state.lmglobal.selectedCustomer,
});

const mapDispatchToProps = (dispatch) => ({
  getStakeholder: (requestBody) => dispatch(getStakeholder(requestBody)),
  CUDStakeholder: (requestBody) => dispatch(CUDStakeholder(requestBody)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(StakeholderOverview));
