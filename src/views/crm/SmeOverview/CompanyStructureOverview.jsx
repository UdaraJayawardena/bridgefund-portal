import React from 'react';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
// import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import { Fab, Button, Dialog, DialogContent, Badge, Grid } from '@material-ui/core';
import { CheckCircle, AddCircle } from '@material-ui/icons';
import EditableTable from 'components/crm/Table/EditableTable';
import AddCompanyStructure from './AddCompanyStructure';

import { displayNotification } from 'store/crm/actions/Notifier';
import { getCompanyStructure, CUDCompanyStructure } from 'store/crm/actions/CompanyStructureOverview.action';
import { CommonConstants } from 'constants/crm/index';
import { compareArrayOfObjects, isNullOrEmpty } from 'lib/crm/utility';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';

class CompanyStructureOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showAddCompanyStructuresDrower: false,
      tableDataCompanyStructures: [],
    };
  }

  componentDidMount() {

    if (this.props.selectedCustomer._id && this.props.companyStructures.length === 0) {
      this.props.getCompanyStructure(this.props.selectedCustomer._id)
        .then(result => {
          this.getoptimizedDisplayData(result);
        })
        .catch(() => {/*  */ });
    } else if (this.props.companyStructures.length > 0) {
      this.getoptimizedDisplayData(this.props.companyStructures);
    }
    else this.getoptimizedDisplayData([]);

  }

  mapPropObject = (item) => ({
    customerNameDaughter: item.customerNameDaughter,
    relationship: 'is owned for',
    companyShare: item.companyShare,
    customerNameMother: item.customerNameMother,
    boardMember: item.boardMemberIndicator,
    endDate: item.endDate ? item.endDate : null,
    customerIdDaughter: item.customerIdDaughter,
    customerIdMother: item.customerIdMother,
    dataSource: item.dataSource,
    _id: item._id
  });

  getoptimizedDisplayData = (companyStructuresData) => {
    const displayCompanyStructures = companyStructuresData.map(item => this.mapPropObject(item));

    this.setState({ tableDataCompanyStructures: displayCompanyStructures });
  }

  handleChanges = (actionType, data) => {

    if (actionType) {
      if (actionType === 'update' && data.endDate === null) {
        this.createUpdateObject(data);
      }
      else if (actionType === 'delete') {
        this.createUpdateObject(data);
      }
    }
  }

  createUpdateObject = (data) => {

    const compantStructures = cloneDeep(this.state.tableDataCompanyStructures);
    const percentage = data.companyShare.replace(/\D/g, '');

    data = {
      ...data,
      companyShare: Number(percentage),
      dataSource: CommonConstants.dataSource.CRM
    };

    const index = compantStructures.findIndex(cs => cs.customerIdDaughter === data.customerIdDaughter && cs.customerIdMother === data.customerIdMother);

    compantStructures[index] = data;

    this.setState({ tableDataCompanyStructures: compantStructures });
  }

  addCompanyStructure = () => {
    this.setState({ showAddCompanyStructuresDrower: !this.state.showAddCompanyStructuresDrower });

  }

  saveCompanyStructure = () => {

    const { updateValues } = this.allChanges.finalObject;
    const setFinalObj = (value, action) => {
      const originalValue = this.props.companyStructures.find(stkh => stkh._id === value._id);
      const obj = {
        action,
        ...value,
        customerIdDaughter: originalValue.customerIdDaughter,
        customerIdMother: originalValue.customerIdMother,
        dataSource: CommonConstants.dataSource.CRM
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

    const requestData = {
      "companyStructures": {
        "data":
          allValues
      }
    };

    this.props.CUDCompanyStructure(requestData)
      .then((response) => this.setResponse(response.companyStructures))
      .catch(() => { /*  */ });
  }

  setResponse = (companyStructures) => {
    const newCompanyStructures = cloneDeep(this.state.tableDataCompanyStructures);
    companyStructures.forEach(element => {
      const index = newCompanyStructures.findIndex(cs => cs.customerIdDaughter === element.customerIdDaughter && cs.customerIdMother === element.customerIdMother);
      index === -1 ? newCompanyStructures.push(this.mapPropObject(element)) : newCompanyStructures[index] = this.mapPropObject(element);
    });
    this.setState({ tableDataCompanyStructures: newCompanyStructures });
  };

  get allChanges() {
    const { updateValues } = compareArrayOfObjects(this.props.companyStructures, this.state.tableDataCompanyStructures, ['companyShare', 'endDate']);

    return { hasChanged: updateValues.length > 0, finalObject: { updateValues }, changeCount: updateValues.length };
  }

  render() {
    const { classes } = this.props;
    // console.log(this.allChanges);
    return (
      <div className={classes.container}>
        {/* <div className={classes.addButton}>
          <Button
            variant='contained'
            startIcon={<AddCircle />}
            className={classes.blueIconButton}
            onClick={() => this.addCompanyStructure()}
          >Add Company Structure</Button>
        </div> */}
          <Grid
          justify="flex-end"
          container
        >
          <Button
            variant='contained'
            startIcon={<AddCircle />}
            className={classes.addIconButton}
            onClick={() => this.addCompanyStructure()}
          >Add Company Structure</Button>
        </Grid>

        <div>
          <EditableTable
            origin={this.props.origin}
            title={"Company Structure"}
            columns={[
              { title: "SMI-Daughter", field: "customerNameDaughter", },
              { title: "Relationship", field: "relationship", },
              { title: "Share %", field: "companyShare" },
              { title: "SME-Mother", field: "customerNameMother", },
              { title: "Board-Member", field: "boardMember" },
              { title: "End DateRelationship", field: "endDate", type: 'date' },
              { title: "customer Id Mother", field: "customerIdDaughter", hidden: true },
              { title: "customer Id Mother", field: "customerIdMother", hidden: true },
              { title: "_Id", field: "_id", hidden: true }
            ]}
            data={this.state.tableDataCompanyStructures}
            actionsHandler={this.handleChanges}
            Actions={[{
              id: 'action-update',
              title: 'Change Info',
              customActionType: 'update',
              materialTableActiontype: 'update',
              editableFields: ['companyShare'],
              disableFunc: (row) => !isNullOrEmpty(row.endDate)
            }, {
              id: 'action-delete',
              title: 'Delete',
              customActionType: 'delete',
              materialTableActiontype: 'update',
              editableFields: ['endDate'],
              disableFunc: (row) => !isNullOrEmpty(row.endDate)
            }]}
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
                fontSize: '12px'
              },
              search: false,
              paging: false,
              sorting: false,
              toolbar: false
            }}
            localization={{
              body: {
                emptyDataSourceMessage: 'No Company Structures to display',
              }
            }}
            style={{
              borderRadius: '10px',
            }}
            systemDate={this.props.systemDate}
            displayNotification={this.props.displayNotification}
          />
          {this.allChanges.hasChanged &&
            <Fab variant='extended' className={classes.saveChangesBtn} onClick={this.saveCompanyStructure}><Badge badgeContent={this.allChanges.changeCount} color="primary"><CheckCircle /></Badge>&nbsp;&nbsp;Save changes</Fab>
          }
          <Dialog
            fullWidth
            maxWidth={'lg'}
            open={this.state.showAddCompanyStructuresDrower}
            onClose={() => this.addCompanyStructure()}
            style={{ margin: 0 }}
          >
            <DialogContent>
              <AddCompanyStructure
                onClose={() => this.addCompanyStructure()}
                onSave={this.setResponse}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }
}
CompanyStructureOverview.defaultProps = {
  origin: 'COMPANY_STRUCTURE'
};

CompanyStructureOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  origin: PropTypes.string,
  systemDate: PropTypes.string,
  icons: PropTypes.object,
  selectedCustomer: PropTypes.object,
  companyStructures: PropTypes.array.isRequired,
  displayData: PropTypes.array,
  getCompanyStructure: PropTypes.func,
  CUDCompanyStructure: PropTypes.func,
  displayNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  systemDate: state.config.systemDate,
  companyStructures: state.companyStructure.companyStructures,
  selectedCustomer: state.lmglobal.selectedCustomer,
});

const mapDispatchToProps = (dispatch) => ({
  getCompanyStructure: (customerId) => dispatch(getCompanyStructure(customerId)),
  CUDCompanyStructure: (requestBody) => dispatch(CUDCompanyStructure(requestBody)),
  displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(CompanyStructureOverview));
