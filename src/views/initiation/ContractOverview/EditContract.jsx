import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import Style from 'assets/jss/material-dashboard-react/views/ContractOverview';

import { Button, CircularProgress } from '@material-ui/core';

import CardFooter from 'components/initiation/Card/CardFooter';
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';

import { displayNotification } from 'store/initiation/actions/Notifier';

import { compareObject } from 'lib/initiation/utility';

class ContractOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      contract: {},
      isLoading: false,
    };
  }

  componentDidMount () {
    this.setState({ contract: this.props.contract });
  }

  handleChange = (name, value) => {
    const contract = cloneDeep(this.state.contract);
    contract[name] = value;
    this.setState({ contract });
  }

  handleContractUpdate = () => {
    const updateContractObj = { contractId: this.state.contract.contractId };
    const responseContractObj = cloneDeep(this.state.contract);
    const updatedVal = compareObject(this.props.contract, this.state.contract, this.props.updatingFileds);

    if (Object.keys(updatedVal).length === 0) {
      return this.props.cancel();
    }

    Object.assign(updateContractObj, updatedVal);
    Object.assign(responseContractObj, updatedVal);

    const isUpdateContract = true;
    let isGenerateContract = true;

    if (this.props.updatingFileds.includes('pdfDocument')) {
      isGenerateContract = false;
      updateContractObj.status = 'contract-archived';
    }

    this.setState({ isLoading: true });
    this.props.updateSpecialclause(updateContractObj, isUpdateContract, isGenerateContract);
  }

  render () {
    const { classes, updatingFileds } = this.props;
    const { isLoading } = this.state;

    return (
      <div>
        {updatingFileds.includes('specialClause') && <CustomInputBox
          label="Special Clause"
          name="specialClause"
          value={this.state.contract.specialClause}
          onChange={this.handleChange}
          type='text'
          multiline
          rows={4}
        />}
        {updatingFileds.includes('pdfDocument') && <CustomInputBox
          type='file'
          label='Connect Signed Contract'
          fieldName='pdfDocument'
          name='pdfDocument'
          value={this.state.contract.pdfDocument}
          onChange={this.handleChange}
          formControlStyle={classes.connectSignedContractBtn}
          classes={{
            uploadButton: classes.uploadBtn
          }}
        />}
        <CardFooter>
          <Button variant='contained' color='secondary' onClick={this.props.cancel} disabled={isLoading}>Cancel</Button>
          <Button className={classes.button} onClick={this.handleContractUpdate} disabled={isLoading}>
            {updatingFileds.includes('pdfDocument') ? 'Connect ' : 'Save and Regenerate Contract '}
            &nbsp; {isLoading && <CircularProgress className={classes.buttonLoader} size={20} />}
          </Button>
        </CardFooter>
      </div>
    );

  }
}


ContractOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  contract: PropTypes.object.isRequired,
  updatingFileds: PropTypes.array.isRequired,
  cancel: PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
  updateSpecialclause: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  displayNotification: (message, warning) => dispatch(displayNotification(message, warning)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(ContractOverview));

