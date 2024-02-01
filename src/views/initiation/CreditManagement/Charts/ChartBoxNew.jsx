// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import LoadingOverlay from 'react-loading-overlay';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';
import { Chart } from "react-google-charts";
import { Chip, Dialog, LinearProgress, Paper, Typography, Grid } from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';

import { EURO } from 'lib/initiation/utility';
import { getBankTransactionsForGivenFilters } from 'store/initiation/actions/BankTransactions.action';
import { getCreditManagementChartData } from 'store/initiation/actions/CreditRiskOverview.action';
import TransactionsPopUp from './TransactionsPopUp';
import chartBoxStyle from 'assets/jss/bridgefundPortal/views/crmChartsStyle';
import { Alert } from '@material-ui/lab';
import ChartLegend from './ChartLegend';



const createCustomChartHTMLToolTipContent = (
    dataList
) => {
    return (
        '<div style="padding:10px 10px 10px 10px;">' +
        "<table >" +

        "<tr>" +
        '<td colspan="2" style="font-size: 15px;"><b> Date ' +
        moment(dataList[0]).format('DD-MM-YYYY') +
        "</b></td>" +
        "</tr>" +

        "<tr>" +
        '<td style="color:blue;font-size: 12px;"><b> Balance ' +
        "</b></td>" +
        '<td style="color:blue;font-size: 12px;float: right;"><b> ' +
        EURO(Number(dataList[3])) +
        "</b></td>" +
        "</tr>" +

        "<tr>" +
        '<td style="color:orange;font-size: 12px;"><b> Outgoing Payment ' +
        "</b></td>" +
        '<td style="color:orange;font-size: 12px;float: right;"><b> ' +
        EURO(Number(dataList[2])) +
        "</b></td>" +
        "</tr>" +

        "<tr>" +
        '<td style="color:green;font-size: 12px;"><b> Incoming Payment ' +
        "</b></td>" +
        '<td style="color:green;font-size: 12px;float: right;"><b> ' +
        EURO(Number(dataList[1])) +
        "</b></td>" +
        "</tr>" +

        "<tr>" +
        '<td style="font-size: 12px;"><b> DD Amount ' +
        "</b></td>" +
        '<td style="font-size: 12px;float: right;"><b> ' +
        EURO(Number(dataList[4])) +
        "</b></td>" +
        "</tr>" +

        "</table>" +
        "</div>"
    );
};

const CHART_LEGENDS = ['IncomingAmountCheckbox', 'OutgoingAmountCheckbox', 'BalanceAmountCheckbox', 'DDAmountCheckbox'];

const initialState = {
    selectedChartRange: 'All',
    data: [],
    selectedBankTransactions: [],
    isOpenTransactionPopup: false,
    overviewDate: null,
    chartLegends: CHART_LEGENDS,
    ddAmount: 0,
    isLoadingChartRangeChange: false,
};


class ChartBox extends Component {

    constructor(props) {
        super(props);
        this.state = initialState;
    }


