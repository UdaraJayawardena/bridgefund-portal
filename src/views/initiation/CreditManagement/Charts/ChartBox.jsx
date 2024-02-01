// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';
import { Chart } from "react-google-charts";
import { Chip, Dialog, LinearProgress, Paper, Typography, Grid } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';

import { EURO } from 'lib/initiation/utility';
import { getBankTransactionsForGivenFilters } from 'store/initiation/actions/BankTransactions.action';
import TransactionsPopUp from './TransactionsPopUp';
import chartBoxStyle from 'assets/jss/bridgefundPortal/views/crmChartsStyle';
import { Alert } from '@material-ui/lab';
import ChartLegend from './ChartLegend';



const createCustomChartHTMLToolTipContent = (
	date,
	balance,
	outgoingPayment,
	incomingPayment,
	ddAmount = 0
) => {
	return (
		'<div style="padding:10px 10px 10px 10px;">' +
		"<table >" +

		"<tr>" +
		'<td colspan="2" style="font-size: 15px;"><b> Date ' +
		moment(date).format('DD-MM-YYYY') +
		"</b></td>" +
		"</tr>" +

		"<tr>" +
		'<td style="color:blue;font-size: 12px;"><b> Balance ' +
		"</b></td>" +
		'<td style="color:blue;font-size: 12px;float: right;"><b> ' +
		EURO(balance) +
		"</b></td>" +
		"</tr>" +

		"<tr>" +
		'<td style="color:orange;font-size: 12px;"><b> Outgoing Payment ' +
		"</b></td>" +
		'<td style="color:orange;font-size: 12px;float: right;"><b> ' +
		EURO(outgoingPayment) +
		"</b></td>" +
		"</tr>" +

		"<tr>" +
		'<td style="color:green;font-size: 12px;"><b> Incoming Payment ' +
		"</b></td>" +
		'<td style="color:green;font-size: 12px;float: right;"><b> ' +
		EURO(incomingPayment) +
		"</b></td>" +
		"</tr>" +

		"<tr>" +
		'<td style="font-size: 12px;"><b> DD Amount ' +
		"</b></td>" +
		'<td style="font-size: 12px;float: right;"><b> ' +
		EURO(ddAmount) +
		"</b></td>" +
		"</tr>" +

		"</table>" +
		"</div>"
	);
};

const isSameTwoBlockArrays = (listOne, listTwo) => {
	let flag = true;

	if (listOne.length !== listTwo.length) return false;

	for (let i = 0; i < listOne.length; i++) {
		const iban = listOne[i];
		const element = listTwo.find(el => el === iban);
		if (!element) flag = false;
	}

	return flag;
};

const CHART_LEGENDS = ['IncomingAmountCheckbox', 'OutgoingAmountCheckbox', 'BalanceAmountCheckbox', 'DDAmountCheckbox'];

