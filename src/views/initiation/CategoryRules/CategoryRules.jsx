/* eslint-disable no-duplicate-imports */
/* eslint-disable no-else-return */
/* eslint-disable prefer-const */
import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import Notifier from 'components/initiation/Notification/Notifier';

import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';

import withStyles from '@material-ui/core/styles/withStyles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
// import TextField from '@material-ui/core/TextField';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import ListSubheader from '@material-ui/core/ListSubheader';

import CustomInputBox from "components/initiation/CustomInput/CustomInputBox";

import TablePagination from '@material-ui/core/TablePagination';

import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';

import { displayNotification } from "store/loanmanagement/actions/Notifier";

import { getCategoryRulesWithPagination, getCategoryRulesEnums, processCategoryRules, IbanSearchRequest } from "store/initiation/actions/CategoryRules.action";
import { InputAdornment } from '@material-ui/core';
// import { selectedRow } from 'assets/jss/bridgefundPortal/components/tableStyle';

const DATA_LIMIT = 10000;//150;

const CR_Basic_Data = {
  priority_level: 1,
  amount: 0,
  amount_operator: '',
  counterparty_iban: '',
  counterparty_iban_boolean: '',
  counterparty_iban_operator: '',
  counterparty_name: '',
  counterparty_name_boolean: '',
  counterparty_name_operator: '',
  description: '',
  description_boolean: '',
  description_operator: '',
  sub_category: '',
  detailed_category: '',
  sub_category_level: null,
  explanation: '',
  category:'',
};

const Validations = {
  priority_level: true,
  amount_operator: true,
  sub_category: true,

  counterparty_iban: true,
  counterparty_name: true,
  description: true,

  counterparty_iban_message: '',
  counterparty_name_message: '',
  description_message: '',

  fieldsMissing_message: '',


};

const MandatoryFields = ['priority_level', 'amount_operator', 'sub_category'];
const OneOfTheFields = ['counterparty_iban', 'counterparty_name', 'description'];

