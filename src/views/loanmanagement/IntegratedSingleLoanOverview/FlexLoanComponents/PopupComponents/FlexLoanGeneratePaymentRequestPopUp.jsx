import { Drawer } from '@material-ui/core';
import React, { Component } from 'react';
import GeneratePaymentRequest from 'views/loanmanagement/GeneratePaymentRequest/GeneratePaymentRequest';

class FlexLoanGeneratePaymentRequestPopUp extends Component {
    render() {
        return (
            <>
                <Drawer
                    id="generate-payment-request-drawer"
                    anchor="bottom"
                    open={this.props.open}
                    onClose={this.props.onClosePopUp}
                >
                    <div
                        tabIndex={0}
                        role="button"
                    >
                        <GeneratePaymentRequest key="generate-payment-request-drawer-content" tikkieData={this.props.tikkieDrawerData} />
                    </div>
                </Drawer>

            </>
        );
    }
}

export default FlexLoanGeneratePaymentRequestPopUp;