import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Chart } from 'react-google-charts';

import Button from 'components/loanmanagement/CustomButtons/Button';

class LiquidityColumnChart extends Component {
  static propTypes = {
    prop: PropTypes,
    overviewData: PropTypes.object,
  }

  constructor(props) {
    super(props);

    const chartViewData = this.props.overviewData ? this.props.overviewData : null;

    this.state = {
      chartViewData,
      displayType: 'overroll', // overroll | drilldown
      selectedMonth: null,

    };
  }

  generateOverviewData = () => {
    let results = [];

    const { freeFallPerMonth } = this.state.chartViewData;

    results = freeFallPerMonth.map((monthData) => {
      return [monthData.month, Number(monthData.liquidityBeginBalanceMonth.toFixed(2)), Number(monthData.plannedPrincipleToReceive.toFixed(2))];
    });

    return results;
  }

  generateDrillDownData = () => {
    const results = [];

    const { freeFallPerLoan } = this.state.chartViewData;

    for (const loanData of freeFallPerLoan) {
      if (loanData && loanData.monthly.length > 0) {

        for (const monthData of loanData.monthly) {
          if (monthData.month === this.state.selectedMonth) {

            results.push([loanData.smeId, monthData.value]);

          }
        }

      }
    }

    return results;
  }

  generateChartData = () => {
    let chartData = [];

    const tables_overview = ['Month', 'Begin Balance', 'PPtR'];
    const tables_drilldown = ['SME Loan', 'Planned principle to receive'];

    const head = this.state.displayType === "overroll" ? tables_overview : tables_drilldown;

    const data = this.state.displayType === "overroll" ? this.generateOverviewData() : this.generateDrillDownData();

    chartData = [
      head,
      ...data
    ];

    return chartData;
  }

  backToOverview = () => {
    this.setState({ displayType: 'overroll', selectedMonth: null });
  }

  render() {

    const chartData = this.generateChartData();

    const changeViewType = (chartWrapper) => {
      if (this.state.displayType === "overroll") {
        const selected = chartWrapper.getChart().getSelection();

        const { freeFallPerMonth } = this.state.chartViewData;

        const update = {
          displayType: (selected && selected[0]) ? 'drilldown' : 'overview',
          selectedMonth: (selected && selected[0]) ? freeFallPerMonth[selected[0].row].month : null
        };

        this.setState(update);
      }
    };



    return (
      <React.Fragment>
        {
          this.state.displayType === "drilldown" ? <Button style={{ padding: '0.5% 1%' }} onClick={this.backToOverview}>Overview</Button> : null
        }
        <Chart
          width="100%"
          height="500px"
          chartType="ColumnChart"
          loader={<div>Chart is loading</div>}
          data={chartData}
          options={{
            chartArea: { width: '80%' },
            isStacked: true,
            legend: { position: 'top' },
            tooltip: { isHtml: true },
            color: ['#00e676', '#ffb300'],
            vAxis: {
              logScale: false,
              minValue: 0,
              viewWindow: { min: 0 },
              format: 'short'
            },
            hAxis: {
              slantedText: true,
              slantedTextAngle: 45
            },
            focusTarget: 'category'
          }}
          chartEvents={[
            {
              eventName: "select",
              callback({ chartWrapper }) {
                changeViewType(chartWrapper);
              }
            }
          ]}
        />
      </React.Fragment>
    );
  }
}

export default (LiquidityColumnChart);
