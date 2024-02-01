import PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import Styles from 'assets/jss/material-dashboard-react/views/refinanceLoanStyles';

import Button from "components/loanmanagement/CustomButtons/Button";

import { displayNotification } from "store/loanmanagement/actions/Notifier";

import renderHTML from 'react-render-html';

import { generateTransactionOverview } from "store/loanmanagement/actions/SmeLoans";

import { withTranslation } from 'react-i18next';

class TransactionOverviewReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false
    };
  }

  render() {
    const { t } = this.props;

    return (
      <div>
        <a href={this.props.decodedData} download="file.pdf">
          <Button id="slo-trnasaction-overview-donload-button" disabled={this.state.disabled} >{t('download.label')}</Button>
        </a>
        <Button id="slo-trnasaction-overview-cancel-button" onClick={this.props.onClose}>{t('cancel.label')}</Button>
        {renderHTML(this.props.pdfData)}
      </div>
    );
  }
}

TransactionOverviewReport.propTypes = {
  pdfData: PropTypes.string,
  generateTransactionOverview: PropTypes.func,
  smeLoan: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  decodedData: PropTypes.string,
};

const mapDispatchToProps = (dispatch) => {
  return {
    displayNotification: (message, type) => {
      dispatch(displayNotification(message, type));
    },
    generateTransactionOverview: (requestData) => {
      dispatch(generateTransactionOverview(requestData));
    },
  };
};

export default connect(
  null,
  mapDispatchToProps
)(withStyles(Styles)(withTranslation()(TransactionOverviewReport)));
