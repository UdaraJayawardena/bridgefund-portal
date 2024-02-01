import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import {
    Table, TableBody, TableCell, TableHead,
    TableRow, TableContainer, FormControl, Select, MenuItem, Chip, TableSortLabel, TablePagination
} from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
import CustomSearch from 'components/initiation/CustomInput/CustomSearch';
import CustomInputBox from 'components/initiation/CustomInput/CustomInputBox';
import { displayNotification } from 'store/initiation/actions/Notifier';
import { getBankTransactionsForGivenFilters, updateBankTransactions } from 'store/initiation/actions/BankTransactions.action';
import { getCategoryRules, getCategoryRulesEnums } from 'store/initiation/actions/CategoryRules.action';
import CheckTransactionData from './CheckTransactionData';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import LoadingOverlay from 'react-loading-overlay';
import { getCheckBankTransactionOverviewData } from 'store/initiation/actions/CreditRiskOverview.action';


class CheckTransactionOverview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            requestIdValue: this.props.overviewData && this.props.overviewData.contractId ? this.props.overviewData.contractId : '',
            bankTransactions: [],
            isLoadingTransactions: false,
            machineLearningScore: 50,
            detailedCategoryEnumsTree: {},
            subCategoryEnumsTree: {},
            shouldShowDetailedConfirmTable: false,
            selectedNewSubCategory: '',
            selectedNewDetailedCategory: '',
            order: "asc",
            orderBy: "transaction_date",
            rowsPerPage: 10,
            pageNumber: 1,
            count: 0,
            updatedTransactionListForRequest: [],
            originalUpdatedTransaction: {},
            shouldShowPagination: true,
        };
    }

    componentDidMount() {
        this.setDataForCategoryDropDowns();
        this.getSelectedBankTransactions();
    }

    getSelectedBankTransactions = () => {
        const { requestIdValue, machineLearningScore, order, orderBy, rowsPerPage, pageNumber } = this.state;
        let requestData = {};
        if (requestIdValue) {

            requestData = {
                "smeLoanRequestId": requestIdValue,
                "machineLearningScoreLessThan": machineLearningScore / 100,
                "statusNotEqual": "confirmed",
                rowsPerPage,
                pageNumber,
                order,
                orderBy
            };

            this.setState({ isLoadingTransactions: true });
            this.props.getCheckBankTransactionOverviewData(requestData)
                .then(res => {
                    this.setState({
                        isLoadingTransactions: false,
                        bankTransactions: res.transactions,
                        count: res.totalOfTransactions,
                        shouldShowPagination: true
                    });
                    // console.log('res ', res);
                })
                .catch(err => {
                    this.setState({ isLoadingTransactions: false });
                    console.log('err getSelectedBankTransactions ', err);
                });

        } else {
            requestData = { "action": "RANDOM" };
            this.getTransactionsForQuery(requestData);
        }
    }

    getTransactionsForQuery = (requestData) => {

        const { machineLearningScore } = this.state;
        this.setState({ isLoadingTransactions: true });

        this.props.getBankTransactionsForGivenFilters(requestData)
            .then(res => {
                // console.log('res ', res);
                this.setState({
                    bankTransactions: res.filter(tr => tr.category_machine_learning_score >= (machineLearningScore / 100)),
                    isLoadingTransactions: false,
                    shouldShowPagination: false
                });
            }).catch(err => {
                this.setState({ isLoadingTransactions: false });
                console.log('err getSelectedBankTransactions ', err);
            });
    }

    handleRequestSort = (property, event) => {
        let order = "desc";
        const orderBy = property;
        if (this.state.orderBy === property && this.state.order === "desc") {
            order = "asc";
        }
        this.setState({ order, orderBy }, () => this.getSelectedBankTransactions());
    }

    setDataForCategoryDropDowns = () => {
        this.props.getCategoryRulesEnums()
            .then(res => {

                this.setState({
                    detailedCategoryEnumsTree: res.detailedCategoryEnumsTree,
                    subCategoryEnumsTree: res.subCategoryEnumsTree,
                });
            })
            .catch(err => { console.log("setDataForCategoryDropDowns err ", err); });
    }

    handleDetailedTableButtonClick = (type) => { //when updating transactions from  detailed tr table 
        let { updatedTransactionListForRequest } = this.state;

        updatedTransactionListForRequest = type === 'change_button' ? this.getUpdatedTransactionDataFromDetailedTable() : this.getUpdatedTransactionDataFromTableRow();

        if (updatedTransactionListForRequest.length === 0) {
            this.props.displayNotification('No transactions to update!', 'warning');
            return;
        }

        if (updatedTransactionListForRequest.find(transaction => transaction.detailedCategory === "" || transaction.subCategory === "")) {
            this.props.displayNotification('Please select category values!', 'warning');
            return;
        }

        const reqData = {
            bankTransaction: updatedTransactionListForRequest
        };

        this.setState({ isLoadingTransactions: true });

        this.props.updateBankTransactions(reqData)
            .then(res => {
                // console.log('res updateBankTransactions from detail table ', res);
                this.setState({
                    isLoadingTransactions: false,
                    updatedTransactionListForRequest: [],
                    originalUpdatedTransaction: {},
                }, () => this.getSelectedBankTransactions());
            })
            .catch(err => {
                console.log("updateBankTransactions error ", err);
                this.setState({
                    isLoadingTransactions: false,
                    updatedTransactionListForRequest: [],
                    originalUpdatedTransaction: {},
                });
            });
    }

    setUpdatedTransactionToList = (transaction) => {

        // console.log('transaction ',transaction);

        const updatedTransactionListForReq = [];
        const updatedObj = {
            "action": "change",
            "bankTransactionId": transaction.id,
            "categoryStatus": "confirmed",
            "subCategory": transaction.selectedNewSubCategory,
            "detailedCategory": transaction.selectedNewDetailedCategory,
            "subCategoryOld": transaction.sub_category,
            "detailedCategoryOld": transaction.detailed_category,
            "processBy": transaction.processed_by
        };

        updatedTransactionListForReq[0] = updatedObj;
        this.setState({
            updatedTransactionListForRequest: updatedTransactionListForReq,
            originalUpdatedTransaction: transaction
        });

    }

    getUpdatedTransactionDataFromDetailedTable = () => {
        const { originalUpdatedTransaction } = this.state;
        const newTransactionArray = [];

        const updatedObj = {
            "action": "change",
            "bankTransactionId": originalUpdatedTransaction.id,
            "categoryStatus": "confirmed",
            "subCategory": this.state.selectedNewSubCategory,
            "detailedCategory": this.state.selectedNewDetailedCategory,
            "subCategoryOld": originalUpdatedTransaction.sub_category,
            "detailedCategoryOld": originalUpdatedTransaction.detailed_category,
            "processBy": originalUpdatedTransaction.processed_by
        };

        newTransactionArray.push(updatedObj);
        return newTransactionArray;

    }

    clearTemporaryChangedTransactions = () => {
        if (this.state.updatedTransactionListForRequest.length > 0)
            this.setState({
                updatedTransactionListForRequest: [],
                shouldShowDetailedConfirmTable: false,
                originalUpdatedTransaction: {}
            });
        return;
    }


    handleDropdownChanges = (e) => {// detailed tr table update  
        this.setState({ [e.target.name]: e.target.value });
    }

    getDetailCategroyDropdownValueList = (subCategory, category) => {
        const { detailedCategoryEnumsTree } = this.state;
        return detailedCategoryEnumsTree && detailedCategoryEnumsTree[category]
            && detailedCategoryEnumsTree[category][subCategory.replace(' ', '_')] ?
            detailedCategoryEnumsTree[category][subCategory.replace(' ', '_')] : [];
    }

    getSubCategroyDropdownValueList = (category) => {
        const { subCategoryEnumsTree } = this.state;
        return subCategoryEnumsTree && subCategoryEnumsTree[category] ?
            subCategoryEnumsTree[category] : [];
    }

    onSearch = (name, value) => {

        if (name === 'requestId' && value === '') {
            this.setState({ requestIdValue: value }, () => this.getSelectedBankTransactions());
            return;
        };
        this.setState({ requestIdValue: value });
    };

    handleOnContractSearchResult = (result) => {
        if (result && typeof result !== 'string') {
            this.setState({ requestIdValue: result.requestId }, () => this.getSelectedBankTransactions());
        }
    }

    handleMLPercentageChange = (name, value) => {
        this.setState({ [name]: value }, () => this.getSelectedBankTransactions());
    };

    handleUpdateTransaction = () => {

        let { updatedTransactionListForRequest, } = this.state;
        const { originalUpdatedTransaction } = this.state;

        if (updatedTransactionListForRequest.length === 0) {
            this.props.displayNotification('No transactions to update!', 'warning');
            return;
        }

        if (updatedTransactionListForRequest.find(transaction => transaction.detailedCategory === "" || transaction.subCategory === "")) {
            this.props.displayNotification('Please select category values!', 'warning');
            return;
        }

        if (originalUpdatedTransaction.selectedNewDetailedCategory === originalUpdatedTransaction.detailed_category &&
            originalUpdatedTransaction.sub_category === originalUpdatedTransaction.selectedNewSubCategory) {
            this.props.displayNotification('You are as good as the computer 👏👏👏', 'success');

            updatedTransactionListForRequest = this.getUpdatedTransactionDataFromTableRow();

            const reqData = { bankTransaction: updatedTransactionListForRequest };

            this.setState({ isLoadingTransactions: true });

            this.props.updateBankTransactions(reqData)
                .then(res => {
                    // console.log('res updateBankTransactions from detail table ', res);
                    this.setState({
                        isLoadingTransactions: false,
                        updatedTransactionListForRequest: [],
                        originalUpdatedTransaction: {},
                    }, () => this.getSelectedBankTransactions());
                })
                .catch(err => {
                    console.log("updateBankTransactions error ", err);
                    this.setState({
                        isLoadingTransactions: false,
                        updatedTransactionListForRequest: [],
                        originalUpdatedTransaction: {},
                    });
                });
        }
        else {
            this.props.displayNotification(`Your category deviates from system values so please confirm what's right !`, 'warning');
            this.setState({
                shouldShowDetailedConfirmTable: true,
                selectedNewSubCategory: originalUpdatedTransaction.selectedNewSubCategory,
                selectedNewDetailedCategory: originalUpdatedTransaction.selectedNewDetailedCategory,
            });
            return;
        }

    }

    getUpdatedTransactionDataFromTableRow = () => {
        const { updatedTransactionListForRequest } = this.state;
        const newTransactionArray = [];
        for (let i = 0; i < updatedTransactionListForRequest.length; i++) {
            const st = updatedTransactionListForRequest[i];

            const updatedObj = {
                "action": "change",
                "bankTransactionId": st.bankTransactionId,
                "categoryStatus": "confirmed",
                "processBy": st.processed_by
            };

            newTransactionArray.push(updatedObj);
        }

        return newTransactionArray;

    }

    handleChangePage = (event, page) => {
        // console.log('page ', page+1);
        this.setState({ pageNumber: Number(page) + 1 }, () => this.getSelectedBankTransactions());
    };

    handleChangeRowsPerPage = (e) => {
        // console.log('rowsPerPage ', e.target.value);
        this.setState({ rowsPerPage: e.target.value }, () => this.getSelectedBankTransactions());
    }

    render() {
        const { classes, isMultipleTransactionUpdate, } = this.props;
        const { isLoadingTransactions, bankTransactions, detailedCategoryEnumsTree, subCategoryEnumsTree, shouldShowPagination,
            machineLearningScore, shouldShowDetailedConfirmTable, selectedNewSubCategory, selectedNewDetailedCategory,
            orderBy, order, requestIdValue, rowsPerPage, pageNumber, count, updatedTransactionListForRequest, originalUpdatedTransaction } = this.state;

        // console.log('state ', this.state);

        return (
            <div >
                {/* ======================= trnasaction selection section ===============================*/}
                <GridContainer >
                    <GridItem md={12}>
                        <GridContainer>
                            <GridItem>
                                <CustomSearch
                                    placeholder={requestIdValue === '' ? "All" : requestIdValue}
                                    label="Contract"
                                    asyncSearchType="requestId"
                                    name="requestId"
                                    value={requestIdValue}
                                    onChange={this.onSearch}
                                    onSearchResult={this.handleOnContractSearchResult}
                                    SearchOptions={{
                                        regexOption: 'i'
                                    }}
                                />
                            </GridItem>
                            <GridItem>
                                <CustomInputBox
                                    id='machine-learning-score'
                                    label='Machine Learning Score'
                                    placeholder='50%'
                                    type='percentage'
                                    value={machineLearningScore}
                                    name='machineLearningScore'
                                    onChange={(name, value) => this.handleMLPercentageChange(name, value)}
                                />
                            </GridItem>
                        </GridContainer>

                    </GridItem>

                    {/* ======================= trnasaction table section ===============================*/}

                    <GridItem md={12}>
                        <TableContainer className={classes.tableContainer} style={{ marginTop: 30 }}>
                            <LoadingOverlay
                                // @ts-ignore
                                id="loader-overlay"
                                active={isLoadingTransactions}
                                spinner
                                text='Loading Transactions...'>
                                <Table className={classes.table} aria-label="simple table">
                                    <TableHead className={classes.tableHeadColor}>
                                        <TableRow >
                                            <TableCell className={classes.tableCell}>Acc</TableCell>
                                            <TableCell className={classes.tableCell} key="transaction_date">
                                                <TableSortLabel
                                                    active={orderBy === "transaction_date"}
                                                    // @ts-ignore
                                                    direction={order}
                                                    onClick={() => this.handleRequestSort("transaction_date")}
                                                >
                                                    Trans. Date
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="right" key="amount" >
                                                <TableSortLabel
                                                    active={orderBy === "amount"}
                                                    // @ts-ignore
                                                    direction={order}
                                                    onClick={() => this.handleRequestSort("amount")}
                                                >
                                                    Amount
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell className={classes.tableCell} key="counterparty_name" align="center" >
                                                <TableSortLabel
                                                    active={orderBy === "counterparty_name"}
                                                    // @ts-ignore
                                                    direction={order}
                                                    onClick={() => this.handleRequestSort("counterparty_name")}
                                                >
                                                    Counterparty
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="left">Description</TableCell>
                                            <TableCell className={classes.tableCell} align="left">New Sub Category</TableCell>
                                            <TableCell className={classes.tableCell} align="left">New Detailed-Category</TableCell>
                                            <TableCell className={classes.tableCell} align="left">&nbsp;</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bankTransactions && bankTransactions.length === 0 && !isLoadingTransactions ?

                                            <TableRow>
                                                <TableCell align="center" className={classes.tableCell} colSpan={8}>
                                                    {'No Transactions to show'}
                                                </TableCell>
                                            </TableRow>

                                            :
                                            bankTransactions && bankTransactions.map(bankTransaction =>
                                                <CheckTransactionData
                                                    key={bankTransaction.id}
                                                    classes={classes}
                                                    bankTransaction={bankTransaction}
                                                    subCategoryEnumsTree={subCategoryEnumsTree}
                                                    detailedCategoryEnumsTree={detailedCategoryEnumsTree}
                                                    setUpdatedTransactionToList={this.setUpdatedTransactionToList}
                                                    isMultipleTransactionUpdate={isMultipleTransactionUpdate}
                                                    handleUpdateTransaction={this.handleUpdateTransaction}
                                                    clearTemporaryChangedTransactions={this.clearTemporaryChangedTransactions}
                                                    selectedTrIdForUpdate={updatedTransactionListForRequest && updatedTransactionListForRequest[0] && updatedTransactionListForRequest[0].bankTransactionId ? updatedTransactionListForRequest[0].bankTransactionId : null}
                                                />
                                            )

                                        }
                                    </TableBody>
                                </Table>
                            </LoadingOverlay>
                            {shouldShowPagination ?
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 50, 100, 200]}
                                    component="div"
                                    count={count}
                                    rowsPerPage={rowsPerPage}
                                    page={pageNumber - 1}
                                    onPageChange={this.handleChangePage}
                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                />
                                : false
                            }
                        </TableContainer>

                        {/* ======================= detailed trnasaction table section ===============================*/}

                        {originalUpdatedTransaction && Object.keys(originalUpdatedTransaction).length > 0 && shouldShowDetailedConfirmTable ?
                            <TableContainer className={classes.tableContainer} style={{ marginTop: "40px", width: "fit-content" }}>
                                <Table className={classes.table} aria-label="simple table">
                                    <TableHead className={classes.tableHeadColor}>
                                        <TableRow >
                                            <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                            <TableCell className={classes.tableCell} align="left">NEW SUB-CATEGORY</TableCell>
                                            <TableCell className={classes.tableCell} align="left">NEW DETAILED-CATEGORY</TableCell>
                                            <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow >
                                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Invers</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{originalUpdatedTransaction.sub_category_invers ? originalUpdatedTransaction.sub_category_invers : '-'}</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{originalUpdatedTransaction.detailed_category_invers ? originalUpdatedTransaction.detailed_category_invers : '-'}</TableCell>
                                            <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                        </TableRow>
                                        <TableRow >
                                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Rule-Engine</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{originalUpdatedTransaction.sub_category_rules_engine ? originalUpdatedTransaction.sub_category_rules_engine : '-'}</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{originalUpdatedTransaction.detailed_category_rules_engine ? originalUpdatedTransaction.detailed_category_rules_engine : '-'}</TableCell>
                                            <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                        </TableRow>
                                        <TableRow >
                                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Machine-Learning</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{originalUpdatedTransaction.sub_category ? originalUpdatedTransaction.sub_category : '-'}</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{originalUpdatedTransaction.detailed_category ? originalUpdatedTransaction.detailed_category : '-'}</TableCell>
                                            <TableCell className={classes.tableCell}>
                                                <Chip label="Keep like this" size="small" style={{ width: '100px', color: "#FFFFFF", backgroundColor: '#2BC4EB', }} onClick={() => this.handleDetailedTableButtonClick('keep_like_this_button')} />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow >
                                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Your Values</TableCell>
                                            <TableCell className={classes.tableCell} align="left">
                                                <FormControl className={classes.formControl} >
                                                    <Select
                                                        labelId="new-sub-category-label"
                                                        id="new-sub-category"
                                                        name="selectedNewSubCategory"
                                                        value={selectedNewSubCategory}
                                                        onChange={this.handleDropdownChanges}
                                                        className={classes.menuSelectStyles}
                                                    >
                                                        <MenuItem value="">
                                                            <em>None</em>
                                                        </MenuItem>
                                                        {this.getSubCategroyDropdownValueList(originalUpdatedTransaction.category) && this.getSubCategroyDropdownValueList(originalUpdatedTransaction.category).map(subCat => <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="left">
                                                <FormControl className={classes.formControl} >
                                                    <Select
                                                        labelId="new-detailed-category-label"
                                                        id="new-detailed-category"
                                                        name="selectedNewDetailedCategory"
                                                        value={selectedNewDetailedCategory}
                                                        onChange={this.handleDropdownChanges}
                                                        className={classes.menuSelectStyles}
                                                    >
                                                        <MenuItem value="">
                                                            <em>None</em>
                                                        </MenuItem>
                                                        {this.getDetailCategroyDropdownValueList(selectedNewSubCategory, originalUpdatedTransaction.category) && this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, originalUpdatedTransaction.category).map(detailedCat => <MenuItem key={detailedCat} value={detailedCat}>{detailedCat}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell className={classes.tableCell}>
                                                <Chip label="Change" size="small" style={{ width: '100px', color: "#B8BDC6", background: '#fdfdfd' }} variant="outlined" onClick={() => this.handleDetailedTableButtonClick('change_button')} disabled={Object.keys(originalUpdatedTransaction).length === 0} />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            :
                            false}
                    </GridItem>
                </GridContainer>
            </div >
        );
    }
}

