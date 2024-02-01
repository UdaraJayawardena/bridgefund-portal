import React, { Component } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import RefinaceLoan from 'views/loanmanagement/SingleLoanOverview/RefinanceLoan';

class FixedLoanRefinancePopUp extends Component {
    render() {

        const { smeLoan, open, directdebits, handleRefinanceScreen,refreshLoanData , locale , symbol , decimalSeparator , thousandSeparator } = this.props;

        return (
            <>
                <Dialog
                    id="refinance-loan-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={open}
                    onClose={() => handleRefinanceScreen(false)}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <RefinaceLoan
                            key="refinance-loan-drawer-content"
                            smeLoan={smeLoan}
                            smeLoanTransactions={directdebits}
                            onClose={() => handleRefinanceScreen(false)}
                            refreshLoanData={refreshLoanData}
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

export default FixedLoanRefinancePopUp;