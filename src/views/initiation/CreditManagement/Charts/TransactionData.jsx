import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormControl, MenuItem, Select, TableCell, TableRow } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import { EURO } from 'lib/initiation/utility';

class TransactionData extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedNewDetailedCategory: this.props.bankTransaction.detailed_category ? this.props.bankTransaction.detailed_category : '',
            selectedNewSubCategory: this.props.bankTransaction.sub_category ? this.props.bankTransaction.sub_category : '',
        };
    }

    handleDropdownChanges = (e) => {

        const { bankTransaction } = this.props;

        this.setState({ [e.target.name]: e.target.value },
            () => this.props.setUpdatedTransactionToList({
                ...bankTransaction,
                [e.target.name]: e.target.value
            }));
    }

    getDetailCategroyDropdownValueList = (subCategory, category) => {
        const { detailedCategoryEnumsTree } = this.props;
        return detailedCategoryEnumsTree && detailedCategoryEnumsTree[category]
            && detailedCategoryEnumsTree[category][subCategory.replace(' ', '_')] ?
            detailedCategoryEnumsTree[category][subCategory.replace(' ', '_')] : [];
    }

    getSubCategroyDropdownValueList = (category) => {
        const { subCategoryEnumsTree } = this.props;
        return subCategoryEnumsTree && subCategoryEnumsTree[category] ?
            subCategoryEnumsTree[category] : [];
    }

    render() {

        const { classes, bankTransaction, isMultipleTransactionUpdate } = this.props;

        return (
            <TableRow>
                <TableCell className={classes.rulePopupCell}>{bankTransaction.counterparty_iban_number}</TableCell>
                <TableCell className={classes.rulePopupCell} align="left">{moment(bankTransaction.transaction_date).format('DD-MM-YYYY')}</TableCell>
                <TableCell className={classes.rulePopupCell} align="left">{bankTransaction.description}</TableCell>
                <TableCell className={classes.rulePopupCell} align="right">{EURO(bankTransaction.amount)}</TableCell>
                <TableCell className={classes.rulePopupCell} align="left">{bankTransaction.counterparty_name}</TableCell>
                {!isMultipleTransactionUpdate &&
                                    <TableCell className={classes.rulePopupCell} align="left">
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
                                            {this.getSubCategroyDropdownValueList(bankTransaction.category) && this.getSubCategroyDropdownValueList(bankTransaction.category).map(subCat => <MenuItem value={subCat}>{subCat}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                }

                {!isMultipleTransactionUpdate &&
                <TableCell className={classes.rulePopupCell} align="left">
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
                            {this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, bankTransaction.category) && this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, bankTransaction.category).map(detailedCat => <MenuItem key={detailedCat} value={detailedCat}>{detailedCat}</MenuItem>)}
                        </Select>
                    </FormControl></TableCell>
                }
                <TableCell className={classes.rulePopupCell}>
                    <VisibilityIcon className={classes.visibilityIconButton} onClick={() => this.props.handleShowHideRulesTable(bankTransaction)} />
                </TableCell>
                <TableCell className={classes.rulePopupCell}>
                    <QuestionAnswer className={classes.visibilityIconButton} onClick={() => this.props.handleShowHidePredictionsPop(bankTransaction)} />
                </TableCell>
            </TableRow>
        );
    }
}

TransactionData.propTypes = {
    classes: PropTypes.object.isRequired,
    bankTransaction: PropTypes.object,
    handleShowHideRulesTable: PropTypes.func,
    setUpdatedTransactionToList: PropTypes.func,
    // subCategoryEnums: PropTypes.array,
    // detailedCategoryEnums: PropTypes.array,
    detailedCategoryEnumsTree: PropTypes.object,
    subCategoryEnumsTree: PropTypes.object,
    isMultipleTransactionUpdate: PropTypes.bool,
    handleShowHidePredictionsPop: PropTypes.func,
};

export default TransactionData;