import React, {Component} from 'react';
import {connect} from 'react-redux';

class CheckLoginStatus extends Component {

  render() {
    return (
      <div>

      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
)(CheckLoginStatus);
