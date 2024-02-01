import React from 'react';
import clx from 'classnames';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';

import withStyles from "@material-ui/core/styles/withStyles";

import { createStyles, AppBar, Tabs, Tab } from '@material-ui/core';

import GridItem from 'components/crm/Grid/GridItem';
import GridContainer from 'components/crm/Grid/GridContainer';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import { InitialEmptyContactArray, getEmptyContactObject, ContactType, ContactSubType } from 'constants/crm/Contacts';
import { dataValidation_regularExpressions } from 'constants/crm/commonData';

const Styles = createStyles({
  formControl: { margin: 1, marginTop: 15, minWidth: 120 },
  // blockContainer: { display: 'block' },
  blockContainer: { display: 'flex' },
  smallBox: {width: '100%'},
  container: {
    // marginTop: 25,
    minWidth: 220
  },
  headerLabelStyle: {
    fontSize: '12px',
    fontFamily: 'Source Sans Pro',
    lineHeight: "15.08px",
    weight: 400,
    paddingBottom: '20px'
  }
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
      style={{ paddingTop: 10 }}
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

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const getDisplayContacts = (contacts) => {
  const displayContacts = [];
  for (const contact of InitialEmptyContactArray) {

    let search = null;
    if (contact.type !== ContactType.SOCIAL) search = contacts.find(c => c.type === contact.type);
    else search = contacts.find(c => c.type === contact.type && c.subType === contact.subType);

    if (!search) displayContacts.push(contact);
  }
  return [...getEmailContacts(displayContacts.concat(contacts)), ...getPhoneContacts(displayContacts.concat(contacts)), ...getSocialContacts(displayContacts.concat(contacts))];
};

const getEmailContacts = (contacts) => {
  return contacts.filter(contact => contact.type === ContactType.EMAIL);
};

const getPhoneContacts = (contacts) => {
  return contacts.filter(contact => contact.type === ContactType.PHONE);
};

const getSocialContacts = (contacts) => {
  return contacts.filter(contact => contact.type === ContactType.SOCIAL);
};

const Contact = ({ classes, contacts, onChange, className, style }) => {

  const displayContacts = getDisplayContacts(contacts);

  const [tabIndex, setValue] = React.useState(0);

  const handleTabIndexChange = (e, value) => {
    setValue(value);
  };

  const handleChange = (value, subType, index) => {
    const allContacts = cloneDeep(displayContacts);
    const changedContact = allContacts[index];

    changedContact.value = value;
    if (subType) changedContact.subType = subType;

    allContacts[index] = changedContact;
    onChange(allContacts);
  };

  const addContact = (type, subType, index) => {

    const allContacts = cloneDeep(displayContacts);
    subType = subType ? subType : '';

    if (!allContacts[index].value) return;

    allContacts.splice(index, 0, getEmptyContactObject(type, subType));

    onChange(allContacts);
  };

  const deleteContact = (index) => {
    const allContacts = cloneDeep(displayContacts);
    if (allContacts.filter(contact => contact.type === displayContacts[index].type && contact.subType === displayContacts[index].subType).length === 1) {
      allContacts[index] = getEmptyContactObject(displayContacts[index].type, displayContacts[index].subType ? displayContacts[index].subType : '');
    }
    else {
      allContacts.splice(index, 1);
    }
    onChange(allContacts);
    // console.log('allContacts ', allContacts);
  };

  const getPhoneContactDisplayValue = (value) => {
    if (!value.match(/\+31\s/g)) {
      return value.replace('+31', '+31 ');
    }
    return value;
  };

  const getPhoneContactChangingValue = (value) => {

    return value.replace('+31 ', '+31');
  };


  return (
    <div className={clx(classes.container, className)} style={style}>
      <AppBar position='static' color='default' style={{height: '40px'}}>
        <Tabs
          style={{minHeight: "40px"}}
          value={tabIndex}
          onChange={handleTabIndexChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab className={classes.headerLabelStyle} label="Contact" {...a11yProps(0)} />
          <Tab className={classes.headerLabelStyle} label="Social" {...a11yProps(1)} />
        </Tabs>
      </AppBar>

      {/* Contacts */}
      <TabPanel value={tabIndex} index={0}>
        <GridContainer className={classes.blockContainer}>
          {displayContacts.map((contact, index) => {
            if (contact.type === ContactType.EMAIL)
              return (
                <GridItem className={classes.smallBox} key={index}>
                  <CustomInputBox
                    id={`email-${index}`}
                    label="Email"
                    name='email'
                    placeholder='abc@abc.com'
                    pattern={dataValidation_regularExpressions.email}
                    helperText='Email should include @ and .'
                    value={contact.value}
                    onChange={(name, value, subType) => handleChange(value, subType, index)}
                    onRemove={() => deleteContact(index)}
                    onAdd={() => addContact(ContactType.EMAIL, null, index)}
                    subType={{
                      value: contact.subType,
                      dropDownValues: [{ value: "private", key: 'Private' }, { value: "work", key: 'Work' }]
                    }}
                  />
                </GridItem>
              );
            if (contact.type === ContactType.PHONE)
              return (
                <GridItem className={classes.smallBox} key={index}>
                  <CustomInputBox
                    id={`phone-${index}`}
                    label="Phone"
                    name='phone'
                    pattern={dataValidation_regularExpressions.phone}
                    placeholder='+31 123456789'
                    helperText='Number format should be +31 followed by 9 digits'
                    value={contact.value}
                    onFocus={(name, value) => handleChange(getPhoneContactChangingValue(value), null, index)}
                    onBlur={(name, value) => handleChange(getPhoneContactDisplayValue(value), null, index)}
                    onChange={(name, value, subType) => handleChange(value, subType, index)}
                    onRemove={() => deleteContact(index)}
                    onAdd={() => addContact(ContactType.PHONE, null, index)}
                    subType={{
                      value: contact.subType,
                      dropDownValues: [{ value: "private", key: 'Private' }, { value: "work", key: 'Work' }]
                    }}
                  />
                </GridItem>
              );

            return false;
          })}
        </GridContainer>

      </TabPanel>

      {/* Social */}
      <TabPanel value={tabIndex} index={1}>
        <GridContainer className={classes.blockContainer}>
          {displayContacts.map((contact, index) => {
            if (contact.type === ContactType.SOCIAL && contact.subType === ContactSubType.WEBSITE)
              return (<GridItem className={classes.smallBox} key={index}>
                <CustomInputBox
                  id={`website-${index}`}
                  label="Website"
                  name='website'
                  value={contact.value}
                  placeholder='www.bridgefund.nl'
                  onChange={(name, value) => handleChange(value, ContactSubType.WEBSITE, index)}
                  onRemove={() => deleteContact(index)}
                  onAdd={() => addContact(ContactType.SOCIAL, ContactSubType.WEBSITE, index)}
                />
              </GridItem>);

            if (contact.type === ContactType.SOCIAL && contact.subType === ContactSubType.TWITTER)
              return (<GridItem className={classes.smallBox} key={index}>
                <CustomInputBox
                  id={`twitter-${index}`}
                  label="Twitter"
                  name='twitter'
                  value={contact.value}
                  placeholder='twitter.com/person'
                  onChange={(name, value) => handleChange(value, ContactSubType.TWITTER, index)}
                  onRemove={() => deleteContact(index)}
                  onAdd={() => addContact(ContactType.SOCIAL, ContactSubType.TWITTER, index)}
                />
              </GridItem>);

            if (contact.type === ContactType.SOCIAL && contact.subType === ContactSubType.LINKEDIN)
              return (<GridItem className={classes.smallBox} key={index}>
                <CustomInputBox
                  id={`linkedin-${index}`}
                  label="Linkedin"
                  name='linkedin'
                  value={contact.value}
                  placeholder='linkedin.com/person'
                  onChange={(name, value) => handleChange(value, ContactSubType.LINKEDIN, index)}
                  onRemove={() => deleteContact(index)}
                  onAdd={() => addContact(ContactType.SOCIAL, ContactSubType.LINKEDIN, index)}
                />
              </GridItem>);

            if (contact.type === ContactType.SOCIAL && contact.subType === ContactSubType.FACEBOOK)
              return (<GridItem className={classes.smallBox} key={index}>
                <CustomInputBox
                  id={`facebook-${index}`}
                  label="Facebook"
                  name='facebook'
                  value={contact.value}
                  placeholder='facebook.com/person'
                  onChange={(name, value) => handleChange(value, ContactSubType.FACEBOOK, index)}
                  onRemove={() => deleteContact(index)}
                  onAdd={() => addContact(ContactType.SOCIAL, ContactSubType.FACEBOOK, index)}
                />
              </GridItem>);

            return null;
          })}
        </GridContainer>
      </TabPanel>
    </div>
  );
};

Contact.defaultProps = {
  contacts: InitialEmptyContactArray
};

Contact.propTypes = {
  onChange: PropTypes.func,
  classes: PropTypes.object.isRequired,
  style: PropTypes.any,
  className: PropTypes.string,
  contacts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    type: PropTypes.string,
    subType: PropTypes.string,
    value: PropTypes.string,
    startDate: PropTypes.string
  })),
  showAddressAndContactErrors: PropTypes.func
};

export default (withStyles(Styles)(Contact));