import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Paper, Table, TableBody, TableCell,
	Dialog, TableHead, TableRow, Typography, Grid, TableContainer,Checkbox
} from '@material-ui/core';
import { clearSmeLoanRequestDetails } from 'store/initiation/actions/CreditRiskOverview.action';
import { EURO, NODECIMALEURO } from 'lib/initiation/utility';
import moment from 'moment';
import styles from "assets/jss/bridgefundPortal/views/categoryBlockStyle";
import TransactionsPopUp from '../Charts/TransactionsPopUp';

class SearchedTransactionBlock extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isOpenUpdateTransactionPopup: false,
			selectedTransactions:[],
			newSearchValue:this.props.newSearchValue,
			shiftSlectedTransactionIndex:null,		
		};
	}

	static getDerivedStateFromProps(props, state) {

		if (props.newSearchValue !== state.newSearchValue) {
		  return {
			newSearchValue: props.newSearchValue,
			selectedTransactions : [],
			shiftSlectedTransactionIndex:null
		  };
		}
		return null;
	  }

	componentDidMount() {
		this.setState({selectedTransactions:[],shiftSlectedTransactionIndex:null});
	}

	handleUpdateTransaction = () => {
		this.handlePopupOpen();
	}


	handleBlockTableChange = (e, block, index, sortedDate) => {
		if (e.target.checked){
			if(e.nativeEvent.shiftKey){
				// shift key pressed
				if(this.state.shiftSlectedTransactionIndex !== null){
					// 1st index available
				 const newAddElementTransactions = this.generateNewAddElementTransactionArray(index,this.state.shiftSlectedTransactionIndex,this.state.selectedTransactions,sortedDate);
				 this.setState({shiftSlectedTransactionIndex : index,selectedTransactions:newAddElementTransactions});
				}else{
					this.setState({shiftSlectedTransactionIndex : index},()=>{this.addElement(block);});
				}
				
			}else{
				this.addElement(block);
			}
			
		}
		else
			this.removeElement(block);

	}

	addElement = (block) => {
		const array = [...this.state.selectedTransactions];
		array.push(block);
		this.setState({ selectedTransactions: array });
	}

	removeElement = (block) => {
		const array = [...this.state.selectedTransactions];
		const index = array.indexOf(block);
		if (index !== -1) {
			array.splice(index, 1);
			this.setState({ selectedTransactions: array });
		}
	}

	checkForSelected = (id) => {
		return this.state.selectedTransactions.find(item => item.id === id) ? true : false;
	}


	handlePopupOpen = () => {
		this.setState({ isOpenUpdateTransactionPopup: !this.state.isOpenUpdateTransactionPopup });
	}

	getSearchedTransactionsdata = () => {
		this.setState({selectedTransactions:[],shiftSlectedTransactionIndex:null},()=>{this.props.getSearchedTransactionsdata();});
	}


	generateNewAddElementTransactionArray = (currentIndex,previousIndex,selectedTransactions,sortedTransactionArray) =>{
		const tranasctions =  [...selectedTransactions];
		const firstIndex = (currentIndex > previousIndex)?previousIndex:currentIndex;
		const secondIndex = (currentIndex > previousIndex)?currentIndex+1:previousIndex+1;
		const betweenTransactions = sortedTransactionArray.slice(firstIndex,secondIndex);
		
		const allSelectedTransactions = tranasctions.concat(betweenTransactions);

		const filteredArr = allSelectedTransactions.reduce((acc, current) => {
			const x = acc.find(item => item.id === current.id);
			if (!x) {
			  return acc.concat([current]);
			} else {
			  return acc;
			}
		  }, []);

		const finalArray = [...filteredArr];
		for (let j = 0; j < filteredArr.length; j++) {
			const se = filteredArr[j];
			if(se.transactionType === 'sub_total'){
				// this recode should not pic
				finalArray.splice(j, 1);
			}
		}

		return finalArray;
	}

	render() {
		const {selectedTransactions } = this.state;
		const { classes, title, totalAmount, dataList } = this.props;

		return (
			<>
				<Paper variant="outlined" className={classes.transactionContainer} >
					<Grid container justify="space-between">
						<Grid item>
							<Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>{title}</Typography>
						</Grid>
						<Grid item>
							<Typography variant="h5" gutterBottom className={classes.transactionContainerTitle}>{EURO(totalAmount)}</Typography>
						</Grid>
					</Grid>

					{/* <Paper variant="outlined"> */}
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table className={classes.table} aria-label="transaction tables">
							<TableHead className={classes.tableHeadColor}>
								<TableRow>
									<TableCell className={classes.tableCell}>&nbsp;</TableCell>
									<TableCell className={classes.tableCell} align="left">Transaction Date</TableCell>
									<TableCell className={classes.tableCell} align="left" >Amount</TableCell>
									<TableCell className={classes.tableCell} align="left">Counterparty Name</TableCell>
									<TableCell className={classes.tableCell} align="left">Description</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{/* ======== check data length of table ============ */}
								{dataList.length === 0 ?
									<TableRow>
										<TableCell className={classes.tableCell} align="center" colSpan={6}>
											{'No Data to show'}
										</TableCell>
									</TableRow>
									: 
								dataList.map((transaction, index) => (
									<TableRow key={index}  className={classes.transactionTableRow} >
										<TableCell className={classes.tableCell}>
											<Checkbox
												defaultChecked={false}
												onChange={(e) => this.handleBlockTableChange(e, transaction, index, dataList)}
												checked ={this.checkForSelected(transaction.id)}
												color="default"
												size="small"
												inputProps={{ 'aria-label': 'checkbox with default color' }}
												style={{ padding: "2px"}}
												disableRipple
											/>
										</TableCell>
										<TableCell className={classes.tableCell} align="left" onClick={() => this.handleUpdateTransaction()}>{moment(transaction.transaction_date).format('DD-MM-YYYY')}</TableCell>
										<TableCell className={classes.tableCell} align="left" onClick={() => this.handleUpdateTransaction()}>{NODECIMALEURO(transaction.amount)}</TableCell>
										<TableCell className={classes.tableCell} align="left" onClick={() => this.handleUpdateTransaction()}>{transaction.counterparty_name}</TableCell>
										<TableCell className={classes.tableCell} align="left" onClick={() => this.handleUpdateTransaction()}>{transaction.description}</TableCell>
									</TableRow>
								))

								}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
				<Dialog
					onClose={this.handlePopupOpen}
					aria-labelledby="transaction-dialog"
					fullWidth
					maxWidth={'lg'}
					open={this.state.isOpenUpdateTransactionPopup}>
					<Paper className={classes.popUpContainer}>
						{/* <SearchedTransactionBlockPopup bankTransaction={selectedTransaction} handlePopupOpen={this.handlePopupOpen} /> */}
						<TransactionsPopUp bankTransactions={selectedTransactions} handlePopupOpen={this.handlePopupOpen} getInitialdata={this.getSearchedTransactionsdata} isMultipleTransactionUpdate={true} />
					</Paper>
				</Dialog>
			</>
		);
	}
}

SearchedTransactionBlock.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	totalAmount: PropTypes.number,
	dataList: PropTypes.array,
	getSearchedTransactionsdata: PropTypes.func,
	newSearchValue: PropTypes.string,
	// contractId: PropTypes.string,
};

const mapStateToProp = (state) => ({
	customer: state.lmglobal.selectedCustomer,
	contractId: state.lmglobal.overviewData.contractId
});

const mapDispatchToProps = (dispatch) => ({
	clearSmeLoanRequestDetails: () => dispatch(clearSmeLoanRequestDetails()),
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(styles)(SearchedTransactionBlock));

