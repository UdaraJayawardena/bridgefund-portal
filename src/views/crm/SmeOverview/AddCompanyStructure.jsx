import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
// import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';
import GridItem from 'components/crm/Grid/GridItem';
import CustomInputBox from 'components/crm/CustomInput/CustomInputBox';
import CustomSearch from 'components/crm/CustomInput/CustomSearch';
import GridContainer from 'components/crm/Grid/GridContainer';
import { Typography, Button, Grid } from '@material-ui/core';
import { cloneDeep } from 'lodash';
import { CompanyStructureConstants, CustomerConstants, CommonConstants } from 'constants/crm/index';

import { getCustomerAddressContact } from 'store/crm/actions/SmeOverview.action';
import { CUDCompanyStructure } from 'store/crm/actions/CompanyStructureOverview.action';
import Style from 'assets/jss/bridgefundPortal/views/customerDashboardStyles';

class AddCompanyStructure extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			smiDaughter: cloneDeep(CustomerConstants.emptyObj),
			smeMother: cloneDeep(CustomerConstants.emptyObj),
			companyStructure: cloneDeep(CompanyStructureConstants.emptyObj),
			isLoading: false,
		};
	}

	handleChange = (name, value, componentName) => {
		const _state = {};

		if (componentName) {
			const component = cloneDeep(this.state[componentName]);
			component[name] = value;
			_state[componentName] = component;
		}
		else {
			_state[name] = value;
		}

		this.setState(_state);
	};

	handleOnSmiDaughterSearchResult = (result) => {
		if (result && typeof result !== 'string') {
			this.props.getCustomerAddressContact(result.id);
		}
	}

	handleOnSmeMotherSearchResult = async (result) => {
		if (result && typeof result !== 'string') {
			const response = await this.props.getCustomerAddressContact(result.id, null, 'yes', true);
			this.state.smeMother = response.customer;
		}
	}

	confirmCompanyStructureSave = () => {

		const companyStructure = cloneDeep(this.state.companyStructure);

		companyStructure.customerIdDaughter = this.props.selectedCustomer._id;
		companyStructure.customerIdMother = this.state.smeMother._id;
		companyStructure.dataSource = CommonConstants.dataSource.CRM;
		
		const requestData = {
			"companyStructures": {
				"data": [
					companyStructure
				]
			}
		};

		this.setState({ isLoading: true });

		this.props.CUDCompanyStructure(requestData)
			.then(response => this.props.onSave(response.companyStructures))
			.catch(() => { /*  */ })
			.finally(() => {
				// this.setState({ isLoading: false }
			});
		this.props.onClose();
	}

	render() {
		const { classes } = this.props;

		return (
			<>
				<div className={classes.personOverviewHeader}>
					<Typography className={classes.textFieldStyle}>Add Company Stucture</Typography>
				</div>
				<GridContainer >
					<GridItem className={classes.doubleBox}>
						<CustomSearch
							id='smidaughter'
							label='Smi Daughter'
							placeholder='Smi Daughter'
							changeToFormatType='CamelCase'
							name='legalName'
							value={this.props.selectedCustomer.legalName}
							onSearchResult={this.handleOnSmiDaughterSearchResult}
							onChange={(name, value) => this.handleChange(name, value, 'smiDaughter')}
							asyncSearchType='customer'
						/>
					</GridItem>
					<GridItem className={classes.doubleBox}>
						<CustomSearch
							id='smemother'
							label='Sme Mother'
							placeholder='Sme Mother'
							changeToFormatType='CamelCase'
							name='legalName'
							value={this.state.smeMother.legalName}
							onSearchResult={this.handleOnSmeMotherSearchResult}
							onChange={(name, value) => this.handleChange(name, value, 'smeMother')}
							asyncSearchType='customer'
							SearchOptions={{
								criteria: 'out',
								customerId: this.props.selectedCustomer._id
							}}
						/>
					</GridItem>
					<GridItem className={classes.doubleBox}>
						<CustomInputBox
							type='dropdown'
							id='board-member'
							label='Board Member'
							placeholder='Board Member'
							name='boardMemberIndicator'
							value={this.state.companyStructure.boardMemberIndicator}
							onChange={(name, value) => this.handleChange(name, value, 'companyStructure')}
							dropDownValues={Object.keys(CompanyStructureConstants.isBoardMember).map(key => { return { key: key, value: CompanyStructureConstants.isBoardMember[key] }; })}
						/>
					</GridItem>
					<GridItem className={classes.doubleBox}>
						<CustomInputBox
							id='share'
							label='Share'
							placeholder='100%'
							type='percentage'
							value={this.state.companyStructure.companyShare}
							name='companyShare'
							onChange={(name, value) => this.handleChange(name, value, 'companyStructure')}
						/>
					</GridItem>

				</GridContainer>
				<Grid
					justify="flex-end"
					container
				>
					<Grid item >
						<Button
							variant="outlined"
							className={classes.cancelIconButton}
							onClick={this.props.onClose}
						>Cancel</Button>
						<Button
							variant='contained'
							className={classes.confirmIconButton}
							disabled={this.state.disabled} 
							onClick={this.confirmCompanyStructureSave}
						>Create</Button>
					</Grid>
				</Grid>
			</>
		);
	}
}
AddCompanyStructure.defaultProps = {
};

AddCompanyStructure.propTypes = {
	classes: PropTypes.object.isRequired,
	origin: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	selectedCustomer: PropTypes.object,
	getCustomerAddressContact: PropTypes.func,
	CUDCompanyStructure: PropTypes.func,
	onSave: PropTypes.func,
};

const mapStateToProps = (state) => ({
	selectedCustomer: state.lmglobal.selectedCustomer
});

const mapDispatchToProps = (dispatch) => ({
	CUDCompanyStructure: (requestBody) => dispatch(CUDCompanyStructure(requestBody)),
	getCustomerAddressContact: (customerId, legalName, activeIndicatior, isNotSelected) => dispatch(getCustomerAddressContact(customerId, legalName, activeIndicatior, isNotSelected)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(Style)(AddCompanyStructure));
