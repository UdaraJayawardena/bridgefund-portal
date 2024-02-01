import React, { Component } from 'react';
import { connect } from 'react-redux';
import SingleFixedLoanOverview from 'views/loanmanagement/SingleLoanOverview';
import SingleFlexLoanOverview from 'components/loanmanagement/FlexLoans/SingleFlexLoanOverview';

class LoanOverviewGateway extends Component {
    constructor(props) {
        super(props);
        this.state = { lmContractType: '' };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.lmContractType !== prevState.lmContractType)
            return {
                lmContractType: nextProps.lmContractType
            };
        return null;
    }


    render() {
        const { lmContractType } = this.state;
        // console.log('state in render ', this.state);
        return (
            <React.Fragment>
                {lmContractType === 'flex-loan' &&
                    <SingleFlexLoanOverview />}
                {lmContractType === 'fixed-loan' &&
                    <SingleFixedLoanOverview />
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        lmContractType: state.lmglobal.selectedLoan.type,
    };
};

const mapDispatchToProps = (/* dispatch */) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoanOverviewGateway);

