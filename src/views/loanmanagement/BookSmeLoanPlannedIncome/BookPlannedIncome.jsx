// @ts-nocheck
import React from "react";
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/smeLoanRecoveryAppointmentStyles.jsx";
import { Paper, MenuItem, InputLabel, FormControl, Select, TextField, Button } from "@material-ui/core";
// import { Extension, SettingsBackupRestore, RestorePage } from "@material-ui/icons";
import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import Notifier from "components/loanmanagement/Notification/Notifier.jsx";
import DateFnsUtils from "@date-io/date-fns";
// import Alert from '@material-ui/lab/Alert';

// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';


import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import Loader from 'components/loanmanagement/CustomLoader/Loader.jsx';


import { ProcessSmeLoanPlannedIncome } from 'store/loanmanagement/actions/SmeLoans';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';
import monthsArray from './months';

import { CollapsibleTableFixedLoans, CollapsibleTableFlexLoans } from "./expantialTable.jsx";
import SelectedMonthDetails from "./selectedMonthDetails.jsx";
import { clearHeaderDisplaySubData } from "store/loanmanagement/actions/HeaderNavigation";

// import moment from 'moment';
// import Util from 'lib/utility';
// const currency = Util.currencyConverter();

import { getFieldNameValues, getLocales } from "store/initiation/actions/Configuration.action";

export const months = monthsArray;

