import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import clx from 'classnames';
import {
	Box, Collapse, Paper, Table, TableBody, TableCell,
	Dialog, TableHead, TableRow, Typography, Grid, TableContainer
} from '@material-ui/core';
import { clearCustomerDetails, clearSmeLoanRequests } from 'store/initiation/actions/BankAccount.action';
import { clearSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import { EURO, percentage, NODECIMALEURO } from 'lib/initiation/utility';
import moment from 'moment';
import TransactionPopUp from '../Charts/TransactionsPopUp';
import CategoryDetailedTransactionHeader from './TransactionHeader';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";

class InternalTypeBlock extends Component {

	constructor(props) {
		super(props);

		this.state = {
			levelOneOpenIndex: null,
			transactionsForInternalType: null,
			isOpenUpdateTransactionPopup: false,
			orderDirection: "asc",
			valueToOrderBy: "date",
		};
	}

	handleLevelOneExpand = (index, transactions) => {

		if (index === this.state.levelOneOpenIndex) {
			this.setState({
				levelOneOpenIndex: null,
				transactionsForInternalType: null
			});
		}
		else {
			this.setState({
				levelOneOpenIndex: index,
				transactionsForInternalType: transactions
			});
		}

	}


	handleUpdateTransaction = (transaction) => {
		this.setState({ selectedTransaction: transaction }, () => {
			this.handlePopupOpen();
		});
	}

	getContentForTransactionTable = () => {
		const { transactionsForInternalType } = this.state;
		const { classes } = this.props;

		const comparatorData = this.getComparator(this.state.orderDirection, this.state.valueToOrderBy);

		let sortedData;
		if (transactionsForInternalType && transactionsForInternalType != null) {
			sortedData = this.sortedRowInformation(transactionsForInternalType && transactionsForInternalType, comparatorData);
		}
		else {
			sortedData = [];
		}

		return (
			<Table size="small" aria-label="purchases" >
				<CategoryDetailedTransactionHeader
					valueToOrderBy={this.state.valueToOrderBy}
					orderDirection={this.state.orderDirection}
					handleRequestSort={this.handleRequestSort}
				/>
				<TableBody className={classes.transactionTableBody}>
					{sortedData && sortedData.length !== 0 ? sortedData.map((transaction, index) => (
						<TableRow key={index} onClick={() => this.handleUpdateTransaction(transaction)} className={clx(classes.transactionTableRow, classes.parameterClickableRow)} >
							<TableCell className={classes.transactionTableCell}>{moment(transaction.transaction_date).format('DD-MM-YYYY')}</TableCell>
							<TableCell className={classes.transactionTableCell} align="right">{NODECIMALEURO(transaction.amount)}</TableCell>
							<TableCell className={classes.transactionTableCell} style={{ paddingLeft: '15px' }} align="left">{transaction.counterparty_name}</TableCell>
							<TableCell className={classes.transactionTableCell} align="left">{transaction.description}</TableCell>
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

	addItemToList = (obj) => {
		const list = [];
		list.push(obj);
		return list;
	}

	render() {
		const { levelOneOpenIndex, selectedTransaction, isOpenUpdateTransactionPopup } = this.state;
		const { classes, title, totalAmount, dataList } = this.props;

		return (
			<>
				<Paper variant="outlined" className={classes.transactionContainer} >
					<Grid container justify="space-between">
						<Grid item>
							<Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>{title}</Typography>
						</Grid>
						<Grid item>
							<Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>{EURO(totalAmount)}</Typography>
						</Grid>
					</Grid>

					{/* <Paper variant="outlined"> */}
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table className={classes.table} aria-label="simple table">
							<TableHead className={classes.tableHeadColor}>
								<TableRow>
									<TableCell className={classes.tableCell}>Internal Transaction Type</TableCell>
									<TableCell className={classes.tableCell} align="right">Amount</TableCell>
									<TableCell className={classes.tableCell} align="right">Perc. &nbsp;%</TableCell>
									<TableCell className={classes.tableCell} align="right">No-of-Trans.</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{/* ======== check data length of table ============ */}
								{dataList.length === 0 ?
									<TableRow>
										<TableCell className={classes.tableCell} align="center" colSpan={4}>
											{'No Data to show'}
										</TableCell>
									</TableRow>
									: dataList.map((row, levelOneIndex) => (
										// ==========  internalType rows ====================
										<React.Fragment key={levelOneIndex}>
											<TableRow onClick={() => this.handleLevelOneExpand(levelOneIndex, row.transactions)} className={levelOneOpenIndex === levelOneIndex ? classes.selectedRow : classes.parameterClickableRow}>
												<TableCell className={classes.tableCell}>{row.internalTransactionType}</TableCell>
												<TableCell className={classes.tableCell} align="right">{EURO(row.totalAmount)}</TableCell>
												<TableCell className={classes.tableCell} align="right">{percentage(row.totalPercentage)}</TableCell>
												<TableCell className={classes.tableCell} align="right">{row.noOfTransactions}</TableCell>
											</TableRow>

											{levelOneOpenIndex === levelOneIndex ?
												<TableRow >
													<TableCell className={classes.transactionTableCell} colSpan={4}>

														<Collapse in={levelOneOpenIndex === levelOneIndex} timeout="auto" unmountOnExit>
															<Box margin={1}>
																{this.getContentForTransactionTable()}
															</Box>
														</Collapse>
													</TableCell>
												</TableRow> : false}

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
					open={isOpenUpdateTransactionPopup}>
					<Paper className={classes.popUpContainer}>
						{/* todo */}
						<TransactionPopUp bankTransactions={this.addItemToList(selectedTransaction)} handlePopupOpen={this.handlePopupOpen} />
					</Paper>
				</Dialog>
			</>
		);
	}
}

InternalTypeBlock.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	totalAmount: PropTypes.number,
	dataList: PropTypes.array,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	contractId: state.lmglobal.overviewData.contractId,
});

const mapDispatchToProps = (dispatch) => ({
	clearCustomerDetails: () => dispatch(clearCustomerDetails()),
	clearSmeLoanRequests: () => dispatch(clearSmeLoanRequests()),
	clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails()),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(InternalTypeBlock));

