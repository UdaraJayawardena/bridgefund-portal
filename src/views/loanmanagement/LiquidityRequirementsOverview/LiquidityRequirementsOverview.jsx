import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";

import Card from "components/loanmanagement/Card/Card.jsx";
import CardBody from "components/loanmanagement/Card/CardBody.jsx";
import CardHeader from "components/loanmanagement/Card/CardHeader.jsx";
import GridContainer from 'components/loanmanagement/Grid/GridContainer.jsx';
import GridItem from 'components/loanmanagement/Grid/GridItem.jsx';
import Notifier from 'components/loanmanagement/Notification/Notifier';
import Button from 'components/loanmanagement/CustomButtons/Button';

import { TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import Radio from "@material-ui/core/Radio";
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

/* Components */
import LiquidityTableView from "components/loanmanagement/Liquidity/Table";
import LiquidityChartView from "components/loanmanagement/Liquidity/Chart";

import { calculateLiquidityOverview } from 'store/loanmanagement/actions/LiquidityOverview';

import customStyles from 'assets/jss/material-dashboard-react/customStyles';

const Requirements = {
  growthPortfolio: 0,
  averageDuration: 6,
  earlyRedemption: 0,
  overdue: 0,
  refinanced: 0,
  growthDuringRefinance: 0,
};

class LiquidityRequirementsOverview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      requirements: {
        ...JSON.parse(JSON.stringify(Requirements))
      },
      overviewData: null,
      startCalculation: false,
      displayType: 'table' // table | chart
    };

  }

  handleRequirementsChanges = (event) => {
    if (0 <= Number(event.target.value) && Number(event.target.value) <= 100) {
      const requirements = this.state.requirements;
      const item = event.target.id ? event.target.id : event.target.name;
      requirements[item] = event.target.value;
      this.setState({ ...requirements });
    }
  }

  clearRequirements = () => {
    const requirements = {
      ...JSON.parse(JSON.stringify(Requirements))
    };

    this.setState({ requirements });
  }

  calculateLiquidityData = () => {

    this.setState({
      startCalculation: true,
      overviewData: null
    }, () => {

      this.props.calculateLiquidityOverview({ ...this.state.requirements })
        .then((response) => {
          this.setState({
            overviewData: response.data,
            startCalculation: false
          });
        })
        .catch(() => {
          this.setState({ startCalculation: false, overviewData: null });
        });

    });

  }

  changeDisplayType = (event) => {
    this.setState({ displayType: event.target.value });
  }

  render() {

    const { classes } = this.props;

    const displayComponent = [];

    const displayWarning = [];

    if (this.state.overviewData) {
      displayComponent.push(this.state.displayType === "table" ? <LiquidityTableView overviewData={this.state.overviewData} /> : <LiquidityChartView overviewData={this.state.overviewData} />);

      if( this.state.overviewData.liquidityDate && 
        ( moment(this.state.overviewData.liquidityDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD') ) ) {
        displayWarning.push(<div>This overview based on {moment(this.state.overviewData.liquidityDate).format('DD-MM-YYYY')} date data</div>);
      }

    }

    return (
      <React.Fragment>
        <Notifier />

        <Card>

          <CardHeader color="info">
            <h4 className={classes.margin_None} >Liquidity Requirements Overview</h4>
          </CardHeader>

          <CardBody>

            <GridContainer>

              <GridItem xs={12} sm={12} md={12}></GridItem>

              <GridItem xs={12} sm={12} md={2} >
                <TextField
                  id="growthPortfolio"
                  name="growthPortfolio"
                  label="Growth Portfolio ( % )"
                  type="number"
                  fullWidth={true}
                  value={this.state.requirements.growthPortfolio}
                  className={classes.textField}
                  inputProps={{
                    min: "0",
                    max: "100"
                  }}
                  InputLabelProps={{ shrink: true, }}
                  onChange={this.handleRequirementsChanges}
                  disabled={true}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={2} >
                <FormControl className={classes.formControl} fullWidth={true}>
                  <InputLabel htmlFor="provision-category">Average Duration</InputLabel>
                  <Select
                    value={this.state.requirements.averageDuration}
                    onChange={this.handleRequirementsChanges}
                    id="averageDuration"
                    inputProps={{
                      name: 'averageDuration',
                      id: 'averageDuration',
                    }}
                    className={classes.selectEmpty}
                  >
                    <MenuItem value={6}>6 months</MenuItem>
                    <MenuItem value={9}>9 months</MenuItem>
                    <MenuItem value={12}>12 months</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem xs={12} sm={12} md={2} >
                <TextField
                  id="earlyRedemption"
                  name="earlyRedemption"
                  label="Early Redemption ( % )"
                  type="number"
                  fullWidth={true}
                  value={this.state.requirements.earlyRedemption}
                  className={classes.textField}
                  inputProps={{
                    min: "0",
                    max: "100"
                  }}
                  InputLabelProps={{ shrink: true, }}
                  onChange={this.handleRequirementsChanges}
                  disabled={true}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={2} >
                <TextField
                  id="overdue"
                  name="overdue"
                  label="Overdue ( % )"
                  type="number"
                  fullWidth={true}
                  value={this.state.requirements.overdue}
                  className={classes.textField}
                  inputProps={{
                    min: "0",
                    max: "100"
                  }}
                  InputLabelProps={{ shrink: true, }}
                  onChange={this.handleRequirementsChanges}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={2} >
                <TextField
                  id="refinanced"
                  name="refinanced"
                  label="Refinanced ( % )"
                  type="number"
                  fullWidth={true}
                  value={this.state.requirements.refinanced}
                  className={classes.textField}
                  inputProps={{
                    min: "0",
                    max: "100"
                  }}
                  InputLabelProps={{ shrink: true, }}
                  onChange={this.handleRequirementsChanges}
                  disabled={true}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={2} >
                <TextField
                  id="growthDuringRefinance"
                  name="growthDuringRefinance"
                  label="Growth Loan During Refinance ( % )"
                  type="number"
                  fullWidth={true}
                  value={this.state.requirements.growthDuringRefinance}
                  className={classes.textField}
                  inputProps={{
                    min: "0",
                    max: "100"
                  }}
                  InputLabelProps={{ shrink: true, }}
                  onChange={this.handleRequirementsChanges}
                  disabled={true}
                />
              </GridItem>

              <GridItem xs={null} sm={null} md={3} ></GridItem>
              <GridItem xs={null} sm={null} md={3} ></GridItem>
              <GridItem xs={null} sm={null} md={3} ></GridItem>
              <GridItem xs={null} sm={null} md={3} >
                <Button className={classes.actionButtons} color="info" onClick={this.calculateLiquidityData} disabled={this.state.startCalculation} >Calculate</Button>
                <Button className={classes.actionButtons} onClick={this.clearRequirements} >Clear</Button>
              </GridItem>

              <GridItem xs={12} sm={12} md={12}></GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <FormControl component="fieldset">
                  <RadioGroup aria-label="chartType" name="chartType" row value={this.state.displayType} onChange={this.changeDisplayType}>
                    <FormControlLabel value="table" control={<Radio />} label="Table" labelPlacement="end" />
                    <FormControlLabel value="chart" control={<Radio />} label="Chart" labelPlacement="end" />
                  </RadioGroup>
                </FormControl>
              </GridItem>
              <GridItem xs={null} sm={null} md={3}>{displayWarning}</GridItem>
              <GridItem xs={null} sm={null} md={3}></GridItem>
              <GridItem xs={null} sm={null} md={3}></GridItem>

            </GridContainer>

            {displayComponent}

            {/* {
              this.state.overviewData ?

                <GridContainer>

                  <Table className={classes.table}>
                    <TableHead >
                      <TableRow key={'tasks_header_description'} >
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell colSpan={12} align={'center'}>End of Month : </TableCell>
                      </TableRow>
                      <TableRow key={'tasks_header'} >
                        <TableCell
                          key={0}
                          align={'center'}
                          padding={'none'}
                          style={{ width: '8%' }}
                        >Details</TableCell>
                        <TableCell
                          key={0}
                          align={'center'}
                          padding={'none'}
                          style={{ width: '6.5%' }}
                        >On Start Date</TableCell>
                        {
                          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) =>
                            (<TableCell key={i} align={'center'} padding={'none'} style={{ width: '6.5%' }} >{`${i}`}</TableCell>))
                        }
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <LiquidityTableView overviewData={this.state.overviewData} />
                    </TableBody>
                  </Table>

                </GridContainer>

                : null
            } */}



          </CardBody>

        </Card>

      </React.Fragment>
    );
  }
}

LiquidityRequirementsOverview.propTypes = {
  classes: PropTypes.object,
  calculateLiquidityOverview: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({

});

const bindActions = (dispatch, actionMethod) => {
  return (params) =>
    new Promise((resolve, reject) =>
      dispatch(actionMethod(params))
        .then(response => resolve(response))
        .catch(error => reject(error))
    );
};

const mapDispatchToProps = dispatch => {
  return {
    calculateLiquidityOverview: bindActions(dispatch, calculateLiquidityOverview)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(customStyles)(LiquidityRequirementsOverview));
