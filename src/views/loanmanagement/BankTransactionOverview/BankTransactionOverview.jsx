import React from "react";
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/smeLoanRecoveryAppointmentStyles.jsx";
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, InputLabel, FormControl, Select, 
	TableSortLabel, Dialog, TableContainer } from "@material-ui/core";	
import { Extension, SettingsBackupRestore, RestorePage } from "@material-ui/icons";
import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
// import Notifier from "components/loanmanagement/Notification/Notifier.jsx";
import ConfirmationDialog from 'components/loanmanagement/ConfirmationDialog/ConfirmationDialog';
import { getAllBankTransactions, reRunBankTransaction, reverseBankTransaction, reverseBankStatement } from "store/loanmanagement/actions/BankTransactions.js";
import { saveBankTransactionStatus } from 'store/loanmanagement/actions/BankTransactions';
import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";
import { getLocales } from "store/initiation/actions/Configuration.action";
import Util from 'lib/loanmanagement/utility';
import IbanNumbers from './BankIbanNumbers';
import TransactionStatuses from './TransactionStatuses';
import UnknownTransactionDialog from './UnknownTransactionDialog';
import ConnectUnknownTransactionsPopup from './ConnectUnknownTransactionsPopup';
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';
import style from "assets/jss/bridgefundPortal/views/pdCustomerOverviewStyle";

