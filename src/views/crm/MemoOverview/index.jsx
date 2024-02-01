 import React from 'react';

import qs from "querystring";
import moment from "moment";

import PropTypes from 'prop-types';

import GridItem from 'components/crm/Grid/GridItem.jsx';
import GridContainer from 'components/crm/Grid/GridContainer.jsx';

import { Button, Typography, Paper, TableContainer, Table, 
        TableHead, TableRow, TableCell, TableBody, TextField,
        Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
        InputLabel, Select, MenuItem, DialogContentText, CircularProgress, Grid } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';

import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import Notifier from 'components/crm/Notification/Notifier';

import { displayNotification } from 'store/crm/actions/Notifier';
import { getMemos, getSmeLoanRequestDetails, CUDMemo, getProcessDefinitions } from 'store/crm/actions/MemoOverview.action';
import { getCustomerDetails } from 'store/crm/actions/Customer.action';
import { getStakeholder } from 'store/crm/actions/StakeholderOverview.action';

import withStyles from '@material-ui/core/styles/withStyles';

// import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';
import { connect } from 'react-redux';

const basicMemo = {
    "id": null,
    "customerId": '',
    "personId": '',
    "contractId": '',
    "processId": '',
    "processStepId": '',
    "header": '',
    "text": '',
    "userId": ''
  };

class MemoOverview extends React.Component {

    constructor(props) {
        super(props);
    
        this.state = {
          customerId: null,
          memos: [],
          openMemoDialog: false,
          openDeleteMemoDialog: false,
          selectedMemo: null,
          dialogAction: null,
          customer: {},
          loanRequests: [],
          stakeholders: [],
          contractSearchId: null,
          personSearchId: null,
          processDefinitions: [],
          tasks: [],
          processId: null,
          processStepId: null,
          isLoadingMemo: false,
          memoDataForProcess: JSON.parse(JSON.stringify(basicMemo))
        };
      }

    componentDidMount () {

        const params = qs.parse(document.location?.search.slice(1));
        const customerId = params.customerId ? params.customerId : null;
        this.setState({ customerId: customerId });

        this.getDisplayData(customerId);
    }

    getDisplayData (customerId) {

        this.props.getCustomerDetails(customerId)
        .then(result => {
          const customerUniqeId = result.customer._id;

          this.getMemoData(customerUniqeId);

          this.setState({ customer: result.customer, customerId: customerUniqeId});

          this.props.getStakeholder({customerId: customerUniqeId})
            .then(result => {
            this.setState({ stakeholders: result});
            })
            .catch(() => {
            this.props.displayNotification('Error occured in get stakeholders!', 'error');
            });
        })
        .catch(() => {
          this.props.displayNotification('Error occured in get customer!', 'error');
        });

        this.props.getSmeLoanRequestDetails(customerId)
        .then(result => {
          this.setState({ loanRequests: result});
        })
        .catch(() => {
          this.props.displayNotification('Error occured in get loan requests!', 'error');
        });

        this.props.getProcessDefinitions()
        .then(result => {

            const selectedMemo = this.state.memoDataForProcess;

            if (selectedMemo.processId) {

                const processDefinition = result.find(processDefinition => processDefinition.key === selectedMemo.processId);

                const tasks = (processDefinition && processDefinition.userTasks) ? processDefinition.userTasks : [];

                const processStepId = selectedMemo.processStepId ? selectedMemo.processStepId : -1;

                this.setState({ tasks: tasks, processStepId: processStepId});
            }

            this.setState({ processDefinitions: result});
        })
        .catch(() => {
          this.props.displayNotification('Error occured in get process definitions!', 'error');
        });
    }

    getMemoData (customerId, personId=null, contractId=null) {

        if (customerId === null) return this.props.displayNotification('Please select a customer!', 'warning');

        this.props.getMemos(customerId, personId, contractId)
        .then(result => {
          this.setState({ memos: result});
        })
        .catch(() => {
          this.props.displayNotification('Error occured in get memos!', 'error');
        });
    }

