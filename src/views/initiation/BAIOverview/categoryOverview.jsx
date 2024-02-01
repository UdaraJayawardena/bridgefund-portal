// import React from "react";
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
// core components
import GridItem from 'components/initiation/Grid/GridItem.jsx';
import GridContainer from 'components/initiation/Grid/GridContainer.jsx';

import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper,TablePagination, NativeSelect,FormControl,Button,Tooltip,Box  } from "@material-ui/core";

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';
import { getBankTransactionsForGivenFilters } from 'store/initiation/actions/BankTransactions.action';
import CardBody from 'components/initiation/Card/CardBody';
import Card from 'components/initiation/Card/Card';
import { displayNotification } from 'store/initiation/actions/Notifier';
import moment from "moment";

import {currencyConverter} from "lib/initiation/utility";

const EURO = currencyConverter();
class BankTransactionCategoryOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      rowsPerPage: 10,
    };
  }

  componentDidMount () {
    // const { params } = this.props.match;
    const ibanNumber = this.props.iban ? this.props.iban : null;
    const startDate = this.props.startDate ?  moment(this.props.startDate).format('YYYY-MM-DD') : null;
    const endDate = this.props.endDate ?  moment(this.props.endDate).format('YYYY-MM-DD') : null;

    if(ibanNumber && startDate && endDate){
    const data = {
      action:'GET',
      ibanNumber,
      startDate,
      endDate
    };
      this.props.getBankTransactionsForGivenFilters(data);
        // .finally(() => {
        // });
    }else{
      this.props.displayNotification('Get bank transactions requierd input missing', 'warning');
    }
  }

    /* Pagination handlers */
    handleChangePage = (event, page) => {
      this.setState({ page });
    };
  
    handleChangeRowsPerPage = event => {
      this.setState({ rowsPerPage: event.target.value });
    };

  render () {
    const { classes, bankTransactionsWithCategories } = this.props;
    const {rowsPerPage, page} = this.state;

    return (
      <div className={classes.container}>
        <h3 style={{lineHeight: "0"}}>Bank Transaction Category Overview</h3>
        <Card>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Type</TableCell>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>IBAN</TableCell>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Counterparty</TableCell>
                        <TableCell style={{ width: "3rem",paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Description</TableCell>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Amount </TableCell>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1.2"}}>System Sub-Category</TableCell>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1.2"}}>System Detailed-Category</TableCell>
                        <TableCell style={{ width: "8rem",paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Sub-Category</TableCell>
                        <TableCell style={{ width: "10rem",paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Detailed-Category</TableCell>
                        <TableCell style={{paddingTop:"0px", paddingBottom:"0px",lineHeight: "1"}}>Action</TableCell>
                        
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bankTransactionsWithCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bankTransaction) => (
                        <TableRow key={bankTransaction.id}>
                          <TableCell className={classes.BTCOTableCell}>{bankTransaction.internal_transaction_type != null ? bankTransaction.internal_transaction_type : ''}</TableCell>
                          <TableCell className={classes.BTCOTableCell}>{bankTransaction.counterparty_iban_number != null ? 
                          <Tooltip title={bankTransaction.counterparty_iban_number }>
                          <div style={{ width: 150, whiteSpace: 'nowrap' }}>
                          <Box
                             component="div"
                             my={2}
                             textOverflow="ellipsis"
                             overflow="hidden"
                             bgcolor="background.paper"
                           >
                             {bankTransaction.counterparty_iban_number}
                           </Box>
                          </div>
                          
                         </Tooltip>
                          : ''}</TableCell>

                          <TableCell className={classes.BTCOTableCell}>{bankTransaction.counterparty_name != null ? 
                          <Tooltip title={bankTransaction.counterparty_name }>
                          <div style={{ width: 150, whiteSpace: 'nowrap' }}>
                          <Box
                             component="div"
                             my={2}
                             textOverflow="ellipsis"
                             overflow="hidden"
                             bgcolor="background.paper"
                           >
                             {bankTransaction.counterparty_name}
                           </Box>
                          </div>
                          
                         </Tooltip>
                          : ''}
                          </TableCell>
                          <TableCell className={classes.BTCOTableCell}>
                            {bankTransaction.description != null ? 
                            // @ts-ignore
                            <Tooltip title={bankTransaction.description}>
                             <div style={{ width: 150, whiteSpace: 'nowrap' }}>
                             <Box
                                component="div"
                                my={2}
                                textOverflow="ellipsis"
                                overflow="hidden"
                                bgcolor="background.paper"
                              >
                                {bankTransaction.description}
                              </Box>
                             </div>
                             
                            </Tooltip>
                             : ''}
                          </TableCell>
                          <TableCell className={classes.BTCOTableCell} style={{ textAlign: "right"}}>{bankTransaction.amount != null ? EURO(bankTransaction.amount) : ''}</TableCell>
                          <TableCell className={classes.BTCOTableCell}>{bankTransaction.sub_category != null ? bankTransaction.sub_category : ''}</TableCell>
                          <TableCell className={classes.BTCOTableCell}>{bankTransaction.detailed_category != null ? bankTransaction.detailed_category : ''}</TableCell>
                          <TableCell className={classes.BTCOTableCell}> 
                          <FormControl className={classes.formControl} disabled>
                            <NativeSelect
                              inputProps={{
                                name: 'subCategory',
                                id: 'name-native-disabled',
                              }}
                              style={{fontSize:"12px"}}
                            >
                              <option value="">Sub Category</option>
                            </NativeSelect>
                          </FormControl>
                          </TableCell>
                          <TableCell className={classes.BTCOTableCell}>
                          <FormControl className={classes.formControl} disabled>
                            <NativeSelect
                              inputProps={{
                                name: 'subCategory',
                                id: 'name-native-disabled',
                              }}
                              style={{fontSize:"12px"}}
                            >
                              <option value="">Detailed Category</option>
                            </NativeSelect>
                          </FormControl>
                          </TableCell>
                          <TableCell className={classes.BTCOTableCell}></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                    component="div"
                    count={bankTransactionsWithCategories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{ 'aria-label': 'Previous Page' }}
                    nextIconButtonProps={{ 'aria-label': 'Next Page' }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                <div style ={{float: "right"}}>
                <Button disabled variant="outlined" color="secondary" className={classes.BTCOButtonProcess}>
                    Process
                </Button>
                <Button disabled variant="outlined" color="primary" className={classes.BTCOButtonProcess}>
                    Next
                </Button>
                </div>

              </GridItem>
            </GridContainer>
          </CardBody>
        </Card>

      </div>
    );
  }
}

BankTransactionCategoryOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object,
  displayNotification: PropTypes.func.isRequired,
  bankTransactionsWithCategories: PropTypes.array,
  getBankTransactionsForGivenFilters: PropTypes.func,
  iban:  PropTypes.string,
  startDate: PropTypes.string,
  endDate:PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    bankTransactionsWithCategories: state.bankTransactions.bankTransactionsWithCategories,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getBankTransactionsForGivenFilters: (data) => dispatch(getBankTransactionsForGivenFilters(data)),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(dashboardStyle)(BankTransactionCategoryOverview));

