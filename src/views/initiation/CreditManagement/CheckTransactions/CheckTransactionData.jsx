import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Chip, FormControl, IconButton, MenuItem, Select, TableCell, TableRow, Tooltip } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { EURO } from 'lib/initiation/utility';

class CheckTransactionData extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedNewDetailedCategory: '',
            selectedNewSubCategory: '',
            ...this.props.bankTransaction,
        };
    }

    handleDropdownChanges = (e) => {

        this.setState({ [e.target.name]: e.target.value },
            () => this.props.setUpdatedTransactionToList({
                ...this.state
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

    resetTransaction = () => {
        this.setState({
            selectedNewDetailedCategory: '',
            selectedNewSubCategory: '',
        }, () => this.props.clearTemporaryChangedTransactions());
    }

    render() {

        const { classes, bankTransaction, handleUpdateTransaction, selectedTrIdForUpdate, } = this.props;

        return (
            <TableRow>
                <TableCell className={classes.tableCell}>{bankTransaction.counterparty_iban_number}</TableCell>
                <TableCell className={classes.tableCell} align="left">{moment(bankTransaction.transaction_date).format('DD-MM-YYYY')}</TableCell>
                <TableCell className={classes.tableCell} align="right">{EURO(bankTransaction.amount)}</TableCell>
                <TableCell className={classes.tableCell} align="left">{bankTransaction.counterparty_name}</TableCell>
                <TableCell className={classes.tableCell} align="left">{bankTransaction.description}</TableCell>

                <TableCell className={classes.tableCell} align="left">
                    <FormControl className={classes.formControl} >
                        <Select
                            labelId="new-sub-category-label"
                            id="new-sub-category"
                            name="selectedNewSubCategory"
                            value={this.state.selectedNewSubCategory}
                            onChange={this.handleDropdownChanges}
                            className={classes.menuSelectStyles}
                            disabled={selectedTrIdForUpdate !== null && selectedTrIdForUpdate !== bankTransaction.id}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {this.getSubCategroyDropdownValueList(bankTransaction.category) && this.getSubCategroyDropdownValueList(bankTransaction.category).map(subCat => <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>)}
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
                            disabled={selectedTrIdForUpdate !== null && selectedTrIdForUpdate !== bankTransaction.id}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, bankTransaction.category) && this.getDetailCategroyDropdownValueList(this.state.selectedNewSubCategory, bankTransaction.category).map(detailedCat => <MenuItem key={detailedCat} value={detailedCat}>{detailedCat}</MenuItem>)}
                        </Select>
                    </FormControl>
                </TableCell>
                {/* <Chip label="Cancel" size="small" style={{ width: '100px' }} variant="outlined" onClick={clearTemporaryChangedTransactions} /> */}
                <TableCell className={classes.tableCell} >
                    <Tooltip title="Cancel Change" placement="top-start">
                        <IconButton disabled={selectedTrIdForUpdate !== null && selectedTrIdForUpdate !== bankTransaction.id} aria-label="delete" size="small" style={{ marginRight: 10 }} onClick={this.resetTransaction}>
                            <HighlightOffIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Chip disabled={selectedTrIdForUpdate !== null && selectedTrIdForUpdate !== bankTransaction.id} label="Confirm" size="small" style={{ width: '100px', color: "#FFFFFF", backgroundColor: '#2BC4EB', }} onClick={handleUpdateTransaction} />
                </TableCell>
            </TableRow >
        );
    }
}

CheckTransactionData.propTypes = {
    classes: PropTypes.object.isRequired,
    bankTransaction: PropTypes.object,
    handleShowHideRulesTable: PropTypes.func,
    setUpdatedTransactionToList: PropTypes.func,
    subCategoryEnums: PropTypes.array,
    detailedCategoryEnums: PropTypes.array,
    detailedCategoryEnumsTree: PropTypes.object,
    subCategoryEnumsTree: PropTypes.object,
    isMultipleTransactionUpdate: PropTypes.bool,
    handleUpdateTransaction: PropTypes.func,
    clearTemporaryChangedTransactions: PropTypes.func,
    selectedTrIdForUpdate: PropTypes.number,
};

export default CheckTransactionData;