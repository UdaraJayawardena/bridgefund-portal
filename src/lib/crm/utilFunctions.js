const regularExpression = {
  phone: /[a-zA-Z!@#\$%\^\&*\)\(=._-]+/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};

const UTILFUNCTIONS = {

  getEventDatasetObject: (event) => {
    return (event.target.dataset && JSON.stringify(event.target.dataset) !== '{}') ? event.target.dataset : event.target.parentElement.dataset;
  },

  getDateString: (dateObject, type) => {

    try {

      if (dateObject && (typeof dateObject === "string") && ((dateObject.match(/[\-A-Z\:]/g)) || (dateObject.match(/[\/\-]/g)))) {
        dateObject = new Date(dateObject).getTime();
        dateObject = new Date(dateObject);
      }

      let _dateObject = dateObject ? ((dateObject instanceof Date) ? dateObject : (typeof dateObject === "string" ? new Date(Number(dateObject)) : dateObject)) : new Date();

      let fullYear = _dateObject.getFullYear();
      let month = _dateObject.getMonth() + 1;
      month = (month < 10) ? ('0' + month) : month;
      let date = _dateObject.getDate();
      date = (date < 10) ? ('0' + date) : date;

      return (!type || (type === "display")) ? `${date}-${month}-${fullYear}` : `${fullYear}-${month}-${date}`;

    } catch (error) {
      console.error(error);
      return dateObject;
    }
  },

  dateDifferenceByMonths: (date_1, date_2) => {
    if ((date_1 instanceof Date) && (date_2 instanceof Date)) {
      let diff = (date_1.getTime() - date_2.getTime()) / 1000;
      diff /= (60 * 60 * 24 * 7 * 4);
      return Math.abs(Math.round(diff));
    } else {
      return null;
    }
  },

  buildFormData: (formData, data, parentKey) => {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        UTILFUNCTIONS.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : data;

      formData.append(parentKey, value);
    }
  },

  jsonToFormData: (jsonData, parentKey, form_Data) => {

    let _formData = form_Data ? form_Data : new FormData();

    for (let key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        console.log('**** : key : ' + key)

        if (jsonData[key] && (typeof jsonData[key] === 'object' && !(jsonData[key] instanceof Date) && !(jsonData[key] instanceof File))) {
          console.log('**** : if : ')



          _formData = UTILFUNCTIONS.jsonToFormData(jsonData[key], parentKey ? `${parentKey}[${key}]` : key, _formData);

        }
        // else if( (jsonData[ key ] instanceof Date) || (jsonData[ key ] instanceof File) ) {
        //     console.log('**** : else if : ')
        //     _formData.append( key, jsonData[ key ] );
        //
        //   }
        else {
          console.log('**** : else : ')
          _formData.append((parentKey ? parentKey : key), jsonData[key]);
        }

      }
    }

    return _formData;

  },

  jsonToFormData_simple: (jsonData, parentKey, form_Data) => {

    let _formData = form_Data ? form_Data : new FormData();

    for (let key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        if (jsonData[key] && (typeof jsonData[key] === 'object' && !(jsonData[key] instanceof Date) && !(jsonData[key] instanceof File))) {
          _formData.append(key, JSON.stringify(jsonData[key]));
        } else {
          _formData.append(key, jsonData[key]);
        }
      }
    }

    return _formData;

  },

  addressObjectGenerator: (addresses, includeId) => {

    let identities = [];

    if (addresses && (typeof addresses === 'object')) {

      const addressTypes = {
        address: "physical",
        physical: "physical",
        email: "email",
        phone: "phone",
        postalCode: "postalCode",
        city: "city",
      };

      for (let property in addresses) {
        if (addresses.hasOwnProperty(property)) {

          let address = {
            "type": addressTypes[property],
            "addressData": (typeof addresses[property] === "object") ? addresses[property].addressData : addresses[property],
            "startDate": (typeof addresses[property] === "object") ? (addresses[property].startDate ? addresses[property].startDate : UTILFUNCTIONS.getDateString(null, "server")) : UTILFUNCTIONS.getDateString(null, "server"),
          };
          if (includeId) {
            address._id = addresses[property]._id;
          }

          identities.push(address);
        }
      }

    }

    return identities;

  },

  copyObject: (objectData) => {
    return JSON.parse(JSON.stringify(objectData));
  },

  dataValidationForSave: (params) => {

    if (params && params.dataList) {

      let allEmpty = true;
      let allMandatory = !!params.checkAll;

      let ignoreList = (params && params.ignoreList) ? params.ignoreList : [];

      for (let propName in params.dataList) {
        /*Check whether current property is in ignoreList*/
        if (params.dataList.hasOwnProperty(propName) && !ignoreList.includes(propName)) {
          /*Check if this is a date object or file*/
          if (!(params.dataList[propName] instanceof Date) && !(params.dataList[propName] instanceof File)) {
            /*Check if this is an object*/
            if ((typeof params.dataList[propName] !== 'object')) {
              /*If not an object, check value*/
              if ((params.dataList[propName]) && (params.dataList[propName] !== "") && (params.dataList[propName] !== undefined)) {
                allEmpty = false;
              }
              /*If this property is an object*/
            } else {
              /*Check is this an array and the length*/
              if (Array.isArray(params.dataList[propName]) && (params.dataList[propName].length > 0)) {
                allEmpty = false;
              }
            }
            /*If this is a date object or file*/
          } else {
            allEmpty = false;
          }

        }
      }

      return allEmpty;

    } else {
      throw new Error('Mandatory data are missing');
    }

  },

  populateDataToTable: (stakeholders, matchId) => {

    let response = [];

    let person = stakeholders.person.filter((person, index) => {
      return (person && (person._id === matchId));
    });

    let stakeholder = stakeholders.stakeHolder.filter((stakeholder, index) => {
      return (stakeholder && (stakeholder.person === matchId));
    });

    let privateCustomer = stakeholders.privateCustomer.filter((customer, index) => {
      return (customer && (customer.person === matchId));
    });

    response.push(privateCustomer[0].stakeholder);
    response.push(privateCustomer[0]._id);
    response.push("Private");
    response.push(person[0].givenName);
    response.push(person[0].surname);
    response.push(privateCustomer[0].registrationDate);
    response.push('');
    response.push('');


    return [response];

  },

  textFormatter: (text, type = "firstUpper") => {
    text = text.trim();
    switch (type) {
      case 'firstUpperAll':
        text = text.toLowerCase();
        let wordArray = text.split(' ');
        return wordArray.map((word) => word.charAt(0).toUpperCase() + word.substring(1, word.length));

      case 'firstUpper':
      default:
        text = text.toLowerCase();
        return text.charAt(0).toUpperCase() + text.substring(1, (text.length));

    }
  },

  getAllCustomers: (privateCustomers, smeCustomers) => {
    let allCustomers = [];

    allCustomers = allCustomers.concat(
      smeCustomers.filter((smeCustomer) => {
        if (smeCustomer && (smeCustomer._id !== "")) {
          smeCustomer.customerType = (!smeCustomer.customerType) ? 'smeCustomer' : smeCustomer.customerType;
          return smeCustomer;
        }
      })
    );

    allCustomers = allCustomers.concat(
      privateCustomers.filter((privateCustomer) => {
        if (privateCustomer && (privateCustomer._id !== "")) {
          privateCustomer.customerType = (!privateCustomer.customerType) ? 'privateCustomer' : privateCustomer.customerType;
          return privateCustomer;
        }
      })
    );

    return allCustomers;
  },

  getSelectedCustomer: (privateCustomers, smeCustomers, customerId) => {

    if (privateCustomers && smeCustomers) {

      return UTILFUNCTIONS.getAllCustomers(privateCustomers, smeCustomers).filter((customer) => (customer && (customer._id === customerId)));

    } else {
      return null;
    }

  },

  /* Merge array with same objects  */
  mergeObjectsInObjectArray: (dataArray) => {

    if (dataArray && Array.isArray(dataArray)) {

      let reducedData = dataArray.reduce((accumulator, currentValue) => {

        if (!accumulator || (typeof accumulator !== 'object')) {
          accumulator = {};
        }
        if (currentValue || (typeof currentValue === 'object')) {

          for (let item in currentValue) {
            if (currentValue.hasOwnProperty(item) && accumulator.hasOwnProperty(item)) {
              accumulator[item] = accumulator[item].concat(currentValue[item]);

            } else {
              accumulator[item] = [];
              accumulator[item] = accumulator[item].concat(currentValue[item]);
            }
          }

        }

        return accumulator;

      });

      for (let item in reducedData) {
        if (reducedData.hasOwnProperty(item)) {
          reducedData[item] = [...new Set(reducedData[item])];
        }
      }

      return reducedData;

    } else {
      throw new Error('Expected an array as a parameter');
    }

  },

  mergeDuplicatesInSameObjectArray: (objectsArray, matchingProperty = '_id') => {

    if (objectsArray && Array.isArray(objectsArray)) {

      let matchBy = matchingProperty;
      let copyOf_objectsArray = [...objectsArray];

      for (let index = 0; index < copyOf_objectsArray.length; index++) {
        let matchingObject = copyOf_objectsArray[index];

        for (let point = (index + 1); point < copyOf_objectsArray.length; point++) {
          if (matchingObject && copyOf_objectsArray[point]) {
            if (matchingObject[matchBy] === copyOf_objectsArray[point][matchBy]) {
              matchingObject = Object.assign(matchingObject, copyOf_objectsArray[point]);

              copyOf_objectsArray[point]["object_duplicate"] = true;
            }
          }
        }

      }

      let filteredArray = copyOf_objectsArray.filter((dataObject) => (!dataObject.object_duplicate));

      return filteredArray.filter(Boolean);

    }

    return objectsArray;

  },

  /* Merge duplicate objects in two separate arrays */
  mergeDuplicatesInObjectArrays: (objectsArray_A, objectsArray_B, matchBy) => {

    if ((objectsArray_A && Array.isArray(objectsArray_A)) && (objectsArray_B && Array.isArray(objectsArray_B))) {

      let matchingProperty = matchBy ? matchBy : '_id';
      /* Make copies from input-arrays */
      let _copyOfArray_A = [...new Set(objectsArray_A)];
      let _copyOfArray_B = [...new Set(objectsArray_B)];

      let matchedItemsIndexes = [];

      /* Find duplicates and merge them into an new array */
      let mergedArray = _copyOfArray_A.map((objectSet_a) => {

        let mergedObject = { ...objectSet_a };

        if (objectSet_a) {

          for (let point = 0; point < _copyOfArray_B.length; point++) {

            if (objectsArray_B[point] && (objectSet_a[matchingProperty] === objectsArray_B[point][matchingProperty])) {
              mergedObject = Object.assign(objectSet_a, objectsArray_B[point]);
              /* Push all the matching objects indexes to an new array */
              matchedItemsIndexes.push(point);

            }

          }

        }

        return mergedObject;

      });

      /* Sort indexes array */
      matchedItemsIndexes.sort();

      /* Delete all the duplicates from the second array */
      for (let point = 0; point < matchedItemsIndexes.length; point++) {
        _copyOfArray_B.splice(
          (matchedItemsIndexes[point] - point),
          (matchedItemsIndexes[point] - (point - 1)));
      }

      /* Merge 'merged-array' and 'filtered-array' ans send */
      let mergedDataArray = mergedArray.concat(_copyOfArray_B);

      return UTILFUNCTIONS.mergeDuplicatesInSameObjectArray(mergedDataArray, matchBy);

    } else {
      return [];
    }

  }

};

export default UTILFUNCTIONS;