    viewMemoDetails = (memoId = null, action = null) => {
        if (action === 'create' || action === 'update') {
        this.setState((prevState) => {
            return {
                openMemoDialog: !prevState.openMemoDialog,
                selectedMemo: memoId,
                dialogAction: action,
            };
            }, () => {
                
                const { memos, selectedMemo } = this.state;

                let { memoDataForProcess } = this.state;

                if (this.state.openMemoDialog && selectedMemo) {

                    const temp = memos.find((data) => data.id === selectedMemo);

                    let tasks = [];

                    if (temp.processId && this.state.processDefinitions.length > 1) {

                        const processDefinitions = this.state.processDefinitions;
            
                        const processDefinition = processDefinitions.find(processDefinition => processDefinition.key === temp.processId);

                        tasks = processDefinition.userTasks ? processDefinition.userTasks : [];
                    }

                    const processStepId = temp.processStepId ? temp.processStepId : -1;

                    this.setState({ processId: temp.processId, processStepId: processStepId, tasks: tasks });

                    memoDataForProcess = temp ? JSON.parse(JSON.stringify(temp)) : JSON.parse(JSON.stringify(basicMemo));

                } else {

                    memoDataForProcess = JSON.parse(JSON.stringify(basicMemo));

                    memoDataForProcess.customerId = this.state.customerId;

                    this.setState({ processStepId: -1 });
                }

                this.setState({ memoDataForProcess });
            });
        } else if (action === 'delete') {
            this.setState((prevState) => {
                return {
                  openDeleteMemoDialog: !prevState.openDeleteMemoDialog,
                  selectedMemo: memoId,
                  dialogAction: action,
                };
              });
        } else {
            this.setState({ openMemoDialog: false, openDeleteMemoDialog: false, memoDataForProcess: JSON.parse(JSON.stringify(basicMemo)) });
        }
    }

    processData = () => {

        let { memoDataForProcess, openMemoDialog, selectedMemo, 
            openDeleteMemoDialog, dialogAction } = this.state;

            const params = {
                memo: {
                  action: this.state.dialogAction,
                  id: selectedMemo
                }
              };

        if (this.state.dialogAction !== 'delete') {
            params.memo = { 
                ...memoDataForProcess, 
                ...params.memo
            };
        }

        let reloadData = false;

        if (this.state.dialogAction !== 'delete' && !params.memo.header) return this.props.displayNotification('Please fill header field!', 'warning');

        this.setState({ isLoadingMemo: true});

        this.props.CUDMemo(params)
            .then(() => {
              memoDataForProcess = JSON.parse(JSON.stringify(basicMemo));
              openMemoDialog = false;
              openDeleteMemoDialog= false;
              selectedMemo = null;
              dialogAction = null;            
              reloadData = true;
            })
            .finally(() => {
            this.setState({ memoDataForProcess, openMemoDialog, openDeleteMemoDialog, 
                            selectedMemo, dialogAction, isLoadingMemo: false },
                    () => { if (reloadData) this.getMemoData(this.state.customerId); });
            });
    }

    handleSearchResult = (event, name) => {

        const value = event.target.value;
        
        if (name === 'personSearchId') this.setState({ personSearchId: value}, ()=> this.getMemoData(this.state.customerId, this.state.personSearchId, this.state.contractSearchId));
        if (name === 'contractSearchId') this.setState({ contractSearchId: value}, ()=> this.getMemoData(this.state.customerId, this.state.personSearchId, this.state.contractSearchId));

    };

    handleProcessDataChanges = (event, name) => {

        const { memoDataForProcess } = this.state;

        const value = event.target.value;

        if (name === 'contractId') this.setState({ contractId: value});

        if (name === 'processId' && value !== -1) {

            const processDefinitions = this.state.processDefinitions;
            
            const processDefinition = processDefinitions.find(processDefinition => processDefinition.key === value);

            this.setState({ tasks: processDefinition.userTasks, processStepId: -1, processId: value});

        } else if (name === 'processId' && value === -1) this.setState({ tasks: []});

        if (name === 'processStepId' && value !== -1) this.setState({ processStepId: value});

        if (name in memoDataForProcess && value !== -1) memoDataForProcess[name] = value;
    
        this.setState({ memoDataForProcess });
    }

    personName (personId) {

        if (!personId) return '';
    
        const stakeholders = this.state.stakeholders;

        const stakeholder = stakeholders.find(stakeholder => stakeholder.personId === personId);

        if (stakeholder && stakeholder.contractName) return stakeholder.contractName;
    }

    setHeaderOnTask (task) {

        const { memoDataForProcess } = this.state;

        memoDataForProcess.header = task;

        this.setState({ memoDataForProcess });
    }

