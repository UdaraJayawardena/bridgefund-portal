import React, { Component } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import RedeemLoan from 'views/loanmanagement/SingleLoanOverview/RedeemLoan';

class FixedLoanRedeemPopUp extends Component {
    render() {
        const { handleRedeemScreen, open, smeLoan, directdebits, locale, symbol, decimalSeparator, thousandSeparator } = this.props;

        return (
            <>
                <Dialog
                    id="redeem-loan-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={open}
                    onClose={() => handleRedeemScreen(false)}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <RedeemLoan
                            key="redeem-loan-drawer-content"
                            smeLoan={smeLoan}
                            smeLoanTransactions={directdebits}
                            locale={locale}
                            symbol={symbol}
                            decimalSeparator={decimalSeparator}
                            thousandSeparator={thousandSeparator}
                            onClose={() => handleRedeemScreen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

export default FixedLoanRedeemPopUp;