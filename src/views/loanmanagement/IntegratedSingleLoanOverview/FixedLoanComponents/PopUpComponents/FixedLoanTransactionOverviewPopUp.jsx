import { Dialog, DialogContent } from '@material-ui/core';
import React, { Component } from 'react';
import TransactionOverviewReport from 'views/loanmanagement/SingleLoanOverview/TransactionOverviewReport';

class FixedLoanTransactionOverviewPopUp extends Component {
    render() {

        const { open, closeTransactionOverview, html, smeLoan, pdf } = this.props;
        return (
            <>
                <Dialog
                    id="transaction-overview-drawer"
                    fullWidth
                    maxWidth={'lg'}
                    open={open}
                    onClose={() => closeTransactionOverview()}
                    style={{ margin: 0 }}
                >
                    <DialogContent>
                        <TransactionOverviewReport
                            key="transaction-overview-drawer-content"
                            pdfData={html}
                            smeLoan={smeLoan}
                            onClose={() => closeTransactionOverview()}
                            decodedData={pdf}
                        />
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

export default FixedLoanTransactionOverviewPopUp;