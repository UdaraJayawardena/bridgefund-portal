import React, { Component } from 'react';
import { Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import Button from 'components/initiation/CustomButtons/Button';
import ConfirmationDialog from 'components/loanmanagement/ConfirmationDialog/ConfirmationDialog';

class FlexLoanStartRevisionPopUp extends Component {
    render() {
        return (
            <>
                {/* revision consfirminig dialog */}
                <Dialog
                    id="approve-revision-confirm-dialog"
                    open={this.props.isOpenRevision}
                    aria-labelledby="alert-dialog-start-revision-confirm-dialog"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-start-revision-confirmation">
                        {"Are you sure you want this loan to be revisioned?"}
                    </DialogTitle>
                    <DialogActions>
                        <Button id="start-revision-confirm-dialog-cancel-button" onClick={() => this.props.onCloseRevision()} color="danger">
                            No
                        </Button>
                        <Button id="start-revision-confirm-dialog-ok-button" onClick={() => this.props.onConfirmRevision()} color="info" autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* revision type consfirm dialog */}

                <Dialog
                    id="approve-revision-final-confirm-dialog"
                    open={this.props.isOpenRevisionTypeConfirmation}
                    aria-labelledby="alert-dialog-start-revision-confirm-dialog"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-approve-revision-confirmation">
                        {this.props.isApprovedRevisionStageTwo ? "You already approved / disapproved this revision; ask you colleague to do the approval" : "Are you sure you want this loan to be approved?"}
                    </DialogTitle>

                    <DialogActions>
                        <Button id="approve-revision-confirm-dialog-cancel-button" onClick={() => this.props.onCloseRevisionTypeConfirmation()} color="danger">
                            Cancel
                        </Button>
                        <Button disabled={this.props.taskId === '' || this.props.isApprovedRevisionStageTwo ? true : false}
                            id="approve-revision-confirm-dialog-ok-button"
                            onClick={() => this.props.onConfirmRevisionTypeConfirmation('approved')}
                            color={this.props.taskId === '' || this.props.isApprovedRevisionStageTwo ? "secondary" : "info"} autoFocus>
                            APPROVE
                        </Button>
                        <Button disabled={this.props.taskId === '' || this.props.isApprovedRevisionStageTwo ? true : false}
                            id="disapprove-revision-confirm-dialog-ok-button"
                            onClick={() => this.props.onConfirmRevisionTypeConfirmation('disApproved')}
                            color={this.props.taskId === '' || this.props.isApprovedRevisionStageTwo ? "secondary" : "info"} autoFocus>
                            DISAPPROVE
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* revision final confirm dialog */}

                <ConfirmationDialog
                    title={this.props.revisionAction === "approved" ? 'Are you sure you want this loan to be approved?' : 'Are you sure you want this loan to be disapproved?'}
                    cancel='NO'
                    ok='YES'
                    open={this.props.isOpenRevisonFinalConfirmation}
                    handleOk={() => this.props.onConfirmRevisonFinalConfirmation()}
                    handleCancel={() => this.props.onCloseRevisonFinalConfirmation()} />
            </>
        );
    }
}

export default FlexLoanStartRevisionPopUp;