import { combineReducers } from 'redux';
import notifier from "./Notifier.reducer";
import customer from "./Customer.reducer";
import person from "./Person.reducer";
import config from "./Configuration.reducer";
import address from "./Address.reducer";
import cddinfo from "./CddInfo.reducer";
import personIdentity from "./PersonIdentity.reducer";
import highRiskRegister from "./HighRiskRegister.reducer";
import contact from "./Contact.reducer";
import stakeholder from "./Stakeholder.reducer";
import companyStructure from "./CompanyStructure.reducer";
import snapshot from "./Snapshot.reducer";
import user from "./User.reducer";

const rootReducer = combineReducers({
  address,
  cddinfo,
  config,
  contact,
  customer,
  highRiskRegister,
  personIdentity,
  person,
  notifier,
  snapshot,
  stakeholder,
  companyStructure,
  user,
});

export default rootReducer;