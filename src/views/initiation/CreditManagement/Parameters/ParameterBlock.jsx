import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import {
	Box, Collapse, Paper, Table, TableBody, TableCell,
	Dialog, TableHead, TableRow, Typography, Grid, TableContainer, Tooltip
} from '@material-ui/core';
import { clearCustomerDetails, clearSmeLoanRequests } from 'store/initiation/actions/BankAccount.action';
import { clearSmeLoanRequestDetails, getCreditRiskParameterList } from 'store/initiation/actions/CreditRiskOverview.action';
import { EURO, percentage , NODECIMALEURO} from 'lib/initiation/utility';
import moment from 'moment';
import CategoryDetailedTransactionHeader from '../Categories/CategoryDetailedTransactionHeader';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import { getBankTransactionsforMultipleIds } from 'store/initiation/actions/BankTransactions.action';
import TransactionsPopUp from '../Charts/TransactionsPopUp';
import { getCreditRiskParameterTypetList } from 'store/initiation/actions/CreditRiskParameterTypes.action';

class ParameterBlock extends Component {

	constructor(props) {
		super(props);

		this.state = {
			levelOneOpenIndex: null,
			levelTwoOpenIndex: null,
			selectedDetailedCategory: null,
			transactionsInDetailedCategory: null,
			isOpenUpdateTransactionPopup: false,
			orderDirection: "asc",
			valueToOrderBy: "date",
			isSelected: false,
			levelThreeOpen: false,
			levelOneOpen: false,
			transactionList: [],
			parameterList: [],
			creditRiskParameterTypes: []
		};
	}

	componentDidMount() {
		const { loanRequestId } = this.props;
		this.props.getCreditRiskParameterList(loanRequestId)
			.then(result => {
				this.setState({ parameterList: result });
			})
			.catch(() => {
				this.props.displayNotification('Error occured in get parameters error!', 'error');
			});


		this.props.getCreditRiskParameterTypetList()
			.then(result => {
				this.setState({ creditRiskParameterTypes: result });
			})
			.catch(() => {
				this.props.displayNotification('Error occured in get parameter Types error!', 'error');
			});
	}

	handleLevelOneExpand = (index, row) => {	

		const selectedIds = row.bankTransactionId;
		
		this.setState({ isSelected: !this.state.isSelected });
		const { levelOneOpenIndex } = this.state;


		if (index === levelOneOpenIndex) {
			this.setState({ levelOneOpenIndex: false, selectedDetailedCategory: null, transactionsInDetailedCategory: null, levelThreeOpen: false });
		}
		else {

			if (selectedIds && selectedIds.length > 0) {
				this.props.getBankTransactionsforMultipleIds({ id: selectedIds })
					.then((response) => {
						if (response) {
							this.setState({ levelOneOpenIndex: index, transactionsInDetailedCategory: response, levelThreeOpen: true });
						}
						else {
							console.log('err');
						}
					});
			}
		}
	}

	handleUpdateTransaction = (transaction) => {
		this.setState({ selectedTransaction: transaction }, () => {
			this.handlePopupOpen();
		});
	}

	getContentForTransactionTable = () => {
		const { transactionsInDetailedCategory } = this.state;
		const { classes } = this.props;

		const comparatorData = this.getComparator(this.state.orderDirection, this.state.valueToOrderBy);

		let sortedData;
		if (transactionsInDetailedCategory && transactionsInDetailedCategory != null) {
			sortedData = this.sortedRowInformation(transactionsInDetailedCategory && transactionsInDetailedCategory, comparatorData);
		}
		else {
			sortedData = [];
		}

		return (
			<Table size="small" aria-label="purchases">
				<CategoryDetailedTransactionHeader
					valueToOrderBy={this.state.valueToOrderBy}
					orderDirection={this.state.orderDirection}
					handleRequestSort={this.handleRequestSort}
				/>
				<TableBody>
					{sortedData && sortedData.length !== 0 ? sortedData.map((transaction, index) => (
						<TableRow key={index} onClick={() => this.handleUpdateTransaction(transaction)} className={classes.transactionTableRow} >
							<TableCell className={classes.transactionTableCell}>{moment(transaction.transactionDate).format('DD-MM-YYYY')}</TableCell>
							<TableCell className={classes.transactionTableCell} align="right">{NODECIMALEURO(transaction.amount)}</TableCell>
							<TableCell className={classes.transactionTableCell}>{transaction.counterParty}</TableCell>
							<TableCell className={classes.transactionTableCell} >{transaction.description}</TableCell>
						</TableRow>
					)) : <TableRow>No Data</TableRow>}
				</TableBody>
			</Table>
		);
	}

	handlePopupOpen = () => {
		this.setState({ isOpenUpdateTransactionPopup: !this.state.isOpenUpdateTransactionPopup });
	}

	handleRequestSort = (event, property) => {
		const isAscending = (this.state.valueToOrderBy === property && this.state.orderDirection === "asc");
		this.setState({ valueToOrderBy: property, orderDirection: isAscending ? "desc" : "asc" });
	}

	sortedRowInformation = (rowArray, comparator) => {

		const stabalizedRowArray = rowArray && rowArray.map((el, index) => [el, index]);
		stabalizedRowArray.sort((a, b) => {
			const order = comparator(a[0], b[0]);
			if (order !== 0) return order;
			return a[1] - b[1];
		});
		return stabalizedRowArray.map((el) => el[0]);
	}

	decendingComparator = (a, b, orderBy) => {
		if (b[orderBy] < a[orderBy]) {
			return -1;
		}
		if (b[orderBy] > a[orderBy]) {
			return 1;
		}
		return 0;
	}

