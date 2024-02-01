
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import Style from "assets/jss/material-dashboard-react/views/requestSmeLoanStyles";
import Button from 'components/initiation/CustomButtons/Button.jsx';
import Card from 'components/initiation/Card/Card';
import CardBody from "components/initiation/Card/CardBody";
import GridContainer from "components/initiation/Grid/GridContainer";
import GridItem from "components/initiation/Grid/GridItem";
import parse from 'html-react-parser';



class ViewContract extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const { classes , selectedContract} = this.props;

    return (

      <div>
        <Card>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <div>{selectedContract === undefined || selectedContract.length === 0 ? '' : parse(selectedContract.html)}</div>
                <div className={classes.requestButton}>
                  <Button color="danger" size="sm" onClick={this.props.onClose} >Cancel</Button>
                </div>
              </GridItem>
            </GridContainer>
          </CardBody>
        </Card>
       
      </div>
    );
  }
}

ViewContract.propTypes = {
  classes: PropTypes.object,
  selectedContract: PropTypes.object,
  onClose: PropTypes.func
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
)(withStyles(Style)(ViewContract));
