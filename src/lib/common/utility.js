

/*********************
 * PRIVATE FUNCTIONS *
 *********************/


/**********************
 *  PUBLIC FUNCTIONS  *
 **********************/

 export const filterData = (array, filters) => {

  if (array && array.length) {
    return array.filter((item) => {
      return Object.entries(filters).every(([property, values]) => {
        return values.includes(item[property]);
      });
    });
  }
  return [];
};

export default {
  filterData
};

