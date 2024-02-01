import { Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import Button from 'components/initiation/CustomButtons/Button';
import React, { Component } from 'react';

class StartFlexLoanPopUp extends Component {
    render() {
        return (
            <Dialog
                id="start-flex-loan-confirm-dialog"
                open={this.props.open}
                //onClose={() => this.handleActiveLoanStopCountDialogLaunch(false)}
                aria-labelledby="alert-dialog-start-flex-loan-confirm-dialog"
                aria-describedby="alert-start-flex-loan-confirm-dialog-description"
            >
                <DialogTitle id="alert-dialog-start-flex-loan-confirmation">
                    {"Are you sure to start this loan?"}
                </DialogTitle>
                <DialogActions>
                    <Button id="start-flex-loan-confirm-dialog-cancel-button" onClick={this.props.onClosePopUP} color="danger">
                        No
                    </Button>
                    <Button id="start-flex-loan-confirm-dialog-ok-button" onClick={this.props.onConfirmPopUp} color="info" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default StartFlexLoanPopUp;