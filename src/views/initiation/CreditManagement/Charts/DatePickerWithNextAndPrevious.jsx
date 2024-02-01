// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Grid, IconButton, Tooltip, Box } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';


class DatePickerWithNextAndPrevious extends Component {

    constructor(props) {
        super(props);
        this.state = {
            overviewDate: this.props.overviewDate
        };
    }

    handleButtonClick = (buttonType) => {
        if (buttonType === 'previous') {
            this.setState(prevOverviewDate => ({ overviewDate: moment(prevOverviewDate.overviewDate).add(-1, 'days') }),
                () => this.props.getDataByDateAndIbans(this.state.overviewDate));
        }
        if (buttonType === 'next') {
            this.setState(prevOverviewDate => ({ overviewDate: moment(prevOverviewDate.overviewDate).add(1, 'days') }),
                () => this.props.getDataByDateAndIbans(this.state.overviewDate));
        }
    }

    render() {
        const { overviewDate } = this.state;
        return (
            <>
                <Grid container
                    direction="row"
                    justifycontent="center"
                    alignItems="center"
                    spacing={1}
                >
                    <Grid item >
                        <p>Description </p>
                    </Grid>
                    <Grid item>
                        <Tooltip placement="top" title="Pervious Day" arrow>
                            <IconButton aria-label="left" size="small" onClick={() => this.handleButtonClick('previous')}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Box component="span" sx={{ p: 0.5, border: '1px solid', borderRadius: '5px' }}>
                            {moment(overviewDate).format("DD-MM-YYYY")}
                        </Box>
                    </Grid>
                    <Grid item>
                        <Tooltip placement="top" title="Next Day" arrow>
                            <IconButton aria-label="right" size="small" onClick={() => this.handleButtonClick('next')}>
                                <ChevronRightIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>

                </Grid>
            </>
        );
    }
}

DatePickerWithNextAndPrevious.propTypes = {
    getDataByDateAndIbans: PropTypes.func,
    overviewDate: PropTypes.string,

};

export default DatePickerWithNextAndPrevious;