import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Button, DialogActions, DialogContent, TextField, DialogTitle } from '@material-ui/core';
import style from 'assets/jss/bridgefundPortal/views/crmChartsStyle';
import { displayNotification } from "store/initiation/actions/Notifier";
import { getPSD2DailyUpdates } from 'store/initiation/actions/CreditRiskOverview.action';

class GetPSD2DailyUpdatesPopUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            customerId: ''
        };
    }

    componentDidMount() {
        this.setState({
            customerId: this.props.customerId
        });
    }
    changeCustomerId = (event) => {
        this.setState({
            customerId: event.target.value
        });
    }

    getPSD2DailyUpdates = () => {
        this.props.handleChangeGetPSD2DailyUpdatesDialog();
        this.props.getPSD2DailyUpdates(this.state.customerId).then(
            (response) => {
                if (response) {
                    this.props.displayNotification('Process Get PSD2 Daily Updates Started!', 'success');
                }else{
                    this.props.displayNotification('Unexpected error occured! Please try again.', 'error');
                }
            }
        );
    }

    render() {
        const { classes } = this.props;
        const { customerId } = this.state;
        return (
            <>
                <DialogTitle id="confirmation-dialog-title">Get PSD2 Daily Updates</DialogTitle>
                <DialogContent>
                    <TextField
                        InputProps={{
                            className: classes.autoSuggestTextStyle
                        }}
                        InputLabelProps={{
                            className: classes.autoSuggestTextLabelStyle,
                            shrink: true,
                        }}
                        id="customerId"
                        value={customerId}
                        onChange={this.changeCustomerId}
                        fullWidth
                        label='Customer ID'
                        style={{ width: '70%' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" variant='contained' onClick={this.props.handleChangeGetPSD2DailyUpdatesDialog} >
                        Cancel
                    </Button>
                    <Button color="primary" variant='contained' onClick={this.getPSD2DailyUpdates} >
                        Process
                    </Button>
                </DialogActions>
            </>
        );
    }
}

GetPSD2DailyUpdatesPopUp.propTypes = {
    handleChangeGetPSD2DailyUpdatesDialog: PropTypes.func,
    customerId: PropTypes.string.isRequired,
    getPSD2DailyUpdates: PropTypes.func

};

const mapStateToProp = (/* state */) => ({

});

const mapDispatchToProps = (dispatch) => ({
    displayNotification: (message, type) => (dispatch(displayNotification(message, type))),
    getPSD2DailyUpdates: (customerId) => (dispatch(getPSD2DailyUpdates(customerId))),

});

// @ts-ignore
export default connect(mapStateToProp, mapDispatchToProps)(withStyles(style)(GetPSD2DailyUpdatesPopUp));