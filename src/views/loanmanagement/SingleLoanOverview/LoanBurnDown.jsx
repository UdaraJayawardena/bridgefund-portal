/* eslint-disable prefer-const */
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { Chart } from "react-google-charts";

const options = {
  legend: {
    position: 'bottom'
  },
  interpolateNulls: true,
  vAxes: {
    0: { logScale: false, minValue: 0, format: 'currency', viewWindow: { min: 0 } },
    1: { logScale: false, maxValue: 1, format: 'percent', viewWindow: { min: 0, max: 1 } }
  },
  series: {
    0: { targetAxisIndex: 0 },
    1: { targetAxisIndex: 0 },
    2: { targetAxisIndex: 1 }
  },
  crosshair: {
    trigger: 'both',
    orientation: 'vertical'
  },
  focusTarget: 'category',
  aggregationTarget: 'category',
  animation: {
    startup: true,
    duration: 2000,
    easing: 'out'
  },
  explorer: {},
  language: 'nl'
};

const headers = [
  [
    { type: 'date', id: 'Date' },
    { type: 'number', id: 'Planned', label: 'Planned' },
    { type: 'string', role: 'tooltip' },
    { type: 'number', id: 'Outstanding', label: 'Outstanding' },
    { type: 'string', role: 'tooltip' },
    { type: 'number', id: 'Overdue Percentage', label: 'Overdue Percentage' },
    { type: 'string', role: 'tooltip' },
  ]
];

class LoanBurnDown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: null,
      smeLoanHistories: null,
      directdebits: null,
      loan: null,
    };
  }

  componentDidMount() {
    const { smeLoanHistories, directdebits, loan } = this.props;

    this.setState({
      directdebits: directdebits,
      smeLoanHistories: smeLoanHistories,
      loan: loan
    });

    this.data(smeLoanHistories, directdebits, loan);
  }

  getActualRemainingPoints = smeLoanHistories => {

    let pointsMap = {};

    smeLoanHistories.forEach(smeLoanHistory => {
      pointsMap[moment(smeLoanHistory.generatedDate).format('DD-MM-YYYY')] = smeLoanHistory.outstandingTotalLoanAmount;
    });

    return pointsMap;
  };

  getOverduePercentages = smeLoanHistories => {

    let pointsMap = {};

    smeLoanHistories.forEach(smeLoanHistory => {
      pointsMap[moment(smeLoanHistory.generatedDate).format('DD-MM-YYYY')] = smeLoanHistory.totalOverduePercentage;
    });

    return pointsMap;
  }

  getPlannedDDPoints = (directdebits, loan) => {
    let remaining = loan.totalLoanAmount;

    let pointsMap = {};

    directdebits = directdebits.sort((a, b) => { return new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime(); });

    for (const directdebit of directdebits) {
      if (
        directdebit.ourReference &&
        directdebit.ourReference.match(/-T(\d+)/gi)
      ) {
        remaining = remaining - directdebit.amount;
        pointsMap[moment(directdebit.plannedDate).format('DD-MM-YYYY')] = remaining;
      }
    }

    return pointsMap;
  };

  joinDataSets = (loan, plannedDDPoints, actualRemainingPoints, overduePercentagePoints) => {

    const joinedData = [];

    let date = moment(loan.startDate);
    let dateString = date.format('DD-MM-YYYY');
    let missedDaysCount = 0;

    while (missedDaysCount < 3) {

      if (plannedDDPoints[dateString] || actualRemainingPoints[dateString]) {
        missedDaysCount = 0;
      } else {
        missedDaysCount++;
      }

      joinedData.push([
        date.toDate(),
        plannedDDPoints[dateString],
        `€ ${Math.round(plannedDDPoints[dateString] * 100) / 100}`,
        actualRemainingPoints[dateString],
        `€ ${Math.round(actualRemainingPoints[dateString] * 100) / 100}`,
        overduePercentagePoints[dateString] / 100,
        `${Math.round(overduePercentagePoints[dateString] * 100) / 100}%`
      ]);

      date.add(1, 'days');
      dateString = date.format('DD-MM-YYYY');
    }

    return joinedData;
  }

  data = (smeLoanHistories, directdebits, loan) => {
    const plannedDDPoints = this.getPlannedDDPoints(directdebits, loan);
    const actualRemainingPoints = this.getActualRemainingPoints(smeLoanHistories);
    const overduePercentagePoints = this.getOverduePercentages(smeLoanHistories);

    const joinedDataSets = this.joinDataSets(loan, plannedDDPoints, actualRemainingPoints, overduePercentagePoints);

    this.setState({
      chartData: joinedDataSets
    });
  };

  render() {
    const { chartData } = this.state;

    return (
      <div>
        {chartData ? (
          <div id="laon-burn-down-chart">
            <Chart
              chartType="LineChart"
              data={headers.concat(chartData)}
              options={options}
              width="100%"
              height="400px"
              chartLanguage="nl"
              legendToggle
            />
          </div>
        ) : (
            <p>Loading ...</p>
          )}
      </div>
    );
  }
}

LoanBurnDown.propTypes = {
  loan: PropTypes.object.isRequired,
  smeLoanHistories: PropTypes.array.isRequired,
  directdebits: PropTypes.array.isRequired
};

export default LoanBurnDown;
