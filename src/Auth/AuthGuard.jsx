import qs from "querystring";
import PropTypes from 'prop-types';
import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { login } from 'store/initiation/actions/login';
import { connect } from "react-redux";
import { Backdrop, CircularProgress } from "@material-ui/core";
import Cookies from 'universal-cookie';

const cookies = new Cookies();
class AuthGuard extends Component {

  constructor(props) {
    super(props);

    this.checkToken();

    this.state = {
      showScreen: false,
      authenticated: false,
    };
  }


  checkToken = () => {
    const search = window.location.search !== "" ? qs.parse(window.location.search.slice(1)) : qs.parse(window.location.search);

    const session = cookies.get('session-token');

    const redirectUrl = window.location.pathname + '?' + qs.stringify(search);

    if (session) {
      this.props.login({ token: session }).then(() => {
        // setTimeout(() => {
        this.getDerivedStateFromProps();
        this.props.history.push(redirectUrl);
        // }, 5000);
      }).catch(() => {/*  */ });
    }
  };

  componentDidMount () {
    if (!cookies.get('session-token')) {
      this.getDerivedStateFromProps();
      this.redirectRoute(this.props);
    }
  }

  componentDidUpdate () {
    if (!this.state.showScreen && !this.state.authenticated) {
      this.getDerivedStateFromProps();
      this.redirectRoute(this.props);
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextState.showScreen !== this.state.showScreen || nextState.authenticated !== this.state.authenticated;
  }

  getDerivedStateFromProps = () => {
    const { location } = this.props;
    const { search } = location;
    const searchJson = search !== "" ? qs.parse(search.slice(1)) : qs.parse(search);

    let showScreen = false;

    const sessionToken = cookies.get('session-token');
    const authenticated = showScreen = sessionToken !== null;

    showScreen = searchJson.token === undefined;

    this.setState({ showScreen, authenticated });
  }

  redirectRoute (props) {
    const { location, history } = props;
    const { pathname, search } = location;

    history.push({
      pathname: "/login",
      state: { redirectUrl: pathname + search }
    });
  }

  loadingScreen = () => {
    return (
      <Backdrop open>
        <CircularProgress />
      </Backdrop>
    );
  };

  render () {
    const { children } = this.props;
    const { showScreen } = this.state;
    return showScreen ? <Fragment>{children}</Fragment> : this.loadingScreen();
  }
}


AuthGuard.propTypes = {
  children: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.object]),
  location: PropTypes.object.isRequired,
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  login: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  login: (params) => dispatch(login(params)),
});

export default withRouter(connect(null, mapDispatchToProps)(AuthGuard));
