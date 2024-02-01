import uuid from 'uuid/v1';
import moment from 'moment';

export default [
  {
    id: uuid(),
    // name: 'Dropbox',
    name: 'Funders',
    imageUrl: '/images/products/product_1.png',
    updatedAt: moment().subtract(2, 'hours')
  },
  {
    id: uuid(),
    // name: 'Medium Corporation',
    name: 'Stakeholders',
    imageUrl: '/images/products/product_2.png',
    updatedAt: moment().subtract(2, 'hours')
  },
  {
    id: uuid(),
    // name: 'Slack',
    name: 'Funder Loans',
    imageUrl: '/images/products/product_3.png',
    updatedAt: moment().subtract(3, 'hours')
  },
  {
    id: uuid(),
    // name: 'Lyft',
    name: 'Funder Contracts',
    imageUrl: '/images/products/product_4.png',
    updatedAt: moment().subtract(5, 'hours')
  },
  {
    id: uuid(),
    // name: 'Github',
    name: 'Funder Redemptions',
    imageUrl: '/images/products/product_5.png',
    updatedAt: moment().subtract(9, 'hours')
  }
];
