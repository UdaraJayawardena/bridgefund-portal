import PropTypes from "prop-types";
import React, { Component } from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import styles from "assets/jss/material-dashboard-react/views/singleLoanOverviewStyles.jsx";
import Util from "lib/loanmanagement/utility";
import moment from "moment";
import {
  Card, CardHeader, CardContent, Typography
} from "@material-ui/core";
const currency = Util.currencyConverter();
class GeneratePaymentOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { classes, paymentOrderData } = this.props;
    return (
      <div>
        {/* <Paper className={classes.tableContainer}> */}
        <Card>
          <CardHeader title='Generate Payment Order' />
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Domain Id: "}{paymentOrderData.domainId}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Date: "}{moment(paymentOrderData.date).format('DD-MM-YYYY')}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Status: "}{paymentOrderData.status}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Counterparty: "}{paymentOrderData.counterparty}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Counterparty Iban Number: "}{paymentOrderData.counterpartyIbanNumber}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Description: "}{paymentOrderData.description}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {"Amount: "}{currency(paymentOrderData.amount)}
            </Typography>
          </CardContent>
        </Card>
        {/* </Paper> */}
      </div>
    );
  }
}

GeneratePaymentOrder.propTypes = {
  classes: PropTypes.object.isRequired,
  paymentOrderData: PropTypes.object,
};

export default withStyles(styles)(GeneratePaymentOrder);
