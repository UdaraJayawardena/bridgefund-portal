import React from 'react';
import PropTypes from "prop-types";
import withStyles from '@material-ui/core/styles/withStyles';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField';

import customInputStyle from "assets/jss/material-dashboard-react/components/customInputStyle.jsx";

const NON_DIGIT = '/[^\\d]/g';

class ProvisionParameters extends React.Component {
	state = {
		open: false,
		provisionParameters: []
	};

	changeValue = (val, obj, key) => {
		delete obj._id

		let provisionParametersArr = this.props.provisionParameters
		obj.standardProvisionPercentage = val
		provisionParametersArr[key] = obj
		this.setState({
			provisionParameters: provisionParametersArr
		});
		this.props.callChanges(provisionParametersArr)
	};

	render() {
		const { classes, provisionParameters } = this.props

		return (
			<div>
				<GridContainer>
					{provisionParameters && provisionParameters.map((provision, key) => {
						if (provision) {

							return (
								<GridItem xs={12} sm={12} md={12} key={'gi' + key}>
									<FormControl
										className={classes.formControl}
										key={'fc' + key}
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
							)
						}
						else {
							return null;
						}
					})}
				</GridContainer>
			</div>
		)
	}
}

ProvisionParameters.propTypes = {
	classes: PropTypes.object.isRequired,
	provisionParameters: PropTypes.array,
	refresh: PropTypes.func,
	callChanges: PropTypes.func,
};

export default withStyles(customInputStyle)(ProvisionParameters);