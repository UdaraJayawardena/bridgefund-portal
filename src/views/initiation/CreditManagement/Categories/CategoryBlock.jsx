/* eslint-disable no-else-return */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import {
	Box, Collapse, Paper, Table, TableBody, TableCell, Switch,
	Dialog, TableHead, TableRow, Typography, Grid, TableContainer, TableSortLabel, Checkbox
} from '@material-ui/core';
import Stack from '@mui/material/Stack';
import { clearCustomerDetails, clearSmeLoanRequests } from 'store/initiation/actions/BankAccount.action';
import { clearSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import { EURO, percentage, NODECIMALEURO } from 'lib/initiation/utility';
import moment from 'moment';
import CategoryDetailedTransactionHeader from './CategoryDetailedTransactionHeader';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import TransactionsPopUp from '../Charts/TransactionsPopUp';
import util from "lib/loanmanagement/utility";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Button, IconButton, Tooltip } from '@mui/material';

const findCommonElementsInArrays = (arr1, arr2) => {
	return arr1.some(item => arr2.includes(item));
};

const diffArray = (arr1, arr2) => {
	return arr1.filter((el) => !arr2.includes(el));
};
class CategoryBlock extends Component {

	constructor(props) {
		super(props);

		this.state = {
			levelOneOpenIndex: null,// drill down from sub-cat to detail-cat
			levelTwoOpenIndex: null,// drill down from detail-cat to IBANNR
			levelThreeOpenIndex: null,// drill down from IBANNR to related transactions
			transactionsInIBANNR: null,
			isOpenUpdateTransactionPopup: false,
			orderDirection: "asc",
			valueToOrderBy: "date",
			isSelected: false,
			levelTwoOpen: false,// is open of detail-cat
			levelOneOpen: false,// is open of sub-cat
			levelThreeOpen: false, // is open of IBANNR
			valueToOrderByLevel_1: 'totalPercentage',//'absoluteTotal',
			OrderDirectionlevel_1: 'desc',

			selectedTransactions: [],
			shiftSlectedTransactionIndex: null,
		};
	}

	handleLevelOneExpand = (index) => { // sub-category expansion handling 
		this.setState({ isSelected: !this.state.isSelected });
		const { levelOneOpenIndex } = this.state;

		if (index === levelOneOpenIndex) {
			this.setState({
				levelThreeOpenIndex: null,
				levelTwoOpenIndex: null,
				levelOneOpenIndex: null,
				transactionsInIBANNR: null,
				levelOneOpen: false,
				levelTwoOpen: false,
				levelThreeOpen: false,
			});
		}
		else {
			this.setState({
				levelOneOpenIndex: index,
				transactionsInIBANNR: null,
				levelTwoOpenIndex: null,
				selectedTransaction: null,
				selectedTransactions: [],
				shiftSlectedTransactionIndex: null,
				levelTwoOpen: false,
				levelOneOpen: true
			});

		}
	}

	handleLevelTwoExpand = (index) => { // detail-category expansion handling 

		const { levelTwoOpenIndex } = this.state;

		if (index === levelTwoOpenIndex) {
			this.setState({ levelTwoOpenIndex: false, levelThreeOpenIndex: false, levelTwoOpen: false, levelThreeOpen: false, selectedTransactions: [] });
		}
		else {
			this.setState({ levelTwoOpenIndex: index, levelTwoOpen: true, selectedTransactions: [] });
		}
	}

	handleLevelThreeExpand = (index, transactions) => {// IBANNR expansion handling 

		const { levelThreeOpenIndex } = this.state;

		if (index === levelThreeOpenIndex) {
			this.setState({ levelThreeOpenIndex: false, transactionsInIBANNR: null, levelThreeOpen: false, shiftSlectedTransactionIndex: null });
		}
		else {
			this.setState({ levelThreeOpenIndex: index, transactionsInIBANNR: transactions, levelThreeOpen: true, shiftSlectedTransactionIndex: null });
		}
	}

	handleUpdateTransaction = () => {
		this.handlePopupOpen();
	}


