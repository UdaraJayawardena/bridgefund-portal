import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { unserialize } from 'serialize-php';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import {
	Table, Button, TableBody, TableCell, TableHead,
	TableRow, Grid, FormControl, Select, MenuItem, TableContainer, Paper
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import VisibilityIcon from '@material-ui/icons/Visibility';
// import { getAllBankTransactionsForCategoryPage } from 'store/actions/CreditRiskOverview.action';

import { EURO } from 'lib/initiation/utility';

import { displayNotification } from 'store/initiation/actions/Notifier';
import { updateBankTransactions } from 'store/initiation/actions/BankTransactions.action';
import { getCategoryRules, getCategoryRulesEnums } from 'store/initiation/actions/CategoryRules.action';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";

class CategoryBlockPopup extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isShowRules: false,
			selectedRules: [],
			subCategoryEnums: [],
			detailedCategoryEnums: [],
			selectedNewDetailedCategory: '',
			selectedNewSubCategory: '',
		};
	}

	componentDidMount() {
		this.setDataForCategoryDropDowns();
	}

	setDataForCategoryDropDowns = () => {
		this.props.getCategoryRulesEnums()
			.then(res => {
				// console.log("res ", res);
				this.setState({
					subCategoryEnums: res.subCategoryEnums,
					detailedCategoryEnums: res.detailedCategoryEnums
				});
			})
			.catch(err => { console.log("setDataForCategoryDropDowns err ", err); });
	}

	handleShowHideRulesTable = () => {
		console.log(this.state.isShowRules, '..isShowRules')
		const { isShowRules } = this.state;
		if (isShowRules) {
			this.setState({ isShowRules: false, selectedRules: [] });
			return;
		}
		this.setState({ isShowRules: true }, () => {
			this.getRulesByRuleIdsOfTransaction();
		});
		return;
	}

	getRulesByRuleIdsOfTransaction = () => {

		const ruleIds = unserialize(this.props.bankTransaction.category_rule_ids);

		if (ruleIds && ruleIds.length > 0) {
			this.props.getCategoryRules()
				.then(res => {
					this.setState({ selectedRules: this.filterCategoryRules(res, ruleIds) });
				})
				.catch(err =>
					console.log("error ", err));
		}
		else {
			this.setState({ selectedRules: [] });
		}
	}

	filterCategoryRules = (rules, ruleIdList) => {
		return rules.filter(rule => ruleIdList.indexOf(rule.id) !== -1)
			.sort((a, b) => (a.priority_level > b.priority_level) ? 1 : -1);
	}

	handleUpdateTransaction = () => {
		const { bankTransaction } = this.props;
		const { selectedNewDetailedCategory, selectedNewSubCategory } = this.state;

		const reqData = {
			bankTransaction: [
				{
					"action": "change",
					"bankTransactionId": bankTransaction.id,
					"categoryStatus": "confirmed",
					"subCategory": selectedNewSubCategory,
					"detailedCategory": selectedNewDetailedCategory,
					"subCategoryOld": bankTransaction.sub_category,
					"detailedCategoryOld": bankTransaction.detailed_category,
					"processBy": bankTransaction.processed_by
				}
			]
		};

		if (selectedNewDetailedCategory === "" || selectedNewSubCategory === "") {
			this.props.displayNotification('Please select category values!', 'warning');
			return;
		}
		this.props.updateBankTransactions(reqData)
			.then(res => {
				console.log("res ", res);
				this.props.handlePopupOpen();
			})
			.catch(err =>
				console.log("updateBankTransactions error ", err));
	}

	handleDropdownChanges = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	}

	render() {
		// console.log("state in render ", this.state);
		const { classes, bankTransaction } = this.props;
		const { isShowRules, detailedCategoryEnums, subCategoryEnums, selectedRules } = this.state;

		return (
			<div >
				{/* ======================= trnasaction table section ===============================*/}
				{/* <Paper variant="outlined" className={classes.transactionContainer} > */}
				<GridContainer>
					<GridItem md={12}>
					{/* <Paper variant="outlined" > */}
					<TableContainer className={classes.tableContainer}>
						<Table className={classes.table} aria-label="simple table">
							<TableHead className={classes.tableHeadColor}>
								<TableRow >
									<TableCell className={classes.tableCell}>Account</TableCell>
									<TableCell className={classes.tableCell}align="left">Trans. Date</TableCell>
									<TableCell className={classes.tableCell}align="left">Description</TableCell>
									<TableCell className={classes.tableCell}align="left">Amount</TableCell>
									<TableCell className={classes.tableCell}align="left">Counterparty</TableCell>
									<TableCell className={classes.tableCell}align="left">New Sub Category</TableCell>
									<TableCell className={classes.tableCell}align="left">New Detailed-Category</TableCell>
									<TableCell className={classes.tableCell} align="left">Rules</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{Object.keys(bankTransaction).length === 0 ?

									<TableRow>
										<TableCell className={classes.tableCell} colSpan={7}>
											{'No Accounts to show'}
										</TableCell>
									</TableRow>

									:

									<TableRow>
										<TableCell className={classes.tableCell}>{bankTransaction.iban_number}</TableCell>
										<TableCell className={classes.tableCell}align="left">{moment(bankTransaction.transaction_date).format('DD-MM-YYYY')}</TableCell>
										<TableCell className={classes.tableCell}align="left">{bankTransaction.description}</TableCell>
										<TableCell className={classes.tableCell}align="left">{EURO(bankTransaction.amount)}</TableCell>
										<TableCell className={classes.tableCell}align="left">{bankTransaction.counterparty_name}</TableCell>
										<TableCell className={classes.tableCell}align="left">
											<FormControl className={classes.formControl} >
												<Select
													labelId="new-sub-category-label"
													id="new-sub-category"
													name="selectedNewSubCategory"
													value={this.state.selectedNewSubCategory}
													onChange={this.handleDropdownChanges}
													className={classes.menuSelectStyles}
												>
													<MenuItem value="">
														<em>None</em>
													</MenuItem>
													{subCategoryEnums && subCategoryEnums.map(subCat => <MenuItem value={subCat}>{subCat}</MenuItem>)}
												</Select>
											</FormControl>
										</TableCell>
										<TableCell className={classes.tableCell} align="left">
											<FormControl className={classes.formControl} >
												<Select
													labelId="new-detailed-category-label"
													id="new-detailed-category"
													name="selectedNewDetailedCategory"
													value={this.state.selectedNewDetailedCategory}
													onChange={this.handleDropdownChanges}
													className={classes.menuSelectStyles}
												>
													<MenuItem value="">
														<em>None</em>
													</MenuItem>
													{detailedCategoryEnums && detailedCategoryEnums.map(detailedCat => <MenuItem value={detailedCat}>{detailedCat}</MenuItem>)}
												</Select>
											</FormControl></TableCell>
										<TableCell className={classes.tableCell}>
											<VisibilityIcon className={classes.visibilityIconButton} onClick={this.handleShowHideRulesTable}>
											</VisibilityIcon>
										</TableCell>
									</TableRow>
								}
							</TableBody>
						</Table>
						</TableContainer>
						<Grid
							justify="flex-end"
							container
						>
							<Grid item >
								<Button 
									variant="outlined"
									style={{ textTransform: 'none' }}
									className={classes.cancelIconButton}
									onClick={() => this.props.handlePopupOpen()}>Cancel</Button>
								<Button
									variant='contained'
									style={{ textTransform: 'none' }}
									className={classes.confirmIconButton}
									onClick={this.handleUpdateTransaction}
								>Confirm</Button>
							</Grid>
						</Grid>
					
					</GridItem>

					{/* ========================== rules table ============================  */}
					<GridItem md={12} >
						{
							isShowRules ?
							<TableContainer component={Paper} className={classes.tableContainer}>
								<Table  className={classes.table
								} aria-label="simple--table" >
									<TableHead className={classes.tableHeadColor}>
										<TableRow >
											<TableCell colSpan={4} className={classes.rightBorderCell}>&nbsp;</TableCell>
											<TableCell align="center" className={classes.rightBorderCell} colSpan={3}>IBAN</TableCell>
											<TableCell align="center" className={classes.rightBorderCell} colSpan={3}>Counterparty Name</TableCell>
											<TableCell align="center" className={classes.rightBorderCell} colSpan={3}>Description</TableCell>
											<TableCell className={classes.tableCell} colSpan={3} align="center">&nbsp;</TableCell>
										</TableRow>
										<TableRow >
											<TableCell className={classes.tableCell}>Rule Id</TableCell>
											<TableCell className={classes.tableCell} align="left">Pro</TableCell>
											<TableCell className={classes.tableCell}align="left">&nbsp;</TableCell>
											<TableCell align="left" className={classes.rightBorderCell}>Amount</TableCell>
											<TableCell className={classes.tableCell}align="left">Boolean</TableCell>
											<TableCell className={classes.tableCell}align="left">Operator</TableCell>
											<TableCell align="left" className={classes.rightBorderCell}>Value</TableCell>
											<TableCell className={classes.tableCell}align="left">Boolean</TableCell>
											<TableCell className={classes.tableCell}align="left">Operator</TableCell>
											<TableCell align="left" className={classes.rightBorderCell}>Value</TableCell>
											<TableCell className={classes.tableCell}align="left">Boolean</TableCell>
											<TableCell className={classes.tableCell}align="left">Operator</TableCell>
											<TableCell align="left" className={classes.rightBorderCell}>Value</TableCell>
											<TableCell className={classes.tableCell}align="left">&nbsp;</TableCell>
											<TableCell className={classes.tableCell}align="left">Detailed-Category</TableCell>
											<TableCell className={classes.tableCell}align="left">Sub-Category</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{selectedRules.length === 0 ?

											<TableRow>
												<TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={13}>
													{'No Rules to show'}
												</TableCell>
											</TableRow>

											:

											// @ts-ignore
											selectedRules.map((rule, index) =>
												<TableRow key={index} >
													<TableCell className={classes.leftBorderCell}>{rule.id}</TableCell>
													<TableCell className={classes.tableCell} align="left">{rule.priority_level}</TableCell>
													<TableCell className={classes.tableCell} align="left">{rule.amount_operator}</TableCell>
													<TableCell align="center" className={classes.ruleTableConditionalCell}>if</TableCell>
													<TableCell className={classes.tableCell} align="left">{rule.counterparty_iban_boolean}</TableCell>
													<TableCell className={classes.tableCell}align="left">{rule.counterparty_iban_operator}</TableCell>
													<TableCell align="left" className={classes.rightBorderCell}>{rule.counterparty_iban}</TableCell>
													<TableCell className={classes.tableCell}align="left">{rule.counterparty_name_boolean}</TableCell>
													<TableCell className={classes.tableCell}align="left">{rule.counterparty_name_operator}</TableCell>
													<TableCell align="left" className={classes.rightBorderCell}>{rule.counterparty_name}</TableCell>
													<TableCell className={classes.tableCell}align="left">{rule.description_boolean}</TableCell>
													<TableCell className={classes.tableCell}align="left">{rule.description_operator}</TableCell>
													<TableCell align="left" className={classes.rightBorderCell}>{rule.description}</TableCell>
													<TableCell align="center" className={classes.ruleTableConditionalCell}>then</TableCell>
													<TableCell className={classes.tableCell}align="left">{rule.detailed_category}</TableCell>
													<TableCell className={classes.rightBorderCell} align="left">{rule.sub_category}</TableCell>
												</TableRow>
											)}
									</TableBody>
								</Table>
								</TableContainer>
								:
								false
						}
					
					</GridItem>

				</GridContainer>
				{/* </Paper> */}
			</div>
		);
	}
}

CategoryBlockPopup.propTypes = {
	classes: PropTypes.object.isRequired,
	updateBankTransactions: PropTypes.func,
	getTransactionRules: PropTypes.func,
	bankTransaction: PropTypes.object,
	handlePopupOpen: PropTypes.func,
	getCategoryRules: PropTypes.func,
	getCategoryRulesEnums: PropTypes.func,
};

const mapStateToProp = (/* state */) => ({
});

const mapDispatchToProps = (dispatch) => ({
	updateBankTransactions: (requestData) => dispatch(updateBankTransactions(requestData)),
	getCategoryRules: () => dispatch(getCategoryRules()),
	getCategoryRulesEnums: (requestQuery) => dispatch(getCategoryRulesEnums(requestQuery)),
	displayNotification: (message, type) => dispatch(displayNotification(message, type)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(CategoryBlockPopup));