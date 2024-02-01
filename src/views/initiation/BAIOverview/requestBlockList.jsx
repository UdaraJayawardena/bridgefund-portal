// import React from "react";
import React from 'react';

import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
/**************/

// core components
import GridItem from 'components/initiation/Grid/GridItem.jsx';
import GridContainer from 'components/initiation/Grid/GridContainer.jsx';

import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper,Button} from "@material-ui/core";
import PageView from '@material-ui/icons/Pageview';
// import { Link } from 'react-router-dom';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';

import CardBody from 'components/initiation/Card/CardBody';
import Card from 'components/initiation/Card/Card';
import moment from 'moment';

class RequestBlockList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const { classes, requestBlockList } = this.props;

    if (requestBlockList === undefined || requestBlockList.length === 0) {
      return false;
    }

    return (
      <div className={classes.container}>

        <Card>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sme Loan Request Id</TableCell>
                        <TableCell>Customer Id</TableCell>
                        <TableCell>Bank Number</TableCell>
                        <TableCell>Iban Number</TableCell>
                        <TableCell>Opening Balance Amount</TableCell>
                        <TableCell>Closing Balance Amount</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Highest Turnover Indicator</TableCell>
                        <TableCell>Inserted Date</TableCell>
                        <TableCell>Updated Date</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {requestBlockList.map((request) => (
                        <TableRow key={request.customer_id}>
                          <TableCell>{request.sme_loan_request_id != null ? request.sme_loan_request_id : ''}</TableCell>
                          <TableCell>{request.customer_id != null ? request.customer_id : ''}</TableCell>
                          <TableCell>{request.bank_number != null ? request.bank_number : ''}</TableCell>
                          <TableCell>{request.iban_number != null ? request.iban_number : ''}</TableCell>
                          <TableCell>{request.opening_balance_amount != null ? request.opening_balance_amount : ''}</TableCell>
                          <TableCell>{request.closing_balance_amount != null ? request.closing_balance_amount : ''}</TableCell>
                          <TableCell>{request.start_date != null ? moment(request.start_date).format('YYYY-MM-DD') : ''}</TableCell>
                          <TableCell>{request.end_date != null ? moment(request.end_date).format('YYYY-MM-DD') : ''}</TableCell>
                          <TableCell>{request.highest_turnover_indicator != null ? request.highest_turnover_indicator : ''}</TableCell>
                          <TableCell>{request.inserted_date != null ? moment(request.inserted_date).format('YYYY-MM-DD') : ''}</TableCell>
                          <TableCell>{request.updated_date != null ? moment(request.updated_date).format('YYYY-MM-DD') : ''}</TableCell>
                          <TableCell>
                            {/* <Link to={`/user/CategoryOverview/${request.iban_number}/${request.start_date}/${request.end_date}`} > */}
                            <Button  color="primary" onClick={() => this.props.bankTransactionInputs(
                                    {
                                      iban:request.iban_number,
                                      startDate: request.start_date,
                                      endDate: request.end_date
                                    })}> 
                                <PageView style={{ cursor: 'pointer' }} 
                                />
                              </Button>
                              {/* </Link> */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </GridItem>
            </GridContainer>
          </CardBody>
        </Card>

      </div>
    );
  }
}

RequestBlockList.propTypes = {
  classes: PropTypes.object.isRequired,
  bankTransactionInputs: PropTypes.func,
  requestBlockList: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    requestBlockList: state.baiOverview.requestBlockList
  };
};

const mapDispatchToProps = () => {
  return {
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(RequestBlockList));