    componentDidMount() {
        this.initChartData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.title === 'Overview Accounts' && JSON.stringify(this.props.data) !== JSON.stringify(prevState.data))
            this.setState({ data: this.props.data });        
        if (prevProps.tabNameForChart !== this.props.tabNameForChart) {
            this.handleChartRangeClick(this.props.tabNameForChart);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.ddAmount !== prevState.ddAmount)
            return { ddAmount: nextProps.ddAmount };
        // if (nextProps.title === 'Overview Accounts' && JSON.stringify(nextProps.data) !== JSON.stringify(prevState.data))
        //     return { data: nextProps.data };
        return null;
    }

    initChartData = () => {
        const { data, ddAmount } = this.props;
        this.setState({ data: data, ddAmount: ddAmount });
    }

    getStyleForSelectedChartRange = (tab) => {
        const { selectedChartRange } = this.state;
        if (tab === selectedChartRange) return { background: 'rgb(195, 195, 162)', color: 'black' };
        return { background: 'rgb(235, 235, 224)', color: 'black' };
    }

    getRangeDigitBySelectedRange = () => {
        const { selectedChartRange } = this.state;
        if (selectedChartRange === 'All') return -1;
        if (selectedChartRange === '1 Month') return 1;
        if (selectedChartRange === '6 Months') return 6;
        if (selectedChartRange === '1 Year') return 12;
    }

    handleChartRangeClick = (tab) => {
        this.setState({ selectedChartRange: tab }, () => this.getChartData());
    }

    getChartData = () => {
        const { requestBlocks, title, requestId } = this.props;
        const { ddAmount } = this.state;
        let requestData = {};

        this.setState({ isLoadingChartRangeChange: true });

        if (title === 'Overview Accounts') {

            requestData = {
                "requestBlock": requestBlocks.map(block => {
                    return {
                        "ibanNo": block.iban,
                        "startDate": block.firstDate,
                        "endDate": block.lastDate,
                        "range": this.getRangeDigitBySelectedRange(),
                        "smeLoanRequestId": requestId,
                        "riskAnalysisSequenceNumber": block.risk_analysis_sequence_number
                    };
                }),
                "isOverview": true,
                "overviewChartOnly": true,
                "range": this.getRangeDigitBySelectedRange(),
                "ddAmount": ddAmount
            };

        }
        if (title !== 'Overview Accounts') {

            const selectedSingleRequestBlock = requestBlocks.find(block => (block.iban === title));

            requestData = {
                "requestBlock": [{
                    "ibanNo": selectedSingleRequestBlock.iban,
                    "startDate": selectedSingleRequestBlock.firstDate,
                    "endDate": selectedSingleRequestBlock.lastDate,
                    "range": this.getRangeDigitBySelectedRange(),
                    "smeLoanRequestId": requestId,
                    "riskAnalysisSequenceNumber": selectedSingleRequestBlock.risk_analysis_sequence_number
                }],
                "isOverview": false,
                "overviewChartOnly": false,
                "range": this.getRangeDigitBySelectedRange(),
                "ddAmount": ddAmount
            };
        }
        this.props.getCreditManagementChartData(requestData)
            .then(res => {

                this.setState({ isLoadingChartRangeChange: false });

                if (title === 'Overview Accounts') {
                    this.setState({ data: res.overviewDailyPositions });
                }
                else {
                    this.setState({ data: res.singleChartDailyPositions[0].data });
                }
            })
            .catch(err => {
                this.setState({ isLoadingChartRangeChange: false });
                console.log('err ', err);
            });
    }

    handlePopupOpen = () => {
        this.setState({ isOpenTransactionPopup: !this.state.isOpenTransactionPopup });
    }

    setSelectedTransactions = (transactions) => {
        this.setState({ selectedBankTransactions: transactions });
    }

    componentWillUnmount() {
        this.setState(initialState);
    }

    mappedChartData = (data) => {
        if (data.length === 0) return [];

        const { ddAmount } = this.state;
        const mappedDataList = data.map(chartData => [moment(chartData[0]).toDate(), createCustomChartHTMLToolTipContent([chartData[0], chartData[1], chartData[2], chartData[3], ddAmount]),
        Number(chartData[1]), Number(chartData[2]), Number(chartData[3]), ddAmount]);
        mappedDataList.unshift(['x', { type: "string", role: "tooltip", p: { html: true } }, 'Incoming Amount', 'Outgoing Amount', 'Balance Amount', 'DD Amount']);
        return this.filterSeriesesByCheckedLegends(mappedDataList);
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
        const removeIndexList = [];
        if (chartLegends.length === 4) return colors;
        if (!chartLegends.includes('IncomingAmountCheckbox')) removeIndexList.push(0);
        if (!chartLegends.includes('OutgoingAmountCheckbox')) removeIndexList.push(1);
        if (!chartLegends.includes('BalanceAmountCheckbox')) removeIndexList.push(2);
        if (!chartLegends.includes('DDAmountCheckbox')) removeIndexList.push(3);

        for (let i = removeIndexList.length - 1; i >= 0; i--)
            colors.splice(removeIndexList[i], 1);

        return colors;

    }

    handleChartClick = (selectedDate) => {
        const { ibanNumberList, title } = this.props;
        let allTransForMainChart = [];

        if (title !== 'Overview Accounts') {
            this.props.getBankTransactionsForGivenFilters({
                "action": "GET",
                "transactionDate": selectedDate,
                "ibanNumber": title
            })
                .then(res => this.setState({
                    selectedBankTransactions: res,
                    isOpenTransactionPopup: true
                }))
                .catch(err => console.log(err));
        }
        else {
            ibanNumberList.forEach(iban => {

                this.props.getBankTransactionsForGivenFilters({
                    "action": "GET",
                    "transactionDate": selectedDate,
                    "ibanNumber": iban
                })
                    .then(res => {

                        allTransForMainChart = [...allTransForMainChart, ...res];
                        this.setState({
                            selectedBankTransactions: allTransForMainChart,
                            isOpenTransactionPopup: true
                        });
                    })
                    .catch(err => console.log(err));
            });
        }
    }

    getChartTitle = () => {
        const { title, requestBlocks } = this.props;
        let firstDate = moment(requestBlocks[0].firstDate).format('DD-MM-YYYY') ;
        const lastDate = moment(requestBlocks[0].lastDate).format('DD-MM-YYYY') ;
        const period = this.getRangeDigitBySelectedRange();
        
        if(period>0){
            firstDate = moment(requestBlocks[0].lastDate).subtract(period,'months').format('DD-MM-YYYY');
        }
        const chartTitle = title+' - From '+firstDate+' to '+lastDate;
        
        return chartTitle;
    }

    render() {
        const { classes, ibanNumberList, title, isLoadingChartData } = this.props;
        const { data, selectedBankTransactions, isOpenTransactionPopup, overviewDate, chartLegends, isLoadingChartRangeChange } = this.state;
        const chartTitle = this.getChartTitle();
        
        return (
            <div>
                {data && data.length === 0 ?
                    <Alert className={classes.chartContainer} variant="outlined" severity="warning">{`No Daily Positions Available`}</Alert>
                    :
                    <>
                        <GridContainer >
                            <GridItem md={12}>
                                <LoadingOverlay
                                    // @ts-ignore
                                    id="loader-overlay"
                                    active={isLoadingChartData || isLoadingChartRangeChange}
                                    spinner
                                    text='Loading Chart Data...'>
                                    <Paper variant="outlined" className={classes.chartContainer}>
                                        <Grid justifyContent="space-between"
                                            container>

                                            <Grid item>
                                                <Typography id="tableTitle" component="div" className={classes.tabHeaderLabel}>{chartTitle}</Typography>
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
                                            data={this.mappedChartData(data)}
                                            chartEvents={[
                                                {
                                                    eventName: 'select',
                                                    callback: ({ chartWrapper }) => {
                                                        const chart = chartWrapper.getChart();
                                                        const selection = chart.getSelection();
                                                        const selectedDate = moment(data[selection[0].row][0]).format('YYYY-MM-DD');
                                                        this.setState({ overviewDate: selectedDate });

                                                        if (selection.length === 1) {
                                                            this.handleChartClick(selectedDate);
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
                                                legend: 'none'
                                            }}
                                            rootProps={{ 'data-testid': '2' }}
                                        />
                                    </Paper>
                                </LoadingOverlay>
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

ChartBox.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.array,
    title: PropTypes.string,
    requestBlocks: PropTypes.array,
    requestId: PropTypes.string,
    ddAmount: PropTypes.number,
    ibanNumberList: PropTypes.array,
    isLoadingChartData: PropTypes.bool
};

const mapStateToProp = (state) => ({
    tabNameForChart: state.creditRiskOverview.tabNameForChart
});

const mapDispatchToProps = (dispatch) => ({
    getBankTransactionsForGivenFilters: (requestData) => dispatch(getBankTransactionsForGivenFilters(requestData)),
    getCreditManagementChartData: (requestData) => dispatch(getCreditManagementChartData(requestData)),
});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(chartBoxStyle)(ChartBox));