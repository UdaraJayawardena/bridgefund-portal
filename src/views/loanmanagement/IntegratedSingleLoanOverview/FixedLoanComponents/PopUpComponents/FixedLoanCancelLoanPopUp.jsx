import { Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import Button from 'components/initiation/CustomButtons/Button';
import React, { Component } from 'react';

class FixedLoanCancelLoanPopUp extends Component {
    render() {
        const { isOpenLoanCancelModel, showCancelSmeLoanModal, handleCancelLoanRequest } = this.props;
        return (
            <>
                <Dialog id="cancel-loan-confirm-drawer" open={isOpenLoanCancelModel} onClose={showCancelSmeLoanModal} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Are you sure to cancel this loan</DialogTitle>
                    <DialogActions>
                        <Button id="cancel-loan-confirm-drawer-back-button" onClick={showCancelSmeLoanModal}>
                            back
                        </Button>
                        <Button id="cancel-loan-confirm-drawer-confirm-button" onClick={handleCancelLoanRequest}>
                            confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default FixedLoanCancelLoanPopUp;