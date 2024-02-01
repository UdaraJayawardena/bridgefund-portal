import React, { Component } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import ClaimLoan from 'views/loanmanagement/SingleLoanOverview/ClaimLoan';

class FixedLoanClaimPopUp extends Component {
    render() {
        const { open, handleClaimScreen, smeLoan, smeLoanTransactions, smeDetails, locale, symbol, decimalSeparator, thousandSeparator } = this.props;
        return (
            <>
                <Dialog
                    id="claim-loan-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={open}
                    onClose={() => handleClaimScreen(false)}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <ClaimLoan
                            key="refund-loan-drawer-content"
                            smeLoan={smeLoan}
                            smeLoanTransactions={smeLoanTransactions}
                            smeDetails={smeDetails}
                            onClose={() => handleClaimScreen(false)}
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

export default FixedLoanClaimPopUp;