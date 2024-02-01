import React from 'react';
import clx from 'classnames';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import { IconButton, createStyles, AppBar, Tabs, Tab } from '@material-ui/core';
import { DeleteOutline, Add } from '@material-ui/icons';
import withStyles from "@material-ui/core/styles/withStyles";
import GridContainer from 'components/crm/Grid/GridContainer';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import { dataValidation_regularExpressions, Countries } from 'constants/crm/commonData';
import { AddressConstants } from 'constants/crm/index';

const Styles = theme => createStyles({
  street: {
    width: 'calc(52% - 22px)',
    minWidth: 100,
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  houserNumberToev: {
    width: 'calc(25% - 4px)',
    minWidth: 75,
    paddingLeft: 10,
    [theme.breakpoints.down('md')]: {
      width: 'calc(50% - 8px)',
      padding: 0,
    }
  },
  toev: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: 10
    }
  },
  cityName: { width: 'calc(75% - 12px)', minWidth: 75 },
  postalCode: {
    width: 'calc(25% - 2px)',
    paddingLeft: 10,
    minWidth: 50,
  },
  blockContainer: { display: 'block' },
  flexContainer: { display: 'flex' },
  container: {
    // marginTop: 25,
    minWidth: 220
  },
  headerLabelStyle: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    // lineHeight: "15.08px",
    weight: 400,
    minWidth:'15px',
    paddingBottom: '20px'
  }
});

/* Tab Panel */

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
      style={{ paddingTop: 10}}
    >
      {value === index && children}
    </div >
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

/* ***END*** */

const Address = ({ classes, addresses, onChange, maxNoAdresses, className, style }) => {

  const [tabIndex, setValue] = React.useState(0);
  if (!addresses || addresses.length === 0) addresses = [AddressConstants.emptyObj];

  const handleTabIndexChange = (e, value) => {
    setValue(value);
  };

  const handleChange = (name, value, subType, index) => {
    const allAddresses = cloneDeep(addresses);
    allAddresses[index][name] = value;
    onChange(allAddresses);
  };

  const addAddress = () => {
    const allAddresses = cloneDeep(addresses);
    if (maxNoAdresses === allAddresses.length) return;
    allAddresses.push(AddressConstants.emptyObj);
    onChange(allAddresses);
    setValue(tabIndex + 1);
  };

  const deleteAddress = () => {
    if (addresses && addresses.length === 1) return;
    const allAddresses = cloneDeep(addresses);
    allAddresses.splice(tabIndex, 1);
    tabIndex === addresses.length - 1 ? setValue(tabIndex - 1) : setValue(tabIndex);
    onChange(allAddresses);
  };

  return (
    <div className={clx(classes.container, className)} style={style}>
      <AppBar position='static' color='default' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' ,height: '40px'}}>
        <Tabs
          style={{minHeight: "40px"}}
          value={tabIndex}
          onChange={handleTabIndexChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="primary"
          textColor="primary"
          aria-label="scrollable force tabs example"
        >
          {addresses.map((address, index) => (
            <Tab className={classes.headerLabelStyle} label={`Address ${index + 1}`}
              id={`scrollable-force-tab-${index}`}
              key={`scrollable-force-tab-${index}`}
            ></Tab>
          ))}
        </Tabs>
        <div style={{ alignSelf: 'center', display: 'inline-flex'}}>
          {addresses.length !== 1 && <IconButton style={{ padding:'5px' }} onClick={deleteAddress}><DeleteOutline style={{ color: "#db1600" }} /></IconButton>}
          {maxNoAdresses !== addresses.length && <IconButton style={{ padding:'5px' }} onClick={addAddress}><Add style={{ color: "#05ad2a" }} /></IconButton>}
        </div>
      </AppBar>
      {addresses.map((address, index) => (
        <TabPanel key={index} value={tabIndex} index={index} >
          <GridContainer className={classes.flexContainer}>
            <CustomInputBox
              type='dropdown'
              id="address-type"
              value={address.type}
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
              label="Address"
              name='type'
              dropDownValues={Object.keys(AddressConstants.type).map(key => { return { key: key, value: AddressConstants.type[key] }; })}
            />
          </GridContainer>
          <GridContainer className={classes.flexContainer}>
            <CustomInputBox
              id="street-name"
              label="Street Name *"
              formControlStyle={classes.street}
              value={address.streetName}
              name='streetName'
              placeholder={address.type === 'physical' ? 'Beetslaan' : 'Postbus'}
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
            />
            <CustomInputBox
              id="house-number"
              label={address.type === "physical" ? "House Number *" : "House Number"}
              formControlStyle={classes.houserNumberToev}
              value={address.houseNumber}
              name='houseNumber'
              placeholder='12'
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
            />
            <CustomInputBox
              id="toev"
              label="Toev."
              formControlStyle={clx(classes.houserNumberToev, classes.toev)}
              value={address.houseNumberAddition}
              name='houseNumberAddition'
              placeholder='B21'
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
            />
          </GridContainer>
          <GridContainer className={classes.flexContainer}>
            <CustomInputBox
              id="city-name"
              label="City Name *"
              formControlStyle={classes.cityName}
              value={address.cityName}
              name='cityName'
              placeholder='Alkmaar'
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
            />
            <CustomInputBox
              id="postal-code"
              label="Postal Code *"
              formControlStyle={classes.postalCode}
              name='postalCode'
              placeholder='9999XX'
              pattern={dataValidation_regularExpressions.postlCode}
              inputValuePatternType='postalCode'
              value={address.postalCode}
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
            />
          </GridContainer>
          <GridContainer className={classes.flexContainer}>
            <CustomInputBox
              type='dropdown'
              id="country"
              value={address.country}
              onChange={(name, value, subType) => handleChange(name, value, subType, index)}
              label="Country"
              name='country'
              dropDownValues={Object.keys(Countries).map(key => { return { key: key, value: Countries[key] }; })}
              defaultValue={Countries.Netherlands}
            />
          </GridContainer>
          {/* </GridContainer> */}
        </TabPanel>
      ))}
    </div>
  );
};

Address.defaultProps = {
  addresses: [AddressConstants.emptyObj],
  onChange: () => {/*  */ },
  maxNoAdresses: -1,
};

Address.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  style: PropTypes.any,
  addresses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    type: PropTypes.string,
    streetName: PropTypes.string,
    houseNumber: PropTypes.string,
    houseNumberAddition: PropTypes.string,
    postalCode: PropTypes.string,
    cityName: PropTypes.string,
    country: PropTypes.string,
    startDate: PropTypes.string,
  })),
  maxNoAdresses: PropTypes.number,
  onChange: PropTypes.func,
};

export default (withStyles(Styles)(Address));