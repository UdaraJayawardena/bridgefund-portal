import React, { Component } from 'react';
import { Drawer } from '@material-ui/core';
import TemporaryLoanStop from "views/loanmanagement/LoanTemporaryStop/LoanTemporaryStop";

class FixedLoanTempLoanStopDrawer extends Component {
    render() {
        const { open, loanData, toggleDrawer, locale , symbol , decimalSeparator , thousandSeparator } = this.props;
        return (
            <>
                <Drawer
                    id="tempory-loan-stop-drawer"
                    anchor="bottom"
                    open={open}
                    onClose={toggleDrawer('temporaryLoanStop', 'bottom', false)}
                >
                    <div
                        tabIndex={0}
                        role="button"
                    >
                        <TemporaryLoanStop key="tempory-loan-stop-drawer-content" 
                        toggleDrawer={toggleDrawer('temporaryLoanStop', 'bottom', false)} 
                        selectedLoan={loanData}
                        locale={locale}
                        symbol={symbol}
                        decimalSeparator={decimalSeparator}
                        thousandSeparator={thousandSeparator} 
                        />
                    </div>
                </Drawer>

            </>
        );
    }
}

export default FixedLoanTempLoanStopDrawer;