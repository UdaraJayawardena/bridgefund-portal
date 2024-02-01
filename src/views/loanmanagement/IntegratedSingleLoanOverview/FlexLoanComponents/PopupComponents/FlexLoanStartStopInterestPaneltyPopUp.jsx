import { Dialog, DialogTitle, DialogActions, DialogContent, RadioGroup, DialogContentText, FormControlLabel, Radio } from '@material-ui/core';
import Button from 'components/initiation/CustomButtons/Button';
import React, { Component } from 'react';

class FlexLoanStartStopInterestPaneltyPopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sendMessage: 'no'
        };
    }

    setStateAndRunCallback = (val) => {
        this.setState(val, () => {
            this.props.toCallBack(this.state);
        });
    }

    render() {
        const { open, handleStartStopInterestPaneltyScreen, indicaterStatus, changeInterestPaneltyStatus } = this.props;
  
        return (
            <>
                <Dialog id="start-stop-loan-confirm-drawer" open={open} onClose={() => handleStartStopInterestPaneltyScreen(false)} aria-labelledby="form-dialog-title">
                   { (indicaterStatus === 'not-applicable' ||  indicaterStatus === 'stopped') ? 
                   <DialogTitle id="form-dialog-title">Do you want to START Interest penalty?</DialogTitle> : 
                    <DialogTitle id="form-dialog-title">Do you want to STOP Interest penalty?</DialogTitle>}
                    {indicaterStatus === 'active' ? null :
                    <DialogContent >
                        <DialogContentText>Do you want to notify via an email ?</DialogContentText>
                        <RadioGroup aria-label="chartType" name="chartType" row value={this.state.sendMessage} onChange={(e) => this.setStateAndRunCallback({ sendMessage: e.target.value })}>
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" labelPlacement="end" />
                            <FormControlLabel value="no" control={<Radio />} label="No" labelPlacement="end" />
                        </RadioGroup>
                    </DialogContent>
                    }
                    <DialogActions>
                        <Button id="start-stop-loan-confirm-drawer-back-button" onClick={() => handleStartStopInterestPaneltyScreen(false)}>
                        CANCEL 
                        </Button>
                        { (indicaterStatus === 'stopped' || indicaterStatus === 'not-applicable' ) ? 
                        <Button id="start-stop-loan-confirm-drawer-confirm-button" onClick={() => changeInterestPaneltyStatus()}>
                        START
                        </Button>:
                         <Button id="start-stop-loan-confirm-drawer-confirm-button" onClick={() => changeInterestPaneltyStatus()}>
                         STOP
                     </Button>
                        }
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default FlexLoanStartStopInterestPaneltyPopUp;