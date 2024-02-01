
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Style from 'assets/jss/material-dashboard-react/views/SmeOverviewStyles';

import Notifier from 'components/initiation/Notification/Notifier';
import LogViewTable from 'views/initiation/HistoryTable/LogsViewTable';
import GridContainer from 'components/initiation/Grid/GridContainer';
import GridItem from 'components/initiation/Grid/GridItem';
import { searchProcessLogs, fiterProcess } from 'store/initiation/actions/workflowManagement.action';
import { Button, TextField, GridList } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
//import CustomInput from 'components/initiation/CustomInput/CustomInput';

class WorkflowManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedProcess: [],
      selectedKey: undefined,
      filterDataList: this.props.filterList,
      selectedTag: {},
      selectedStatus: {},
      selectedIdentifiers: {},
      isUpdated: false,
      showIdentifiers: false,
      identifiers: [],
      perPage: 10,
      page: 0,
      totalCount: 0,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.props.fiterProcess()
      .then(result => {
        this.getoptimizedDisplayData(result);
      })
      .catch(() => {/*  */ });

  }

  getoptimizedDisplayData = (data) => {
    this.setState({ filterDataList: data });
  }

  searchResultData = (origin = 'SEARCH_BUTTON') => {
    const { page, perPage } = this.state;
    this.setState({ isUpdated: false });
    const process = this.state.selectedTag && this.state.selectedTag.key;
    const status = this.state.selectedStatus && this.state.selectedStatus.key;
    const keySelection = this.state.selectedKey;
    const identifiers = this.state.selectedIdentifiers;

    const req = {
      process,
      keySelection,
      status,
      identifiers,
      page: origin === 'SEARCH_BUTTON' ? 1 : page, // after changing perPage count should show page 1
      perPage,
    };

    this.getData(req);
  }

  getData = (req) => {
    const key = req.keySelection === '' ? undefined : req.keySelection;
    this.setState({ isLoading: true });
    this.props.searchProcessLogs(req.process, key, req.status, req.identifiers, req.page, req.perPage)
      .then(result => {
        this.setState({
          selectedProcess: result.records,
          perPage: result._metaData.perPage,
          page: result._metaData.page - 1,
          totalCount: result._metaData.totalCount,
          isUpdated: true,
          isLoading: false
        });
      })
      .catch(() => {/*  */
        this.setState({ isLoading: false });
      });

  }

  setPaginationData = (page, perPage) => {
    this.setState({ page, perPage }, () => this.searchResultData('PAGINATION_TABLE'));
  }

  handleKeyChange = (event) => {
    this.setState({ selectedKey: event.target.value });
  }

  handleIdentifierChange = (event, index, apiIn) => {
    this.setState({ selectedIdentifiers: { ...this.state.selectedIdentifiers, [apiIn]: event.target.value } });
  }

  onProcessChange = (event, values) => {

    if (values === null) {
      this.setState({ showIdentifiers: false, selectedIdentifiers: {}, identifiers: [] });
    }

    this.setState({
      selectedTag: values,
      selectedKey: '',
      identifiers: values === null ? [] : values.identifiers
    }, () => {
      /*  */
      if (this.state.selectedTag && Object.keys(this.state.selectedTag).length > 0) {
        this.setState({ showIdentifiers: true });
      }
    });
  }

  onStatusChange = (event, values) => {
    this.setState({
      selectedStatus: values,
    }, () => {
      /*  */
    });
  }

  render() {

    const { classes } = this.props;
    const keyHints = this.state.selectedTag && this.state.selectedTag.businessKey;

    return (
      <>
        <Notifier />
        <div>
          <h3>Workflow Overview</h3>
          <div>
            <GridContainer className={classes.flexContainer}>
              <GridItem className={classes.smallBox}>
                <Autocomplete
                  id="size-small-standard"
                  options={this.state.filterDataList.processList}
                  getOptionLabel={(option) => option.name}
                  defaultValue={this.state.filterDataList.key}
                  onChange={this.onProcessChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Search Process"
                      placeholder="Search Process"
                    />
                  )}
                />
              </GridItem>
              <GridItem className={classes.smallBox}>
                {keyHints ? <TextField
                  variant="outlined"
                  id="standard-full-width"
                  label={"Search Key: " + keyHints.placeholder}
                  onChange={(event) => this.handleKeyChange(event)}
                  value={this.state.selectedKey}
                  style={{
                    margin: 1,
                    marginTop: 0,
                    minWidth: 200,
                  }}
                  placeholder={keyHints.hint}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                /> : <TextField
                  //disabled
                  variant="outlined"
                  id="standard-full-width"
                  label="Search Key"
                  value={this.state.selectedKey}
                  onChange={(event) => this.handleKeyChange(event)}
                  style={{
                    margin: 1,
                    marginTop: 0,
                    minWidth: 200,
                  }}
                  placeholder="Search Key"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />}
              </GridItem>
              <GridItem className={classes.smallBox}>
                <Autocomplete
                  id="size-small-standard"
                  options={this.state.filterDataList.statusList}
                  getOptionLabel={(option) => option.value}
                  defaultValue={this.state.filterDataList.key}
                  onChange={this.onStatusChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Search Status"
                      placeholder="Search Status"
                    />
                  )}
                />
              </GridItem>
              {this.state.showIdentifiers === false ? false : <div className={classes.rootheader}>
                {this.state.selectedTag && this.state.selectedTag.identifiers.length === 0 ? false : <p>Additional Filters</p>}
                {this.state.selectedTag && this.state.selectedTag.identifiers.length === 0 ? null : <div className={classes.root}><GridList className={classes.gridList} cols={2}>

                  {this.state.selectedTag && this.state.selectedTag.identifiers.map((log, index) => (
                    <TextField
                      variant="outlined"
                      id={`roles[${index}]`}
                      label={log.name}
                      key={index}
                      value={this.state.selectedIdentifiers[index]}
                      onChange={(event) => this.handleIdentifierChange(event, index, log.apiIn)}
                      style={{
                        marginTop: 20,
                        paddingRight: 15,
                        minWidth: 220,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      placeholder=""
                      fullWidth
                      margin="normal"
                    />

                  ))}
                </GridList></div>}
              </div>}

            </GridContainer>
          </div>
          <div className={classes.searchButtonWrapper}>

            <Button
              variant='contained'
              className={classes.blueIconButton}
              onClick={() => this.searchResultData()}
            >Search</Button>
          </div>
          <LogViewTable
            tableHeaderColor="gray"
            isLoading={this.state.isLoading}
            // @ts-ignore
            logViewData={this.state.selectedProcess}
            selectedId={this.state.selectedContractId}
            isUpdated={this.state.isUpdated}
            perPage={this.state.perPage}
            page={this.state.page}
            totalCount={this.state.totalCount}
            setPaginationData={this.setPaginationData}
          />
        </div>
      </>
    );
  }
}

WorkflowManagement.propTypes = {
  classes: PropTypes.object,
  searchProcessLogs: PropTypes.func,
  tableData: PropTypes.array,
  fiterProcess: PropTypes.func,
  filterList: PropTypes.array
};

const mapStateToProps = (state) => ({
  filterList: state.workFlowManagement.filterList
});

const mapDispatchToProps = (dispatch) => ({
  searchProcessLogs: (processDefinitionKey, processInstanceBusinessKey, processStatus, processIdentifiers, page, perPage) => dispatch(searchProcessLogs({ processDefinitionKey, processInstanceBusinessKey, processStatus, processIdentifiers, page, perPage })),
  fiterProcess: () => dispatch(fiterProcess()),

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(Style)(WorkflowManagement));

/***************/
