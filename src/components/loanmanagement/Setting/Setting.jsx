import React from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from 'components/loanmanagement/Card/Card.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import CardFooter from 'components/loanmanagement/Card/CardFooter.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import Notifier from 'components/loanmanagement/Notification/Notifier';
import CustomTable from 'components/loanmanagement/Table/Table.jsx';

import { getProvisionParameterHistory, getProvisionParameters, createProvisionParameters, emptyProvisionParameters } from "store/loanmanagement/actions/ProvisionParameters";
import ProvisionParameters from './ProvisionParameters'
import ConfirmationDialog from "components/loanmanagement/ConfirmationDialog/ConfirmationDialog.jsx"
import { createStyles } from '@material-ui/core';

const styles = createStyles({
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
		fontWeight: 300,
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
});

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
			provisionParameters: { provisionParameters: provisionChanges }
		});
	}

	refresh = () => {
		this.setState({
			refresh: true,
		});
	}

	savePrompt = () => {
		this.setState({
			savePrompt: true
		});
	}
	onSaveConfirm = (value, callbackFunc) => {
		if (value) {
			this.props.createProvisionParameters(this.state.provisionParameters);
		}
		this.setState({
			savePrompt: !this.state.savePrompt,
			changes: false
		})
		callbackFunc();
	}

	updateTableList = () => {
		this.props.getProvisionParameterHistory('all');
	}


	componentDidMount() {
		this.props.getProvisionParameterHistory('all');
		this.props.getProvisionParameters('active');
	}

	render() {
		const { classes, provisionParameters, provisionParameterHistory } = this.props
		const { changes } = this.state
		const provisionParameterHistoryList = provisionParameterHistory.config ? provisionParameterHistory.config : [];

		return (
			<div>
				<Notifier />

				<GridContainer>
					<GridItem xs={12} sm={12} md={12}>
						<Card chart>
							<CardHeader color="info">
								<h4 className={classes.cardTitleWhite}>Set Provision Parameters</h4>
							</CardHeader>

							<CardBody>
								<GridContainer>
									<GridItem xs={12} sm={12} md={12}>
										<Card chart>
											<CardBody>
												<ProvisionParameters provisionParameters={provisionParameters} callChanges={this.callChanges} refresh={this.refresh} />
											</CardBody>
											<Box style={{ margin: '10px' }}>
												<Button style={{ float: 'right' }} size="small" color="secondary" onClick={() => { this.refresh() }}>Cancel</Button>
												<Button style={{ float: 'right' }} size="small" color="primary" disabled={changes === false ? true : false} onClick={() => { this.savePrompt() }}>Save</Button>
											</Box>
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
									tableData={provisionParameterHistoryList.map((p, key) => {
										return [(key + 1).toString(),
										moment(provisionParameterHistory.createdAt).format('DD-MM-YYYY'),
										moment(provisionParameterHistory.updatedAt).format('DD-MM-YYYY'),
										p.parameters[0].standardProvisionPercentage.toString(),
										p.parameters[1].standardProvisionPercentage.toString(),
										p.parameters[2].standardProvisionPercentage.toString()];
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
						handleOk={() => this.onSaveConfirm(true, this.updateTableList)}
						handleCancel={() => this.onSaveConfirm(false, this.updateTableList)} /> : ''
				}
			</div>
		)
	}
}

Setting.propTypes = {
	classes: PropTypes.object.isRequired,
	provisionParameters: PropTypes.array,
	provisionParameterHistory: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	getProvisionParameters: PropTypes.func.isRequired,
	clearProvisionParameters: PropTypes.func.isRequired,
	createProvisionParameters: PropTypes.func.isRequired,
	getProvisionParameterHistory: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
	return {
		provisionParameters: state.provisionParameters.provisionParameters,
		provisionParameterHistory: state.provisionParameters.provisionParameterHistory
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getProvisionParameterHistory: status => {
			dispatch(getProvisionParameterHistory(status));
		},
		getProvisionParameters: status => {
			dispatch(getProvisionParameters(status));
		},
		createProvisionParameters: object => {
			dispatch(createProvisionParameters(object));
		},
		clearProvisionParameters: () => {
			dispatch(emptyProvisionParameters([]));
		}
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Setting));