CheckTransactionOverview.propTypes = {
    classes: PropTypes.object.isRequired,
    updateBankTransactions: PropTypes.func,
    bankTransactions: PropTypes.array,
    handlePopupOpen: PropTypes.func,
    getCategoryRules: PropTypes.func,
    getCategoryRulesEnums: PropTypes.func,
    getInitialdata: PropTypes.func,
    origin: PropTypes.string,
    overviewDate: PropTypes.string,
    ibanNumberList: PropTypes.array,
    getBankTransactionsForGivenFilters: PropTypes.func,
    setSelectedTransactions: PropTypes.func,
    isMultipleTransactionUpdate: PropTypes.bool,
    getCheckBankTransactionOverviewData: PropTypes.func,
};

const mapStateToProp = (state) => ({
    overviewData: state.lmglobal.overviewData,
});

const mapDispatchToProps = (dispatch) => ({
    updateBankTransactions: (requestData) => dispatch(updateBankTransactions(requestData)),
    getCategoryRules: () => dispatch(getCategoryRules()),
    getCategoryRulesEnums: (requestQuery) => dispatch(getCategoryRulesEnums(requestQuery)),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    getBankTransactionsForGivenFilters: (requestData) => dispatch(getBankTransactionsForGivenFilters(requestData)),
    getCheckBankTransactionOverviewData: (requestData) => dispatch(getCheckBankTransactionOverviewData(requestData)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(CheckTransactionOverview));