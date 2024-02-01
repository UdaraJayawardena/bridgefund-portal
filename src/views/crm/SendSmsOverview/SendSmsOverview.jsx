import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// @material-ui/core
import withStyles from "@material-ui/core/styles/withStyles";

import Style from "assets/jss/bridgefundPortal/views/SmsOverviewStyle";
import GridContainer from "components/crm/Grid/GridContainer";
import GridItem from "components/crm/Grid/GridItem";
import { Button, TextField } from "@material-ui/core";
import { getPhoneNumber, sendSMS } from "store/crm/actions/SmsOverview.action";

class SendSmsOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      phoneNumber: null,
      message: "Hi, Team BridgeFund.",
      opportunityRef: null,
      isSendButtonDisabled: true,
      isSmsSent: false,
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);

    const contractId = urlParams.get("contractId");

    if (contractId) {
      this.getPhoneNumber(contractId);
      this.setState({ opportunityRef: contractId });
    }
  }

  async getPhoneNumber(contractId) {
    const response = await this.props.getPhoneNumber(contractId);

    this.setState({ phoneNumber: response });
  }

  handleMessageChange = (event) => {
    const updatedMessage = event.target.value;

    const isStandardText = updatedMessage === "Hi, Team BridgeFund.";

    this.setState({
      message: updatedMessage,
      isSendButtonDisabled: isStandardText || updatedMessage.trim() == "",
    });
    
  };

  handleSendClick = async () => {
    const { phoneNumber, message, opportunityRef } = this.state;

    const shouldAddOpportunityComment = true;

    if (phoneNumber) {
      const requestBody = {
        phoneNumber,
        message,
        opportunityRef,
        shouldAddOpportunityComment,
      };

      await this.props.sendSMS(requestBody);

      this.setState({
        isSmsSent: true,
        message: "Hi, Team BridgeFund.",
      });
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <>
        <div>
          <GridContainer className={classes.columnContainer}>
            <GridItem className={classes.smallBox}>
              <TextField
                className={classes.phoneNumberFeild}
                label="Phone Number"
                variant="outlined"
                id="phone-number"
                defaultValue=" "
                value={this.state.phoneNumber}
                disabled
              />

              <TextField
                label="Message"
                variant="outlined"
                id="outlined-multiline-static"
                value={this.state.message}
                onChange={this.handleMessageChange}
                multiline
                minRows={6}
                fullWidth
                margin="normal"
              />

              <div className={classes.sendButtonWapper}>
                <Button
                  variant="contained"
                  className={classes.blueIconButton}
                  disabled={
                    this.state.isSendButtonDisabled || this.state.isSmsSent
                  }
                  onClick={() => this.handleSendClick()}
                >
                  Send
                </Button>
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </>
    );
  }
}

SendSmsOverview.propTypes = {
  match: PropTypes.object,
  sendSMS: PropTypes.func,
  getPhoneNumber: PropTypes.func,
  location: PropTypes.object.isRequired,
};

const mapStateToProp = (state) => ({
  phoneNumber: state.phoneNumber,
});

const mapDispatchToProps = (dispatch) => ({
  sendSMS: (requestBody) => dispatch(sendSMS(requestBody)),
  getPhoneNumber: (contractId) => dispatch(getPhoneNumber(contractId)),
});

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(withStyles(Style)(SendSmsOverview));
