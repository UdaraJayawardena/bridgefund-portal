import { Dialog, DialogContent } from '@material-ui/core';
import React, { Component } from 'react';
import RefundLoan from 'views/loanmanagement/SingleLoanOverview/RefundLoan';

class FixedLoanRefundPopUp extends Component {
    render() {

        const { open, handleRefundScreen, smeLoan, smeDetails, smeLoanTransactions, locale, symbol,
                decimalSeparator, thousandSeparator } = this.props;

        const desiredDDs = new Set(["profit", "loss"]);
        const profitLostData = this.props.smeLoanTransactions && this.props.smeLoanTransactions.length === 0 ? [] : this.props.smeLoanTransactions.filter(item => desiredDDs.has(item.type));
        const sumProfitLossAmount = profitLostData && profitLostData.length === 0 ? 0 : profitLostData.reduce((n, { amount }) => n + amount, 0);
        return (
            <>
                <Dialog
                    id="refund-loan-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={open}
                    onClose={() => handleRefundScreen(false)}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <RefundLoan
                            key="redeem-loan-drawer-content"
                            smeLoan={smeLoan}
                            smeLoanTransactions={smeLoanTransactions}
                            smeDetails={smeDetails}
                            totProfitLostAmount={sumProfitLossAmount}
                            onClose={() => handleRefundScreen(false)}
                            locale={locale}
                            symbol={symbol}
                            decimalSeparator={decimalSeparator}
                            thousandSeparator={thousandSeparator}

                        />
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

export default FixedLoanRefundPopUp;