import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Table, TableBody, TableRow, TableCell,TextField } from "@material-ui/core";

class TikkieMultipleUrlCard extends React.Component {
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

    copyUrlToClipboard = (e,index) => {
        const id = `tikkie-url-${index}`;
        const buttonId = `copy-btn-${index}`;
        const element = document.getElementById(id);
        // @ts-ignore
        element.select();
        document.execCommand('copy');
        document.getElementById(buttonId).style.backgroundColor="#4ce57b";
      };

    render() {
        // const { classes } = this.props;
        return (
            <div>
                <Dialog
                    id="tikkie-multiple-url-card-drawer"
                    open={this.props.open}
                    onClose={this.handleCloseCancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                    <DialogContent>
                    <Table id="tikkie-url-card-table">
                        <TableBody id="tikkie-url-card-table-body">
                        {this.props.tikkieUrls.map((singleTikkieData, index) => (
                          <TableRow id={index} key={index}>
                            <TableCell colSpan={5}>
                            <TextField
                                id={'tikkie-url-'+index}
                                name={'tikkie-url-'+index}
                                type="text"
                                value={singleTikkieData.url}
                                fullWidth
                                contentEditable={false}
                            />
                            </TableCell>
                            <TableCell colSpan={5}>
                                <Button  onClick={e => this.copyUrlToClipboard(e,index)} id={'copy-btn-'+index} color="primary">
                                    Copy
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                        </Table>
                        <DialogContentText id="alert-dialog-description">
                            {this.props.content}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button id="tikkie-url-card-cancel-button" onClick={this.handleCloseCancel} color="primary">
                            {this.props.cancel}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

TikkieMultipleUrlCard.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string,
    content: PropTypes.any,
    cancel: PropTypes.string.isRequired,
    handleCancel: PropTypes.func.isRequired,
    tikkieUrls: PropTypes.array
};

export default TikkieMultipleUrlCard;