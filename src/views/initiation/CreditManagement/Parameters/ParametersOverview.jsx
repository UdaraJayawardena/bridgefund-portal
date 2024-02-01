import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import { Checkbox, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { getAllBankTransactionsForCategoryPage } from 'store/initiation/actions/CreditRiskOverview.action';
import ParameterBlock from './ParameterBlock';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";


class Parameters extends Component {

	constructor(props) {
		super(props);

		this.state = {
			requestBlocks: [],
			isLoadingOutgoingBlock: false,
			isLoadingIncomingBlock: false
		};
	}

	componentDidMount() {
		this.getInitialdata();
	}

	getInitialdata = () => {
		const { requestBlocks } = this.state;

		if (requestBlocks.length > 0) {
			this.props.getAllBankTransactionsForCategoryPage(requestBlocks.map(acc => {
				return {
					"action": "GET",
					"ibanNumber": acc.iban,
					"startDate": acc.firstDate,
					"endDate": acc.lastDate
				};
			}));
	
		}
		else {
			this.props.getAllBankTransactionsForCategoryPage([]);
		}
	}

	handleBlockTableChange = (e, block) => {
		if (e.target.checked)
			this.addElement(block);
		else
			this.removeElement(block);

	}

	addElement = (block) => {
		const array = [...this.state.requestBlocks];
		array.push(block);
		this.setState({ requestBlocks: array }, () => this.getInitialdata());
	}

	removeElement = (block) => {
		const array = [...this.state.requestBlocks];
		const index = array.indexOf(block);
		if (index !== -1) {
			array.splice(index, 1);
			this.setState({ requestBlocks: array }, () => this.getInitialdata());
		}
	}

	render() {
		const { classes, bankAccounts} = this.props;
		// const bankAccounts = this.state.requestBlocks;

		return (
			<div >
				{/* table section ===============================*/}
				{/* <GridContainer >
					<GridItem md={12}> */}
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table className={classes.table} aria-label="simple table">
							<TableHead  className={classes.tableHeadColor}>
								<TableRow >
									<TableCell className={classes.tableCell}>&nbsp;</TableCell>
									<TableCell className={classes.tableCell} align="left">IBAN</TableCell>
									<TableCell className={classes.tableCell} align="left">Currency</TableCell>
									<TableCell className={classes.tableCell} align="left">Account-Type</TableCell>
									{/* <TableCell className={classes.tableCell} align="left">Owner</TableCell> */}
									<TableCell className={classes.tableCell} align="left">First-Date</TableCell>
									<TableCell  className={classes.tableCell} align="left">Last-Date</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{bankAccounts.length === 0 ?

									<TableRow>
										<TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={8}>
											{'No Accounts to show'}
										</TableCell>
									</TableRow>

									:

									bankAccounts.map((acc, index) =>
										<TableRow key={index} >
											<TableCell className={classes.tableCell}>
												<Checkbox
													// defaultChecked
													defaultChecked={acc.highestTurnoverIndicator ? true : false}
													disabled
													onChange={(e) => this.handleBlockTableChange(e, acc)}
													color="default"
													inputProps={{ 'aria-label': 'checkbox with default color' }}
												/>
											</TableCell>
											<TableCell  className={classes.tableCell}align="left">{acc.iban}</TableCell>
											<TableCell className={classes.tableCell}align="left">{acc.currency}</TableCell>
											<TableCell className={classes.tableCell}align="left">{acc.accountType}</TableCell>
											{/* <TableCell className={classes.tableCell}align="left">{acc.owner}</TableCell> */}
											<TableCell className={classes.tableCell} align="left">{moment(acc.firstDate).format('DD-MM-YYYY')}</TableCell>
											<TableCell className={classes.tableCell} align="left">{moment(acc.lastDate).format('DD-MM-YYYY')}</TableCell>
										</TableRow>
									)}
							</TableBody>
						</Table>
						</TableContainer>
					{/* </GridItem>
				</GridContainer> */}
				{/* ======================= transaction blocks ========================== */}
				<GridContainer>
					{/* ======================= outgoing transaction block ========================== */}
					<GridItem xs={6} sm={6} lg={6}>
						<ParameterBlock dataList={this.props.listData} title="Parameters" parameterTypeList={this.props.parameterTypes}/>
					</GridItem>

				</GridContainer>
				{/* ============ popup content =============== */}
			</div>
		);
	}
}

Parameters.propTypes = {
	classes: PropTypes.object.isRequired,
	setCustomerDetails: PropTypes.func,
	clearCustomerDetails: PropTypes.func,
	customer: PropTypes.object,
	overviewData: PropTypes.object,
	pricingParameter: PropTypes.object,
	getSmeLoanRequests: PropTypes.func,
	smeLoanRequests: PropTypes.array,
	getSmeLoanRequestDetails: PropTypes.func,
	getStandardLoanPricingParameter: PropTypes.func,
	getBankAccounts: PropTypes.func,
	bankAccounts: PropTypes.array,
	incomingTransactionData: PropTypes.object,
	outgoingTransactionData: PropTypes.object,
	listData: PropTypes.array,
	parameterTypes: PropTypes.array,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	smeLoanRequests: state.creditRiskOverview.smeLoanRequests,
	overviewData: state.lmglobal.overviewData,
	pricingParameter: state.creditRiskOverview.pricingParameter,
	bankAccounts: state.creditRiskOverview.bankAccounts,
	incomingTransactionData: state.creditRiskOverview.incomingTransactionData,
	outgoingTransactionData: state.creditRiskOverview.outgoingTransactionData,
});

const mapDispatchToProps = (dispatch) => ({
	getAllBankTransactionsForCategoryPage: (dataList) => dispatch(getAllBankTransactionsForCategoryPage(dataList))
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(Parameters));