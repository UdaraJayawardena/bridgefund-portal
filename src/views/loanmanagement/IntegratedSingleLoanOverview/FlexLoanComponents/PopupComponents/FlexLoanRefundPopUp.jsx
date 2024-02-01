import { Dialog, DialogContent } from '@material-ui/core';
import React, { Component } from 'react';
import RefundLoan from 'views/loanmanagement/SingleLoanOverview/RefundLoan';

class FlexLoanRefundPopUp extends Component {
    
    render() {

        const { directdebits } = this.props;
        const desiredDDs = new Set(["profit", "loss"]);
        const profitLostData = directdebits && directdebits.length === 0 ? [] : directdebits.filter(item => desiredDDs.has(item.type));
        const sumProfitLossAmount = profitLostData && profitLostData.length === 0 ? 0 : profitLostData.reduce((n, { amount }) => n + amount, 0);

        return (
            <>
                <Dialog
                    id="show-refund-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={this.props.open}
                    onClose={() => this.props.onClosePopUp()}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <RefundLoan
                            key="redeem-loan-drawer-content"
                            smeLoan={this.props.smeLoan}
                            smeLoanTransactions={this.props.directdebits}
                            smeDetails={this.props.smeDetails}
                            //lastWithdrawalOrder={this.state.lastWithdrawalOrder}
                            totWithdrawalAmount={this.props.totalwithdrawals}
                            totProfitLostAmount={sumProfitLossAmount}
                            onClose={() => this.props.onClosePopUp()}
                        />
                    </DialogContent>
                </Dialog>

            </>
        );
    }
}

export default FlexLoanRefundPopUp;