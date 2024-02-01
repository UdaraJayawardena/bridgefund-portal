import React, { useState } from "react";
import MaterialTable from "material-table";
import PropTypes from 'prop-types';
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Menu, MenuItem } from "@material-ui/core";
import { cloneDeep } from "lodash";

const EditableTable = props => {

  const { title, /* origin, */ icons, options, localization, style } = props;

  const materialTableRef = React.createRef();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [initialFormData] = useState({});
  const [data, setData] = useState(undefined);
  const [columns, setColumns] = useState([]);
  const [rollbackDataOnCancelUpdate, setRollbackOnCancelUpdate] = useState([]);
  const [selectedAction, setSelectedAction] = useState(undefined);

  React.useEffect(() => {
    setColumns(cloneDeep(props.columns).map(col => ({ ...col, editable: 'never' })));
  }, [props.columns]);

  React.useEffect(() => {
    setData(cloneDeep(props.data));
  }, [props.data]);

  const onRowUpdate = (newData) =>
    new Promise((resolve) => {
      props.actionsHandler(selectedAction.customActionType, newData);
      setRollbackOnCancelUpdate([]);
      resolve();
    });

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const onActionClick = (action) => {

    setSelectedAction(action);
    let editableOperation = 'never';
    if (action.disableFunc && action.disableFunc(selectedRow)) {
      props.displayNotification('Sorry this action cannot be perfomed for this row!', 'warning');
      handleClose();
      return;
    }

    switch (action.materialTableActiontype) {
      case 'update':
        editableOperation = 'onUpdate';
        updateMaterialTableProps(action.editableFields, editableOperation, 'update');
        break;
      case 'external':
        action.externalFunction(selectedRow);
        break;

      default:
        break;
    }
    handleClose();
  };

  const updateMaterialTableProps = (editableFields, materialOperation, rowOperation) => {

    const materialTable = materialTableRef.current;
    const newData = materialTable.state.data.slice();

    materialTable.dataManager.columns.forEach((col, index) => {

      if (editableFields.includes(col.field)) {
        materialTable.dataManager.columns[index].editable = materialOperation;

        if (materialTable.dataManager.columns[index].type === 'date') {
          const field = materialTable.dataManager.columns[index].field;
          const cval = newData[selectedRow.tableData.id][field];
          newData[selectedRow.tableData.id][field] = cval === null ? props.systemDate : cval;
          setRollbackOnCancelUpdate([...rollbackDataOnCancelUpdate, { index: selectedRow.tableData.id, field, value: cval }]);
        }

      } else {
        materialTable.dataManager.columns[index].editable = 'never';
      }
      materialTable.dataManager.columns[index].editable = editableFields.includes(col.field) ? materialOperation : 'never';
    });
    materialTable.setState({
      showAddRow: false,
      lastEditingRow: selectedRow.tableData.id,
    });
    materialTable.dataManager.changeRowEditing(selectedRow, rowOperation);
  };

  const onRowUpdateCancelled = () => {

    const materialTable = materialTableRef.current;
    const newData = materialTable.state.data.slice();

    rollbackDataOnCancelUpdate.forEach(rollback => {
      newData[rollback.index][rollback.field] = rollback.value;
    });
  };

  return (
    <>
      <MaterialTable
        // title={title}
        columns={columns}
        data={data}
        icons={icons}
        editable={{
          isEditHidden: () => true,
          onRowUpdate: onRowUpdate,
          onRowUpdateCancelled: onRowUpdateCancelled,
        }}
        options={options}
        style= {{fontSize: '12px', fontFamily: 'Roboto'}}
        actions={[
          {
            icon: MoreVertIcon,
            tooltip: "More",
            onClick: handleClick,
          }
        ]}
        localization={localization}
        tableRef={materialTableRef}
        initialFormData={initialFormData}
      />
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        keepMounted={true}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {
          props.Actions.map(action => (
            <MenuItem
              style= {{fontSize: '12px', fontFamily: 'Roboto'}}
              key={Math.random().toString() + action.id}
              id={Math.random().toString() + action.id}
              onClick={() => onActionClick(action)}>
              {action.title}
            </MenuItem>
          ))
        }
      </Menu>
    </>
  );
};

EditableTable.defaultProps = {
  systemDate: Date.now(),
  displayNotification: (msg, type) => console.error(type, msg),
};

EditableTable.propTypes = {
  title: PropTypes.string,
  systemDate: PropTypes.string.isRequired,
  columns: PropTypes.array,
  data: PropTypes.array,
  Actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      materialTableActiontype: PropTypes.oneOf(['update', 'delete', 'external']).isRequired,
      customActionType: PropTypes.oneOf(['update', 'delete']).isRequired,
      editableFields: PropTypes.arrayOf(PropTypes.string),
      externalFunction: PropTypes.func,
      disableFunc: PropTypes.func,
    })
  ),
  actionsHandler: PropTypes.func,
  displayNotification: PropTypes.func,
  origin: PropTypes.string,
  icons: PropTypes.object,
  options: PropTypes.object,
  localization: PropTypes.object,
  style: PropTypes.object,
};

export default EditableTable;