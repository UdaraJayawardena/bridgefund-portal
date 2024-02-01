/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from "prop-types";
import withStyles from '@material-ui/core/styles/withStyles';
import GridItem from 'components/initiation/Grid/GridItem.jsx';
import GridContainer from 'components/initiation/Grid/GridContainer.jsx';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

import customInputStyle from "assets/jss/material-dashboard-react/components/customInputStyle.jsx";



// eslint-disable-next-line no-useless-escape
const NON_DIGIT = '/[^\d]/g';

class ProvisionParameters extends React.Component {
    state = {
        open: false,
        provisionParameters: []
    };

    changeValue = (val, obj, key) => {
        delete obj._id;

        const provisionParametersArr = this.props.provisionParameters;
        obj.standardProvisionPercentage = val;
        provisionParametersArr[key] = obj;
        this.setState({
            provisionParameters: provisionParametersArr
        });
        this.props.callChanges(provisionParametersArr);
    };

    render() {
        const { classes, provisionParameters } = this.props; 

        return (
            <div>
                <GridContainer>
                    {provisionParameters && provisionParameters.map((provision, key) => (
                        <GridItem xs={12} sm={12} md={12} key={'gi'+ key}>
                            <FormControl
                                className={classes.formControl}
                                key={'fc'+ key}
                                >
                                    <TextField
                                        type="number"
                                        label={provision.parameterName}
                                        id={provision.parameterName}
                                        key={key}
                                        value={provision.standardProvisionPercentage}
                                        name={provision.parameterName}
                                        
                                        onChange={(e) => this.changeValue(parseInt(e.target.value.toString().replace(NON_DIGIT, '')), provision, key)}
                                    />
                                </FormControl>
                        </GridItem>
                    ))}
                </GridContainer>
            </div>
        );
    }
}

ProvisionParameters.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(customInputStyle)(ProvisionParameters);