    render() {

        const { classes } = this.props;

        const { memos, openMemoDialog, customer, memoDataForProcess, loanRequests, 
                stakeholders, openDeleteMemoDialog, personSearchId, contractSearchId,
                processDefinitions, tasks, processStepId } = this.state;

        const contractId = memoDataForProcess.contractId ? memoDataForProcess.contractId : -1;

        const personId = memoDataForProcess.personId ? memoDataForProcess.personId : -1;

        const processId = memoDataForProcess.processId ? memoDataForProcess.processId : -1;

        return (
            <div className={classes.header}>
                {/* <Notifier /> */}
                    {/* <Grid container justify="flex-end">
                {/* <GridContainer className={`${classes.flexContainer} ${classes.margin_botom_15}`}> */}
                <GridContainer className={classes.flexContainer}>
                    <GridItem className={classes.smallBox}>
                        <FormControl size= "small" variant="outlined" className={`${classes.formHeader}`}>
                            <InputLabel className={classes.inputLabel} id="contract-label">Contract</InputLabel>
                            <Select
                                labelId="contract"
                                id="contract"
                                value={contractSearchId}
                                onChange={(event) => this.handleSearchResult(event, 'contractSearchId')}
                                label="Internal Transaction Type"
                                className={classes.inputProp}
                            >
                                <MenuItem className={classes.menuItem} >All</MenuItem>
                                {loanRequests.map((loanRequest) => (
                                    <MenuItem className={classes.menuItem} key={loanRequest.id} value={loanRequest.contractId}>{loanRequest.contractId}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </GridItem>
                    <GridItem className={classes.smallBox}>
                        <FormControl size= "small" variant="outlined" className={`${classes.formHeader}`}>
                            <InputLabel className={classes.inputLabel} id="person-label">Person</InputLabel>
                            <Select
                                labelId="person"
                                id="person"
                                value={personSearchId}
                                onChange={(event) => this.handleSearchResult(event, 'personSearchId')}
                                label="Person"
                                className={classes.inputProp}
                            >
                                <MenuItem className={classes.menuItem}>All</MenuItem>
                                {stakeholders.map((stakeholder) => (
                                    <MenuItem className={classes.menuItem} key={stakeholder.id} value={stakeholder.personId}>{stakeholder.contractName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </GridItem>
                    <GridItem className={classes.smallBox}>
                        <div className={classes.memoButtonWrapper}>
                            <Button
                                variant='contained'
                                startIcon={<AddCircle />}
                                className={classes.confirmIconButton}
                                onClick={() => this.viewMemoDetails(null, 'create')}
                            >Add Memo</Button>
                        </div>

                    </GridItem>
                </GridContainer>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                        <TableContainer component={Paper} className={classes.tableContainer}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableHead className={classes.tableHeadColor}>
                                    <TableRow>
                                        <TableCell className={classes.tableCell}>Action</TableCell>
                                        <TableCell className={classes.tableCell}>Date</TableCell>
                                        <TableCell className={classes.tableCell}>Topic</TableCell>
                                        <TableCell className={classes.tableCell}>Text</TableCell>
                                        <TableCell className={classes.tableCell}>Contract</TableCell>
                                        <TableCell className={classes.tableCell}>Person</TableCell>
                                        <TableCell className={classes.tableCell}>User</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {memos.map((memo) => (
                                        <TableRow key={memo.id}>
                                        <TableCell className={classes.tableCell} >
                                            <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.viewMemoDetails(memo.id, 'update')}/></div>
                                            <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.viewMemoDetails(memo.id, 'delete')}/></div>
                                        </TableCell>
                                        <TableCell className={classes.tableCell}>{moment(memo.date).format('DD-MM-YYYY')}</TableCell>
                                        <TableCell className={classes.tableCell}>{memo.header}</TableCell>
                                        <TableCell className={classes.tableCell}>{memo.text}</TableCell>
                                        <TableCell className={classes.tableCell}>{memo.contractId}</TableCell>
                                        <TableCell className={classes.tableCell}>{this.personName(memo.personId)}</TableCell>
                                        <TableCell className={classes.tableCell}>{memo.userId}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </GridItem>
                </GridContainer>
                <Dialog open={openMemoDialog} fullWidth={true} maxWidth={'md'} aria-labelledby="memos">
                    <DialogContent>
                        <GridContainer>
                            <GridItem md={12}>
                                <Table style={{ marginTop: '15px' }} aria-label="simple table">
                                    <TableHead style={{ background: '#eeeeee' }}>
                                        <TableRow >
                                            <TableCell style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }} colSpan={2} align="center"><b>{this.state.dialogAction === 'create' ? 'Add' : 'Update'} Memo</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                         <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left">{'Customer'}</TableCell>
                                            <TableCell className={classes.rightBorderCell} align="left">
                                            <TextField
                                                id="customer"
                                                value={customer.legalName}
                                                fullWidth
                                                disabled
                                            />
                                            </TableCell>
                                        </TableRow>
                                       <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left" >{'Person'}</TableCell>
                                            <TableCell className={classes.rightBorderCell} align="left">
                                                <TextField
                                                    id="person"
                                                    onChange={(event) => this.handleProcessDataChanges(event, 'personId')}
                                                    value={personId || -1}
                                                    select
                                                    fullWidth
                                                >
                                                    <MenuItem value={-1}>Select</MenuItem>
                                                    {stakeholders.map((stakeholder) => (
                                                        <MenuItem key={stakeholder.id} value={stakeholder.personId}>{stakeholder.contractName}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left" >{'Contract'}</TableCell>
                                            <TableCell className={classes.rightBorderCell} align="left">
                                                <TextField
                                                    id="contract"
                                                    onChange={(event) => this.handleProcessDataChanges(event, 'contractId')}
                                                    value={contractId || -1}
                                                    select
                                                    fullWidth
                                                >
                                                    <MenuItem value={-1}>Select</MenuItem>
                                                    {loanRequests.map((loanRequest) => (
                                                        <MenuItem key={loanRequest.id} value={loanRequest.contractId}>{loanRequest.contractId}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell> 
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left" >{'Process'}</TableCell>
                                            <TableCell className={classes.rightBorderCell} align="left">
                                                <TextField
                                                    id="process"
                                                    onChange={(event) => this.handleProcessDataChanges(event, 'processId')}
                                                    value={processId || -1}
                                                    select
                                                    fullWidth
                                                >
                                                    <MenuItem value={-1}>Select</MenuItem>
                                                    {processDefinitions.map((processDefinition) => (
                                                        <MenuItem key={processDefinition.key} value={processDefinition.key}>{processDefinition.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell> 
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left" >{'Task'}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    id="task"
                                                    onChange={(event) => this.handleProcessDataChanges(event, 'processStepId')}
                                                    value={processStepId || -1}
                                                    select
                                                    fullWidth
                                                >
                                                    <MenuItem value={-1}>Select</MenuItem>
                                                    {tasks.map((task) => (
                                                        <MenuItem onClick={ () => this.setHeaderOnTask(task.name) } key={task.id} value={task.id}>{task.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left">{'Header'}</TableCell>
                                            <TableCell className={classes.rightBorderCell} align="left">
                                            <TextField
                                                id="header"
                                                multiline
                                                rows={4}
                                                onChange={(event) => this.handleProcessDataChanges(event, 'header')}
                                                value={memoDataForProcess.header || ''}
                                                fullWidth
                                            />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.leftAndRightBorderCell} align="left">{'Text'}</TableCell>
                                            <TableCell className={classes.rightBorderCell} align="left">
                                            <TextField
                                                id="text"
                                                multiline
                                                rows={4}
                                                onChange={(event) => this.handleProcessDataChanges(event, 'text')}
                                                value={memoDataForProcess.text || ''}
                                                fullWidth
                                            />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </GridItem>
                        </GridContainer>
                    </DialogContent>
                    <DialogActions>
                        {this.state.isLoadingMemo && <CircularProgress size={22}/>}
                        <Button onClick={this.viewMemoDetails} disabled={this.state.isLoadingMemo} className={classes.cancelIconButton}>Close</Button>
                        <Button onClick={this.processData} disabled={this.state.isLoadingMemo} className={classes.confirmIconButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openDeleteMemoDialog} aria-labelledby="delete-memo" aria-describedby="alert-dialog-description" onClose={this.viewMemoDetails} >
                    <DialogTitle id="alert-dialog-title">Delete Memo</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">{'Are you sure you want to delete this memo?'}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {this.state.isLoadingMemo && <CircularProgress size={22}/>}
                        <Button onClick={this.viewMemoDetails} disabled={this.state.isLoadingMemo} className={classes.cancelIconButton} >
                        Cancel
                    </Button>
                        <Button onClick={this.processData} disabled={this.state.isLoadingMemo} className={classes.confirmIconButton}  >
                        Delete
                    </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

MemoOverview.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getMemos: PropTypes.func, 
    displayNotification: PropTypes.func.isRequired,
    getCustomerDetails: PropTypes.func.isRequired,
    getSmeLoanRequestDetails: PropTypes.func.isRequired,
    getStakeholder: PropTypes.func.isRequired,
    CUDMemo: PropTypes.func.isRequired,
    getProcessDefinitions: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
    return {
    };
  };
  
  const mapDispatchToProps = (dispatch) => {
    return {
        getMemos: (customerId, personId, contractId) => dispatch(getMemos(customerId, personId, contractId)),
        displayNotification: (message, warning) => dispatch(displayNotification(message, warning)),
        getCustomerDetails: (customerId) => dispatch(getCustomerDetails(customerId)),
        getSmeLoanRequestDetails: (customerId) => dispatch(getSmeLoanRequestDetails(customerId)),
        getStakeholder: (customerId) => dispatch(getStakeholder(customerId)),
        CUDMemo: (memo) => dispatch(CUDMemo(memo)),
        getProcessDefinitions: () => dispatch(getProcessDefinitions()),
    };
  };
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(Style)(MemoOverview));