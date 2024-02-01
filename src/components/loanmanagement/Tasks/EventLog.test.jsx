import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer'
import EventLog from 'components/loanmanagement/Tasks/EventLog.jsx';

it('renders Tasks component as User without crashing', () => {
  shallow(<EventLog />);
});
describe('EventLog --- Snapshot', () => {
  const tasksData = [
    {
      id: 1,
      createdAt: '2019/01/01',
      customerName: 'ABC',
      message: 'medium priority event log',
      priority: 1
    },
    {
      id: 2,
      createdAt: '2019/01/02',
      customerName: 'ABC 123',
      message: 'high priority event log',
      priority: 2
    },
    {
      id: 3,
      createdAt: '2019/01/03',
      customerName: '456 xxx-01',
      message: 'panic priority event log',
      priority: 3
    }
  ];
  let panics = [], highs = [], mediums = [], panic_indexes = [], high_indexes = [], medium_indexes = [];

  panics = tasksData.filter(e => e.priority == 3);
  highs = tasksData.filter(e => e.priority == 2);
  mediums = tasksData.filter(e => e.priority == 1);

  Object.keys(panics).map((e, key) =>
    panic_indexes.push(key)
  );
  Object.keys(highs).map((e, key) =>
    high_indexes.push(key)
  );
  Object.keys(mediums).map((e, key) =>
    medium_indexes.push(key)
  );
  test('+++capturing Snapshot of EventLog, Panic Priority Logs', () => {
    const renderedValue = renderer.create(<EventLog checkedIndexes={[]} tasks={panics} tasksIndexes={panic_indexes} />).toJSON()
    expect(renderedValue).toMatchSnapshot();
  });

  test('+++capturing Snapshot of EventLog, High Priority Logs', () => {
    const renderedValue = renderer.create(<EventLog checkedIndexes={[]} tasks={highs} tasksIndexes={high_indexes} />).toJSON()
    expect(renderedValue).toMatchSnapshot();
  });

  test('+++capturing Snapshot of EventLog, Medium Priority Logs', () => {
    const renderedValue = renderer.create(<EventLog checkedIndexes={[]} tasks={mediums} tasksIndexes={medium_indexes} />).toJSON()
    expect(renderedValue).toMatchSnapshot();
  });
});