import React, {Component} from 'react';
import {connect} from 'react-redux';

/* @material-ui/core */
import withStyles from "@material-ui/core/styles/withStyles";
import { Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableSortLabel,
  TablePagination,
  Tooltip,
  IconButton,
  Fab  } from '@material-ui/core';
import "@material-ui/icons";
import Icon from "@material-ui/core/Icon";

/* Core components */
import Card from "components/crm/Card/Card.jsx";
import CardHeader from "components/crm/Card/CardHeader.jsx";
import CardBody from "components/crm/Card/CardBody.jsx";
import GridItem from "components/crm/Grid/GridItem.jsx";
import GridContainer from "components/crm/Grid/GridContainer.jsx";

/*Styles import*/
import customStyles from 'assets/jss/material-dashboard-react/components/customStyles.jsx';
import utilFunctions from "lib/crm/utilFunctions";
import Edit from "@material-ui/core/SvgIcon/SvgIcon";
import AccountCircle from '@material-ui/icons/AccountCircle';
import {instanceOf} from "prop-types";

/* Table headers */
const rows = [
  { id: 'chamberOfCommerceId', numeric: false, disablePadding: false, label: 'CocID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Customer' },
  { id: 'legalForm', numeric: false, disablePadding: false, label: 'Legal form' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' }
];

class SortableTable extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      value: 0,
      order: ( props.tableBody && props.tableBody.order ) ? props.tableBody.order : 'asc', // 'asc'| 'desc'
      orderBy: ( props.tableBody && props.tableBody.orderBy ) ? props.tableBody.orderBy : '',
      page: 0,
      rowsPerPage: 25,
      redirect: false,
      redirectUrl: '',
    };

  }

  handleRequestSort = (property, event) => {
    const orderBy = property;
    let order = (this.state.orderBy === property && this.state.order === 'desc') ? 'asc' : 'desc';

    this.setState({ order, orderBy });
  };


  /* sort functionality */
  desc = (a, b, orderBy) => {
    if( a && b ) {
      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
    }
    return 0;
  };

  getSorting = (order, orderBy) => {
    return order === 'desc' ? (a, b) => this.desc(a, b, orderBy) : (a, b) => -( this.desc(a, b, orderBy) );
  };

  renderComponent = ( CustomComponent ) => {
    return (
      <CustomComponent />
    )
  };

  render() {

    // let propsForLoanTable = {
    //   headerLabel : {
    //     visibility : true,
    //     name : 'Customer Loans',
    //   },
    //   tableHeaders : [
    //     { id: 'loanId', numeric: false, disablePadding: false, label: 'Loan ID' },
    //     { id: 'customerId', numeric: false, disablePadding: false, label: 'Customer ID' },
    //     { id: 'name', numeric: false, disablePadding: false, label: 'Customer' },
    //     { id: 'start', numeric: false, disablePadding: false, label: 'Start date' },
    //     { id: 'end', numeric: false, disablePadding: false, label: 'End date' },
    //   ],
    //   tableBody : {
    //     order : 'asc',
    //     orderBy : 'loanId',
    //     data : [
    //       {
    //         // "S" : Edit,
    //         // "A" : Edit,
    //         // "C" : Edit,
    //         // "ADS" : Edit,
    //         // "E" : Edit,
    //       }
    //     ],
    //     hide : [],
    //   }
    // };

    let { classes, headerLabel, tableHeaders, tableBody } = this.props;
    let { order, orderBy, rowsPerPage, page } = this.state;

    let componentHeaderVisibility = ( headerLabel && headerLabel.visibility ) ? headerLabel.visibility : true;
    let componentHeader = ( headerLabel && headerLabel.name ) ? headerLabel.name : '';
    let tableHeaderRows = tableHeaders ? tableHeaders : rows;
    let tableBodyData = ( tableBody && tableBody.data ) ? tableBody.data : [];
    let hideList = ( tableBody && tableBody.hide ) ? tableBody.hide : [];

    let filteredData = tableBodyData.sort( this.getSorting( order, orderBy ) );

    return (
      <React.Fragment>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card className={ `${classes.cardMarginBottom} ${classes.zIndexHigh}` }>
              {/*Table component header*/}
              {
                componentHeaderVisibility ? <CardHeader color="info" className={ `${classes.zeroMargin}` }>{componentHeader}</CardHeader> : null
              }
              {/*Table body*/}
              <CardBody>
                <div className={classes.tableResponsive}>

                  <Table className={classes.table}>

                    <TableHead>
                      <TableRow >
                        { tableHeaderRows.map(
                          row => (
                            <TableCell
                              key={row.id}
                              align={row.numeric ? 'right' : 'left'}
                              padding={row.disablePadding ? 'none' : 'default'}
                              sortDirection={orderBy === row.id ? order : false}
                            >
                              <Tooltip
                                title="Sort"
                                placement={row.numeric ? 'top-end' : 'top-start'}
                                enterDelay={300}
                              >
                                <TableSortLabel
                                  active={orderBy === row.id}
                                  direction={order}
                                  onClick={this.handleRequestSort.bind(this, row.id)}
                                >
                                  {row.label}
                                </TableSortLabel>
                              </Tooltip>
                            </TableCell>
                          ),
                          this,
                        ) }
                      </TableRow>
                    </TableHead>

                    {/*Table body*/}
                    <TableBody>
                      {
                        filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map( ( singleData, index ) => {

                          let tableCells = [];
                          if( singleData ) {
                            for (let item in singleData) {
                              if( singleData.hasOwnProperty( item ) && !hideList.includes( item ) ) {
                                console.log('\nitem : ' + item)
                                console.log('\ntype : ' + typeof singleData[ item ])
                                console.log('instanceof : ' + singleData[ item ] instanceof React.Component )
                                console.log('isValidElement : ' + React.isValidElement(singleData[ item ]) )
                                console.log('function : ' + typeof singleData[ item ].type === "function" )
                                let A = singleData[ item ]
                                tableCells.push(
                                  <TableCell>
                                    { React.isValidElement( singleData[ item ] ) ? this.renderComponent() : <A /> }
                                  </TableCell>
                                )
                              }
                            }
                          }

                          let tableRowKey = ( singleData && singleData._id ) ? singleData._id : ( index );

                          return (
                            <TableRow key={tableRowKey} className={classes.tableRow}>
                              {tableCells}
                              {/*<TableCell>*/}
                              {/*  <Edit className={classes.actionIcons} onClick={ () => this.actionsHandler( 'edit', customer._id, customer.customerType ) }/>*/}
                              {/*  <AccountCircle className={classes.actionIcons} onClick={ () => this.actionsHandler( 'view', customer._id, customer.customerType ) }/>*/}
                              {/*</TableCell>*/}
                            </TableRow>
                          )
                        } )
                      }
                    </TableBody>

                  </Table>

                </div>
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    stakeholders : state.stakeholder,
  };
};

const bindActions = ( dispatch, actionMethod ) => {
  return ( params ) =>
    new Promise( ( resolve, reject ) =>
      dispatch( actionMethod( params ) )
        .then( response => resolve( response ) )
        .catch( error => reject( error ) ) );
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
  };
};

export default connect( mapStateToProps, mapDispatchToProps )( withStyles( customStyles ) ( SortableTable ) );
