import React from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import moment from 'moment';

import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from 'components/crm/Card/Card.jsx';
import CardBody from 'components/crm/Card/CardBody.jsx';
import CardHeader from 'components/crm/Card/CardHeader.jsx';
import CardFooter from 'components/crm/Card/CardFooter.jsx';
import GridItem from 'components/crm/Grid/GridItem.jsx';
import GridContainer from 'components/crm/Grid/GridContainer.jsx';
import Notifier from 'components/crm/Notification/Notifier';
import CustomTable from 'components/crm/Table/Table.jsx';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ConfirmationDialog from "components/ConfirmationDialog/ConfirmationDialog.jsx"

const styles = {
    cardCategoryWhite: {
        color: 'rgba(255,255,255,.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0'
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        textAlign: 'center'
    },
    fullList: {
        width: 'auto'
    },
    fabButton: {
        position: 'absolute',
        zIndex: 1,
        bottom: -35,
        left: 0,
        right: 0,
        margin: '0 auto',
      },
};

class Setting extends React.Component {
    state = {
        open: false,
        changes: false,
        refresh: false,

        savePrompt: false,
        provisionParameters: {}
    };

    callChanges = (provisionChanges) => {
        this.setState({
            changes: this.props.provisionParameters === provisionChanges,
            provisionParameters: { provisionParameters: provisionChanges, isActive: true}
        });
    }

    refresh = () => {
        this.setState({
            refresh: true
        });
    }

    savePrompt = () => {
        this.setState({
            savePrompt: true
        });
    }
    onSaveConfirm = (value) => {
        if (value) {
            // this.props.createProvisionParameters(this.props.provisionParameters)
            // this.props.createProvisionParameters(Object.assign({}, this.props.provisionParameters))
            this.props.createProvisionParameters(this.state.provisionParameters)
        }
        this.setState({
            savePrompt: !this.state.savePrompt
        })
    }
    

    componentDidMount(){
    }

    render() {
        const { classes, setting, provisionParameters, provisionParameterHistory } = this.props 
        const { changes } = this.state

        provisionParameterHistory && provisionParameterHistory.sort((a, b) => {
            return  new Date(b.createdAt) -  new Date(a.createdAt);
          })

        return (
            <div>
                <Notifier />

                <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                        <Card chart>
                            <CardHeader color="info">
                                <h4 className={classes.cardTitleWhite}>Set Provision Parameters</h4>
                                {/* <Fab color="primary" aria-label="Add" className={classes.fabButton}>
                                    <AddIcon />
                                </Fab> */}
                            </CardHeader>

                            <CardBody>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <Card chart>
                                            {/* <CardHeader>
                                            </CardHeader> */}
                                            <CardBody> 
                                                <ProvisionParameters provisionParameters={provisionParameters} callChanges={this.callChanges} refresh={this.refresh}/>
                                            </CardBody>

                                            <ExpansionPanel defaultExpanded>    
                                                <ExpansionPanelActions>
                                                    <Button size="small" color="secondary" onClick={(e) => {this.refresh(this)} }>Cancel</Button>
                                                    <Button size="small" color="primary" disabled={changes===false?true:false} onClick={(e) => {this.savePrompt(this)} }>
                                                        Save
                                                    </Button>
                                                </ExpansionPanelActions>
                                            </ExpansionPanel>
                                        </Card>
                                        
                                    </GridItem>
                                </GridContainer>
                            </CardBody>
                        </Card>

                        <Card chart>
                            <CardHeader color="info">
                                <h4 className={classes.cardTitleWhite}>History/Detail</h4>
                            </CardHeader>

                            <CardBody>
                                <CustomTable
                                    tableHeaderColor="warning"
                                    tableHead={["#", "Created", "Updated", "Normal", "Extended", "Severe"]}
                                    tableData={provisionParameterHistory && provisionParameterHistory.map((p, key) => {
                                        return [(key + 1).toString(), 
                                                moment(p.createdAt).format('DD-MM-YYYY'),
                                                moment(p.updatedAt).format('DD-MM-YYYY'),
                                                p.provisionParameters[0].standardProvisionPercentage.toString(),
                                                p.provisionParameters[1].standardProvisionPercentage.toString(),
                                                p.provisionParameters[2].standardProvisionPercentage.toString()] ;
                                    })}
                                    />
                            </CardBody>
                            
                            <CardFooter chart>
                                <div className={classes.stats}>
                                    {/* updated 4 minutes ago */}
                                </div>
                            </CardFooter>
                        </Card>
                    </GridItem>

                    <GridItem xs={12} sm={12} md={12}>
                        
                    </GridItem>
                </GridContainer>

                {/*Confirmation Dialog*/}
                {this.state.savePrompt ?
                    <ConfirmationDialog title='Save ?'
                        content={'Do you want to Save ?'}
                        cancel={<span style={{ textTransform: 'uppercase' }}>NO</span>}
                        ok={<span style={{ textTransform: 'uppercase' }}>YES</span>}
                        open={this.state.savePrompt}
                        handleOk={() => this.onSaveConfirm(true)}
                        handleCancel={() => this.onSaveConfirm(false)} /> : ''
                }
            </div>
        )
    }
}

Setting.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
    return {
        provisionParameters: state.provisionParameters.provisionParameters,
        provisionParameterHistory: state.provisionParameters.provisionParameterHistory
    };
};

const mapDispatchToProps = dispatch => {
    return {
        
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(Setting));