class CategoryRules extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,

      openCategoryRulesDeleteConfirmDialog: false,

      validations: JSON.parse(JSON.stringify(Validations)),

      selectedRule: JSON.parse(JSON.stringify(CR_Basic_Data)),
      dialogAction: null,
      openCategoryRulesDialog: false,
      // selectedCategory: null,
      selectedRulePosition: null,

      categoryRules: [],
      categoryRulesTotalCount: 0,
      rows: [],
      rowsPerPage: 10, //50
      pageNumber: 0,
      rawCount:0,

      rowsPerPageIbanSearch: 10, //50
      pageNumberIbanSearch: 0,
      rawCountIbanSearch:0,

      enumValues: {},

      counterPartyNameQuery:'',
      discriptionQuery:'',

      openIbanSearch: false,
      counterPartyNameInIbanSearch : '',
      IbanSearchResults:[],
      IbanSearchSelectedIban:'',
      IbanSearchSelectedCounterParty:'',



    };
  }

  componentDidMount() {
    this.getBasicDetails();
  }

  /* Initial category rules request */
  getInitialCategoryRules = async () => {
    return await this.props.getCategoryRulesWithPagination({ limit: DATA_LIMIT, offset: 0, '$sort': JSON.stringify({ 'id': 1 }) })
      .then((response) => {
        if (response) {
          const { categoryRules } = this.state;

          return { categoryRulesTotalCount: response.count, categoryRules: categoryRules.concat(response.rows) };
        }

        return {};
      })
      .catch((error) => { throw Error(error); });
  }

  /* Enums request */
  getEnums = async () => {
    return await this.props.getCategoryRulesEnums({ all: true })
      .then((response) => {
        if (response) {

          for (const item in response) {
            if (Array.isArray(response[item])) {
              response[`${item}_selection`] = response[item].map((value) => ({ key: (value === '' ? 'EMPTY' : value), value: (value === '' ? 'EMPTY' : value), }));
            }
          }

          return { enumValues: response };
        }

        return {};
      })
      .catch((error) => { throw Error(error); });
  }

  /* Get basic details at component mount */
  getBasicDetails = () => {

    this.setState({ isLoading: true }, () => {

      const requestPromisesArray = [];

      const state = JSON.parse(JSON.stringify(this.state));

      /* get all banks details */
      requestPromisesArray.push(this.getInitialCategoryRules());

      /* get enum details */
      requestPromisesArray.push(this.getEnums());

      Promise.all(requestPromisesArray)
        .then((responses) => {

          for (const item of responses) {
            for (const property in item) {
              state[property] = item[property];
            }
          }

        })
        .catch((error) => { console.log(error); })
        .finally(() => {
          this.setState({ ...state, isLoading: false });
        });

    });

  }

  /* Data slicing logic */
  dataSlicingPoints = () => {
    const { rowsPerPage, pageNumber } = this.state;
    return { 'sliceFrom': (pageNumber * rowsPerPage), 'sliceTo': (pageNumber * rowsPerPage + rowsPerPage) };
  }

  /* Get category rules for tabel */
  RulesWithPagination = ({ limit, offset }) => {
    this.props.getCategoryRulesWithPagination({ limit, offset, '$sort': JSON.stringify({ 'id': 1 }) })
      .then((response) => {
        if (response) {

          const { categoryRules } = this.state;

          this.setState({ categoryRulesTotalCount: response.count, categoryRules: categoryRules.concat(response.rows) });
        }
      });
  }

  /* Check for next data set when pagination changed */
  checkForNextDataBatch = () => {
    const { categoryRules, rowsPerPage, categoryRulesTotalCount } = this.state;

    if (categoryRules.length !== categoryRulesTotalCount) {
      if (categoryRules.length - this.dataSlicingPoints().sliceTo <= rowsPerPage) {
        this.RulesWithPagination({ limit: DATA_LIMIT, offset: (categoryRules.length + 1) });
      }
    }

  }

  /* Filter selected category rule from the array */
  getSelectedRule = (id) => {
    let selectedRule = null;

    let position = null;

    if (id) selectedRule = JSON.parse(JSON.stringify(this.state.categoryRules.find((rule, index) => {
      if (rule.id === id) {
        position = index;
        return rule;
      }
    })));

    else selectedRule = JSON.parse(JSON.stringify(CR_Basic_Data));

    if (selectedRule.amount_operator && selectedRule.amount_operator !== '') {
      const type = (selectedRule.amount_operator === '='|| selectedRule.amount_operator === '>' ||selectedRule.amount_operator === '>=') ? 'INCOME' : 'EXPENSES';
      selectedRule.category = type;
      selectedRule.sub_category_level = type;

      let sub_category = selectedRule.sub_category;
      let detailed_category = selectedRule.detailed_category;
      let explanation = selectedRule.explanation;

      if (sub_category && sub_category !== '') sub_category = `${type}-${sub_category.replace(/\s/g, '_')}`;

      if (detailed_category && detailed_category !== '') detailed_category = `${type}-${selectedRule.sub_category.replace(/\s/g, '_')}-${detailed_category.replace(/\s/g, '_')}`;

      selectedRule.sub_category = sub_category;
      selectedRule.detailed_category = detailed_category;
      selectedRule.explanation = (explanation)? explanation: '';

    }


    return { selectedRule, position };
  }

  /* Category icons click events */
  categoryRulesActions = (action = null, id = null) => {

    const section_1 = ['create', 'update', 'view','createByIbanSearch'];
    const section_2 = ['delete'];

    this.setState((prevState) => {

      const { selectedRule, position } = this.getSelectedRule(id);

      const response = {
        dialogAction: action,
        selectedRule,
        selectedRulePosition: position
      };

      if (section_1.includes(action)) response['openCategoryRulesDialog'] = !prevState.openCategoryRulesDialog;
      else if (section_2.includes(action)) response['openCategoryRulesDeleteConfirmDialog'] = !prevState.openCategoryRulesDeleteConfirmDialog;
      else {
        response['openCategoryRulesDialog'] = false;
        response['openCategoryRulesDeleteConfirmDialog'] = false;
        response['dialogAction'] = null;
        response['validations'] = JSON.parse(JSON.stringify(Validations));

      }

      if(action === 'createByIbanSearch'){
        response.dialogAction = 'create';
        selectedRule.counterparty_iban = this.state.IbanSearchSelectedIban;
        selectedRule.counterparty_iban_boolean = 'AND';
        selectedRule.counterparty_iban_operator = '=';

        // selectedRule.counterparty_name = this.state.IbanSearchSelectedCounterParty;
        // selectedRule.counterparty_name_boolean = 'OR';
        // selectedRule.counterparty_name_operator = 'LIKE';
      }

      if(action === 'update'){
        if(
          selectedRule[`counterparty_iban`] !== '' &&  
          selectedRule[`counterparty_iban_boolean`] !== '' && 
          selectedRule[`counterparty_iban_operator`] !== ''
          ){
            selectedRule[`counterparty_name`] = '';
            selectedRule[`counterparty_name_boolean`] = '';
            selectedRule[`counterparty_name_operator`]='';
          }
      }

      return response;

    }, () => {
      if (action === 'update') {
        const { validations } = this.validateDataForProcess();
        this.setState({ validations });
      }
    });

  }

  /* Pagination : page changes handler */
  handleChangePage = (event, newPage) => {
    this.setState({ pageNumber: newPage }, () => { this.checkForNextDataBatch(); });
  }

  /* Pagination : number of rows per page change handler */
  handleChangeRowsPerPage = (event) => {
    this.setState({ pageNumber: 0, rowsPerPage: event.target.value }, () => { this.checkForNextDataBatch(); });
  }

  /* Pagination : page changes handler Iban search */
  handleChangePageIbanSearch = (event, newPage) => {
    this.setState({ pageNumberIbanSearch: newPage });
  }

  /* Pagination : number of rows per page change handler Iban serarch */
  handleChangeRowsPerPageIbanSearch = (event) => {
    this.setState({ pageNumberIbanSearch: 0, rowsPerPageIbanSearch: event.target.value });
  }

  /* Input changes handler */
  handleProcessDataChanges = (name, value) => {

    const { selectedRule } = this.state;

    let valide = true;

    if (name === 'amount_operator') {
      if (value && value !== '') {
        selectedRule.category = (value === '='|| value === '>' || value === '>=') ? 'INCOME' : 'EXPENSES';
        selectedRule.sub_category = '';
        selectedRule.detailed_category = '';
      }
      else selectedRule.category = '';
    }

    if (name === 'priority_level') {
      if (!value.match(/[aA-zZ]+\s?/g)) value = Number(value);
      else valide = false;
    }

    
    let valueToSet = value;
    
    if (name in selectedRule && valide) selectedRule[name] = valueToSet;

    this.setState({ selectedRule },() => {
   
      if(
      this.state.selectedRule[`counterparty_iban`] !== '' &&  
      this.state.selectedRule[`counterparty_iban_boolean`] !== '' && 
      this.state.selectedRule[`counterparty_iban_operator`] !== ''
      ){
        selectedRule[`counterparty_name`] = '';
        selectedRule[`counterparty_name_boolean`] = '';
        selectedRule[`counterparty_name_operator`]='';
      }

      this.setState({selectedRule});
    });

  }

  handleSearchDataChanges = (name, value) => {

    const state = this.state;

    state[name] = value;

    this.setState({  state});

  }

  /* Selection boxes data change handler */
  handleSelectionDataChanges = (event, name) => {
    const nameBlocks = (event.target.value && event.target.value !== '') ? event.target.value.split('-') : null;

    const { selectedRule, validations } = this.state;

    if (name in selectedRule) selectedRule[name] = (nameBlocks !== null)?event.target.value:'';

    if (name === 'sub_category') selectedRule.sub_category_level = (nameBlocks && nameBlocks[0] && nameBlocks[0] !== '') ? nameBlocks[0] : null;
  
    if (name === 'sub_category' && event.target.value !== "") validations[name] = true;

    this.setState({ selectedRule, validations });

  }

  /* Validate data before make process request */
  validateDataForProcess = () => {

    const { selectedRule } = this.state;

    const validations = JSON.parse(JSON.stringify(Validations));

    let mandatoryFieldsCheck = true;
    let oneOfTheFieldsCheck = false;
    let supportingFieldsCheck = true;

    /* Check mandatory fields values */
    for (const property of MandatoryFields) {
      if (property in selectedRule) {
        if (!selectedRule[property] || selectedRule[property] === '') {
          mandatoryFieldsCheck = false;
          validations[property] = false;
        }
      } else mandatoryFieldsCheck = false;
    }

    for (const element of OneOfTheFields) {
      if (element in selectedRule) {
        if (selectedRule[element] && selectedRule[element] !== '') {
          oneOfTheFieldsCheck = true;

          if (
            (!selectedRule[`${element}_boolean`] || selectedRule[`${element}_boolean`] === '') ||
            (!selectedRule[`${element}_operator`] || selectedRule[`${element}_operator`] === '')
          ) {

            supportingFieldsCheck = false;
            validations[element] = false;
            validations[`${element}_message`] = '*You have to fill all three sections';

          }

        }else if((selectedRule[`${element}_boolean`] !== '')||(selectedRule[`${element}_operator`] !== '')){
          if(selectedRule[element] === ''){
            supportingFieldsCheck = false;
            validations[element] = false;
            validations[`${element}_message`] = '*You have to fill all three sections';
          }
        }
      }
    }

    if (!oneOfTheFieldsCheck) validations.fieldsMissing_message = 'One of these sections must be filled : Counterparty IBAN, Counterparty Name, or Description ';


    if( 
      selectedRule[`counterparty_iban`] !== '' &&  
      selectedRule[`counterparty_iban_boolean`] !== '' && 
      selectedRule[`counterparty_iban_operator`] !== '' 
      ){
        selectedRule[`counterparty_name`] = '';
        selectedRule[`counterparty_name_boolean`] = '';
        selectedRule[`counterparty_name_operator`]='';
    }

    return { mandatoryFieldsCheck, oneOfTheFieldsCheck, supportingFieldsCheck, validations };

  }

  /* Category rules process API request */
  processCategoryRulesRequest = (requestData) => {

    this.setState({ isLoading: true }, () => {

      this.props.processCategoryRules(requestData)
        .then((response) => {
          const { categoryRules, selectedRulePosition, IbanSearchResults } = this.state;
          let IbanSearchResultsFilterdArray = IbanSearchResults;
          if (response && requestData.action !== 'delete') categoryRules[selectedRulePosition] = response;

          if (response && requestData.action === 'create') categoryRules.unshift(response);

          if( requestData.action === 'delete' ) categoryRules.splice(selectedRulePosition, 1);

          if(requestData.action === 'create' && IbanSearchResults.length > 0){
            IbanSearchResultsFilterdArray = this.updateIbanSearchArray(IbanSearchResults,response);
          }

          this.setState({
            openCategoryRulesDialog: false,
            openCategoryRulesDeleteConfirmDialog: false,
            dialogAction: null,
            selectedRule: JSON.parse(JSON.stringify(CR_Basic_Data)),
            categoryRules,
            selectedRulePosition: null,
            isLoading: false,
            IbanSearchResults:IbanSearchResultsFilterdArray
          });

        })
        .catch((error) => { 
          console.log(error);
        
          this.setState({ isLoading: false });

        });

    });

  }

  updateIbanSearchArray = (IbanSearchResults,response ) => {
    let dataArray = IbanSearchResults;
    if(response.counterparty_iban !== ''){
      const arrayIndex = IbanSearchResults.findIndex((SID) =>{return SID.iban === response.counterparty_iban});
      if(arrayIndex !== -1){
        // this mean Iban search need to be updated
        dataArray[arrayIndex].isRuleAvailable = true;
      }
    }

    return dataArray;
    
  }

  /* Generate data object for process API request */
  generateDataForProcess = () => {

    const { selectedRule } = this.state;

    const categoryData = { ...selectedRule };

    delete categoryData._id;
    delete categoryData.id;
    delete categoryData.sub_category_level;
    delete categoryData.category;
    
    categoryData.sub_category = categoryData.sub_category.split('-')[1].replace(/_/g, ' ');
    categoryData.detailed_category =(categoryData.detailed_category !== '')? categoryData.detailed_category.split('-')[2].replace(/_/g, ' '):categoryData.detailed_category;

    for (const item of OneOfTheFields) {

      if (`${item}_boolean` in categoryData) {
        if (categoryData[`${item}_boolean`] === 'EMPTY') categoryData[`${item}_boolean`] = '';
      }

      if (`${item}_operator` in categoryData) {
        if (categoryData[`${item}_operator`] === 'EMPTY') categoryData[`${item}_operator`] = '';
      }

    }

    return categoryData;

  }

  /* Create new button action */
  createNewRule = () => {

    const requestData = {
      action: 'create',
      categoryDataForCreate: this.generateDataForProcess(),
    };

    this.processCategoryRulesRequest(requestData);

  }

  /* Update existing rule button action */
  updateExistingRule = () => {

    const { selectedRule } = this.state;

    const requestData = {
      action: 'update',
      categoryDataForUpdate: {
        categoryId: selectedRule.id,
        data: this.generateDataForProcess(),
      },
    };

    this.processCategoryRulesRequest(requestData);

  }

  /* Delete existing rule button action */
  deleteExistingRule = () => {

    const { selectedRule } = this.state;

    const requestData = {
      action: 'delete',
      // categoryDeleteQuery: { id: selectedRule.id },
      categoryDataForUpdate: {
        categoryId: selectedRule.id,
      },
    };

    this.processCategoryRulesRequest(requestData);

  }

  /* Action buttons handlers */
  processData = () => {

    if (
      (this.state.dialogAction === 'create') ||
      (this.state.dialogAction === 'update')
    ) {

      const { mandatoryFieldsCheck, oneOfTheFieldsCheck, supportingFieldsCheck, validations } = this.validateDataForProcess();

      if (mandatoryFieldsCheck && oneOfTheFieldsCheck && supportingFieldsCheck) {
        
        // set presentage and AND
        const  {selectedRule} = this.SetFinalChecks(this.state.selectedRule);

        this.setState({ selectedRule,validations: JSON.parse(JSON.stringify(Validations)) }, () => {

          if (this.state.dialogAction === 'create') this.createNewRule();

          if (this.state.dialogAction === 'update') this.updateExistingRule();

        });
      } else {
        this.setState({ validations });
      }

    }

    if (this.state.dialogAction === 'delete') this.deleteExistingRule();

  }

  /* Sub category selection DOM creator */
  subCategoriesSelections = () => {

    const { openCategoryRulesDialog, selectedRule, enumValues, validations } = this.state;

    const { classes } = this.props;

    if (!openCategoryRulesDialog) return null;

    const selections = [];
  
    if(selectedRule.category !== ''){
      // for (const subItem in enumValues.subCategoryEnumsTree[selectedRule.category]) {

        selections.push(<ListSubheader key={selectedRule.category}>{selectedRule.category}</ListSubheader>);
  
        for (const item of enumValues.subCategoryEnumsTree[selectedRule.category]) {
          const value = `${selectedRule.category}-${item.replace(/\s/g, '_')}`;
          selections.push(<MenuItem key={value} value={value}>{item}</MenuItem>);
        }
  
      // }
    }
    


    const styleClass = (selectedRule.sub_category && selectedRule.sub_category !== '') ? classes.shrinedSelectionLabel : classes.selectionLabel;


    const response =
      <FormControl style={{ width: '100%', margin: '5px' }} error={!validations.sub_category}>
        <InputLabel htmlFor="sub_category" className={styleClass}>Sub</InputLabel>
        <Select
          defaultValue=""
          id="sub_category"
          name="sub_category"
          variant="outlined"
          error={!validations.sub_category}
          onChange={(event) => this.handleSelectionDataChanges(event, 'sub_category')}
          value={selectedRule.sub_category} >
          <MenuItem value=""><em>None</em></MenuItem>

          {selections}

        </Select>
        <FormHelperText>Required</FormHelperText>
      </FormControl>;

    return response;

  }

  /* Detailed category selection DOM creator */
  detailedCategoriesSelections = () => {

    const { openCategoryRulesDialog, selectedRule, enumValues } = this.state;

    const { classes } = this.props;

    if (!openCategoryRulesDialog) return null;

    const selections = [];

    /* Get copy from detailedCategoryEnumsTree */
    let detailedCategoriesSet = { ...enumValues.detailedCategoryEnumsTree };

    /* if sub_category is selected */
    if (selectedRule.sub_category_level) {

      /* Use only that sub_category data */
      detailedCategoriesSet = { [selectedRule.sub_category_level]: detailedCategoriesSet[selectedRule.sub_category_level] };

      /* Get data according to the sub_category selected value */
      if (selectedRule.sub_category && selectedRule.sub_category !== '') {

        const subCategory = selectedRule.sub_category.split('-')[1];

        detailedCategoriesSet = {
          [selectedRule.sub_category_level]: {
            [subCategory]: detailedCategoriesSet[selectedRule.sub_category_level][subCategory]
          }
        };

      }

    }


    for (const topItem in detailedCategoriesSet) {

      selections.push(<ListSubheader key={topItem}>{topItem}</ListSubheader>);

      for (const subItem in detailedCategoriesSet[topItem]) {

        selections.push(<ListSubheader key={subItem}>{subItem}</ListSubheader>);

        for (const item of detailedCategoriesSet[topItem][subItem]) {
          const value = `${topItem}-${subItem}-${item.replace(/\s/g, '_')}`;
          selections.push(<MenuItem key={value} value={value}>{item}</MenuItem>);
        }

      }

    }

    const styleClass = (selectedRule.detailed_category && selectedRule.detailed_category !== '') ? classes.shrinedSelectionLabel : classes.selectionLabel;

    const response =
      <FormControl style={{ width: '100%', margin: '5px' }}>
        <InputLabel htmlFor="detailed_category" className={styleClass}>Detailed</InputLabel>
        <Select
          defaultValue=""
          id="detailed_category"
          name="detailed_category"
          variant="outlined"
          required={true}
          onChange={(event) => this.handleSelectionDataChanges(event, 'detailed_category')}
          value={selectedRule.detailed_category} >
          <MenuItem value=""><em>None</em></MenuItem>

          {selections}

        </Select>
      </FormControl>;

    return response;

  }

  filterCategoryRules = (rules, toLowerCaseCunterPartyNameQuery, toLowerCaseDiscriptionQuery) => {
    const filteredRules = rules.filter(x=>{
      if(toLowerCaseCunterPartyNameQuery !== '' || toLowerCaseDiscriptionQuery !== ''){
        
        // this means seach query available.
        let filerByCP = false;
        let filerByD = false;
        if(toLowerCaseCunterPartyNameQuery !== ''){
          if(x.counterparty_name.toLowerCase().includes(toLowerCaseCunterPartyNameQuery)){
            filerByCP = true;
          }
        }else{
          filerByCP = true;
        }

        if(toLowerCaseDiscriptionQuery !== ''){
          if(x.description.toLowerCase().includes(toLowerCaseDiscriptionQuery)){
            filerByD = true;
          }
        }else{
          filerByD = true;
        }

        return (filerByCP && filerByD);


      }else{
        return true;
      }
    });

      return {filteredCategoryRules: filteredRules, rawCount: filteredRules.length };

  }

  IbanSearch = () =>{
    this.setState({openIbanSearch:!this.state.openIbanSearch});
  }

  handleIbanSearchInput = (name,value) =>{
    const state = this.state;

    state[name] = value;

    this.setState({  state});
  }

  addNewRule = (iban, counterPartyName) => {
    const IbanSearchSelectedIban = (iban)?iban:'';
    const IbanSearchSelectedCounterParty = (counterPartyName)?counterPartyName:'';
    this.setState({
      openIbanSearch:!this.state.openIbanSearch,
      IbanSearchSelectedIban,
      IbanSearchSelectedCounterParty
    },()=>{
      this.categoryRulesActions('createByIbanSearch');
    });
  };

  searchIbans = () => {
    const { counterPartyNameInIbanSearch } = this.state;
    if(counterPartyNameInIbanSearch === ''){
      this.props.displayNotification('Please enter counter party name!', 'warning');
    }else{
      this.IbanSearchAPIRequest(counterPartyNameInIbanSearch);
    }

    
  }

    /* IBAN Search API request */
    IbanSearchAPIRequest = (requestData) => {

      this.setState({ isLoading: true }, () => {
  
        this.props.IbanSearchRequest(requestData)
          .then((response) => {
  
            let { IbanSearchResults } = this.state;
            
            IbanSearchResults = response;
  
            this.setState({
              isLoading: false,
              IbanSearchResults : IbanSearchResults,
              rawCountIbanSearch : response.length
            });
  
          })
          .catch((error) => { 
            console.log(error);
          
            this.setState({ isLoading: false, IbanSearchResults:[] });
  
          });
  
      });
  
    }

    SetFinalChecks = (selectedRow) => {
      const selectedRowData = selectedRow;

      // Set AND
      // let andAvailable = false;
      let IbanAvailabel = false;
      let counterPrartyNameAvailable =false;
      // let discriptionAvailable = false;

      if(selectedRowData['counterparty_iban'] !== ''){
        // iban available
        IbanAvailabel = true;
        selectedRowData['counterparty_iban_boolean'] = 'AND';
      }

      if(selectedRowData['counterparty_name'] !== '' && !IbanAvailabel){
        // counter party name available
        counterPrartyNameAvailable = true;
        selectedRowData['counterparty_name_boolean'] = 'AND';
      }

      if(selectedRowData['description'] !== '' && !IbanAvailabel && !counterPrartyNameAvailable){
        // discription available
        // discriptionAvailable = true;
        selectedRowData['description_boolean'] = 'AND';
      }

      return {selectedRule:selectedRowData};

    }



  render() {

    const { classes, origin } = this.props;

    const { categoryRules, rowsPerPage, pageNumber, categoryRulesTotalCount, isLoading, pageNumberIbanSearch, rowsPerPageIbanSearch, rawCountIbanSearch,
      openCategoryRulesDialog, selectedRule, enumValues, openCategoryRulesDeleteConfirmDialog, validations, openIbanSearch, IbanSearchResults  } = this.state;

    // const { sliceFrom, sliceTo } = this.dataSlicingPoints();

    // const categoryRulesDisplayPortion = categoryRules; // categoryRules.slice(sliceFrom, sliceTo);

    const disableInputs = !((this.state.dialogAction === 'update') || (this.state.dialogAction === 'create'));

    const toLowerCaseCunterPartyNameQuery = this.state.counterPartyNameQuery.toLowerCase();
    const toLowerCaseDiscriptionQuery = this.state.discriptionQuery.toLowerCase();

    const {filteredCategoryRules, rawCount } =  this.filterCategoryRules(categoryRules, toLowerCaseCunterPartyNameQuery,toLowerCaseDiscriptionQuery);

    return (
      <div>
        <Notifier />
        {/* {origin === "ADMIN" ? <h1>Category Rules</h1> : false} */}

        <div>
          <Paper >
            <div className={classes.tableHeaders}>
              <Typography variant="h6" id="tableTitle" component="div" className={classes.tableHeaderLabel}>Category Rules Manager</Typography>
              <Button className={`${classes.addButton}`} disabled={isLoading} onClick={() => this.IbanSearch()}>IBAN-SEARCH</Button>
              <Button className={`${classes.floatRight} ${classes.addButton}`} disabled={isLoading} onClick={() => this.categoryRulesActions('create')}>Add Rule</Button>
            </div>
            <TableContainer component={Paper}>
              <Table stickyHeader aria-label="Bank details table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" ></TableCell>
                    <TableCell align="center" colSpan={3}></TableCell>
                    <TableCell align="center" colSpan={3} className={classes.tableHeadBorderLeft}>IBAN</TableCell>
                    <TableCell align="center" colSpan={3} className={classes.tableHeadBorderBothSides}>
                      Counterparty Name
                      <CustomInputBox id="counterPartyNameQuery" name="counterPartyNameQuery" onChange={this.handleSearchDataChanges} label="search" value={selectedRule.counterPartyNameQuery}  formControlStyle={classes.noMargin}/>
                    </TableCell>
                    <TableCell align="center" colSpan={3} className={classes.tableHeadBorderBothSides}>
                      Description
                      <CustomInputBox id="discriptionQuery" name="discriptionQuery" onChange={this.handleSearchDataChanges} label="search" value={selectedRule.discriptionQuery}  formControlStyle={classes.noMargin}/>
                    </TableCell>
                    <TableCell align="center" colSpan={4} className={classes.tableHeadBorderBothSides}>Category</TableCell>
                  </TableRow>
                  <TableRow>
                    {/* <TableCell className={classes.width_15}>Action</TableCell> */}
                    <TableCell >Action</TableCell>
                    <TableCell align="center">Priority</TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center">Amount</TableCell>

                    <TableCell align="center" className={classes.tableHeadBorderLeft}>Boolean</TableCell>
                    <TableCell align="center">Operator</TableCell>
                    <TableCell align="center">Value</TableCell>

                    <TableCell align="center" className={classes.tableHeadBorderLeft}>Boolean</TableCell>
                    <TableCell align="center">Operator</TableCell>
                    <TableCell align="center">Value</TableCell>

                    <TableCell align="center" className={classes.tableHeadBorderLeft}>Boolean</TableCell>
                    <TableCell align="center">Operator</TableCell>
                    <TableCell align="center">Value</TableCell>

                    <TableCell align="center" className={classes.tableHeadBorderLeft}></TableCell>
                    <TableCell align="center">Detailed</TableCell>
                    <TableCell align="center">Sub</TableCell>
                    <TableCell align="center">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  {
                    (filteredCategoryRules && filteredCategoryRules.length > 0) ?
                    filteredCategoryRules.slice(this.state.pageNumber * this.state.rowsPerPage, this.state.pageNumber * this.state.rowsPerPage + this.state.rowsPerPage).map((row, index) => {
                        return (
                          <Tooltip key={index+'tooltip'}  classes={{ tooltip: classes.toolTipMaxWidth }}
                           title={row.explanation ? <p style={{fontSize:"16px",}}>{row.explanation}</p>  : ''}>
                          <TableRow hover key={row.id}>
                            
                            <TableCell style={{ display: 'flex' }}>
                              <div className={classes.actionButtons}><VisibilityIcon className={classes.cursorPointer} onClick={() => this.categoryRulesActions('view', row.id)} /></div>
                              <div className={classes.actionButtons}><EditIcon className={classes.cursorPointer} onClick={() => this.categoryRulesActions('update', row.id)} /></div>
                              <div className={classes.actionButtons}><DeleteForeverIcon className={classes.cursorPointer} onClick={() => this.categoryRulesActions('delete', row.id)} /></div>
                            </TableCell>
                            <TableCell align="center">{row.priority_level}</TableCell>
                            <TableCell align="center" style={{ fontStyle: 'italic' }}>if</TableCell>
                            <TableCell align="center">{row.amount_operator}</TableCell>

                            <TableCell align="center" className={classes.tableHeadBorderLeft}>{row.counterparty_iban_boolean}</TableCell>
                            <TableCell align="center">{row.counterparty_iban_operator}</TableCell>
                            <TableCell align="center">{row.counterparty_iban}</TableCell>

                            <TableCell align="center" className={classes.tableHeadBorderLeft}>{row.counterparty_name_boolean}</TableCell>
                            <TableCell align="center">{row.counterparty_name_operator}</TableCell>
                            <TableCell align="center">{row.counterparty_name}</TableCell>

                            <TableCell align="center" className={classes.tableHeadBorderLeft}>{row.description_boolean}</TableCell>
                            <TableCell align="center">{row.description_operator}</TableCell>
                            <TableCell align="center">{row.description}</TableCell>

                            <TableCell align="center" className={classes.tableHeadBorderLeft} style={{ fontStyle: 'italic' }}>then</TableCell>
                            <TableCell align="center">{row.detailed_category}</TableCell>
                            <TableCell align="center">{row.sub_category}</TableCell>
                            <TableCell align="center">{row.amount_operator === '>=' ? 'INCOME' : 'EXPENSES'}</TableCell>
                          </TableRow>
                          </Tooltip>
                         
                        );
                      })
                      : null
                  }

                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 75,100,1000]}
              component="div"
              count={rawCount}
              rowsPerPage={rowsPerPage}
              page={pageNumber}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />

          </Paper>
        </div>

        {/* View/Edit/Add Dialog */}
        {
          openCategoryRulesDialog && (

            <Dialog open={openCategoryRulesDialog} onClose={() => this.categoryRulesActions('close')} fullWidth={true} maxWidth={'md'} aria-labelledby="category-rules-details">
              <DialogTitle id="bank-details-title">Category Rule</DialogTitle>
              <DialogContent style={{ overflowY: 'unset' }}>
                <Grid container spacing={3}>

                  <Grid item xs={3} md={3}><CustomInputBox type="text" id="priority_level" key={`priority_level_${validations.priority_level}`} required={true} showError={!validations.priority_level} name="priority_level" onChange={this.handleProcessDataChanges} label="Priority Level" value={selectedRule.priority_level} disabled={disableInputs} formControlStyle={classes.noMargin} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox type="text" id="amount" name="amount" onChange={this.handleProcessDataChanges} label="Amount" value={selectedRule.amount} disabled={disableInputs} formControlStyle={classes.noMargin} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox  id="amount_operator" key={`amount_operator${validations.amount_operator}`} required={true} showError={!validations.amount_operator} name="amount_operator" type="dropdown" onChange={this.handleProcessDataChanges} label="Amount Operator" dropDownValues={enumValues.amountOperator_selection} value={selectedRule.amount_operator} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}></Grid>

                  {
                    validations.fieldsMissing_message !== '' ?
                      <Grid item xs={12} md={12}><div className={classes.errorMessageDiv}>{validations.fieldsMissing_message}</div></Grid>
                      : null
                  }

                  <Grid item xs={12} md={12}><div>IBAN</div></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox  id="counterparty_iban_boolean" name="counterparty_iban_boolean" type="dropdown" dropDownValues={enumValues.counterpartyIbanBoolean_selection} onChange={this.handleProcessDataChanges} label="Boolean" value={selectedRule.counterparty_iban_boolean} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox  id="counterparty_iban_operator" name="counterparty_iban_operator" type="dropdown" dropDownValues={enumValues.counterpartyIbanOperator_selection} onChange={this.handleProcessDataChanges} label="Operator" value={selectedRule.counterparty_iban_operator} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox type="text" id="counterparty_iban" name="counterparty_iban" onChange={this.handleProcessDataChanges} label="Value" value={selectedRule.counterparty_iban} disabled={disableInputs} formControlStyle={classes.noMargin} /></Grid>
                  <Grid item xs={3} md={3}>{!validations.counterparty_iban ? <div className={classes.errorMessageDiv}>{validations.counterparty_iban_message}</div> : null}</Grid>

                  <Grid item xs={12} md={12}><div>Counterparty Name</div></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox id="counterparty_name_boolean" name="counterparty_name_boolean" type="dropdown" dropDownValues={enumValues.counterpartyNameBoolean_selection} onChange={this.handleProcessDataChanges} label="Boolean" value={selectedRule.counterparty_name_boolean} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox id="counterparty_name_operator" name="counterparty_name_operator" type="dropdown" dropDownValues={enumValues.counterpartyNameOperator_selection} onChange={this.handleProcessDataChanges} label="Operator" value={selectedRule.counterparty_name_operator} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}></Grid>
                  <Grid item xs={12} md={12}>
                    <TextField
                        label="Value"
                        id="counterparty_name" 
                        name="counterparty_name" 
                        variant="outlined"
                        className={classes.noMargin}
                        value={selectedRule.counterparty_name} 
                        onChange={e=>this.handleProcessDataChanges(e.target.name,e.target.value)} 
                        disabled={disableInputs}
                        style={{"width":"100%"}}
                        multiline
                        maxRows={10}
                      />
                  </Grid>
  
                  <Grid item xs={12} md={12}>{!validations.counterparty_name ? <div className={classes.errorMessageDiv}>{validations.counterparty_name_message}</div> : null}</Grid>

                  <Grid item xs={12} md={12}><div>Description</div></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox id="description_boolean" name="description_boolean" type="dropdown" dropDownValues={enumValues.descriptionBoolean_selection} onChange={this.handleProcessDataChanges} label="Boolean" value={selectedRule.description_boolean} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox id="description_operator" name="description_operator" type="dropdown" dropDownValues={enumValues.descriptionOperator_selection} onChange={this.handleProcessDataChanges} label="Operator" value={selectedRule.description_operator} disabled={disableInputs} classes={classes} /></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox type="text" id="description" name="description" onChange={this.handleProcessDataChanges} label="Value" value={selectedRule.description} disabled={disableInputs} formControlStyle={classes.noMargin} /></Grid>
                  <Grid item xs={3} md={3}>{!validations.description ? <div className={classes.errorMessageDiv}>{validations.description_message}</div> : null}</Grid>

                  <Grid item xs={12} md={12}><div>Category</div></Grid>
                  <Grid item xs={3} md={3}><CustomInputBox type="text" id="category" name="category" formControlStyle={classes.margin_5} label={selectedRule.category ? "" : "Category"} value={selectedRule.category} disabled={true} /></Grid>
                  <Grid item xs={3} md={3}>{this.subCategoriesSelections()}</Grid>
                  <Grid item xs={3} md={3}>{this.detailedCategoriesSelections()}</Grid>
                  <Grid item xs={3} md={3}></Grid>

                  <Grid item xs={12} md={12}><div>Explanation</div></Grid>
                  <Grid item xs={9} md={9}><CustomInputBox type="text" id="explanation" name="explanation" onChange={this.handleProcessDataChanges} label="explanation" value={selectedRule.explanation} disabled={disableInputs} formControlStyle={classes.noMargin} /></Grid>
                  <Grid item xs={3} md={3}></Grid>

                </Grid>
              </DialogContent>
              <DialogActions>
                <Button disabled={isLoading} onClick={() => this.categoryRulesActions('close')} className={classes.popupCloseButton}>Close</Button>
                {
                  !disableInputs ?
                    <Button disabled={isLoading} onClick={this.processData} className={classes.popupAddButton}>{this.state.dialogAction === 'create' ? 'Add' : 'Update'}</Button>
                    : null
                }
              </DialogActions>
            </Dialog>

          )
        }

        {/*  */}
        {
          openCategoryRulesDeleteConfirmDialog &&
          (
            <Dialog
              open={openCategoryRulesDeleteConfirmDialog}
              onClose={() => this.categoryRulesActions('close')}
              aria-labelledby="delete-category-rule"
            >
              <DialogTitle id="delete-category-rule">
                Delete Selected Rule
              </DialogTitle>
              <DialogContent>
                <DialogContentText>Do you want to delete this category rule ?</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button disabled={isLoading} autoFocus onClick={() => this.categoryRulesActions('close')} >Cancel</Button>
                <Button disabled={isLoading} onClick={this.processData} color="primary">Delete</Button>
              </DialogActions>
            </Dialog>
          )
        }

        {/*IBAN search  */}
        {
          openIbanSearch &&
          (
            <Dialog
              open={openIbanSearch}
              onClose={() => this.IbanSearch()}
              aria-labelledby="delete-category-rule"
              fullWidth={true} maxWidth={'md'}
            >
              <DialogTitle>
              Seach IBAN's
              </DialogTitle>
              <DialogContent >
                {/* <DialogContentText>Do you want to delete this category rule ?</DialogContentText> */}
              <Grid container spacing={3}>
                {/*  */}
                <Grid item xs={3} md={3}></Grid>
                <Grid item xs={3} md={3}><span style={{fontWeight: "bolder",fontSize: "18px",marginTop: "9px"}}>counter party name</span></Grid>
                <Grid item xs={3} md={3}><TextField  id="counterPartyNameSearch" name='counterPartyNameInIbanSearch'   onChange={e=>this.handleIbanSearchInput('counterPartyNameInIbanSearch',e.target.value)}  size="small" label="counter party name" value={this.state.counterPartyNameInIbanSearch}  variant="outlined" /></Grid>
                <Grid item xs={3} md={3}><Button disabled={isLoading} autoFocus onClick={() => this.searchIbans()} className={`${classes.addButton}`}>Search</Button></Grid>
                
              </Grid>

              <Paper >
            <TableContainer component={Paper}>
              <Table stickyHeader aria-label="Bank details table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" >Action</TableCell>
                    <TableCell align="center">IBAN</TableCell>
                    <TableCell align="center">Counter party name</TableCell>
                    <TableCell align="center">Rule-Present</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  {
                    (IbanSearchResults && IbanSearchResults.length > 0) ?
                    IbanSearchResults.slice(this.state.pageNumberIbanSearch * this.state.rowsPerPageIbanSearch, this.state.pageNumberIbanSearch * this.state.rowsPerPageIbanSearch + this.state.rowsPerPageIbanSearch).map((row, index) => {
                        return (
                          <TableRow hover key={row.id}>
                            <TableCell align="center">{(row.isRuleAvailable)?null :  <Button disabled={isLoading} autoFocus onClick={() => this.addNewRule(row.iban,row.counterPartyName)} className={`${classes.addButton}`}>Add</Button>}</TableCell>
                            <TableCell align="center" >{row.iban}</TableCell>
                            <TableCell align="center">{row.counterPartyName}</TableCell>
                            <TableCell align="center">{(row.isRuleAvailable)?'Yes':'No'}</TableCell>
                          </TableRow>                    
                        );
                      })
                      : null
                  }

                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 75,100,1000]}
              component="div"
              count={rawCountIbanSearch}
              rowsPerPage={rowsPerPageIbanSearch}
              page={pageNumberIbanSearch}
              onChangePage={this.handleChangePageIbanSearch}
              onChangeRowsPerPage={this.handleChangeRowsPerPageIbanSearch}
            />

          </Paper>
              </DialogContent>
              <DialogActions>
                <Button disabled={isLoading} autoFocus onClick={() => this.IbanSearch()} >Cancel</Button>
              </DialogActions>
            </Dialog>
          )
        }


      </div>
    );
  }
}

CategoryRules.propTypes = {
  classes: PropTypes.object.isRequired,
  getCategoryRulesWithPagination: PropTypes.func.isRequired,
  getCategoryRulesEnums: PropTypes.func.isRequired,
  processCategoryRules: PropTypes.func.isRequired,
  origin: PropTypes.string,
  IbanSearchRequest:PropTypes.func.isRequired,
  displayNotification: PropTypes.func.isRequired,
};

CategoryRules.defaultProps = {
  origin: "ADMIN"
};

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => ({
  getCategoryRulesWithPagination: (requestQuery) => dispatch(getCategoryRulesWithPagination(requestQuery)),
  getCategoryRulesEnums: (requestQuery) => dispatch(getCategoryRulesEnums(requestQuery)),
  processCategoryRules: (requestData) => dispatch(processCategoryRules(requestData)),
  IbanSearchRequest: (requestData) => dispatch(IbanSearchRequest(requestData)),
  displayNotification: (msg, type) => {
    dispatch(displayNotification(msg, type));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dashboardStyle)(CategoryRules));