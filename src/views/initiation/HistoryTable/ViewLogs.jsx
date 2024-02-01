/* eslint-disable no-nested-ternary */
// import React from "react";
import React from 'react';

import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
/**************/

import { Button } from "@material-ui/core";

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import { connect } from 'react-redux';

class ViewLogs extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

        };
    }


    render() {
        const { classes, logData } = this.props;

        if (logData !== undefined || logData.length !== 0) {

            return (<div className={classes.container}>
                <ul>
                    {logData.map((data, index) => (
                        <li key={index}>{data.logData.error}</li>
                    ))}
                </ul>
                <div className={classes.canselButtonWrappers}>
                    <Button variant='contained' className={classes.blueIconButton} onClick={this.props.onClose}>CANCEL</Button>
                </div>
            </div>);

        }
        return null;

    }
}

ViewLogs.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    logData: PropTypes.array
};

const mapStateToProps = () => {
    return {
    };
};

const mapDispatchToProps = () => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(dashboardStyle)(ViewLogs));

