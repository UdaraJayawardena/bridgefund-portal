import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer'
import Trends from 'components/loanmanagement/Tasks/Trends.jsx';

it('renders Trends component as User without crashing', () => {
  shallow(<Trends />);
});
describe('Trends --- Snapshot',()=>{
      const trendsData = [
          {
              id: 1,
              customerName: 'ABC',
              trend: 'up',
              percentageBehind: 1
          },
          {
              id: 2,
              customerName: 'ABC 123',
              trend: 'down',
              percentageBehind: 2
          },
          {
              id: 3,
              customerName: '456 xxx-01',
              trend: 'down',
              percentageBehind: 3
          }
      ];
      let trend_up = [], trend_down = [], trend_up_indexes = [], trend_down_indexes = [];

      trend_up = trendsData.filter(e => e.trend == 'up');
      trend_down = trendsData.filter(e => e.trend == 'down');

      Object.keys(trend_up).map((e, key) =>
        trend_up_indexes.push(key)
      );
      Object.keys(trend_down).map((e, key) =>
        trend_down_indexes.push(key)
      );
      test('+++capturing Snapshot of Trends Up', () => {
          const renderedValue =  renderer.create(<Trends trends={trendsData} tasksIndexes={trend_up_indexes}/>).toJSON()
          expect(renderedValue).toMatchSnapshot();
      });

      test('+++capturing Snapshot of Trends Down', () => {
        const renderedValue =  renderer.create(<Trends trends={trendsData} tasksIndexes={trend_down_indexes}/>).toJSON()
        expect(renderedValue).toMatchSnapshot();
    });

});