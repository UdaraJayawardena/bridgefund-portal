import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import { Checkbox, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Tabs, Tab, Typography} from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import { clearTransactionsForInternalTypes, getAllBankTransactionsForCategoryPage, getBankAccountsByPeriod, } from 'store/initiation/actions/CreditRiskOverview.action';
import InternalTypeBlock from './InternalTypeBlock';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";


class CreditManagementInternalTypes extends Component {

    constructor(props) {
        super(props);

        this.state = {
            requestBlocks: [],
            isLoadingOutgoingBlock: false,
            isLoadingIncomingBlock: false,
        };
    }

    componentDidMount() {
        this.setState({ tabIndex:this.props.tabValue, requestBlocks: this.props.selectedRequestBlocks && this.props.selectedRequestBlocks.length === 0 ? [] : this.props.selectedRequestBlocks }, () => this.getInitialdata());
    }

    getInitialdata = () => {
        
        const { requestBlocks } = this.state;
        if (requestBlocks.length > 0) {
            const period = this.getPeriodByTabId(this.state.tabIndex);

            this.props.getAllBankTransactionsForCategoryPage(requestBlocks.map(acc => {
                return {
                    "action": "GET",
                    "ibanNumber": acc.iban,
                    "startDate": acc.firstDate,
                    "endDate": acc.lastDate,
                    "period": period
                };
            }), 'internal-types');
        }
        else {
            this.props.getAllBankTransactionsForCategoryPage([], 'internal-types');
        }
    }

    handleBlockTableChange = (e, block) => {
        if (e.target.checked)
            this.addElement(block);
        else
            this.removeElement(block);

    }

    addElement = (block) => {
        const array = [...this.state.requestBlocks];
        array.push(block);
        this.setState({ requestBlocks: [...new Set(array)] }, () => this.getInitialdata());
    }