	handleTransactionCheckBoxChange = (e, block, index, sortedDate) => {
		if (e.target.checked) {
			if (e.nativeEvent.shiftKey) {
				// shift key pressed
				if (this.state.shiftSlectedTransactionIndex !== null) {
					// 1st index available
					const newAddElementTransactions = this.generateNewAddElementTransactionArray(index, this.state.shiftSlectedTransactionIndex, this.state.selectedTransactions, sortedDate);
					this.setState({ shiftSlectedTransactionIndex: null, selectedTransactions: newAddElementTransactions });
				} else {
					this.setState({ shiftSlectedTransactionIndex: index }, () => { this.addElement(block); });
				}

			} else {
				this.addElement(block);
			}

		}
		else
			this.removeElement(block);

	}

	addElement = (block) => {
		const array = [...this.state.selectedTransactions];
		array.push(block);
		this.setState({ selectedTransactions: array });
	}

	removeElement = (block) => {
		const array = [...this.state.selectedTransactions];
		const index = array.indexOf(block);
		if (index !== -1) {
			array.splice(index, 1);
			if (array.length === 0) {
				this.setState({ selectedTransactions: array, shiftSlectedTransactionIndex: null });
			} else {
				this.setState({ selectedTransactions: array });
			}

		}
	}

	checkCurrentTransactionInSelectedTransactionList = (id) => {
		return this.state.selectedTransactions.find(item => item.id === id) ? true : false;
	}

	generateNewAddElementTransactionArray = (currentIndex, previousIndex, selectedTransactions, sortedTransactionArray) => {
		const tranasctions = [...selectedTransactions];
		const firstIndex = (currentIndex > previousIndex) ? previousIndex : currentIndex;
		const secondIndex = (currentIndex > previousIndex) ? currentIndex + 1 : previousIndex + 1;
		const betweenTransactions = sortedTransactionArray.slice(firstIndex, secondIndex);

		const allSelectedTransactions = tranasctions.concat(betweenTransactions);

		const filteredArr = allSelectedTransactions.reduce((acc, current) => {
			const x = acc.find(item => item.id === current.id);
			if (!x) {
				return acc.concat([current]);
			} else {
				return acc;
			}
		}, []);

		const finalArray = [...filteredArr];
		for (let j = 0; j < filteredArr.length; j++) {
			const se = filteredArr[j];
			if (se.transactionType === 'sub_total') {
				// this recode should not pic
				finalArray.splice(j, 1);
			}
		}

		return finalArray;
	}


