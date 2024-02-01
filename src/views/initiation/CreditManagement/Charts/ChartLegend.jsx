import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';

const BalanceAmountCheckbox = withStyles({
    root: {
        color: 'blue',
        '&$checked': {
            color: 'blue',
        },
    },
    checked: {},
})((props) => <Checkbox color="default" {...props} />);

const IncomingAmountCheckbox = withStyles({
    root: {
        color: 'green',
        '&$checked': {
            color: 'green',
        },
    },
    checked: {},
})((props) => <Checkbox color="default" {...props} />);

const OutgoingAmountCheckbox = withStyles({
    root: {
        color: 'orange',
        '&$checked': {
            color: 'orange',
        },
    },
    checked: {},

})((props) => <Checkbox color="default" {...props} />);

const DDAmountCheckbox = withStyles({
    root: {
        color: 'black',
        '&$checked': {
            color: 'black',
        },
    },
    checked: {},
})((props) => <Checkbox color="default" {...props} />);

class ChartLegend extends Component {


    render() {
        const { handleLegendChange, legends } = this.props;

        // console.log('legends in child ', legends);
        return (
            <FormGroup row style={{ marginRight: 100 }}>
                <FormControlLabel
                    style={{
                        textDecoration: 'underline',
                        textDecorationColor: 'green',
                    }}
                    control={<IncomingAmountCheckbox checked={legends.find(legend => legend === 'IncomingAmountCheckbox') ? true : false} onChange={(e) => handleLegendChange('IncomingAmountCheckbox', e)} name="IncomingAmountCheckbox" />}
                    label="Incoming Amount"
                />
                <FormControlLabel
                    style={{
                        textDecoration: 'underline',
                        textDecorationColor: 'orange',
                    }}
                    control={<OutgoingAmountCheckbox checked={legends.find(legend => legend === 'OutgoingAmountCheckbox') ? true : false} onChange={(e) => handleLegendChange('OutgoingAmountCheckbox', e)} name="OutgoingAmountCheckbox" />}
                    label="Outgoing Amount"
                />
                <FormControlLabel
                    style={{
                        textDecoration: 'underline',
                        textDecorationColor: 'blue',
                    }}
                    control={<BalanceAmountCheckbox checked={legends.find(legend => legend === 'BalanceAmountCheckbox') ? true : false} onChange={(e) => handleLegendChange('BalanceAmountCheckbox', e)} name="BalanceAmountCheckbox" />}
                    label="Balance Amount"
                />
                <FormControlLabel
                    style={{
                        textDecoration: 'underline',
                        textDecorationColor: 'black',
                    }}
                    control={<DDAmountCheckbox checked={legends.find(legend => legend === 'DDAmountCheckbox') ? true : false} onChange={(e) => handleLegendChange('DDAmountCheckbox', e)} name="DDAmountCheckbox" />}
                    label="DD Amount"
                />
            </FormGroup>
        );
    }
}

export default ChartLegend;