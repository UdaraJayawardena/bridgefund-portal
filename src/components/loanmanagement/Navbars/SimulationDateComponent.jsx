/* eslint-disable no-nested-ternary */
import moment from 'moment';
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from 'react-redux';
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
// core components
import headerStyle from "assets/jss/material-dashboard-react/components/headerStyle.jsx";

import { getSimulationDate } from "store/loanmanagement/actions/Configuration.action";
import { IconButton, Grid } from '@material-ui/core';
import { Replay } from '@material-ui/icons';

class SimulationDateComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };
    }

    componentDidMount() {
        this.reloadSimulationDate();
    }

    simulationDate = () => {
        if (process.env.REACT_APP_ENVIRONMENT !== 'production') {

            const view = this.props.configurations.simulations.systemDate ?

                (
                    this.props.configurations.simulations.isWorkingDate ?
                        ` ${moment(this.props.configurations.simulations.systemDate).format('DD-MM-YYYY')}` :
                        ` ${moment(this.props.configurations.simulations.systemDate).format('DD-MM-YYYY')} ( Not a working date! )`
                )

                :
                'Simulation date not found !';

            return view;

        }

        return null;
    }

    reloadSimulationDate = () => {

        if (!this.state.loading) {
            this.setState({ loading: true }, () => {
                return this.props.getSimulationDate()
                    .finally(() => this.setState({ loading: false }));
            });
        }
    }

    render() {

        const { configurations } = this.props;

        return (
            (process.env.REACT_APP_ENVIRONMENT !== 'production') &&
            <Grid container justifyContent="flex-end">
                <Grid item style={{ alignSelf: 'center' }}>
                    <IconButton
                        size="small"
                        aria-label="SimulationDate"
                        onClick={this.reloadSimulationDate}                    >
                        <Replay fontSize="small" style={configurations.simulations.systemDate ? { color: 'inherit' } : { color: 'red' }} />
                    </IconButton>
                </Grid>
                <Grid item>
                    <p style={configurations.simulations.systemDate ? { color: 'inherit' } : { color: 'red' }}>{this.simulationDate()}</p>
                </Grid>
            </Grid>

        );
    }

}

SimulationDateComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    configurations: PropTypes.object.isRequired,
    getSimulationDate: PropTypes.func.isRequired,
};

const mapStateToProp = state => ({
    configurations: state.configurations
});

const mapDispatchToProps = (dispatch) => ({
    getSimulationDate: () => dispatch(getSimulationDate())
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(headerStyle)(SimulationDateComponent));