	getContentForTransactionTable = () => {
		const { transactionsInIBANNR } = this.state;
		const { classes } = this.props;

		const comparatorData = this.getComparator(this.state.orderDirection, this.state.valueToOrderBy);

		let sortedData;
		if (transactionsInIBANNR && transactionsInIBANNR != null) {
			const transactionArray = [...transactionsInIBANNR];
			if (this.state.valueToOrderBy === 'counterparty_name') {
				for (let k = 0; k < transactionArray.length; k++) {
					const STNC = transactionArray[k];
					if (!STNC.counterparty_name) {
						STNC.counterparty_name = '';
					}
				}
			}

			sortedData = this.sortedRowInformation(transactionArray && transactionArray, comparatorData);
		}
		else {
			sortedData = [];
		}


		// counterparty name sort special requirement (creadit managment dashboard category overview v1.2)

		if (this.state.valueToOrderBy === 'counterparty_name') {

			let counterpartyName = '';
			let counterpartySum = 0;
			let counterPartyNameCount = 0;
			const spliceArray = [];
			for (let i = 0; i < sortedData.length; i++) {

				const st = sortedData[i];
				let formattedCounterPartyName = st.counterparty_name;
				if (st.counterparty_name) {
					const temp = st.counterparty_name.toLowerCase();
					formattedCounterPartyName = temp.replace(/\s/g, ''); //temp.trim();
				}

				if (i === sortedData.length - 1) {
					// debugger
					// this is the last transaction so if there are sum need to show otherwise no need to compair
					if (counterpartyName && st.counterparty_name && counterpartyName === formattedCounterPartyName) {
						// this means second to last element is same transaction counterparty
						const subTotalTransaction = {
							transactionType: 'sub_total',
							amount: counterpartySum + st.amount,
							index: sortedData.length,
							counterpartyName: counterpartyName,
							counterpartySum,
							counterPartyNameCount
						};
						// sortedData.splice(sortedData.length,0,subTotalTransaction);
						spliceArray.push(subTotalTransaction);
					} else {
						if (counterpartyName && counterPartyNameCount > 0) {
							const subTotalTransaction = {
								transactionType: 'sub_total',
								amount: counterpartySum,
								index: sortedData.length - 1,
								counterpartyName: counterpartyName,
								counterpartySum,
								counterPartyNameCount
							};
							// sortedData.splice(sortedData.length,0,subTotalTransaction);
							spliceArray.push(subTotalTransaction);
							counterpartySum = 0;
							counterPartyNameCount = 0;
							counterpartyName = '';
						}
						if (counterpartyName !== formattedCounterPartyName) {
							const subTotalTransaction = {
								transactionType: 'sub_total',
								amount: counterpartySum + st.amount,
								index: sortedData.length,
								counterpartyName: counterpartyName,
								counterpartySum,
								counterPartyNameCount
							};
							// sortedData.splice(sortedData.length,0,subTotalTransaction);
							spliceArray.push(subTotalTransaction);
							counterpartySum = 0;
							counterPartyNameCount = 0;
							counterpartyName = '';
						}
					}


				} else {
					if (st.counterparty_name) {

						if (counterpartyName === formattedCounterPartyName) {

							// this means same type counter party transaction
							counterpartyName = formattedCounterPartyName;
							counterpartySum += st.amount;
							counterPartyNameCount += 1;
						} else {
							// this means diffent type counterparty transactions
							if (counterpartyName && counterPartyNameCount > 0) {

								// this means there are pervious transaction (not initial)
								const subTotalTransaction = {
									transactionType: 'sub_total',
									amount: counterpartySum,
									index: i,
									counterpartyName: counterpartyName,
									counterpartySum,
									counterPartyNameCount
								};
								// sortedData.splice(sortedData[i],0,subTotalTransaction);
								spliceArray.push(subTotalTransaction);
								counterpartySum = 0;
								counterPartyNameCount = 0;
								counterpartyName = '';
							}

							//   if(counterpartyName !=)
							counterpartyName = formattedCounterPartyName;
							counterpartySum = st.amount;
							counterPartyNameCount += 1;

						}
					} else {
						if (counterpartyName && counterPartyNameCount > 0) {
							// this means there are pervious transaction (not initial)
							const subTotalTransaction = {
								transactionType: 'sub_total',
								amount: counterpartySum,
								index: i,
								counterpartyName: counterpartyName,
								counterpartySum,
								counterPartyNameCount
							};
							// sortedData.splice(sortedData[i],0,subTotalTransaction);
							spliceArray.push(subTotalTransaction);
							counterpartySum = 0;
							counterPartyNameCount = 0;
							counterpartyName = '';
						}
					}




				}
			}

			if (spliceArray.length > 0) {
				// this means there are sub total transactions need to include
				for (let j = 0; j < spliceArray.length; j++) {

					const stt = spliceArray[j];
					sortedData.splice(stt.index + j, 0, stt);

				}
			}
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
						(transaction.transactionType && transaction.transactionType === 'sub_total') ?
							<TableRow key={index} className={classes.transactionTableRow} style={{ backgroundColor: "#80808073" }}>
								<TableCell className={classes.transactionTableCell} >
									&nbsp;
								</TableCell>
								<TableCell className={classes.transactionTableCell} >Subtotal</TableCell>
								<TableCell className={classes.transactionTableCell} align="right" style={{ fontWeight: "bolder" }}>{NODECIMALEURO(transaction.amount)}</TableCell>
								<TableCell className={classes.transactionTableCell} style={{ paddingLeft: '15px' }} align="left">&nbsp;</TableCell>
								<TableCell className={classes.transactionTableCell} align="left">&nbsp;</TableCell>
							</TableRow>
							:
							<TableRow key={index} className={classes.transactionTableRow} >
								<TableCell className={classes.transactionTableCell} >
									<Checkbox
										defaultChecked={false}
										onChange={(e) => this.handleTransactionCheckBoxChange(e, transaction, index, sortedData)}
										checked={this.checkCurrentTransactionInSelectedTransactionList(transaction.id)}
										color="default"
										size="small"
										disableRipple
										inputProps={{ 'aria-label': 'checkbox with default color' }}
										style={{ padding: "2px" }}
									/>

								</TableCell>
								<TableCell className={classes.transactionTableCell} onClick={() => this.handleUpdateTransaction()}>{moment(transaction.transaction_date).format('DD-MM-YYYY')}</TableCell>
								<TableCell className={classes.transactionTableCell} onClick={() => this.handleUpdateTransaction()} align="right">{NODECIMALEURO(transaction.amount)}</TableCell>
								<TableCell className={classes.transactionTableCell} onClick={() => this.handleUpdateTransaction()} style={{ paddingLeft: '15px' }} align="left">{transaction.counterparty_name}</TableCell>
								<TableCell className={classes.transactionTableCell} onClick={() => this.handleUpdateTransaction()} align="left">{transaction.description}</TableCell>
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

	handleRequestSortLevel_1 = (event) => {
		const isAscending = (this.state.valueToOrderByLevel_1 === event && this.state.OrderDirectionlevel_1 === "asc");
		this.setState({ valueToOrderByLevel_1: event, OrderDirectionlevel_1: isAscending ? "desc" : "asc", shiftSlectedTransactionIndex: null });
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

	getInitialdata = () => {
		this.setState({ selectedTransactions: [], shiftSlectedTransactionIndex: null }, () => { this.props.getInitialdata(); });
	}

	getClass = (level, curentIndex) => {

		const { levelOneOpenIndex, levelTwoOpenIndex, levelThreeOpenIndex } = this.state;
		const { classes } = this.props;

		if (level === 1 && curentIndex === levelOneOpenIndex) {
			return classes.selectedRow;
		}

		if (level === 2 && curentIndex === levelTwoOpenIndex) {
			return classes.selectedRow;
		}

		if (level === 3 && curentIndex === levelThreeOpenIndex) {
			return classes.selectedRowStyleForLevelThree;
		}

		if (level === 3 && curentIndex !== levelThreeOpenIndex) {
			return classes.defaultRowStyleForLevelThree;
		}

		return classes.defaultRowStyle;
	}

	getExpandOrCollapseIcon = (level, curentIndex) => {

		const { levelThreeOpenIndex } = this.state;

		if (level === 3 && curentIndex === levelThreeOpenIndex) {
			return <ExpandLessIcon fontSize="small" />;
		}

		return <ExpandMoreIcon fontSize="small" />;
	}

	getTooltipContent = (level, curentIndex) => {

		const { levelThreeOpenIndex } = this.state;

		if (level === 3 && curentIndex === levelThreeOpenIndex) {
			return 'Click to collapse';
		}

		return 'Click to expand';
	}

	//IABNNR selections =============================================

	handleIBANNRCheckBoxChange = (e, block,) => {

		if (e.target.checked) {
			this.addIBANNRElement(block);
		}
		else {
			this.removeIBANNRElement(block);
		}
	}

	addIBANNRElement = (block) => {
		const trArray = [...this.state.selectedTransactions];
		this.setState({ selectedTransactions: [...new Set(trArray.concat(block.transactions))] });
	}

	removeIBANNRElement = (block) => {
		const trArray = [...this.state.selectedTransactions];
		this.setState({ selectedTransactions: [...new Set(diffArray(trArray, block.transactions))] });
	}

	checkCurrentIBANNRInSelectedIBANNRList = (IBANNR) => {
		const currentTransactions = [...IBANNR.transactions];
		const { selectedTransactions } = this.state;
		// return arrayContainsAll(currentTransactions, selectedTransactions);
		return findCommonElementsInArrays(selectedTransactions,currentTransactions);
	}

	getIbanNumberCellComponent = (IBANNR) => {
		return (
			<Stack direction="row">
				<Checkbox
					defaultChecked={false}
					onChange={(e) => this.handleIBANNRCheckBoxChange(e, IBANNR)}
					checked={this.checkCurrentIBANNRInSelectedIBANNRList(IBANNR)}
					color="default"
					size="small"
					disableRipple
					inputProps={{ 'aria-label': 'checkbox with default color' }}
					style={{ padding: "2px" }}
				/>
				<Button size="small" onClick={() => this.handleUpdateTransaction()} style={{ color: 'rgba(0, 0, 0, 0.87)' }} >{IBANNR.IBANNR}</Button>
			</Stack >
		);
	}

	render() {
		const { levelOneOpenIndex, levelTwoOpenIndex, levelThreeOpenIndex, selectedTransactions, } = this.state;
		const { classes, title, totalAmount, dataList, shouldShowCategoryTypeSwitch, isCategoryTypeMachineLearning, changeCategoryType } = this.props;

		// console.log('dataList ', dataList);
		return (
			<>
				<Paper variant="outlined" className={classes.transactionContainer} >
					<Grid container justifyContent="space-between">
						<Grid item>
							<Grid container
								direction="row"
								justifyContent="flex-start"
								alignItems="center"
								spacing={3}>
								<Grid item >
									<Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>{title}</Typography>
								</Grid>
								{shouldShowCategoryTypeSwitch ?
									<Grid item >
										<Stack direction="row" spacing={1} alignItems="center">
											<Typography style={{ color: !isCategoryTypeMachineLearning ? 'black' : 'darkgrey' }} variant="caption">Rule Engine</Typography>
											<Switch
												className={classes.switchStyle}
												focusVisibleClassName=".Mui-focusVisible"
												disableRipple
												checked={isCategoryTypeMachineLearning}
												onChange={changeCategoryType}
											/>
											<Typography style={{ color: isCategoryTypeMachineLearning ? 'black' : 'darkgrey' }} variant="caption">Machine Learning</Typography>
										</Stack>
									</Grid>
									:
									false}
							</Grid>
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
									<TableCell className={classes.tableCell}>
										<TableSortLabel
											active={this.state.valueToOrderByLevel_1 === "totalPercentage"} // absoluteTotal
											// @ts-ignore
											direction={this.state.OrderDirectionlevel_1}
											onClick={this.handleRequestSortLevel_1.bind(this, 'totalPercentage')} // absoluteTotal
										>
											Sub-Category
										</TableSortLabel>
									</TableCell>
									<TableCell className={classes.tableCell} align="right">Detailed-Category</TableCell>
									<TableCell className={classes.tableCell} align="right" colSpan={2}>IBANNR</TableCell>
									<TableCell className={classes.tableCell} align="right">Counter-Party</TableCell>
									<TableCell className={classes.tableCell} align="right" >Amount</TableCell>
									<TableCell className={classes.tableCell} align="right">Perc. &nbsp;%</TableCell>
									<TableCell className={classes.tableCell} align="right">No-of-Trans.</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>

								{/* ======== check data length of table ============ */}

								{dataList && dataList.length === 0 ?
									<TableRow>
										<TableCell className={classes.tableCell} align="center" colSpan={9}>
											{'No Data to show'}
										</TableCell>
									</TableRow>
									:

									/*  ==========  subCategory rows ==================== */

									util.stableSort(dataList, util.getSorting(this.state.OrderDirectionlevel_1, this.state.valueToOrderByLevel_1)).map((row, levelOneIndex) => (


										<React.Fragment key={levelOneIndex}>
											<TableRow onClick={() => this.handleLevelOneExpand(levelOneIndex)} className={this.getClass(1, levelOneIndex)}>
												<TableCell className={classes.tableCell}>
													{row.subCategory}
												</TableCell>
												<TableCell className={classes.tableCell} align="right"></TableCell>
												<TableCell className={classes.tableCell} align="right"></TableCell>
												<TableCell className={classes.tableCell} align="right"></TableCell>
												<TableCell className={classes.tableCell} align="right"></TableCell>
												<TableCell className={classes.tableCell} align="right" >{NODECIMALEURO(row.totalAmount)}</TableCell>
												<TableCell className={classes.tableCell} align="right">{percentage(row.totalPercentage)}</TableCell>
												<TableCell className={classes.tableCell} align="right">{row.noOfTransactions}</TableCell>
											</TableRow>

											{levelOneOpenIndex === levelOneIndex ?
												util.stableSort(row.detailedCategories, util.getSorting(this.state.OrderDirectionlevel_1, this.state.valueToOrderByLevel_1)).map((detailCategory, levelTwoIndex) =>
													<React.Fragment key={levelTwoIndex}>

														{/* =========== detailed category rows ================ */}

														<TableRow onClick={() => this.handleLevelTwoExpand(levelTwoIndex)} className={this.getClass(2, levelTwoIndex)}>
															<TableCell className={classes.tableCell} component="th" scope="row">	&nbsp;</TableCell>
															<TableCell className={classes.tableCell} align="right">{detailCategory.detailedCategory}</TableCell>
															<TableCell className={classes.tableCell} align="right"></TableCell>
															<TableCell className={classes.tableCell} align="right"></TableCell>
															<TableCell className={classes.tableCell} align="right"></TableCell>
															<TableCell className={classes.tableCell} align="right">{NODECIMALEURO(detailCategory.totalAmount)}</TableCell>
															<TableCell className={classes.tableCell} align="right">{percentage(detailCategory.totalPercentage)}</TableCell>
															<TableCell className={classes.tableCell} align="right">{detailCategory.noOfTransactions}</TableCell>
														</TableRow>

														{/* =========== IBANNR rows ================ */}

														{levelTwoOpenIndex === levelTwoIndex && levelOneOpenIndex === levelOneIndex ?
															util.stableSort(detailCategory.IBANNRs, util.getSorting(this.state.OrderDirectionlevel_1, this.state.valueToOrderByLevel_1)).map((IBANNR, levelThreeIndex) =>
																<React.Fragment key={levelThreeIndex}>
																	<TableRow className={this.getClass(3, levelThreeIndex)}>
																		<TableCell className={classes.tableCell} component="th" scope="row">	&nbsp;</TableCell>
																		<TableCell className={classes.tableCell} align="right"></TableCell>
																		{/* <TableCell className={classes.tableCell} align="right">{IBANNR.IBANNR}</TableCell> */}
																		<TableCell className={classes.tableCell} align="right">{this.getIbanNumberCellComponent(IBANNR)}</TableCell>
																		<TableCell className={classes.tableCell} align="right">
																			<Tooltip title={this.getTooltipContent(3, levelThreeIndex)} placement="right-end">
																				<IconButton size="small" color="primary"
																					aria-label="collapse-or-expand-button"
																					style={{ color: 'rgba(0, 0, 0, 0.87)' }}
																					onClick={() => this.handleLevelThreeExpand(levelThreeIndex, IBANNR.transactions)}>
																					{this.getExpandOrCollapseIcon(3, levelThreeIndex)}
																				</IconButton>
																			</Tooltip>
																		</TableCell>
																		<TableCell className={classes.tableCell} align="right">{IBANNR.counterPartyName}</TableCell>
																		<TableCell className={classes.tableCell} align="right">{NODECIMALEURO(IBANNR.totalAmount)}</TableCell>
																		<TableCell className={classes.tableCell} align="right">{percentage(IBANNR.totalPercentage)}</TableCell>
																		<TableCell className={classes.tableCell} align="right">{IBANNR.noOfTransactions}</TableCell>
																	</TableRow>

																	{/* ============= expanded content for selected IBANNR transactions || all-transactions ========== */}


																	{levelTwoOpenIndex === levelTwoIndex && levelOneOpenIndex === levelOneIndex && levelThreeOpenIndex === levelThreeIndex ?
																		<TableRow key={levelThreeIndex + "trans"} >
																			<TableCell className={classes.transactionTableCell} colSpan={8}>

																				<Collapse
																					in={levelTwoOpenIndex === levelTwoIndex && levelOneOpenIndex === levelOneIndex && levelThreeOpenIndex === levelThreeIndex}
																					timeout="auto"
																					unmountOnExit>
																					<Box margin={1}>
																						{this.getContentForTransactionTable()}
																					</Box>
																				</Collapse>
																			</TableCell>
																		</TableRow> : false}

																</React.Fragment>
															)
															:
															false}

													</React.Fragment>
												)
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
						{/* <CategoryBlockPopup bankTransaction={selectedTransaction} handlePopupOpen={this.handlePopupOpen} /> */}
						<TransactionsPopUp
							bankTransactions={[...selectedTransactions]}
							handlePopupOpen={this.handlePopupOpen}
							getInitialdata={this.getInitialdata}
							isMultipleTransactionUpdate={true}
						/>
					</Paper>
				</Dialog>
			</>
		);
	}
}

CategoryBlock.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	totalAmount: PropTypes.number,
	dataList: PropTypes.array,
	getInitialdata: PropTypes.func,
	shouldShowCategoryTypeSwitch: PropTypes.bool,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	contractId: state.lmglobal.overviewData.contractId
});

const mapDispatchToProps = (dispatch) => ({
	clearCustomerDetails: () => dispatch(clearCustomerDetails()),
	clearSmeLoanRequests: () => dispatch(clearSmeLoanRequests()),
	clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails()),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(CategoryBlock));

