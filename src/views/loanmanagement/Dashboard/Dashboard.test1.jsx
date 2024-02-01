// /* import React from 'react';
// import { shallow } from 'enzyme';
// import configureStore from 'redux-mock-store';

// // Actions
// import { getAllCustomers } from 'store/actions/HeaderNavigation';

// // Dashboard Container
// import Dashboard from './Dashboard';

// // Mocking Initial State
// const mockInitialState = {
//     customers: {
//         list: [
//         {
//             id: 1,
//             title: 'ABC'
//         },
//         {
//             id: 2,
//             title: 'ABC 123'
//         },
//         {
//             id: 3,
//             title: '456 xxx-01'
//         }
//         ]
//     }
// };

// // Configuring Mock Store
// const mockStore = configureStore()(mockInitialState);

// // Mocking the Actions
// jest.mock('store/actions/HeaderNavigation', () => ({
//     getAllCustomers: jest.fn().mockReturnValue({ type: 'mock-GET_ALL_CUSTOMER_DETAILS' })
// }));

// describe('Dashboard Container', () => {
//     let mockParams;
//     let container;
  
//     beforeEach(() => {
//         getAllCustomers.mockClear();
//         mockParams = {};
//         mockStore.clearActions();
//         container = shallow(<Dashboard {...mockParams} store={mockStore} />);
//     });
  
//     it('should dispatch getAllCustomers', () => {
//       const { getAllCustomers } = container.props();
  
//       getAllCustomers();
  
//       const actions = mockStore.getActions();
  
//       expect(actions).toEqual([{ type: 'mock-GET_ALL_CUSTOMER_DETAILS' }]);
//     });

// });
//  */

// import React from 'react';
// import { shallow } from 'enzyme';
// import configureStore from 'redux-mock-store';

// import renderer from 'react-test-renderer'

// import Dashboard from './Dashboard';
// import Trends from 'components/Tasks/Trends.jsx';

// // Snapshot for Home React Component
// describe('Dashboard --- Snapshot',()=>{
//     /* const trendsData = [
//         {
//             id: 1,
//             customerName: 'ABC',
//             trend: 'up',
//             percentageBehind: 1
//         },
//         {
//             id: 2,
//             customerName: 'ABC 123',
//             trend: 'down',
//             percentageBehind: 2
//         },
//         {
//             id: 3,
//             customerName: '456 xxx-01',
//             trend: 'down',
//             percentageBehind: 3
//         }
//     ];
//     it('+++capturing Snapshot of Dashboard', () => {
//         const renderedValue =  renderer.create(<Trends trends={trendsData}/>).toJSON()
//         expect(renderedValue).toMatchSnapshot();
//     }); */

//     /* it('+++capturing Snapshot of Dashboard', () => {
//         const renderedValue =  renderer.create(<Dashboard />)
//         expect(renderedValue).toMatchSnapshot();
//     }); */
// });