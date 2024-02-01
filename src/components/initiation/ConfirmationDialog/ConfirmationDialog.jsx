import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class ConfirmationDialog extends React.Component {
  state = {
    open: false,
  };

  componentDidMount() {
    this.setState({
      open: true
    });
  }

  handleCloseCancel = () => {
    this.setState({
      open: false
    });
    this.props.handleCancel();
  };

  handleCloseOk = () => {
    this.setState({
      open: false
    });
    this.props.handleOk();
  };

  render() {
    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.handleCloseCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
          <DialogContent>
            {this.props.dialogContent}
            <DialogContentText id="alert-dialog-description">
              {this.props.content}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseCancel} color="primary">
              {this.props.cancel}
            </Button>
            <Button onClick={this.handleCloseOk} color="primary" autoFocus>
              {this.props.ok}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  content: PropTypes.any,
  cancel: PropTypes.string.isRequired,
  ok: PropTypes.string.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  dialogContent: PropTypes.any
};

export default ConfirmationDialog;