	getComparator = (order, orderBy) => {
		return order === "desc"
			? (a, b) => this.decendingComparator(a, b, orderBy)
			: (a, b) => -this.decendingComparator(a, b, orderBy);
	}

	getTypeDescription =(type) => {
		 const { creditRiskParameterTypes}  = this.state;
		 
		if(creditRiskParameterTypes && creditRiskParameterTypes.length > 0) {
			const item = creditRiskParameterTypes.filter(item => item.type === type);
			return item && item.length === 0 ? null : item[0].description;
		}
	}

	formatParameterValues = (type, value) => {
		const { creditRiskParameterTypes}  = this.state;

		const selectedObj = creditRiskParameterTypes && creditRiskParameterTypes.length === 0 ? {} : creditRiskParameterTypes.filter(function (obj) { 
			return obj.type === type; 
		})[0];
		
		const selectedFormat = Object.keys(selectedObj).length === 0 ? ''  : selectedObj && selectedObj.format;

		switch (selectedFormat) {
			case 'integer': {
				return Math.round(value);
			}
			case 'integer+1': {
				return value.toFixed(1);
			}
			case 'integer+2': {
				return value.toFixed(2);
			}
			case 'euro-rounded': {
				return EURO(Math.round(value));
			}
			case 'euro-with-decimals': {
				return EURO(value);
			}
			case 'percentage': {
				return percentage(Math.round(Number(value)));
			}
			case 'percentage+': {
				return percentage(Number(value).toFixed(1));
			}
			case 'percentage+2': {
				return percentage(Number(value).toFixed(2));
			} 
			case 'string': {
				return value;
			}
			default : return value;
		  }

	}

	render() {
		const { levelOneOpenIndex, selectedTransaction, parameterList } = this.state;
		const { classes, title } = this.props;

		return (
			<>
				<Paper variant="outlined" className={classes.transactionContainer} >
					<Grid container justify="space-between">
						<Grid item>
							<Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>{title}</Typography>
						</Grid>
					</Grid>

					{/* <Paper variant="outlined"> */}
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table className={classes.table} aria-label="simple table">
							<TableHead className={classes.tableHeadColor}>
								<TableRow>
									<TableCell className={classes.tableCell}>Parameter</TableCell>
									<TableCell className={classes.tableCell} align="right">Parameter value</TableCell>
									<TableCell className={classes.tableCell} align="right">Turnover &nbsp;%</TableCell>
									<TableCell className={classes.tableCell} align="right">Source</TableCell>
									{/* <TableCell className={classes.tableCell} align="right">No-of-Trans.</TableCell> */}
								</TableRow>
							</TableHead>
							<TableBody>
								{/* ======== check data length of table ============ */}
								{parameterList.length === 0 ?
									<TableRow>
										<TableCell className={classes.tableCell} align="center" colSpan={6}>
											{'No Data to show'}
										</TableCell>
									</TableRow>
									: parameterList.map((row, levelOneIndex) => (
									
										<React.Fragment key={levelOneIndex}>
											<Tooltip title={this.getTypeDescription(row.type)}>
											<TableRow onClick={() => this.handleLevelOneExpand(levelOneIndex, row)} className={`${this.state.levelOneOpenIndex === levelOneIndex ? classes.selectedRow : null} ${row.bankTransactionId && row.bankTransactionId.length > 0 ? classes.parameterClickableRow: "inherit"}`} >
												<TableCell className={classes.tableCell}>
													{row.type}
												</TableCell>
												<TableCell className={classes.tableCell} align="right">{this.formatParameterValues(row.type,row.value)}</TableCell>
												<TableCell className={classes.tableCell} align="right">{percentage(row.turnover)}</TableCell>
												<TableCell className={classes.tableCell} align="right">{row.source}</TableCell>
											</TableRow>
											</Tooltip>

											{levelOneOpenIndex === levelOneIndex ?
													<React.Fragment>
														
															<TableRow >
																<TableCell className={classes.transactionTableCell} colSpan={6}>

																	<Collapse in={this.state.levelThreeOpen} timeout="auto" unmountOnExit>
																		<Box margin={1}>
																			{this.getContentForTransactionTable()}
																		</Box>
																	</Collapse>
																</TableCell>
															</TableRow> 

													</React.Fragment>
												:
												false}

										</React.Fragment>
									))}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
				<Dialog
					onClose={this.handlePopupOpen}
					aria-labelledby="transaction-dialog"
					fullWidth
					maxWidth={'lg'}
					open={this.state.isOpenUpdateTransactionPopup}>
					<Paper className={classes.popUpContainer}>
					<TransactionsPopUp bankTransactions={[selectedTransaction]} handlePopupOpen={this.handlePopupOpen} />
					</Paper>
				</Dialog>
			</>
		);
	}
}

ParameterBlock.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	totalAmount: PropTypes.number,
	dataList: PropTypes.array,
	parameterTypeList: PropTypes.array,
	// clearSmeLoanRequestDetails: PropTypes.func,
	// contractId: PropTypes.string,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	contractId: state.lmglobal.overviewData.contractId,
	loanRequestId:  state.lmglobal.overviewData.id
});

const mapDispatchToProps = (dispatch) => ({
	clearCustomerDetails: () => dispatch(clearCustomerDetails()),
	clearSmeLoanRequests: () => dispatch(clearSmeLoanRequests()),
	clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails()),
	getBankTransactionsforMultipleIds: (data) => dispatch(getBankTransactionsforMultipleIds(data)),
	getCreditRiskParameterList: (requestQuery) => dispatch(getCreditRiskParameterList(requestQuery)),
	getCreditRiskParameterTypetList: () => dispatch(getCreditRiskParameterTypetList())
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(ParameterBlock));

