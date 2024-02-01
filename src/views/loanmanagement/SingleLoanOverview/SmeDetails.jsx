import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";
import tasksStyle from 'assets/jss/material-dashboard-react/components/tasksStyle.jsx';

import withStyles from "@material-ui/core/styles/withStyles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
} from "@material-ui/core";

import CardHeader from 'components/loanmanagement/Card/CardHeader.jsx';
import Card from 'components/loanmanagement/Card/Card.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import CardBody from 'components/loanmanagement/Card/CardBody.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';

import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { updateContact } from 'store/loanmanagement/actions/Customers';
import { updateCustomer } from 'store/loanmanagement/actions/Customers';
import { displayNotification } from 'store/loanmanagement/actions/Notifier';

// eslint-disable-next-line no-useless-escape
const emailRegPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class SmeDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      smeEmail: '',
      isOpenEditSmeEmailInputBox: false,
      isEnableEmailEdit: true,
    };
  }

  changeEmail = (email, isOpenEditSmeEmailInputBox) => {
    this.setState({ smeEmail: email, isOpenEditSmeEmailInputBox: isOpenEditSmeEmailInputBox });
  };

  updateSmeEmailData = () => {


    if (this.validateEmail()) {

      this.setState({ isEnableEmailEdit: false });

      const emaiObj = this.props.smeDetails.contacts.find(contact => contact.type === 'email' && contact.subType === 'work');
      const smeToUpdate = {
        ...emaiObj,
        value: this.state.smeEmail
      };

      this.props.updateContact(this.props.smeDetails, smeToUpdate, 'customer email updated')
        .then(() => {
          this.setState({ isOpenEditSmeEmailInputBox: false, isEnableEmailEdit: true });
        })
        .catch(error => {
          console.error(error);
          this.setState({ isEnableEmailEdit: true });
        });
    }

    return;
  }

  validateEmail = () => {
    if (!new RegExp(emailRegPattern).test(this.state.smeEmail)) {
      this.props.displayNotification('Invalid email address!', 'warning');
      return false;
    }
    this.setState({ isEnableEmailEdit: true });
    return true;
  }

  enableSyncToAWS = () => {

    this.setState({ isEnableEmailEdit: false });

    console.log('this.props.smeDetails', this.props.smeDetails);

    const customerToUpdate = {
     action: "update",
     _id: this.props.smeDetails._id,
     isNeedSyncToAWS: true      
    };

    this.props.updateCustomer(this.props.smeDetails, customerToUpdate, 'Started synchronization to Mobile App successfully')
      .catch(error => {
        console.error(error);
      });

    return;
  }

  render() {
    const { classes, smeDetails } = this.props;
    const isSmeFound = smeDetails.id !== undefined;
    const { isOpenEditSmeEmailInputBox, smeEmail, isEnableEmailEdit } = this.state;

    return (
      <div>

        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="newInfo" >
                <div style={{ position: 'relative', float: 'left' }}>
                  <h5>SME Details</h5>
                </div>
              </CardHeader>
              <CardBody>

                <Table id="sme-detail-table">
                  <TableHead id="sme-detail-table-head">
                    <TableRow id="sme-detail-table-header-row" className={classes.tableHeaderRow}>
                      <TableCell className={classes.tableHeaderCell}>SME Name</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Company</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Email</TableCell>
                      <TableCell className={classes.tableHeaderCell}>Phone</TableCell>
                      {/* <TableCell className={classes.tableHeaderCell}>&nbsp;</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell id="sme-name" className={classes.tableBodyCell}>{isSmeFound ? smeDetails.name : ""}</TableCell>
                      <TableCell id="sme-company" className={classes.tableBodyCell}>{isSmeFound ? smeDetails.company : ""}</TableCell>
                      <TableCell id="sme-email" className={classes.tableBodyCell} >
                        {isSmeFound && !isOpenEditSmeEmailInputBox ?
                          < React.Fragment >
                            {smeDetails.email}
                            <Tooltip id="sme-email-edit-tooltip" title="Edit Email" placement="top">
                              <IconButton id="sme-email-edit-button" aria-label="edit" className={classes.iconButtonMargin} onClick={() => this.changeEmail(smeDetails.email, true)} size="small">
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </React.Fragment>
                          : ''}
                        {isSmeFound && isOpenEditSmeEmailInputBox ?
                          <React.Fragment>
                            <TextField
                              label="Email"
                              id="sme-email-edit-input"
                              value={smeEmail}
                              variant="outlined"
                              size="small"
                              disabled={!isEnableEmailEdit}
                              onChange={(event) => this.setState({ smeEmail: event.target.value })}
                            />
                            <Tooltip id="sme-email-save-tooltip" title="Save Email" placement="top">
                              <IconButton id="sme-email-save-button" aria-label="save" className={classes.iconButtonMargin} onClick={this.updateSmeEmailData} size="small">
                                <DoneIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip id="sme-email-cancel-tooltip" title="Cancel" placement="top">
                              <IconButton id="sme-email-cancel-button" aria-label="cancel" className={classes.iconButtonMargin} onClick={() => this.changeEmail(smeDetails.email, false)} size="small">
                                <CloseOutlinedIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </React.Fragment>
                          : ''}
                      </TableCell>
                      <TableCell id="sme-phone" className={classes.tableBodyCell}>{isSmeFound ? smeDetails.phone : ""}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div >
    );
  }
}

SmeDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  smeDetails: PropTypes.object,
  updateContact: PropTypes.func,
  updateCustomer: PropTypes.func,
  displayNotification: PropTypes.func
};

const mapStateToProps = state => {
  return {
    smeDetails: state.lmglobal.customerDetails,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateContact: (customer, contact, message) => { return dispatch(updateContact(customer, contact, message)); },
    updateCustomer: (customer, customerToUpdate, message) => { return dispatch(updateCustomer(customer, customerToUpdate, message)); },
    displayNotification: (message, type) => { dispatch(displayNotification(message, type)); },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(tasksStyle)(SmeDetails));
