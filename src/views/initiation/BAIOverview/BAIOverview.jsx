/* cSpell: ignore Iban */
import React, { Component } from 'react';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import baiOverviewstyle from 'assets/jss/material-dashboard-react/views/BAIOverview.jsx';

import withStyles from '@material-ui/core/styles/withStyles';

import RequestBlockList from "./requestBlockList";
import { Card, Button, Dialog, DialogActions, DialogContent, } from '@material-ui/core';
import CardBody from 'components/initiation/Card/CardBody';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';
import CustomInput from 'components/initiation/CustomInput/CustomInput';
import { AddCircle } from '@material-ui/icons';
import clx from 'classnames';
import { importBlockRequest } from 'store/initiation/actions/BAIOverview.actions';
import CategoryOverview from "./categoryOverview";

class BAIOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      requestId: '',
      requestBlockList: [],
      iban:null,
      startDate:null,
      endDate:null,
      showBankTransactions:false

    };
  }

  handleCustomInputChange = (id, value) => {
    this.setState({ requestId: value });
  }

  displayRequestBlockData = () => {
    if (this.state.requestId && this.state.requestId !== "") {
        this.props.importBlockRequest(this.state.requestId)
        .then(result => {
          this.setState({ requestBlockList: result}, () => {
            /*  */
          });
        })
        .catch(() => {/*  */ });
    }

  }

  bankTransacitonInputs = (inputs) => {
    this.setState({
      iban:  inputs.iban,
      startDate: inputs.startDate,
      endDate:inputs.endDate,
      showBankTransactions:true
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <h3>Request Block List</h3>
        <Card>
          <CardBody>
            <GridContainer >
              <GridItem xs={12} sm={6} md={3} lg={3}>
                <CustomInput
                  id='request-id'
                  formControlProps={{
                    className: clx(classes.zeroMargin)
                  }}
                  inputProps={{
                    name: 'requestId',
                    value: this.state.requestId,
                    onChange: (e) => this.handleCustomInputChange('requestId', e.target.value),
                  }}
                />
              </GridItem>

              <GridItem xs={12} sm={6} md={3} lg={3} style={{ marginTop: "10px" }}>
                <Button
                  variant='contained'
                  startIcon={<AddCircle />}
                  className={classes.blueIconButton}
                  onClick={this.displayRequestBlockData}
                >Search</Button>

              </GridItem>

            </GridContainer>

          </CardBody>
        </Card>
        <RequestBlockList  
          bankTransactionInputs = {this.bankTransacitonInputs}
        />
        <Dialog
          open={this.state.showBankTransactions}
          maxWidth={'xl'}
          onClose={() => this.setState({ showBankTransactions: false })}
        >
          <DialogContent>
            <CategoryOverview
              // @ts-ignore
              iban ={this.state.iban}
              startDate = {this.state.startDate}
              endDate = {this.state.endDate}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ showBankTransactions: false })} className={classes.popupCloseButton} variant="contained" color="secondary">Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

BAIOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  requestBlockList: PropTypes.array,
  importBlockRequest: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    requestBlockList: state.baiOverview.requestBlockList,
  };
};

const mapDispatchToProps = (dispatch) => ({
  importBlockRequest: (requestId) => dispatch(importBlockRequest(requestId))
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(baiOverviewstyle)(BAIOverview));