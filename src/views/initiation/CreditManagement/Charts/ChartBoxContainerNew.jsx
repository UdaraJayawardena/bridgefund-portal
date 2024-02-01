import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ChartBox from './ChartBoxNew';
import { getCreditManagementChartData } from 'store/initiation/actions/CreditRiskOverview.action';

const DefaultDataRange = 12; 
class ChartBoxContainer extends Component {
   
    constructor(props) {
        super(props);
        this.state = {
            allDailyPositionListForMainChart: [],
            dailyPositionBlockList: [],
            isLoadingChartData: false
        };
    }

    componentDidMount() {
        this.initChartData();
    }

    componentDidUpdate(prevProps, prevState) {

        const curentBlocks = this.props.requestBlocks ? this.props.requestBlocks : [];
        const prevBlocks = prevProps.requestBlocks;

        if (!this.isSameTwoBlockArrays(curentBlocks, prevBlocks)) {
            this.initChartData();
        }
    }

    isSameTwoBlockArrays = (listOne, listTwo) => {
        let flag = true;

        if (listOne.length !== listTwo.length) return false;

        for (let i = 0; i < listOne.length; i++) {
            const iban = listOne[i].iban;
            const element = listTwo.find(el => el.iban === iban);
            if (!element) flag = false;
        }

        return flag;
    }

    initChartData = () => {
        // console.log('init main chart ');
        const { requestBlocks, requestId, ddAmount } = this.props;

        const requestData = {
            "requestBlock": requestBlocks.map(block => {
                return {
                    "ibanNo": block.iban,
                    "startDate": block.firstDate,
                    "endDate": block.lastDate,
                    "range": DefaultDataRange,//to get all data initially
                    "smeLoanRequestId": requestId,
                    "riskAnalysisSequenceNumber": block.risk_analysis_sequence_number
                };
            }),
            "isOverview": true,
            "overviewChartOnly": false,
            "range": DefaultDataRange,//to get all data initially
            "ddAmount": ddAmount
        };
        console.log('getCreditManagementChartData req started ', new Date());
        this.setState({ isLoadingChartData: true });
        this.props.getCreditManagementChartData(requestData)
            .then(res => {
                console.log('getCreditManagementChartData req finished ', new Date());
                this.setState({ isLoadingChartData: false });
                this.setState({
                    allDailyPositionListForMainChart: res.overviewDailyPositions,//mapped to chart data
                    dailyPositionBlockList: res.singleChartDailyPositions//{data://mapped to chart data,iban:""}
                });
            }).catch(err => {
                console.log('getCreditManagementChartData error ', err);
                this.setState({ isLoadingChartData: false });
            });

    }



    render() {
        const { requestBlocks, requestId, ddAmount, ibanNumberList } = this.props;
        const { allDailyPositionListForMainChart, dailyPositionBlockList, isLoadingChartData } = this.state;
        // console.log(' in chartContainer ', { allDailyPositionListForMainChart, dailyPositionBlockList });
        return (
            <div>
                {/* main chart section */}
                {requestBlocks.length >= 2 ?
                    <ChartBox ibanNumberList={ibanNumberList} requestId={requestId} title={'Overview Accounts'} data={allDailyPositionListForMainChart} requestBlocks={requestBlocks} ddAmount={ddAmount} isLoadingChartData={isLoadingChartData} />
                    : false}

                {/* single charts section */}
                {requestBlocks.length > 0 && dailyPositionBlockList && dailyPositionBlockList.map((block) => <ChartBox requestId={requestId} ibanNumberList={ibanNumberList} title={block.iban} key={block.iban} data={block.data} requestBlocks={requestBlocks} ddAmount={ddAmount} isLoadingChartData={isLoadingChartData} />)}
            </div>
        );
    }
}

ChartBoxContainer.propTypes = {
    classes: PropTypes.object,
    requestBlocks: PropTypes.array,
    ibanNumberList: PropTypes.array,
    ddAmount: PropTypes.number,
    getCreditManagementChartData: PropTypes.func,
    requestId: PropTypes.string,
};

const mapStateToProp = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    getCreditManagementChartData: (requestData) => dispatch(getCreditManagementChartData(requestData)),
});

export default connect(mapStateToProp, mapDispatchToProps)(ChartBoxContainer);