class ChartBox extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedChartRange: 'All',
			data: ['x', 'iban'],
			selectedBankTransactions: [],
			isOpenTransactionPopup: false,
			overviewDate: null,
			chartLegends: CHART_LEGENDS,
		};
	}


	componentDidMount() {
		this.initChartData();
	}

	componentDidUpdate(prevProps, prevState) {
		const { ibanNumberList, ddAmount } = this.props;
		console.log('Chart Box cdu');
		if ((ddAmount && prevProps.ddAmount !== ddAmount) || (ibanNumberList && !isSameTwoBlockArrays(ibanNumberList, prevProps.ibanNumberList)))
			this.initChartData();
	}

	initChartData = () => {

		const { dailyPositionBlock } = this.props;
		this.setState({ data: this.mapDataForSingleChart(this.getStartDateByRange(dailyPositionBlock.data)) });
	}


	getStartDateByRange = (dailyPositions) => {
		const endDate = dailyPositions[dailyPositions.length - 1] ? dailyPositions[dailyPositions.length - 1].position_date : null;
		if (!endDate) {
			return [];
		}
		const { selectedChartRange } = this.state;
		if (selectedChartRange === '1 Month') return dailyPositions.filter(dp => moment(dp.position_date).isSameOrAfter(moment(endDate).add(-1, 'months').format('YYYY-MM-DD')));
		if (selectedChartRange === '6 Months') return dailyPositions.filter(dp => moment(dp.position_date).isSameOrAfter(moment(endDate).add(-6, 'months').format('YYYY-MM-DD')));
		return dailyPositions;
	}

	mapDataForSingleChart = (resData) => {
		if (!resData) return [];
		const { ddAmount } = this.props;

		const data = resData.map(position => {

			return [position.position_date,
			createCustomChartHTMLToolTipContent(position.position_date, position.balance_amount, position.outgoing_payment_amount, position.incoming_payment_amount, ddAmount),
			position.incoming_payment_amount, position.outgoing_payment_amount, position.balance_amount, ddAmount
			];
		});

		data.unshift(['x', { type: "string", role: "tooltip", p: { html: true } }, 'Incoming Amount', 'Outgoing Amount', 'Balance Amount', 'DD Amount']);
		return data;
	}

	getStyleForSelectedChartRange = (tab) => {
		const { selectedChartRange } = this.state;
		if (tab === selectedChartRange) return { background: 'rgb(195, 195, 162)', color: 'black' };
		return { background: 'rgb(235, 235, 224)', color: 'black' };
	}

	handleChartRangeClick = (tab) => {
		this.setState({ selectedChartRange: tab }, () => this.initChartData());
	}

	handlePopupOpen = () => {
		this.setState({ isOpenTransactionPopup: !this.state.isOpenTransactionPopup });
	}

	setSelectedTransactions = (transactions) => {
		this.setState({ selectedBankTransactions: transactions });
	}

	componentWillUnmount() {
		this.setState({
			selectedChartRange: 'All',
			data: ['x', 'iban'],
			selectedBankTransactions: [],
			isOpenTransactionPopup: false,
			overviewDate: null,
		});
	}

	filterSeriesesByCheckedLegends = (data) => {
		const { chartLegends } = this.state;
		// 'Incoming Amount'==>2, 'Outgoing Amount'==>3, 'Balance Amount'==>4, 'DD Amount'==>5 // indexes
		return data.map(data => {
			const IncomingDataItem = [...data];
			const revoveIndexList = [];

			if (!chartLegends.includes('IncomingAmountCheckbox')) revoveIndexList.push(2);
			if (!chartLegends.includes('OutgoingAmountCheckbox')) revoveIndexList.push(3);
			if (!chartLegends.includes('BalanceAmountCheckbox')) revoveIndexList.push(4);
			if (!chartLegends.includes('DDAmountCheckbox')) revoveIndexList.push(5);

			for (let i = revoveIndexList.length - 1; i >= 0; i--)
				IncomingDataItem.splice(revoveIndexList[i], 1);

			return IncomingDataItem;
		});

	}

	handleLegendChange = (legend, e) => {
		const { chartLegends } = this.state;

		if (chartLegends.length === 1 && chartLegends.includes(legend)) return;
		this.setState(prevState => {
			if (prevState.chartLegends.includes(legend)) {
				return { chartLegends: prevState.chartLegends.filter(l => l !== legend) };
			}
			return { chartLegends: [...prevState.chartLegends, legend] };
		});
	}

	getChartSeriesesColorSequence = () => {
		const { chartLegends } = this.state;
		const colors = ['green', 'orange', 'blue', 'black'];
		const revoveIndexList = [];
		if (chartLegends.length === 4) return colors;
		if (!chartLegends.includes('IncomingAmountCheckbox')) revoveIndexList.push(0);
		if (!chartLegends.includes('OutgoingAmountCheckbox')) revoveIndexList.push(1);
		if (!chartLegends.includes('BalanceAmountCheckbox')) revoveIndexList.push(2);
		if (!chartLegends.includes('DDAmountCheckbox')) revoveIndexList.push(3);

		for (let i = revoveIndexList.length - 1; i >= 0; i--)
			colors.splice(revoveIndexList[i], 1);

		return colors;

	}

	render() {
		const { classes, dailyPositionBlock, ibanNumberList } = this.props;
		const { data, selectedBankTransactions, isOpenTransactionPopup, overviewDate, chartLegends } = this.state;
		// console.log('getChartSeriesesColorSequence ', this.getChartSeriesesColorSequence());
		// console.log('data ', data);
		return (
			<div>
				{data && data.length === 1 ?
					<Alert className={classes.chartContainer} variant="outlined" severity="warning">{`No Daily Positions for  ${dailyPositionBlock.iban} `}</Alert> :
					<>
						<GridContainer >
							<GridItem md={12}>
								<Paper variant="outlined" className={classes.chartContainer}>
									<Grid justify="space-between"
										container>
										<Grid item>
											<Typography className={classes.chartTitle} variant="h5" >{dailyPositionBlock.iban}
												<Chip size="small" className={classes.chartRangeButton} label="1 Month" style={this.getStyleForSelectedChartRange('1 Month')} onClick={(e) => this.handleChartRangeClick('1 Month')} />
												<Chip size="small" className={classes.chartRangeButton} label="6 Months" style={this.getStyleForSelectedChartRange('6 Months')} onClick={(e) => this.handleChartRangeClick('6 Months')} />
												<Chip size="small" className={classes.chartRangeButton} label="All" style={this.getStyleForSelectedChartRange('All')} onClick={(e) => this.handleChartRangeClick('All')} />
											</Typography>
										</Grid>
										<Grid item>
											<ChartLegend handleLegendChange={this.handleLegendChange} legends={chartLegends} />
										</Grid>
									</Grid>
									<Chart
										width={1700}
										height={500}
										chartType="LineChart"
										loader={<LinearProgress />}
										data={this.filterSeriesesByCheckedLegends(data)}
										chartEvents={[
											{
												eventName: 'select',
												callback: ({ chartWrapper }) => {
													const chart = chartWrapper.getChart();
													const selection = chart.getSelection();
													const selectedDate = moment(data[selection[0].row + 1][0]).format('YYYY-MM-DD');
													this.setState({ overviewDate: selectedDate });

													if (selection.length === 1) {
														this.props.getBankTransactionsForGivenFilters({
															"action": "GET",
															"transactionDate": selectedDate,
															"ibanNumber": dailyPositionBlock.iban
														})
															.then(res => this.setState({
																selectedBankTransactions: res,
																isOpenTransactionPopup: true
															}))
															.catch(err => console.log(err));
													}
												},
											},
										]}
										options={{
											chartArea: { left: 100, top: 20, bottom: 50, right: 50 },
											timeline: {
												groupByRowLabel: true
											},
											hAxis: {
												format: 'MMM YYYY',
												minorGridlines: { count: 0 },
												textStyle: {
													fontSize: 15
												},
											},
											vAxis: {
												format: { prefix: '\u20AC ', pattern: 'short' },
												gridlines: {
													count: 8,
												},
												minorGridlines: { count: 0 },
												textStyle: {
													fontSize: 15
												},
											},
											explorer: {
												actions: ['dragToZoom', 'rightClickToReset'],
												axis: 'horizontal',
												keepInBounds: true,
												maxZoomIn: 40.0
											},
											focusTarget: 'category',
											tooltip: { isHtml: true },
											colors: this.getChartSeriesesColorSequence(),
											animation: {
												startup: true,
												duration: 500
											},
											// legend: { position: 'top', alignment: 'end' },
											legend: 'none'
										}}
										rootProps={{ 'data-testid': '2' }}
									// legendToggle
									/>
								</Paper>
							</GridItem>
						</GridContainer>
						<Dialog
							onClose={this.handlePopupOpen}
							aria-labelledby="transaction-dialog"
							fullWidth
							maxWidth={'lg'}
							open={isOpenTransactionPopup}>
							<Paper className={classes.popUpContainer}>
								<TransactionsPopUp bankTransactions={selectedBankTransactions}
									overviewDate={overviewDate}
									ibanNumberList={ibanNumberList}
									handlePopupOpen={this.handlePopupOpen}
									setSelectedTransactions={this.setSelectedTransactions}
									origin={'CHARTS'} />
							</Paper>
						</Dialog>
					</>
				}
			</div>
		);
	}
}

// {
// 	"action": "GET",
// 	"transactionDate": "2020-05-28",
// 	"ibanNumber": "NL04ABNA0826477348"
//   }

ChartBox.propTypes = {
	classes: PropTypes.object.isRequired,
	dailyPositionBlock: PropTypes.object.isRequired,
	ddAmount: PropTypes.number,
	getBankTransactionsForGivenFilters: PropTypes.func,
	ibanNumberList: PropTypes.array
};

const mapStateToProp = () => ({
});

const mapDispatchToProps = (dispatch) => ({
	getBankTransactionsForGivenFilters: (requestData) => dispatch(getBankTransactionsForGivenFilters(requestData)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(chartBoxStyle)(ChartBox));