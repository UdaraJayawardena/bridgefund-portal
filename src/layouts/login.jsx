import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";

import withStyles from '@material-ui/core/styles/withStyles';
import Notifier from "components/initiation/Notification/Notifier.jsx";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import { login } from 'store/initiation/actions/login';

import { isNullOrEmpty } from 'lib/initiation/utility';
import { createStyles } from '@material-ui/styles';
import { rembemberMe, decriptRembemberMe } from '../lib/initiation/userPermission';
import { CircularProgress } from '@material-ui/core';
import ENV from '../config/env';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

// @ts-ignore
const encryptor = require('simple-encryptor')(ENV.ENCRYPTION_KEY);

const useStyles = createStyles({
  paper: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: '1px',
    backgroundColor: "#04decf",
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: "1px",
  },
  submit: {
    margin: "3px 0 2px",
    backgroundColor: "#34d1c2",
    '&:hover': {
      background: "#26beaf",
    }
  },
});

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      password: "",
      errorUserName: "",
      errorPassword: "",
      isLogin: false,
      isLoadingLoginRequest: false,
      rememberMe: false
    };
  }

  handleChange = event => {
    switch (event.target.name) {
      case "userName":
        this.setState({ [event.target.name]: event.target.value, errorUserName: "" });
        break;
      case "password": {
        this.setState({ [event.target.name]: event.target.value, errorPassword: "" });
        break;
      }
      case "rememberMe": {
        this.setState({ [event.target.name]: event.target.checked });
        break;
      }
      default:
        this.setState({ [event.target.name]: event.target.value });
        break;
    }
  };

  componentDidMount() {
    const avilableUserCredintials = decriptRembemberMe();
    if (avilableUserCredintials && avilableUserCredintials.expired > Date.now()) {
      this.setState({ userName: avilableUserCredintials.userName, password: avilableUserCredintials.password, rememberMe: avilableUserCredintials.rememberMe });
    }
  }

  handleSignIn = () => {
    let errorUserName = '';
    let errorPassword = '';
    if (this.state.userName === '') {
      errorUserName = "Username is required.";
    }

    if (this.state.password === '') {
      errorPassword = "Password is required.";
    }

    if (errorUserName !== '' || errorPassword !== '') {
      return this.setState({ errorUserName: errorUserName, errorPassword: errorPassword });
    }
    // eslint-disable-next-line no-else-return
    else {
      this.setState({ isLoadingLoginRequest: true });
      const loginDetails = {
        userName: this.state.userName,
        password: this.state.password
      };
      if (this.state.rememberMe) {
        const rememberMeObj = {
          rememberMe: this.state.rememberMe,
          userName: this.state.userName,
          password: this.state.password,
          expired: Date.now() + (60 * 60 * 24 * 30)
        };

        this.saveCredentials(rememberMeObj);

      }

      this.props.login(loginDetails)
        .then((token) => {
          if (!isNullOrEmpty(token)) {
            const userRoutes = encryptor.decrypt(sessionStorage.getItem('routes'));
            // console.log('userRoutes ', userRoutes);
            // console.log('this.props.location.state.redirectUrl ', this.props.location.state?.redirectUrl);
            let redirectUrl = (this.props.location.state && this.props.location.state.redirectUrl) || (userRoutes && userRoutes[0] && userRoutes[0].path ? `/user${userRoutes[0].path}` : "/user");
            if (redirectUrl === '/login' || redirectUrl === '/') redirectUrl = userRoutes && userRoutes[0] && userRoutes[0].path ? `/user${userRoutes[0].path}` : "/user";
            this.setState({ isLoadingLoginRequest: false });
            // console.log('redirectUrl ', redirectUrl);
            return this.props.history.push(redirectUrl);
          }
        })
        .catch((e) => {
          console.error(e);
          this.setState({ isLoadingLoginRequest: false });
        });
    }
  };

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleSignIn();
    }
  };

  saveCredentials(credintialObj) {
    return rembemberMe(credintialObj);
  }

  render() {
    const classes = this.props.classes;
    return (
      <div>
        <Notifier />
        <Container component="main" maxWidth="xs" style={{ marginTop: "13%" }}>
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="userName"
                label="User Name"
                name="userName"
                onKeyUp={this.handleKeyUp}
                onChange={this.handleChange}
                value={this.state.userName}
              />
              <span style={{ color: "red" }}>{this.state.errorUserName}</span>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                onChange={this.handleChange}
                onKeyUp={this.handleKeyUp}
                value={this.state.password}
              />
              <p style={{ color: "red" }}>{this.state.errorPassword}</p>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.rememberMe}
                    onChange={this.handleChange}
                    name="rememberMe"
                    style={{ color: "#04decf" }}
                  />
                }
                label="Remember Me"
              />

              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                onClick={this.handleSignIn}
                className={classes.submit}
              >
                {this.state.isLoadingLoginRequest ? <CircularProgress style={{ color: 'white' }} size={25} thickness={3} /> : 'Sign In'}
              </Button>
            </form>
          </div>
        </Container>
      </div>
    );
  }

}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  token: PropTypes.string,
  redirectUrl: PropTypes.string,
  login: PropTypes.func.isRequired,
  history: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

const bindActions = (dispatch, actionMethod) => {
  return (params) =>
    new Promise((resolve, reject) =>
      dispatch(actionMethod(params))
        .then(response => resolve(response))
        .catch(error => reject(error)));
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    login: bindActions(dispatch, login),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(useStyles)(SignIn));