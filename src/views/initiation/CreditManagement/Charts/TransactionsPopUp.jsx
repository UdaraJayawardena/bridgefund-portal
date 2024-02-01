import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { unserialize } from 'serialize-php';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import {
    Table, Button, TableBody, TableCell, TableHead, Chip,
    TableRow, Grid, TableContainer, Paper, FormControl, Select, MenuItem
} from '@material-ui/core';
import GridItem from 'components/initiation/Grid/GridItem';
import GridContainer from 'components/initiation/Grid/GridContainer';
// import { getAllBankTransactionsForCategoryPage } from 'store/actions/CreditRiskOverview.action';


import { displayNotification } from 'store/initiation/actions/Notifier';
import { getBankTransactionsForGivenFilters, updateBankTransactions, sendTransactionToMlModel, getMlPredictions } from 'store/initiation/actions/BankTransactions.action';
import { getCategoryRules, getCategoryRulesEnums } from 'store/initiation/actions/CategoryRules.action';
import TransactionData from './TransactionData';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import DatePickerWithNextAndPrevious from './DatePickerWithNextAndPrevious';
import LoadingOverlay from 'react-loading-overlay';

const isSameTwoBlockArrays = (listOne, listTwo) => {
    let flag = true;

    if (listOne.length !== listTwo.length) return false;

    for (let i = 0; i < listOne.length; i++) {
        const id = listOne[i].id;
        const element = listTwo.find(el => el.id === id);
        if (!element) flag = false;
    }

    return flag;
}
class TransactionsPopUp extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rulesShowingBankTransactionId: null,
            predictionsShowingBankTransactionId: null,
            bankTransactions: [],
            selectedRules: [],
            updatedBankTransactions: [],
            updatedTransactionListForRequest: [],
            detailedCategoryEnumsTree: {},
            subCategoryEnumsTree: {},
            isLoadingTransactions: false,

            selectedNewSubCategory: '',
            selectedNewDetailedCategory: '',

            receivedMLpredictions: []
        };
    }

    componentDidMount() {
        this.setDataForCategoryDropDowns();
        this.setState({ bankTransactions: this.props.bankTransactions });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!isSameTwoBlockArrays(prevState.bankTransactions, nextProps.bankTransactions)) {
            return { bankTransactions: nextProps.bankTransactions };
        }
        return null;
    }

    getDataByDateAndIbans = (transactionDate) => {
        // console.log('transactionDate ', moment(transactionDate).format('YYYY-MM-DD'));
        let allTransForMainChart = [];
        this.setState({ isLoadingTransactions: true });

        this.props.ibanNumberList && this.props.ibanNumberList.forEach(iban => {
            this.props.getBankTransactionsForGivenFilters({
                "action": "GET",
                "transactionDate": moment(transactionDate).format('YYYY-MM-DD'),
                "ibanNumber": iban
            })
                .then(res => {

                    allTransForMainChart = [...allTransForMainChart, ...res];
                    console.log('allTransForMainChart ', allTransForMainChart, ' ..... ', moment(transactionDate).format('YYYY-MM-DD'));
                    this.setState({
                        isLoadingTransactions: false
                    }, () => this.props.setSelectedTransactions(allTransForMainChart));
                })
                .catch(err => {
                    console.log(err);
                    this.setState({ isLoadingTransactions: false });
                });
        });
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

    handleShowHideRulesTable = (bankTransaction) => {
        const { rulesShowingBankTransactionId } = this.state;
        if (rulesShowingBankTransactionId === bankTransaction.id) {
            this.setState({ rulesShowingBankTransactionId: null, selectedRules: [] });
            return;
        }
        this.setState({ rulesShowingBankTransactionId: bankTransaction.id }, () => {
            this.getRulesByRuleIdsOfTransaction(bankTransaction);
        });
        return;
    }

    getRulesByRuleIdsOfTransaction = (bankTransaction) => {

        const ruleIds = unserialize(bankTransaction.category_rule_ids);

        if (ruleIds && ruleIds.length > 0) {
            this.props.getCategoryRules()
                .then(res => {
                    this.setState({ selectedRules: this.filterCategoryRules(res, ruleIds) });
                })
                .catch(err =>
                    console.log("error ", err));
        }
        else {
            this.setState({ selectedRules: [] });
        }
    }

    handleShowHidePredictionsPop = (bankTransaction) => {

        const { predictionsShowingBankTransactionId } = this.state;
        if (predictionsShowingBankTransactionId === bankTransaction.id) {
            this.setState({ predictionsShowingBankTransactionId: null, receivedMLpredictions: [] });
            return;
        }
        this.setState({ predictionsShowingBankTransactionId: bankTransaction.id }, () => {
            this.getMlPredictionsOfTransaction(bankTransaction);
        });
        return;
    }

    getMlPredictionsOfTransaction = (bankTransaction) => {

        if (bankTransaction) {
            console.log(bankTransaction);
            const requestBody = [{
                amount: bankTransaction.amount,
                bank_id: bankTransaction.bank_id.toString(),
                bank_transaction_type: bankTransaction.bank_transaction_type,
                counterparty_name: bankTransaction.counterparty_name,
                description: bankTransaction.description,
                id: bankTransaction.id.toString(),
                transaction_date: bankTransaction.transaction_date
            }];
            this.props.getMlPredictions(requestBody)
                .then(res => {
                    this.setState({ receivedMLpredictions: res });
                })
                .catch(err =>
                    console.log("error ", err));
        }
        else {
            this.setState({ receivedMLpredictions: [] });
        }
    }

    filterCategoryRules = (rules, ruleIdList) => {
        return rules.filter(rule => ruleIdList.indexOf(rule.id) !== -1)
            .sort((a, b) => (a.priority_level > b.priority_level) ? 1 : -1);
    }

    handleUpdateTransaction = () => {
        let { updatedTransactionListForRequest } = this.state;
        let mlTransactions = [];

        if (this.props.isMultipleTransactionUpdate) {
            updatedTransactionListForRequest = this.prepairMultipleUpdateTransactions();
            mlTransactions = this.updateMultiplemLTransactions('US');
        } else {
            const bankTransaction = updatedTransactionListForRequest[0];
            const mlTransaction = {
                "category": {
                    "category": bankTransaction.category,
                    "detailed_category": this.state.selectedNewDetailedCategory,
                    "sub_category": this.state.selectedNewSubCategory
                },
                "transaction": {
                    "amount": bankTransaction.amount,
                    "bank_id": bankTransaction.bank_id.toString(),
                    "bank_transaction_type": bankTransaction.bank_transaction_type,
                    "counterparty_name": bankTransaction.counterparty_name,
                    "description": bankTransaction.description,
                    "id": bankTransaction.id.toString(),
                    "transaction_date": bankTransaction.transaction_date
                }
            };
            mlTransactions.push(mlTransaction);
        }

        const reqData = {
            bankTransaction: updatedTransactionListForRequest
        };

        if (updatedTransactionListForRequest.length === 0) {
            this.props.displayNotification('No transactions to update!', 'warning');
            return;
        }

        if (updatedTransactionListForRequest.find(transaction => transaction.detailedCategory === "" || transaction.subCategory === "")) {
            this.props.displayNotification('Please select category values!', 'warning');
            return;
        }
        this.props.updateBankTransactions(reqData)
            .then(res => {
                this.sendTransactionsToMlModel(mlTransactions);
                this.props.handlePopupOpen();
                if (this.props.getInitialdata) {
                    this.props.getInitialdata()
                        .then(() => this.props.handlePopupOpen());
                } else {
                    this.props.handlePopupOpen();
                }
            })
            .catch(err =>
                console.log("updateBankTransactions error ", err));
    }

    setUpdatedTransactionToList = (transaction) => {

        const { bankTransactions, updatedTransactionListForRequest } = this.state;
        let updatedTransactionListForReq = [];
        let selectedTransactionIndex;

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

        if (updatedTransactionListForRequest.find(tr => tr.bankTransactionId === transaction.id)) {
            //update obj in list
            updatedTransactionListForReq = updatedTransactionListForRequest;
            const index = updatedTransactionListForRequest.findIndex(tr => tr.bankTransactionId === transaction.id);
            updatedTransactionListForReq[index] = updatedObj;
            this.setState({ updatedTransactionListForRequest: updatedTransactionListForReq });
        }
        else {
            //add new obj
            updatedTransactionListForReq = updatedTransactionListForRequest;
            updatedTransactionListForReq.push(updatedObj);
            this.setState({ updatedTransactionListForRequest: updatedTransactionListForReq });
        }


        for (let i = 0; i < bankTransactions.length; i++) {
            const trns = bankTransactions[i];

            if (trns.id === transaction.id) {
                selectedTransactionIndex = i;
            }
        }

        bankTransactions[selectedTransactionIndex] = transaction;

        this.setState({ bankTransactions });

    }

    prepairMultipleUpdateTransactions = () => {
        const { bankTransactions } = this.state;
        const newTransactionArray = [];
        for (let i = 0; i < bankTransactions.length; i++) {
            const st = bankTransactions[i];

            const updatedObj = {
                "action": "change",
                "bankTransactionId": st.id,
                "categoryStatus": "confirmed",
                "subCategory": this.state.selectedNewSubCategory,//user values
                "detailedCategory": this.state.selectedNewDetailedCategory,//user values
                "subCategoryOld": st.sub_category,//ML values
                "detailedCategoryOld": st.detailed_category,//ML values
                "subCategoryRulesEngine": this.state.selectedNewSubCategory,//user values
                "detailedCategoryRulesEngine": this.state.selectedNewDetailedCategory,//user values
                "processBy": st.processed_by
            };

            newTransactionArray.push(updatedObj);
        }
        return newTransactionArray;
    }

    updateMultipleTransactionsFromMachineLearning = () => {
        const { bankTransactions } = this.state;
        const newTransactionArray = [];
        for (let i = 0; i < bankTransactions.length; i++) {
            const st = bankTransactions[i];

            const updatedObj = {
                "action": "change",
                "bankTransactionId": st.id,
                "categoryStatus": "confirmed",
                "processBy": st.processed_by,
                "subCategoryRulesEngine": st.sub_category,
                "detailedCategoryRulesEngine": st.detailed_category
            };

            newTransactionArray.push(updatedObj);
        }
    }

    updateMultipleTransactionsToReValues = () => {
        const { bankTransactions } = this.state;
        const newTransactionArray = [];
        for (let i = 0; i < bankTransactions.length; i++) {
            const st = bankTransactions[i];

            const updatedObj = {
                "action": "change",
                "bankTransactionId": st.id,
                "categoryStatus": "confirmed",
                "subCategory": st.sub_category_rules_engine,
                "detailedCategory": st.detailed_category_rules_engine,
                "subCategoryOld": st.sub_category,//ML values
                "detailedCategoryOld": st.detailed_category,//ML values
                "processBy": st.processed_by
            };

            newTransactionArray.push(updatedObj);
        }
        return newTransactionArray;
    }

    updateMultiplemLTransactions = (row) => {
        const { bankTransactions } = this.state;
        const newTransactionArray = [];
        for (let i = 0; i < bankTransactions.length; i++) {
            const bankTransaction = bankTransactions[i];

            const mlTransaction = {
                "category": {
                    "category": bankTransaction.category,
                    "detailed_category": row == 'RE' ? bankTransaction.detailed_category_rules_engine :  row == 'ML' ? bankTransaction.detailed_category : this.state.selectedNewDetailedCategory,
                    "sub_category": row == 'RE' ? bankTransaction.sub_category_rules_engine :  row == 'ML' ? bankTransaction.sub_category : this.state.selectedNewSubCategory,
                },
                "transaction": {
                    "amount": bankTransaction.amount,
                    "bank_id": bankTransaction.bank_id.toString(),
                    "bank_transaction_type": bankTransaction.bank_transaction_type,
                    "counterparty_name": bankTransaction.counterparty_name,
                    "description": bankTransaction.description,
                    "id": bankTransaction.id.toString(),
                    "transaction_date": bankTransaction.transaction_date
                }
            };
            newTransactionArray.push(mlTransaction);
        }
        return newTransactionArray;
    }

    sendTransactionsToMlModel = (bankTransactions) => {

        const mlData = {
            mlTransactions: {
                data: bankTransactions
            }
        };
        this.props.sendTransactionToMlModel(mlData);
    }

    handleDropdownChanges = (e) => {
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

    getCategoryValuesForTransactions = (transactionList, rowType) => {
        // rowType => inverse(detailed_category_invers), machineLearning(detailed_category), ruleEngine(detailed_category_rules_engine)
        const result = transactionList.map(tr => tr[rowType]);
        // to check every transaction has same value for selected property
        if (new Set(result).size === 1) {
            return result[0] ? result[0] : 'N/A';
        }
        return 'Different values for ' + rowType;
    }

    handleKeepLikeThisButtonClick = () => {

        let { updatedTransactionListForRequest } = this.state;
        let mlTransactions = [];

        if (this.props.isMultipleTransactionUpdate) {
            updatedTransactionListForRequest = this.updateMultipleTransactionsFromMachineLearning();
            mlTransactions = this.updateMultiplemLTransactions('ML');
        } else {
            const bankTransaction = updatedTransactionListForRequest[0];
            const mlTransaction = {
                "category": {
                    "category": bankTransaction.category,
                    "detailed_category": bankTransaction.detailed_category,
                    "sub_category": bankTransaction.sub_category
                },
                "transaction": {
                    "amount": bankTransaction.amount,
                    "bank_id": bankTransaction.bank_id.toString(),
                    "bank_transaction_type": bankTransaction.bank_transaction_type,
                    "counterparty_name": bankTransaction.counterparty_name,
                    "description": bankTransaction.description,
                    "id": bankTransaction.id.toString(),
                    "transaction_date": bankTransaction.transaction_date
                }
            };
            mlTransactions.push(mlTransaction);
        }

        const reqData = {
            bankTransaction: updatedTransactionListForRequest
        };

        if (updatedTransactionListForRequest.length === 0) {
            this.props.displayNotification('No transactions to update!', 'warning');
            return;
        }

        this.props.updateBankTransactions(reqData)
            .then(res => {
                this.sendTransactionsToMlModel(mlTransactions);
                this.props.handlePopupOpen();
                if (this.props.getInitialdata) {
                    this.props.getInitialdata()
                        .then(() => this.props.handlePopupOpen());
                } else {
                    this.props.handlePopupOpen();
                }
            })
            .catch(err =>
                console.log("updateBankTransactions error ", err));
    }

    handleChangeToReValuesButtonClick = () => {

        let { updatedTransactionListForRequest } = this.state;
        let mlTransactions = [];

        if (this.props.isMultipleTransactionUpdate) {
            updatedTransactionListForRequest = this.updateMultipleTransactionsToReValues();
            mlTransactions = this.updateMultiplemLTransactions('RE');
        } else {
            const bankTransaction = updatedTransactionListForRequest[0];
            const mlTransaction = {
                "category": {
                    "category": bankTransaction.category,
                    "detailed_category": bankTransaction.detailed_category_rules_engine,
                    "sub_category": bankTransaction.sub_category_rules_engine
                },
                "transaction": {
                    "amount": bankTransaction.amount,
                    "bank_id": bankTransaction.bank_id.toString(),
                    "bank_transaction_type": bankTransaction.bank_transaction_type,
                    "counterparty_name": bankTransaction.counterparty_name,
                    "description": bankTransaction.description,
                    "id": bankTransaction.id.toString(),
                    "transaction_date": bankTransaction.transaction_date
                }
            };
            mlTransactions.push(mlTransaction);
        }

        const reqData = {
            bankTransaction: updatedTransactionListForRequest
        };

        if (updatedTransactionListForRequest.length === 0) {
            this.props.displayNotification('No transactions to update!', 'warning');
            return;
        }

        this.props.updateBankTransactions(reqData)
            .then(res => {
                this.sendTransactionsToMlModel(mlTransactions);
                this.props.handlePopupOpen();
                if (this.props.getInitialdata) {
                    this.props.getInitialdata()
                        .then(() => this.props.handlePopupOpen());
                } else {
                    this.props.handlePopupOpen();
                }
            })
            .catch(err =>
                console.log("updateBankTransactions error ", err));
    }

    render() {
        // console.log("popup state in render ", this.state);
        const { classes, origin, overviewDate, isMultipleTransactionUpdate, } = this.props;
        const { rulesShowingBankTransactionId, predictionsShowingBankTransactionId, isLoadingTransactions,
            selectedRules, bankTransactions, detailedCategoryEnumsTree, subCategoryEnumsTree, receivedMLpredictions } = this.state;

        return (
            <div >
                {/* ======================= trnasaction table section ===============================*/}
                <GridContainer>
                    <GridItem md={12}>
                        {isMultipleTransactionUpdate && bankTransactions.length > 0 &&

                            <TableContainer className={classes.tableContainer} style={{ marginBottom: "40px", width: "fit-content" }}>
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
                                            <TableCell className={classes.tableCell} align="left">{this.getCategoryValuesForTransactions(bankTransactions, 'sub_category_invers')}</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{this.getCategoryValuesForTransactions(bankTransactions, 'detailed_category_invers')}</TableCell>
                                            <TableCell className={classes.tableCell}>&nbsp;</TableCell>
                                        </TableRow>
                                        <TableRow >
                                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Rule-Engine</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{this.getCategoryValuesForTransactions(bankTransactions, 'sub_category_rules_engine')}</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{this.getCategoryValuesForTransactions(bankTransactions, 'detailed_category_rules_engine')}</TableCell>
                                            <TableCell className={classes.tableCell}>
                                                <Chip label="Change to RE-values" size="small" style={{ width: '150px', color: "#FFFFFF", backgroundColor: '#2BC4EB', }} onClick={this.handleChangeToReValuesButtonClick} />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow >
                                            <TableCell className={classes.tableCell} style={{ fontWeight: "bold" }}>Machine-Learning</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{this.getCategoryValuesForTransactions(bankTransactions, 'sub_category')}</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{this.getCategoryValuesForTransactions(bankTransactions, 'detailed_category')}</TableCell>
                                            <TableCell className={classes.tableCell}>
                                                <Chip label="Keep like this" size="small" style={{ width: '150px', color: "#FFFFFF", backgroundColor: '#2BC4EB', }} onClick={this.handleKeepLikeThisButtonClick} />
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
                                                        value={this.state.selectedNewSubCategory}
                                                        onChange={this.handleDropdownChanges}
                                                        className={classes.menuSelectStyles}
                                                    >
                                                        <MenuItem value="">
                                                            <em>None</em>
                                                        </MenuItem>
                                                        {this.getSubCategroyDropdownValueList(bankTransactions[0].category) && this.getSubCategroyDropdownValueList(bankTransactions[0].category).map(subCat => <MenuItem value={subCat}>{subCat}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="left">
                                                <FormControl className={classes.formControl} >
                                                    <Select
                                                        labelId="new-detailed-category-label"
                                                        id="new-detailed-category"
                                                        name="selectedNewDetailedCategory"
                                                        value={this.state.selectedNewDetailedCategory}
                                                        onChange={this.handleDropdownChanges}
                                                        className={classes.menuSelectStyles}
                                                    >
                                                        <MenuItem value="">
                                                            <em>None</em>
                                                        </MenuItem>
                                                        {this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, bankTransactions[0].category) && this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, bankTransactions[0].category).map(detailedCat => <MenuItem value={detailedCat}>{detailedCat}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell className={classes.tableCell}>
                                                <Chip label="Change" size="small" style={{ width: '150px', color: "#B8BDC6", background: '#fdfdfd' }} variant="outlined" onClick={this.handleUpdateTransaction} disabled={bankTransactions.length === 0} />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                        <TableContainer className={classes.tableContainer}>
                            <LoadingOverlay
                                // @ts-ignore
                                id="loader-overlay"
                                active={isLoadingTransactions}
                                spinner
                                text='Loading Transactions...'>
                                <Table className={classes.table} aria-label="simple table">
                                    <TableHead className={classes.tableHeadColor}>
                                        <TableRow >
                                            <TableCell className={classes.tableCell}>Account</TableCell>
                                            <TableCell className={classes.tableCell} align="left">Trans. Date</TableCell>
                                            <TableCell className={classes.tableCell} align="left">{origin === 'CHARTS' ? <DatePickerWithNextAndPrevious overviewDate={overviewDate} getDataByDateAndIbans={this.getDataByDateAndIbans} /> : 'Description'}</TableCell>
                                            <TableCell className={classes.tableCell} align="right">Amount</TableCell>
                                            <TableCell className={classes.tableCell} align="left">Counterparty</TableCell>
                                            {!isMultipleTransactionUpdate &&
                                                <TableCell className={classes.tableCell} align="left">New Sub Category</TableCell>
                                            }
                                            {!isMultipleTransactionUpdate &&
                                                <TableCell className={classes.tableCell} align="left">New Detailed-Category</TableCell>
                                            }
                                            <TableCell className={classes.tableCell} align="left">Rules</TableCell>
                                            <TableCell className={classes.tableCell} align="left">Predictions</TableCell>
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
                                                <TransactionData
                                                    key={bankTransaction.id}
                                                    classes={classes}
                                                    bankTransaction={bankTransaction}
                                                    subCategoryEnumsTree={subCategoryEnumsTree}
                                                    detailedCategoryEnumsTree={detailedCategoryEnumsTree}
                                                    handleShowHideRulesTable={this.handleShowHideRulesTable}
                                                    handleShowHidePredictionsPop={this.handleShowHidePredictionsPop}
                                                    setUpdatedTransactionToList={this.setUpdatedTransactionToList}
                                                    isMultipleTransactionUpdate={isMultipleTransactionUpdate}
                                                />
                                            )

                                        }
                                    </TableBody>
                                </Table>
                            </LoadingOverlay>
                        </TableContainer>

                        <Grid
                            justifyContent="flex-end"
                            container
                        >
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    style={{ textTransform: 'none' }}
                                    className={classes.cancelIconButton}
                                    onClick={() => this.props.handlePopupOpen()}>Cancel</Button>

                            </Grid>
                        </Grid>

                    </GridItem>

                    {/* ========================== rules table ============================  */}
                    <GridItem md={12} >
                        {
                            rulesShowingBankTransactionId !== null ?
                                <TableContainer component={Paper} className={classes.tableContainer}>
                                    <Table className={classes.table
                                    } aria-label="simple--table" >
                                        <TableHead className={classes.tableHeadColor}>
                                            <TableRow >
                                                <TableCell colSpan={4} className={classes.rightBorderCell}>&nbsp;</TableCell>
                                                <TableCell align="center" className={classes.rightBorderCell} colSpan={3}>IBAN</TableCell>
                                                <TableCell align="center" className={classes.rightBorderCell} colSpan={3}>Counterparty Name</TableCell>
                                                <TableCell align="center" className={classes.rightBorderCell} colSpan={3}>Description</TableCell>
                                                <TableCell className={classes.tableCell} colSpan={3} align="center">&nbsp;</TableCell>
                                            </TableRow>
                                            <TableRow >
                                                <TableCell className={classes.tableCell}>Rule Id</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Pro</TableCell>
                                                <TableCell className={classes.tableCell} align="left">&nbsp;</TableCell>
                                                <TableCell align="left" className={classes.rightBorderCell}>Amount</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Boolean</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Operator</TableCell>
                                                <TableCell align="left" className={classes.rightBorderCell}>Value</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Boolean</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Operator</TableCell>
                                                <TableCell align="left" className={classes.rightBorderCell}>Value</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Boolean</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Operator</TableCell>
                                                <TableCell align="left" className={classes.rightBorderCell}>Value</TableCell>
                                                <TableCell className={classes.tableCell} align="left">&nbsp;</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Detailed-Category</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Sub-Category</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedRules.length === 0 ?

                                                <TableRow>
                                                    <TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={13}>
                                                        {'No Rules to show'}
                                                    </TableCell>
                                                </TableRow>

                                                :

                                                // @ts-ignore
                                                selectedRules.map((rule, index) =>
                                                    <TableRow key={index} >
                                                        <TableCell className={classes.leftBorderCell}>{rule.id}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.priority_level}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.amount_operator}</TableCell>
                                                        <TableCell align="center" className={classes.ruleTableConditionalCell}>if</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.counterparty_iban_boolean}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.counterparty_iban_operator}</TableCell>
                                                        <TableCell align="left" className={classes.rulePopupRightBorderCell}>{rule.counterparty_iban}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.counterparty_name_boolean}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.counterparty_name_operator}</TableCell>
                                                        <TableCell align="left" className={classes.rulePopupRightBorderCell}>{rule.counterparty_name}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.description_boolean}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.description_operator}</TableCell>
                                                        <TableCell align="left" className={classes.rulePopupRightBorderCell}>{rule.description}</TableCell>
                                                        <TableCell align="center" className={classes.ruleTableConditionalCell}>then</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{rule.detailed_category}</TableCell>
                                                        <TableCell className={classes.rulePopupRightBorderCell} align="left">{rule.sub_category}</TableCell>
                                                    </TableRow>
                                                )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                :
                                false
                        }
                    </GridItem>

                    {/* ========================== ML Predictions table ============================  */}
                    <GridItem md={12} >
                        {
                            predictionsShowingBankTransactionId !== null ?
                                <TableContainer component={Paper} className={classes.tableContainer}>
                                    <Table className={classes.table
                                    } aria-label="simple--table" >
                                        <TableHead className={classes.tableHeadColor}>
                                            <TableRow >
                                                <TableCell className={classes.tableCell}>Predicted Category</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Probability</TableCell>
                                                <TableCell className={classes.tableCell} align="left">Transaction ID</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {receivedMLpredictions.length === 0 ?

                                                <TableRow>
                                                    <TableCell className={classes.leftAndRightBorderCell} align="center" colSpan={13}>
                                                        {'No Predictions to show'}
                                                    </TableCell>
                                                </TableRow>

                                                :

                                                // @ts-ignore
                                                receivedMLpredictions.map((prediction, index) =>
                                                    <TableRow key={index} >
                                                        <TableCell className={classes.leftBorderCell}>{prediction.predicted_category}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{prediction.predicted_category_probability}</TableCell>
                                                        <TableCell className={classes.rulePopupCell} align="left">{prediction.transaction_id}</TableCell>
                                                    </TableRow>
                                                )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                :
                                false
                        }
                    </GridItem>

                </GridContainer>

            </div >
        );
    }
}

TransactionsPopUp.propTypes = {
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
    sendTransactionToMlModel: PropTypes.func,
    getMlPredictions: PropTypes.func,
};

TransactionsPopUp.defaultProps = {
    origin: "ADMIN"// values can be CHARTS or ADMIN
};

const mapStateToProp = (/* state */) => ({
});

const mapDispatchToProps = (dispatch) => ({
    updateBankTransactions: (requestData) => dispatch(updateBankTransactions(requestData)),
    getCategoryRules: () => dispatch(getCategoryRules()),
    getCategoryRulesEnums: (requestQuery) => dispatch(getCategoryRulesEnums(requestQuery)),
    displayNotification: (message, type) => dispatch(displayNotification(message, type)),
    getBankTransactionsForGivenFilters: (requestData) => dispatch(getBankTransactionsForGivenFilters(requestData)),
    sendTransactionToMlModel: (requestData) => dispatch(sendTransactionToMlModel(requestData)),
    getMlPredictions: (requestData) => dispatch(getMlPredictions(requestData)),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(TransactionsPopUp));