class BookPlannedIncome extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedMonth: (this.props.systemDate) ? (Number(new Date(moment(this.props.systemDate).format('YYYY-MM-DD')).getMonth()) + 1) : (Number(new Date().getMonth()) + 1),
			selectedDate: (this.props.systemDate) ? new Date(moment(this.props.systemDate).format('YYYY-MM-DD')) : new Date(),
			selectedYear: (this.props.systemDate) ? new Date(moment(this.props.systemDate).format('YYYY-MM-DD')).getFullYear() : new Date().getFullYear(),
			numberOfMonthsBookForword: 1,
			numberOfMonthsBookForwordTemp: 0,
			isProcessAndFlagAsBooked: false,
			buttonsDisabled: false,
			results: null,

			firstMonth: null,
			selectedMonthTotal: null,
			firstMonthDataToMonthSummaryList: null,
			otherMonthsTotal: null,

			showBookInGLAlert: false,

			flexLoanOverview: null,

			downloadButtonDisabled: true,
			downloadLink: '',
			fileName: '',

			disabledProcessAndBookBTN: true,
			countries:[],
			currencies: [],
			country: 'all',
			currency: 'EUR',
			countryName: ''
		};
	}

	componentDidMount() {
		this.props.clearHeaderDisplaySubData();
		this.isDisabledProcessAndBookBTN();
		this.getFieldNameValues();
	}

	isDisabledProcessAndBookBTN = () => {
		let year = new Date().getFullYear();
		let month = Number(new Date().getMonth()) + 1;
		if (this.props.systemDate) {
			year = new Date(moment(this.props.systemDate).format('YYYY-MM-DD')).getFullYear();
			month = Number(new Date(moment(this.props.systemDate).format('YYYY-MM-DD')).getMonth()) + 1;
		}
		let disabledProcessAndBookBTN = true;
		if (this.state.selectedYear <= year) {
			if (this.state.selectedMonth < month) {
				disabledProcessAndBookBTN = false;
			} else {
				if (this.state.selectedYear < year) {
					disabledProcessAndBookBTN = false;
				}
			}
		}
		this.setState({ disabledProcessAndBookBTN: disabledProcessAndBookBTN });
	}

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value }, () => {
			this.isDisabledProcessAndBookBTN();
		});

	};

	handleYearChange(date) {
		const selectedDate = new Date(date);
		const year = selectedDate.getFullYear();
		this.setState({ selectedYear: year, selectedDate: selectedDate },
			() => {
				this.isDisabledProcessAndBookBTN();
			});
	}

	handleNumberOfMonthsForwardChange = (event) => {
		if (0 <= Number(event.target.value) && Number(event.target.value) <= 100) {

			this.setState({ numberOfMonthsBookForwordTemp: event.target.value, numberOfMonthsBookForword: (Number(event.target.value) + 1) });
		}
	}

	generateSelectedMonthTotal = (selectedMonth) => {
		const initialFee = selectedMonth.cat1.summary.initialFee + selectedMonth.cat2.summary.initialFee + selectedMonth.cat3.summary.initialFee + selectedMonth.cat4.summary.initialFee;
		const interestIncome = selectedMonth.cat1.summary.interestIncome + selectedMonth.cat2.summary.interestIncome + selectedMonth.cat3.summary.interestIncome + selectedMonth.cat4.summary.interestIncome;
		const otherIncome = selectedMonth.cat1.summary.otherIncome + selectedMonth.cat2.summary.otherIncome + selectedMonth.cat3.summary.otherIncome + selectedMonth.cat4.summary.otherIncome;
		const claimOrInterestPanalty = selectedMonth.cat1.summary.claimOrInterestPanalty + selectedMonth.cat2.summary.claimOrInterestPanalty + selectedMonth.cat3.summary.claimOrInterestPanalty + selectedMonth.cat4.summary.claimOrInterestPanalty;
		const totalIncome = selectedMonth.cat1.summary.totalIncome + selectedMonth.cat2.summary.totalIncome + selectedMonth.cat3.summary.totalIncome + selectedMonth.cat4.summary.totalIncome;
		const marginFreeFall = selectedMonth.cat1.summary.marginFreeFall + selectedMonth.cat2.summary.marginFreeFall + selectedMonth.cat3.summary.marginFreeFall + selectedMonth.cat4.summary.marginFreeFall;
		const discount = selectedMonth.cat1.summary.discount + selectedMonth.cat2.summary.discount + selectedMonth.cat3.summary.discount + selectedMonth.cat4.summary.discount;

		return {
			initialFee: initialFee,
			interestIncome: interestIncome,
			otherIncome: otherIncome,
			claimOrInterestPanalty: claimOrInterestPanalty,
			totalIncome: totalIncome,
			marginFreeFall: marginFreeFall,
			discount: discount
		};
	};

	generateOtherMonthsTotal = (otherMonths) => {
		let initialFee = 0;
		let interestIncome = 0;
		let otherIncome = 0;
		let claimOrInterestPanalty = 0;
		let totalIncome = 0;
		let marginFreeFall = 0;
		let discount = 0;

		if (otherMonths && otherMonths.length > 0) {
			otherMonths.forEach(sm => {
				initialFee = sm.cat1.summary.initialFee + initialFee;
				interestIncome = sm.cat1.summary.interestIncome + interestIncome;
				otherIncome = sm.cat1.summary.otherIncome + otherIncome;
				claimOrInterestPanalty = sm.cat1.summary.claimOrInterestPanalty + claimOrInterestPanalty;
				totalIncome = sm.cat1.summary.totalIncome + totalIncome;
				marginFreeFall = sm.cat1.summary.marginFreeFall + marginFreeFall;
				discount = sm.cat1.summary.discount + discount;
			});
		}

		return {
			initialFee: initialFee,
			interestIncome: interestIncome,
			otherIncome: otherIncome,
			claimOrInterestPanalty: claimOrInterestPanalty,
			totalIncome: totalIncome,
			marginFreeFall: marginFreeFall,
			discount: discount
		};
	}

	generateOtherMonthDrilldownsTotal = (otherMonths) => {


		if (otherMonths && otherMonths.length > 0) {
			otherMonths.forEach(sm => {
				let initialFee = 0;
				let interestIncome = 0;
				let otherIncome = 0;
				let claimOrInterestPanalty = 0;
				let totalIncome = 0;
				sm.drilldown.normalloans.forEach(nle => {
					initialFee = nle.initialFee + initialFee;
					interestIncome = nle.interestIncome + interestIncome;
					otherIncome = nle.otherIncome + otherIncome;
					claimOrInterestPanalty = nle.claimOrInterestPanalty + claimOrInterestPanalty;
					totalIncome = nle.totalIncome + totalIncome;
				});
				const total = {
					initialFee: initialFee,
					interestIncome: interestIncome,
					otherIncome: otherIncome,
					claimOrInterestPanalty: claimOrInterestPanalty,
					totalIncome: totalIncome
				};
				sm.drilldown.normalloans.push(total);


			});
		}

		return otherMonths;
	}

	generateFirstMonthDrillDownTotal = (selectedMonth) => {
		if (selectedMonth.drilldown.normalloans && selectedMonth.drilldown.normalloans.length > 0) {
			// update normal loans total
			let initialFee = 0;
			let interestIncome = 0;
			let otherIncome = 0;
			let claimOrInterestPanalty = 0;
			let totalIncome = 0;
			selectedMonth.drilldown.normalloans.forEach(nle => {
				initialFee = nle.initialFee + initialFee;
				interestIncome = nle.interestIncome + interestIncome;
				otherIncome = nle.otherIncome + otherIncome;
				claimOrInterestPanalty = nle.claimOrInterestPanalty + claimOrInterestPanalty;
				totalIncome = nle.totalIncome + totalIncome;
			});
			const total = {
				initialFee: initialFee,
				interestIncome: interestIncome,
				otherIncome: otherIncome,
				claimOrInterestPanalty: claimOrInterestPanalty,
				totalIncome: totalIncome
			};
			selectedMonth.drilldown.normalloans.push(total);
		}

		if (selectedMonth.drilldown.refinancedLoans && selectedMonth.drilldown.refinancedLoans.length > 0) {
			// update refinanced loans total
			let initialFee = 0;
			let interestIncome = 0;
			let otherIncome = 0;
			let claimOrInterestPanalty = 0;
			let totalIncome = 0;
			let marginFreeFall = 0;
			let discount = 0;
			let refinancedAmount = 0;

			selectedMonth.drilldown.refinancedLoans.forEach(nle => {
				initialFee = nle.initialFee + initialFee;
				interestIncome = nle.interestIncome + interestIncome;
				otherIncome = nle.otherIncome + otherIncome;
				claimOrInterestPanalty = nle.claimOrInterestPanalty + claimOrInterestPanalty;
				totalIncome = nle.totalIncome + totalIncome;
				marginFreeFall = nle.marginFreeFall + marginFreeFall;
				discount = nle.discount + discount;
				refinancedAmount = nle.refinancedAmount + refinancedAmount;
			});
			const total = {
				initialFee: initialFee,
				interestIncome: interestIncome,
				otherIncome: otherIncome,
				claimOrInterestPanalty: claimOrInterestPanalty,
				totalIncome: totalIncome,
				marginFreeFall: marginFreeFall,
				discount: discount,
				refinancedAmount: refinancedAmount
			};
			selectedMonth.drilldown.refinancedLoans.push(total);
		}

		if (selectedMonth.drilldown.redeemedLoans && selectedMonth.drilldown.redeemedLoans.length > 0) {
			// update redeemed loans total
			let initialFee = 0;
			let interestIncome = 0;
			let otherIncome = 0;
			let claimOrInterestPanalty = 0;
			let totalIncome = 0;
			let marginFreeFall = 0;
			let discount = 0;
			selectedMonth.drilldown.redeemedLoans.forEach(nle => {
				initialFee = nle.initialFee + initialFee;
				interestIncome = nle.interestIncome + interestIncome;
				otherIncome = nle.otherIncome + otherIncome;
				claimOrInterestPanalty = nle.claimOrInterestPanalty + claimOrInterestPanalty;
				totalIncome = nle.totalIncome + totalIncome;
				marginFreeFall = nle.marginFreeFall + marginFreeFall;
				discount = nle.discount + discount;
			});
			const total = {
				initialFee: initialFee,
				interestIncome: interestIncome,
				otherIncome: otherIncome,
				claimOrInterestPanalty: claimOrInterestPanalty,
				totalIncome: totalIncome,
				marginFreeFall: marginFreeFall,
				discount: discount
			};
			selectedMonth.drilldown.redeemedLoans.push(total);
		}

		if (selectedMonth.drilldown.loanInDefaultLoans && selectedMonth.drilldown.loanInDefaultLoans.length > 0) {
			// update defult loans total
			let initialFee = 0;
			let interestIncome = 0;
			let otherIncome = 0;
			let claimOrInterestPanalty = 0;
			let totalIncome = 0;
			let marginFreeFall = 0;
			let discount = 0;
			selectedMonth.drilldown.loanInDefaultLoans.forEach(nle => {
				initialFee = nle.initialFee + initialFee;
				interestIncome = nle.interestIncome + interestIncome;
				otherIncome = nle.otherIncome + otherIncome;
				claimOrInterestPanalty = nle.claimOrInterestPanalty + claimOrInterestPanalty;
				totalIncome = nle.totalIncome + totalIncome;
				marginFreeFall = nle.marginFreeFall + marginFreeFall;
				discount = nle.discount + discount;
			});
			const total = {
				initialFee: initialFee,
				interestIncome: interestIncome,
				otherIncome: otherIncome,
				claimOrInterestPanalty: claimOrInterestPanalty,
				totalIncome: totalIncome,
				marginFreeFall: marginFreeFall,
				discount: discount
			};
			selectedMonth.drilldown.loanInDefaultLoans.push(total);
		}

		return selectedMonth;
	}


	/// Flex loans
	generateFlexLoanOtherMonthsTotal = (otherMonths, selectedMonthSummary) => {
		let recurringFee = 0;//selectedMonthSummary.recurringFee;


		if (otherMonths && otherMonths.length > 0) {
			otherMonths.forEach(sm => {
				recurringFee = sm.summary.recurringFee + recurringFee;
			});
		}

		return {
			recurringFee: recurringFee
		};
	}

	generateFlexLoanOtherMonthDrilldownsTotal = (otherMonths) => {


		if (otherMonths && otherMonths.length > 0) {
			otherMonths.forEach(sm => {
				let withDrawalFee = 0;
				let outstandingAmountAtLastWithdrawal = 0;
				let recurringFee = 0;
				let claimOrInterestPanalty = 0;
				sm.drilldown.forEach(nle => {
					withDrawalFee = nle.withDrawalFee + withDrawalFee;
					outstandingAmountAtLastWithdrawal = nle.outstandingAmountAtLastWithdrawal + outstandingAmountAtLastWithdrawal;
					recurringFee = nle.recurringFee + recurringFee;
					claimOrInterestPanalty = nle.claimOrInterestPanalty + claimOrInterestPanalty;
				});
				const total = {
					withDrawalFee: withDrawalFee,
					outstandingAmountAtLastWithdrawal: outstandingAmountAtLastWithdrawal,
					recurringFee: recurringFee,
					claimOrInterestPanalty: claimOrInterestPanalty
				};
				sm.drilldown.push(total);


			});
		}

		return otherMonths;
	}

	handleProcessType = (type) => {
		let isProcessAndFlagAsBooked = false;
		if (type) {
			isProcessAndFlagAsBooked = true;
		} else {
			isProcessAndFlagAsBooked = false;
		}

		this.setState({ isProcessAndFlagAsBooked: isProcessAndFlagAsBooked, buttonsDisabled: true, results: null, downloadButtonDisabled: true }, () => {
			const inputs = {
				year: this.state.selectedYear,
				month: this.state.selectedMonth,
				numberOfMonths: this.state.numberOfMonthsBookForword,
				isProcessAndFlagAsBooked : this.state.isProcessAndFlagAsBooked,
				country: this.state.country
			};

			this.props.ProcessSmeLoanPlannedIncome(inputs)
				.then((response) => {
					let downloadButtonDisabled = true;
					let downloadLink = null;
					let fileName = null;
					const selectedMonthTotal = this.generateSelectedMonthTotal(response.selected);
					const firstMonthDataToMonthSummaryList = { year: response.selected.year, month: response.selected.month, summary: selectedMonthTotal };
					const otherMonthsTotal = this.generateOtherMonthsTotal(response.otherMonths);
					const updateOtherMonths = this.generateOtherMonthDrilldownsTotal(response.otherMonths);
					const updatefirstMonthDrilldown = this.generateFirstMonthDrillDownTotal(response.selected);
					firstMonthDataToMonthSummaryList.drilldown = updatefirstMonthDrilldown.drilldown;

					const flexLoanOtherMonthsTotal = this.generateFlexLoanOtherMonthsTotal(response.flexLoanOtherMonths, response.flexLoanOverviewSelected.summary);
					const updateFlexLoanOtherMonths = this.generateFlexLoanOtherMonthDrilldownsTotal(response.flexLoanOtherMonths);
					if (response.file) {
						downloadLink = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.file}`;
						downloadButtonDisabled = false;
						fileName = response.fileName;
					}

					this.setState({
						results: response,
						firstMonth: response.selected,
						otherMonths: updateOtherMonths,
						selectedMonthTotal: selectedMonthTotal,
						firstMonthDataToMonthSummaryList: firstMonthDataToMonthSummaryList,
						otherMonthsTotal: otherMonthsTotal,
						flexLoanOverview: response.flexLoanOverviewSelected,
						flexLoanOverviewOtherMonths: updateFlexLoanOtherMonths,
						flexLoanOtherMonthsTotal: flexLoanOtherMonthsTotal,
						buttonsDisabled: false,
						downloadButtonDisabled: downloadButtonDisabled,
						downloadLink: downloadLink,
						fileName: fileName
					});

					this.RequestLocales();

				})
				.catch(() => {

					this.setState({ buttonsDisabled: false, results: null, downloadButtonDisabled: true });
				});


		});
	};

	handleBookInGL = () => {
		this.props.displayNotification('Book in GL process unavailable in this version.', 'warning');
	}

	redirectToDashBoard = () => {
		window.location.replace("/user/dashboard");
	}

	// SelectedMonthDetails = (props) => {

	// };

  	getFieldNameValues = () => {

		this.props.getFieldNameValues({ fieldName: 'country'})
			.then((response) => {
				if (Array.isArray(response)) {
					if (response.length > 0) {

						const countries = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES' && fieldNameValue.fieldName === 'country')
						.map(fieldNameValue => fieldNameValue.fieldNameValue);
						this.setState({ countries: countries });

						const currencies = response.filter(fieldNameValue => fieldNameValue.activeIndicator === 'YES' && fieldNameValue.fieldName === 'currency')
						.map((fieldNameValue) => {
							return {
								currency : fieldNameValue.fieldNameValue, country : fieldNameValue.country
							};
						});

						this.setState({currencies : currencies});
						
				}
			}

		});
	}

	RequestLocales = () => {
		const {currencies, country} = this.state;
		let loanCurrency = 'EUR';
		if(country !== 'all'){
			const currencyElm =  currencies.find(currencyObj => currencyObj.country === country);
			loanCurrency = currencyElm.currency

			this.props.getLocales({countryCode: country, currencyCode: loanCurrency})
			.then(res => {
				
				if (!res || res.length == 0) {             
				return this.props.displayNotification('Country and currency doesnt fit', 'warning');
				}
				this.setState({ 
					locale: res[0].locale,
					currency : res[0].currencyCode,
					countryName: res[0].country
				});
				})
				.catch(err => { console.log('getLocales err ', err); });
		} else{
			this.setState({ 
				locale: 'nl-NL',
				currency : loanCurrency,
				countryName: 'All countries'
			});
		}
	}


	render() {
		const { classes } = this.props;
		const {countries, locale, currency, countryName} = this.state;

		return (
			<div>
				<Notifier />

				<Card>
					<CardHeader color='info'>
						<h4 className={classes.cardTitleWhite}>Book Sme Loan Planned Income</h4>
					</CardHeader>
					<CardBody>
						<GridContainer>
							<GridItem xs={12} sm={3} md={2}>
								Period to book
							</GridItem>
							<GridItem xs={12} sm={6} md={2}>
								<FormControl className={classes.formControl}>
									<InputLabel htmlFor="bank-account">Month</InputLabel>
									<Select
										value={this.state.selectedMonth}
										onChange={this.handleChange}
										inputProps={{
											name: 'selectedMonth',
											id: 'selected-month',
										}}
										className={classes.selectEmpty}
									>
										{
											months.map((monthObj, index) => (
												<MenuItem key={index} value={monthObj.value}>{monthObj.name}</MenuItem>
											))
										}
									</Select>
								</FormControl>
							</GridItem>
							<GridItem xs={12} sm={6} md={2}>
								<FormControl className={classes.formControl_4 + ' ' + classes.fullWidth}>
									{/* <YearPicker onChange={this.handleChange} className={classes.footerBtn} /> */}
									<MuiPickersUtilsProvider utils={DateFnsUtils}>
										<DatePicker
											views={["year"]}
											label="Select year"
											value={this.state.selectedDate}
											onChange={this.handleYearChange.bind(this)}
										/>
									</MuiPickersUtilsProvider>
								</FormControl>
							</GridItem>
							<GridItem xs={12} sm={3} md={2}>
								Number-of-Months to look forward
							</GridItem>
							<GridItem xs={12} sm={6} md={2}>
								<FormControl className={classes.formControl_4 + ' ' + classes.fullWidth}>
									<TextField
										id="NMTBF"
										name="numberOfMonthsBookForward"
										label=" "
										type="number"
										fullWidth={true}
										value={this.state.numberOfMonthsBookForwordTemp}
										className={classes.textField}
										inputProps={{
											min: "0",
											max: "100"
										}}
										InputLabelProps={{ shrink: true, }}
										onChange={this.handleNumberOfMonthsForwardChange}
									/>
								</FormControl>
							</GridItem>
							<GridItem>
								<FormControl className={classes.formControl}>
									<InputLabel htmlFor="bank-account">Country</InputLabel>
									<Select
										value={this.state.country}
										onChange={this.handleChange}
										inputProps={{
											name: 'country',
											id: 'selected-country',
										}}
										className={classes.selectEmpty}
									>
										<MenuItem key="all" value="all">All</MenuItem>
										 {
											countries.map((country, index) => (
												<MenuItem key={index} value={country}>{country}</MenuItem>
											))
										}
									</Select>
								</FormControl>
							</GridItem>
							{/* <GridItem xs={12} sm={3} md={2}>
							</GridItem> */}
							<GridItem xs={12} sm={6} md={6}>
							</GridItem>
							{/* <GridItem xs={12} sm={3} md={2}>
							</GridItem> */}
							<GridItem xs={12} sm={3} md={2}>
								{(this.state.buttonsDisabled) ?
									<Button className={classes.addNewButton} variant="contained" color="primary" style={{ marginTop: "20px" }} disabled >
										PROCESS
									</Button>
									:
									<Button className={classes.addNewButton} variant="contained" color="primary"
										onClick={() => this.handleProcessType(0)} style={{ marginTop: "20px" }}>
										PROCESS
									</Button>
								}

							</GridItem>
							<GridItem xs={12} sm={3} md={2}>
								{(this.state.disabledProcessAndBookBTN || this.state.buttonsDisabled) ?
									<Button className={classes.addNewButton} variant="contained" color="primary" style={{ marginTop: "20px" }} disabled>PROCESS AND BOOK</Button>
									:
									<Button className={classes.addNewButton} variant="contained" color="primary" onClick={() => this.handleProcessType(1)} style={{ marginTop: "20px" }} >PROCESS AND BOOK</Button>

								}
							</GridItem>
							<GridItem xs={12} sm={3} md={2}>
								{(this.state.downloadButtonDisabled) ?
									<Button className={classes.addNewButton} variant="contained" color="secondary" style={{ marginTop: "20px" }} disabled>Download</Button>
									:
									<a href={this.state.downloadLink} download={this.state.fileName}>
										<Button className={classes.addNewButton} variant="contained" color="secondary" style={{ marginTop: "20px" }} >Download</Button>
									</a>

								}
							</GridItem>
						</GridContainer>
						<Paper className={classes.tableContainer}>
							{(this.state.results !== null) ?
								<>
									<h4 style={{ fontWeight: "500", marginLeft: "1rem", marginBottom: "0.5rem" }}>Fixed-Loans</h4>
									<span style={{ fontWeight: "500", marginLeft: "1rem" }}>{countryName}</span>
								</>
								
								:
								null
							}
							{(this.state.results !== null)?
								<SelectedMonthDetails selectMonthData={this.state.firstMonth} totalrow={this.state.selectedMonthTotal} locale={locale} currencyVal={currency}  />
								:
								null
							}
							{(this.state.results !== null) ?
								<CollapsibleTableFixedLoans
									firstMonthData={this.state.firstMonthDataToMonthSummaryList}
									otherMonthTotal={this.state.otherMonthsTotal}
									otherMonths={this.state.otherMonths}
									locale={locale} 
									currencyVal={currency}
									countryName={countryName}
								/>
								:
								null
							}
							{/* flex loans */}
							{(this.state.results !== null) ?
								<CollapsibleTableFlexLoans
									row={this.state.flexLoanOverview}
									flexLoanOverviewOtherMonths={this.state.flexLoanOverviewOtherMonths}
									flexLoanOtherMonthsTotal={this.state.flexLoanOtherMonthsTotal}
									locale={locale} 
									currencyVal={currency}
									countryName={countryName}
								/>
								:
								null
							}


						</Paper>
						<GridContainer>
							<GridItem xs={12} sm={3} md={3}>
								<Button variant="contained" color="secondary"
									onClick={() => this.redirectToDashBoard()} style={{ marginTop: "20px", borderRadius: "20px" }}>
									CANCEL
								</Button>
							</GridItem>
							<GridItem xs={12} sm={6} md={6}>
							</GridItem>

							<GridItem xs={12} sm={3} md={3}>
								{(!this.state.results) ?
									<Button className={classes.addNewButton} variant="contained" color="primary" style={{ marginTop: "20px" }} disabled>BOOK in GL</Button>
									:
									<Button className={classes.addNewButton} variant="contained" color="primary" onClick={() => this.handleBookInGL()} style={{ marginTop: "20px" }} >BOOK in GL</Button>

								}
							</GridItem>
						</GridContainer>
					</CardBody>
				</Card>
				<Loader open={this.state.buttonsDisabled} />
			</div>
		);
	}
}
BookPlannedIncome.propTypes = {
	classes: PropTypes.object,
	ProcessSmeLoanPlannedIncome: PropTypes.func.isRequired,
	displayNotification: PropTypes.func.isRequired,
	systemDate: PropTypes.string,
	clearHeaderDisplaySubData: PropTypes.func,
	getFieldNameValues: PropTypes.func.isRequired,
	getLocales: PropTypes.func.isRequired

};

const mapStateToProps = state => {
	return {
		systemDate: state.configurations.simulations.systemDate,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		ProcessSmeLoanPlannedIncome: (inputs) => dispatch(ProcessSmeLoanPlannedIncome(inputs)),
		displayNotification: (message, type) => dispatch(displayNotification(message, type)),
		clearHeaderDisplaySubData: () => dispatch(clearHeaderDisplaySubData()),
		getFieldNameValues: () => dispatch(getFieldNameValues()),
		getLocales: (inputs) => dispatch(getLocales(inputs))
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(BookPlannedIncome));