    removeElement = (block) => {
        const array = [...this.state.requestBlocks];
        const removingArray = array.filter(acc => acc.iban === block.iban);
        removingArray.map(function (element) {           
            const index=array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
            }
        });
        this.setState({ requestBlocks: [...new Set(array)] }, () => this.getInitialdata());

    }

    checkForDefaultSelect = (iban) => {
        return this.props.selectedRequestBlocks.find(item => item.iban === iban) ? true : false;
    }

    handleTabIndexChangeAccountCategory = (e, value) => {
		let period_code ='';
		let tabValue = 0;
		let tabName = '';
        
		switch (value){
			case 0:
				period_code="1m";
				tabValue = 1;
				tabName = '1 Month';
				break;
			case 1:
				period_code="6m";
				tabValue = 6;
				tabName = '6 Months';
				break;
			case 2:
				period_code="1y";
				tabValue = 12;
				tabName = '1 Year';
				break;
			default:
				period_code="all";
				tabValue = -1;
				tabName = 'All';
				break;
		}
		const requestObj = {
			smeLoanRequestId: this.props.overviewData.contractId,
			riskAnalysisSequenceNumber: this.state.riskAnalysisSequenceNumber,
			period: period_code,
		};
		this.props.getBankAccountsByPeriod(requestObj)
        .then(result => {
            this.setState({tabIndex: value});
            this.getInitialdata();
        });	       

        

	};

    getPeriodByTabId = (value) => {
        let period = 0;
        switch (value){
            case 0:
                period = 1;
                break;
            case 1:
                period = 6;
                break;
            case 2:
                period = 12;
                break;
            default:
                period = -1;
                break;				
        }
        return period;
    };

    
    render() {

        const { classes, incomingTransactionData, outgoingTransactionData, bankAccounts } = this.props;
        // const bankAccounts = this.state.requestBlocks;

        return (
            <div >
                {/* ============================ table section ===============================*/}
                <div className={classes.header} >			
                    <Typography id="tableTitle" component="div" className={classes.tabHeaderLabel}>Accounts</Typography>
                    <Tabs
                        value={this.state.tabIndex}
                        onChange={this.handleTabIndexChangeAccountCategory}
                        variant="scrollable"
                        scrollButtons="auto"
                        classes={{
                            indicator: classes.tabIndicator
                        }}													
                        style={{ float: 'right'}}
                        >
                        <Tab label='1 Month'  id='crd-acc-0' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
                        <Tab label='6 Months' id='crd-acc-1' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
                        <Tab label='1 Year'   id='crd-acc-2' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>
                        <Tab label='All' 	  id='crd-acc-3' classes={{ textColorInherit: classes.tabFont, textColorPrimary: classes.tabFont, selected: classes.selectedTabFont }}></Tab>								
                    </Tabs>										
                </div>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead className={classes.tableHeadColor}>
                            <TableRow >
                                <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                <TableCell className={classes.tableCell} align="left">IBAN</TableCell>
                                <TableCell className={classes.tableCell} align="left">Currency</TableCell>
                                <TableCell className={classes.tableCell} align="left">Account-Type</TableCell>
                                <TableCell className={classes.tableCell} align="left">First-Date</TableCell>
                                <TableCell className={classes.tableCell} align="left">Last-Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bankAccounts.length === 0 ?

                                <TableRow>
                                    <TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={8}>
                                        {'No Accounts to show'}
                                    </TableCell>
                                </TableRow>

                                :

                                bankAccounts.map((acc, index) =>
                                    <TableRow key={index} >
                                        <TableCell className={classes.tableCell}>
                                            <Checkbox
                                                defaultChecked={this.checkForDefaultSelect(acc.iban)}
                                                onChange={(e) => this.handleBlockTableChange(e, acc)}
                                                color="default"
                                                inputProps={{ 'aria-label': 'checkbox with default color' }}
                                            />
                                        </TableCell>
                                        <TableCell className={classes.tableCell} align="left">{acc.iban}</TableCell>
                                        <TableCell className={classes.tableCell} align="left">{acc.currency}</TableCell>
                                        <TableCell className={classes.tableCell} align="left">{acc.accountType}</TableCell>
                                        <TableCell className={classes.tableCell} align="left">{moment(acc.firstDate).format('DD-MM-YYYY')}</TableCell>
                                        <TableCell className={classes.tableCell} align="left">{moment(acc.lastDate).format('DD-MM-YYYY')}</TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <GridContainer>
                    {/* ======================= outgoing transaction block ========================== */}
                    <GridItem xs={6} sm={6} lg={6}>
                        <InternalTypeBlock dataList={outgoingTransactionData.transactionList} title="Outgoing Transactions" totalAmount={outgoingTransactionData.totalAmount} />
                    </GridItem>
                    {/* ======================= incoming transaction block ========================== */}
                    <GridItem xs={6} sm={6} lg={6}>
                        <InternalTypeBlock dataList={incomingTransactionData.transactionList} title="Incoming Transactions" totalAmount={incomingTransactionData.totalAmount} />
                    </GridItem>

                </GridContainer>
            </div>
        );
    }

    componentWillUnmount() {
        this.props.clearTransactionsForInternalTypes();
    }

}

CreditManagementInternalTypes.propTypes = {
    classes: PropTypes.object.isRequired,
    bankAccounts: PropTypes.array,
    incomingTransactionData: PropTypes.object,
    outgoingTransactionData: PropTypes.object,
    selectedRequestBlocks: PropTypes.array,
    clearTransactionsForInternalTypes: PropTypes.func,
    getAllBankTransactionsForCategoryPage: PropTypes.func,
    overviewData: PropTypes.object,
    getBankAccountsByPeriod: PropTypes.func,
    tabValue: PropTypes.number,
   // getPeriodByTabId: PropTypes.func,
};

const mapStateToProp = (state) => ({
    bankAccounts: state.creditRiskOverview.bankAccounts,
    incomingTransactionData: state.creditRiskOverview.incomingTransactionData,
    outgoingTransactionData: state.creditRiskOverview.outgoingTransactionData,
    selectedRequestBlocks: state.creditRiskOverview.selectedRequestBlocks,
    overviewData: state.lmglobal.overviewData,    
    tabValue: state.creditRiskOverview.tabValueForAccount

});

const mapDispatchToProps = (dispatch) => ({
    getAllBankTransactionsForCategoryPage: (dataList, origin) => dispatch(getAllBankTransactionsForCategoryPage(dataList, origin)),
    clearTransactionsForInternalTypes: () => dispatch(clearTransactionsForInternalTypes()),
    getBankAccountsByPeriod: (requestQuery) => dispatch(getBankAccountsByPeriod(requestQuery)),
    //getPeriodByTabId: (value) => dispatch(getPeriodByTabId(value)),

});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(CreditManagementInternalTypes));