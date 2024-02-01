import { Drawer } from '@material-ui/core';
import React, { Component } from 'react';
import GeneratePaymentRequest from 'views/loanmanagement/GeneratePaymentRequest/GeneratePaymentRequest';

class FixedLoanGeneratePaymentOrderDrawer extends Component {
    render() {
        const { open, toggleDrawer, tikkieDrawerData } = this.props;
        return (
            <>
                <Drawer
                    id="generate-payment-request-drawer"
                    anchor="bottom"
                    open={open}
                    onClose={toggleDrawer('generatePaymentRequest', 'bottom', false)}
                >
                    <div
                        tabIndex={0}
                        role="button"
                    >
                        <GeneratePaymentRequest key="generate-payment-request-drawer-content" tikkieData={tikkieDrawerData} />
                        {/* <TemporaryLoanStop toggleDrawer={this.toggleDrawer('temporaryLoanStop', 'bottom', false)} selectedLoan={this.props.loan} /> */}
                    </div>
                </Drawer>
            </>
        );
    }
}

export default FixedLoanGeneratePaymentOrderDrawer;