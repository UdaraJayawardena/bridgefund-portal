import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ChartBox from './ChartBox';
import MainChartBox from './MainChartBox';
import { getBankAccountsDailyPositions } from 'store/initiation/actions/CreditRiskOverview.action';
import moment from 'moment';
class ChartBoxContainer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			allDailyPositionListForMainChart: [],
			dailyPositionBlockList: [],
			// requestBlocks:this.props.requestBlocks,
		};
	}

	componentDidMount() {
		this.initChartData();
	}

	componentDidUpdate(prevProps, prevState) {

		const curentBlocks = this.props.requestBlocks ? this.props.requestBlocks : [];
		const prevBlocks = prevProps.requestBlocks;

		if (!this.isSameTwoBlockArrays(curentBlocks, prevBlocks)) {
			// console.log('in chart container ', { curentBlocks, prevBlocks });
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
		const { requestBlocks, requestId } = this.props;
		let allDaily = [];
		let allBlock = [];

		console.log('requestBlocks in char container ', requestBlocks);

		if (requestBlocks && requestBlocks.length > 0) {
			requestBlocks.forEach(requestBlock => {
				this.props.getBankAccountsDailyPositions({
					action: 'GET',
					endDate: requestBlock.lastDate,
					startDate: requestBlock.firstDate,
					ibanNumber: requestBlock.iban,
					smeLoanRequestId: requestId,
					riskAnalysisSequenceNumber: requestBlock.risk_analysis_sequence_number,
				})
					.then(res => {

						// console.log('res ', res);

						const responseWithConvertedDates = res.map(position => { return { ...position, position_date: moment(position.position_date).toDate() }; });
						// console.log('responseWithConvertedDates ', responseWithConvertedDates);

						allDaily = [...allDaily, ...responseWithConvertedDates];
						allBlock = [...allBlock, { data: responseWithConvertedDates, iban: requestBlock.iban, endDate: moment(requestBlock.lastDate).toDate(), }];

						this.setState({
							allDailyPositionListForMainChart: allDaily,
							dailyPositionBlockList: allBlock
						});
					});

			});
		}

	}

	render() {
		const { requestBlocks, ddAmount, ibanNumberList } = this.props;
		const { allDailyPositionListForMainChart, dailyPositionBlockList } = this.state;
		// console.log('requestBlocks in chartContainer ', requestBlocks);
		return (
			<div>
				{/* main chart section */}
				{requestBlocks.length >= 2 ?
					<MainChartBox dailyPositions={allDailyPositionListForMainChart} ibanNumberList={requestBlocks.map(rb => rb.iban)} ddAmount={ddAmount} />
					: false}

				{/* single charts section */}
				{requestBlocks.length > 0 && dailyPositionBlockList.map((block, index) => <ChartBox key={index} dailyPositionBlock={block} ibanNumberList={ibanNumberList.filter(b => b === block.iban)} ddAmount={ddAmount} />)}
			</div>
		);
	}
}

ChartBoxContainer.propTypes = {
	classes: PropTypes.object,
	requestBlocks: PropTypes.array,
	ibanNumberList: PropTypes.array,
	ddAmount: PropTypes.number,
	getBankAccountsDailyPositions: PropTypes.func,
	requestId: PropTypes.string,
};

const mapStateToProp = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
	getBankAccountsDailyPositions: (requestQuery) => dispatch(getBankAccountsDailyPositions(requestQuery)),
});

export default connect(mapStateToProp, mapDispatchToProps)(ChartBoxContainer);