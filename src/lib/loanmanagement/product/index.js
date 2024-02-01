// Mock data
// import products from 'data/products';
import products from '../products';

export const getProducts = (limit = 6) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        products: products.slice(0, limit),
        productsTotal: products.length
      });
    }, 700);
  });
};