import {
	KeyboardDatePicker,
	MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import { BTStatus } from 'constants/loanmanagement/bank-transaction';
import { clearHeaderDisplaySubData } from "store/loanmanagement/actions/HeaderNavigation";

const currency = Util.multiCurrencyConverter();

export const BankAccount = IbanNumbers;
export const Transactionstatus = TransactionStatuses;

/*** sort functionality */
function desc(a, b, orderBy) {

	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function stableSort(array, cmp) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
	return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

class BankTransactionOverview extends React.Component {
	constructor(props) {
		super(props);

		this.handleClose = this.handleClose.bind(this);
		this.handleCloseDDO = this.handleCloseDDO.bind(this);

		this.state = {
			selectedBankAccount: Util.getEnv() === 'development' ? 'NL45ABNA0816153094' : 'NL61ABNA0825708761',
			selectedStatus: 'unknown',
			transactionDate: moment().subtract(1, 'days').format('YYYY-MM-DD') /* moment(this.props.systemDate).format('YYYY-MM-DD') */,

			openDialog: false,
			value: '',
			processingTransaction: {},
			counterPartyIban: '',

			openDirectDebitConnect: false,

			newTransactionProps: {},

			isChangeStatus: false,

			order: 'asc',
			orderBy: 'statement',
			locales: [],
			bankTransactions: []
		};
	}

	componentDidMount() {
		this.props.clearHeaderDisplaySubData();
		if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
			this.props.getSimulationDate()
				.then((result) => {
					this.setState({ transactionDate: result.systemDate }, () => {
						this.refreshData();
					});
					// console.log(result);
				});
		} else {
			this.setState({ transactionDate: moment().subtract(1, 'days').format('YYYY-MM-DD') }, () => {
				this.refreshData();
			});
		}

		this.retriveLocales();

	}

	componentDidUpdate(prevProps) {
		if (prevProps.bankTransactions !== this.props.bankTransactions) {
			this.updateTransactionsWithLocale(this.props.bankTransactions)
	 	}
	};

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value }, () => {
			this.props.getAllBankTransactions(this.state.transactionDate, this.state.selectedStatus, this.state.selectedBankAccount);
		});

	};

	handleDatePickers = date => {
		const value = moment(date).format('YYYY-MM-DD');
		if (moment(value).isValid()) {
			this.setState({ transactionDate: value }, () => {
				this.refreshData();
			});
		}
	};

	handleClickListItem(transaction, btn) {
		if (btn !== '') {
			switch (btn) {
				case 'unknown':
					this.processUnknownTransaction(transaction);
					break;
				case 're-run':
					this.processReRun(transaction);
					break;
				case 'reverse':
					this.processReverse(transaction);
					break;
				case 'reverse-statement':
					this.processReverseStatement(transaction);
					break;
				default: break;
			}
		} else {
			console.log('Invalid action triggered...');
		}
	}
	refreshData = (transactionDate, selectedStatus, selectedBankAccount) => {
		const _state = {};
		if (Util.isNullOrEmpty(transactionDate)) transactionDate = this.state.transactionDate; else _state.transactionDate = transactionDate;
		if (Util.isNullOrEmpty(selectedStatus)) selectedStatus = this.state.selectedStatus; else _state.selectedStatus = selectedStatus;
		if (Util.isNullOrEmpty(selectedBankAccount)) selectedBankAccount = this.state.selectedBankAccount; else _state.selectedBankAccount = selectedBankAccount;
		this.setState(_state);
		return this.props.getAllBankTransactions(transactionDate, selectedStatus, selectedBankAccount);
	};

	processUnknownTransaction(transaction) {
		this.setState({
			openDialog: true,
			processingTransaction: transaction
		});
	}

	processReRun(transaction) {

		this.props.setRerunBankTransaction(transaction, this.state.selectedBankAccount);
	}

	processReverse(transaction) {

		this.props.setReverseBankTransaction(transaction, this.state.transactionDate);
	}

	processReverseStatement(transaction) {

		this.props.setReverseBankStatement(transaction, this.state.selectedBankAccount);
	}

	handleClose(newValue) {
		this.setState({
			openDialog: false,
			value: newValue
		});
		if (newValue !== '') {
			switch (newValue) {
				case 'Manually Settle':
					this.setState({ isChangeStatus: true });
					break;
				case 'Connect to SME Loan Transaction':
					this.handleConnectToDirectDebit();
					break;
				default: break;
			}
		} else {
			console.log('Invalid action...');
		}
	}

	handleConnectToDirectDebit = () => {

		this.setState({
			counterPartyIban: this.state.processingTransaction.counterpartyIbanNumber,
			openDirectDebitConnect: true,
			connectTransactionType: this.state.processingTransaction.amount < 0 ? 'connect-to-transaction' : 'connect-to-dd'
		});
	}

	handleCloseDDO() {
		this.setState({
			openDirectDebitConnect: false
		});
	}

	handleRequestSort = (property) => {
		const orderBy = property;
		let order = 'desc';

		if (this.state.orderBy === property && this.state.order === 'desc') {
			order = 'asc';
		}

		this.setState({ order, orderBy });
	};

	/**
	 * Changes the bank transaction status as manually-settled
	 */
	confirmChangeStatus = () => {
		this.props.setManuallySettled(this.state.processingTransaction._id, BTStatus.MANUALLY_SETTLED)
			.finally(() => {
				this.setState({ isChangeStatus: false });
				this.refreshData(null, BTStatus.UNKNOWN, null);
			});
	};

	retriveLocales = () => {
		this.props.getLocales()
			.then((localeData) => {
				if(localeData) {
					this.setState({
						locales : localeData
					});
				}
			});
	}

	updateTransactionsWithLocale = (bankTransactions) => {
		const { locales } = this.state;
		const updatesBankTransaction = bankTransactions;

		if(updatesBankTransaction && updatesBankTransaction.length > 0 && locales && locales.length > 0){
			updatesBankTransaction.find((transaction) =>{
				const currencyCode = transaction.currency ? transaction.currency : 'EUR';
				locales.find((item) => {
					if(item.currencyCode === currencyCode){
						transaction.country = item.countryCode;
						transaction.locale = item.locale;	
					}	
				});
			});
		}

		this.setState({
			bankTransactions : updatesBankTransaction
		});		
	};


	render() {
		const { classes } = this.props;
		const { openDialog, value, openDirectDebitConnect, processingTransaction, bankTransactions } = this.state;
		return (
			<div>
				{/* <Notifier /> */}  
				<Card>
					<CardHeader color='info'>
						<h4 className={classes.cardTitleWhite}>Bank Transaction Overview</h4>
					</CardHeader>
					<CardBody>
						<GridContainer>
							<GridItem xs={12} sm={4} md={3}>
								<CustomInputBox
									type='dropdown'
									id='Status'
									label='Bank Account'
									onChange={(event, newValue) => {
										if (newValue) {
											this.setState({ selectedBankAccount: newValue });
											this.props.getAllBankTransactions(this.state.transactionDate, this.state.selectedStatus, newValue);
										}
									}}
									dropDownValues={Object.keys(BankAccount).map(key => { return { key: key, value: BankAccount[key] }; })}
									isNoneInDropDownList={false}
								/>
							</GridItem>
							<GridItem xs={12} sm={4} md={3}>
								<CustomInputBox
									type='dropdown'
									id='Status'
									label='Status'
									onChange={(event, newValue) => {
										if (newValue) {
											this.setState({ selectedStatus: newValue });
											this.props.getAllBankTransactions(this.state.transactionDate, newValue, this.state.selectedBankAccount);
										}
									}}
									dropDownValues={Object.keys(Transactionstatus).map(key => { return { key: key, value: Transactionstatus[key] }; })}
									isNoneInDropDownList={false}
								/>
							</GridItem>
							<GridItem xs={12} sm={4} md={3}className={classes.smallBox}>
							<FormControl size="small" variant="outlined" className={classes.searchBox} style= {{marginTop: '19px'}}>
								<MuiPickersUtilsProvider utils={MomentUtils}>
                                    <KeyboardDatePicker
                                        disableToolbar
                                        id="process-end-date"
                                        name="transactionDate"
                                        autoOk
                                        variant="inline"
                                        label="Transaction Date "
                                        format="DD-MM-YYYY"
                                        value={this.state.transactionDate}
                                        InputAdornmentProps={{ position: "start" }}
                                        onChange={date => this.handleDatePickers(date)}
                                        inputVariant="outlined"
                                        InputProps={{
                                            className: classes.inputProp
                                          }}
                                          InputLabelProps={{
                                            shrink: true,
                                            className: classes.inputLabel
                                          }}
                                    />
                                </MuiPickersUtilsProvider>
							</FormControl>
							</GridItem>
						</GridContainer>
						<TableContainer component={Paper} className={classes.tableContainer} style= {{marginTop: '19px'}}>
							<Table className={classes.table} aria-label="simple table">
								<TableHead className={classes.tableHeadColor}>
									<TableRow>
										<TableCell className={classes.tableCell} title='Statement'>
											<TableSortLabel
												active={this.state.orderBy === 'statement'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'statement')}>
												Statement
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Date'>
											<TableSortLabel
												active={this.state.orderBy === 'date'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'date')}>
												Date
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Counterparty'>
											<TableSortLabel
												active={this.state.orderBy === 'counterpartyIban'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'counterpartyIban')}>
												Counterparty IBAN
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Counterparty'>
											<TableSortLabel
												active={this.state.orderBy === 'counterparty'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'counterparty')}>
												Counterparty
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='SmeCompany'>
											<TableSortLabel
												active={this.state.orderBy === 'smeCompany'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'smeCompany')}>
												{/* SME Name */}
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Description'>
											<TableSortLabel
												active={this.state.orderBy === 'description'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'description')}>
												Description
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Amount'>
											<TableSortLabel
												active={this.state.orderBy === 'amount'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'amount')}>
												Amount
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Balance'>
											<TableSortLabel
												active={this.state.orderBy === 'balance'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'balance')}>
												Balance
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Status'>
											<TableSortLabel
												active={this.state.orderBy === 'status'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'status')}>
												Status
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Reason Code'>
											<TableSortLabel
												active={this.state.orderBy === 'reasonCode'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'reasonCode')}>
												Reason Code
											</TableSortLabel>
										</TableCell>
										<TableCell className={classes.tableCell} title='Reason'>
											<TableSortLabel
												active={this.state.orderBy === 'reason'}
												// @ts-ignore
												direction={this.state.order}
												onClick={this.handleRequestSort.bind(this, 'reason')}>
												Reason
											</TableSortLabel>
										</TableCell>
									</TableRow>
								</TableHead>
								{
									stableSort(bankTransactions, getSorting(this.state.order, this.state.orderBy))
										.map((transaction, key) => (
											<TableBody key={key}>
												{(key === 0 || transaction.statementNumber !== bankTransactions[key - 1].statementNumber) ?
													<TableRow key={'statement_row' + transaction._id}>
														<TableCell
															className={classes.tableBodyCell}>{transaction.statementNumber}</TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left">
															{currency(transaction.bankStatement?.closingBalanceAmount, transaction.locale ? transaction.locale : 'nl-NL', transaction.currency ? transaction.currency : 'EUR')}
														</TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
														<TableCell className={classes.tableCell} align="left"></TableCell>
													</TableRow> :
													false
												}

												<TableRow key={transaction._id}>
													{/* <TableCell className={classes.tableBodyCell}>{moment(transaction.transactionDate).format('YYYY-MM-DD')}</TableCell> */}
													<TableCell className={classes.tableCell} align="left"></TableCell>
													<TableCell className={classes.tableCell} align="left">{moment(transaction.transactionDate).format('DD-MM-YYYY')}</TableCell>
													{/* <TableCell className={classes.tableBodyCell}>{transaction.counterparty !== 'undefined' && transaction.counterpartyIbanNumber}</TableCell> */}
													<TableCell className={classes.tableCell} align="left">{transaction.counterparty !== 'undefined' && transaction.counterpartyIbanNumber}</TableCell>
													<TableCell className={classes.tableCell} align="left">{transaction.counterpartyIbanNumber !== 'undefined' && transaction.counterparty}</TableCell>
													<TableCell className={classes.tableCell} align="left">{transaction.smeCompany}</TableCell>
													<TableCell className={classes.tableCell} align="left">{transaction.description}</TableCell>
													<TableCell className={classes.tableCell} align="left">
														{currency(transaction.amount, transaction.locale ? transaction.locale : 'nl-NL', transaction.currency ? transaction.currency : 'EUR')}
													</TableCell>

													<TableCell className={classes.tableCell} align="left"></TableCell>
													<TableCell className={classes.tableCell} align="left">{transaction.status}</TableCell>
													<TableCell className={classes.tableCell} align="left">{transaction.reasonCode}</TableCell>
													<TableCell className={classes.tableCell} align="left">{transaction.returnReason}</TableCell>

													<TableCell className={classes.tableCell} align="left">
														{(transaction.status === 'unknown') &&
															<IconButton
																title='process'
																onClick={() => this.handleClickListItem(transaction, 'unknown')}
															>
																<Extension />
															</IconButton>
														}
														{((key === 0 || transaction.statementNumber !== bankTransactions[key - 1].statementNumber) && transaction.status === 'processed') ?
															<IconButton
																title='reverse-statement'
																onClick={() => this.handleClickListItem(transaction, 'reverse-statement')}
																style={{ visibility: 'hidden' }}
															>
																<RestorePage />
															</IconButton>
															: ''
														}

														{((key === 0 || transaction.statementNumber !== bankTransactions[key - 1].statementNumber) && transaction.status !== 'processed') ?
															<IconButton
																title='re-run-statement'
																onClick={() => this.handleClickListItem(transaction, 're-run')}
																style={{ visibility: 'hidden' }}
															>
																<SettingsBackupRestore />
															</IconButton>
															: ''
														}

														{(transaction.status === 'reverse') &&
															<IconButton
																title='re-run-statement'
																onClick={() => this.handleClickListItem(transaction, 're-run')}
																style={{ visibility: 'hidden' }}
															>
																<SettingsBackupRestore />
															</IconButton>
														}
													</TableCell>
												</TableRow>
											</TableBody>
										))}
							</Table>
						</TableContainer>
					</CardBody>
				</Card>

				<UnknownTransactionDialog
					classes={{
						paper: classes.paper,
					}}
					id="unknown-transaction-dialog"
					keepMounted
					open={openDialog}
					onClose={this.handleClose}
					transactionData={processingTransaction}
					value={value}
				/>

				<Dialog maxWidth="lg" open={openDirectDebitConnect}>
					<ConnectUnknownTransactionsPopup
						onClose={this.handleCloseDDO}
						bankTransaction={processingTransaction}
						connectTransactionType={this.state.connectTransactionType}
						refreshBTOverview={this.refreshData}
					/>
				</Dialog>

				<ConfirmationDialog title='Are you sure this transaction has no influence on the loan?'
					cancel='NO'
					ok='YES'
					open={this.state.isChangeStatus}
					handleOk={this.confirmChangeStatus}
					handleCancel={() => this.setState({ isChangeStatus: false })} />
			</div>
		);
	}
}
BankTransactionOverview.propTypes = {
	classes: PropTypes.object,
	bankTransactions: PropTypes.array,
	setManuallySettled: PropTypes.func.isRequired,
	getAllBankTransactions: PropTypes.func.isRequired,
	setRerunBankTransaction: PropTypes.func.isRequired,
	setReverseBankStatement: PropTypes.func.isRequired,
	setReverseBankTransaction: PropTypes.func.isRequired,
	getSimulationDate: PropTypes.func.isRequired,
	systemDate: PropTypes.string,
	clearHeaderDisplaySubData: PropTypes.func,
	getLocales: PropTypes.func
};

const mapStateToProps = state => {
	return {
		bankTransactions: state.bankTransactions.bankTransactions,
		systemDate: state.configurations.simulations.systemDate,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getAllBankTransactions: (transactionDate, status, bankAccount) => {
			dispatch(getAllBankTransactions(transactionDate, status, bankAccount));
		},
		setRerunBankTransaction: (transaction, transactionDate) => {
			dispatch(reRunBankTransaction(transaction, transactionDate));
		},
		setReverseBankTransaction: (transaction, transactionDate) => {
			dispatch(reverseBankTransaction(transaction, transactionDate));
		},
		setReverseBankStatement: (transaction, selectedBankAccount) => {
			dispatch(reverseBankStatement(transaction, selectedBankAccount));
		},
		setManuallySettled: (transactionId, status) => dispatch(saveBankTransactionStatus(transactionId, status)),
		getSimulationDate: () => { return dispatch(getSimulationDate()); },
		clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
		getLocales: () => dispatch(getLocales())
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(style)(BankTransactionOverview));