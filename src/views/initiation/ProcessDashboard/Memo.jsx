import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Button, DialogActions, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';

import { displayNotification } from "store/initiation/actions/Notifier";
import { getPersonListForCustomer, createMemo } from 'store/initiation/actions/ProcessDashboard.action';

const style = (theme) => ({
	blueIconButton: {
		color: "#fff",
		backgroundColor: '#2CC4EB',
		borderRadius: 20,
		textTransform: 'none',
		margin: theme.spacing(2)
	},
	defaultIconButton: {
		color: "#000",
		// backgroundColor: '#2CC4EB',
		borderRadius: 20,
		textTransform: 'none',
		margin: theme.spacing(2)
	},

	rightBorderCell: {
		borderRight: '1px solid rgba(224, 224, 224, 1)'
	},
	leftAndRightBorderCell: {
		borderRight: '1px solid rgba(224, 224, 224, 1)',
		borderLeft: '1px solid rgba(224, 224, 224, 1)'
	}
});

class Memo extends Component {

	constructor(props) {
		super(props);
		this.state = {
			personList: [],
			selectedPerson: '',
			headerValue: '',
			textValue: '',
		};
	}

	componentDidMount() {
		const { memoData } = this.props;

		this.props.getPersonListForCustomer({ customerId: memoData.customer })
			// todo need to change this id to get data from task prop
			.then(res => {
				if (res.length === 1) {
					this.setState({ personList: res, selectedPerson: res[0].personId, headerValue: memoData.taskName });
				}
				else {
					this.setState({ personList: res, headerValue: memoData.taskName });
				}
			})
			.catch(err => console.log(err));
	}

	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	}

	handleCreateMemo = () => {
		const { memoData } = this.props;
		const { selectedPerson, headerValue, textValue } = this.state;

		if (headerValue === '') return this.props.displayNotification('Header should be filled !', 'warning');

		const reqData = {
			memo: {
				action: "create",
				customerId: memoData.customer,
				personId: selectedPerson,
				contractId: memoData.contractId,
				processId: memoData.processKey,
				processStepId: memoData.taskKey,
				header: headerValue,
				text: textValue,
			}
		};
		this.props.createMemo(reqData)
			.then(() => this.props.handleMemoDialog());

	}

	render() {
		const { classes, memoData } = this.props;
		const { selectedPerson, headerValue, textValue, personList } = this.state;
		return (
			<>
				<DialogContent>
					<GridContainer>
						<GridItem md={12}>
							<Table style={{ marginTop: '15px' }} aria-label="simple table">
								<TableHead style={{ background: '#eeeeee' }}>
									<TableRow >
										<TableCell style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }} colSpan={2} align="center"><b>Memo</b></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow >
										<TableCell className={classes.leftAndRightBorderCell} align="left">{'Customer'}</TableCell>
										<TableCell className={classes.rightBorderCell} align="left">
											<TextField
												id="customer"
												value={memoData.customerLegalName || ''}
												fullWidth
												disabled
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.leftAndRightBorderCell} align="left" >{'Person'}</TableCell>
										<TableCell className={classes.rightBorderCell} align="left"><TextField
											id="standard-select-person"
											select
											fullWidth
											name="selectedPerson"
											value={selectedPerson}
											onChange={this.handleChange}
										>
											<MenuItem value="" disabled>
												<em>None</em>
											</MenuItem>
											{personList && personList.map((stakeholder) => (
												<MenuItem key={stakeholder.id} value={stakeholder.personId}>{stakeholder.contractName}</MenuItem>
											))}
										</TextField>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.leftAndRightBorderCell} align="left">{'Process'}</TableCell>
										<TableCell className={classes.rightBorderCell} align="left">
											<TextField
												id="process"
												value={memoData.processName}
												fullWidth
												disabled
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.leftAndRightBorderCell} align="left">{'Task'}</TableCell>
										<TableCell className={classes.rightBorderCell} align="left">
											<TextField
												id="task"
												value={memoData.taskName}
												fullWidth
												disabled
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.leftAndRightBorderCell} align="left">{'Header'}</TableCell>
										<TableCell className={classes.rightBorderCell} align="left">
											<TextField
												id="header"
												name="headerValue"
												multiline
												rows={4}
												value={headerValue}
												onChange={this.handleChange}
												fullWidth
											// placeholder="Header"
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.leftAndRightBorderCell} align="left">{'Text'}</TableCell>
										<TableCell className={classes.rightBorderCell} align="left">
											<TextField
												id="text"
												name="textValue"
												multiline
												rows={4}
												value={textValue}
												onChange={this.handleChange}
												fullWidth
											// placeholder="Text"
											/>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</GridItem>
					</GridContainer>
				</DialogContent>
				<DialogActions>
					<Button variant='contained' onClick={this.props.handleMemoDialog} className={classes.defaultIconButton}>
						Cancel
			</Button>
					<Button variant='contained' onClick={this.handleCreateMemo} className={classes.blueIconButton}>
						Process
			</Button>
				</DialogActions>
			</>
		);
	}

}

Memo.propTypes = {
	classes: PropTypes.object.isRequired,
	memoData: PropTypes.object,
	getPersonListForCustomer: PropTypes.func,
	displayNotification: PropTypes.func,
	handleMemoDialog: PropTypes.func,
	createMemo: PropTypes.func,
};


const mapStateToProp = (/* state */) => ({
	// smeLoanRequests: state.creditRiskOverview.smeLoanRequests,
	// overviewData: state.creditRiskOverview.overviewData,
	// pricingParameter: state.creditRiskOverview.pricingParameter,
	// bankAccounts: state.creditRiskOverview.bankAccounts,
});

const mapDispatchToProps = (dispatch) => ({
	displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
	getPersonListForCustomer: (requestQuery) => dispatch(getPersonListForCustomer(requestQuery)),
	createMemo: (requestQuery) => dispatch(createMemo(requestQuery)),
	// getSmeLoanRequestDetails: (requestQuery) => dispatch(getSmeLoanRequestDetails(requestQuery)),
	// getStandardLoanPricingParameter: (requestQuery) => dispatch(getStandardLoanPricingParameter(requestQuery)),
	// getBankAccounts: (requestQuery) => dispatch(getBankAccounts(requestQuery)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(Memo));