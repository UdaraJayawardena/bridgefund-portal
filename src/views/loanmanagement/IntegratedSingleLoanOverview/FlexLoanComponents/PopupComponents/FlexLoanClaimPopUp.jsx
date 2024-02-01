import { Dialog, DialogContent } from '@material-ui/core';
import React, { Component } from 'react';
import ClaimLoan from 'views/loanmanagement/SingleLoanOverview/ClaimLoan';

class FlexLoanClaimPopUp extends Component {
    render() {
        return (
            <>
                <Dialog
                    id="show-claim-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={this.props.open}
                    onClose={this.props.onClosePopUp}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <ClaimLoan
                            key="show-claim-drawer-content"
                            smeLoan={this.props.smeLoan}
                            smeLoanTransactions={this.props.smeLoanTransactions}
                            smeDetails={this.props.smeDetails}
                            lastWithdrawalOrder={this.props.lastWithdrawalOrder}
                            onClose={this.props.onClosePopUp}
                        />
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

export default FlexLoanClaimPopUp;