// import React, { Component, Suspense } from "react";
// import { connect } from "react-redux";
// import PropTypes from "prop-types";
// import { Router, Switch, Route } from "react-router-dom";
// import routes from "./routes";
// // import LeftSlideBar from "./components/main/LeftSlideBar";
// // import HeaderBar from "./components/main/HeaderBar";
// import history from "./history";

// class App extends Component {

//   constructor(props) {
//     super(props);
//   }

//   loading = () => (
//     <div className="animated fadeIn pt-1 text-center">Loading...</div>
//   );

//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <Router history={history}>
//             <div className="landing-main-div">
//               {/* <LeftSlideBar /> */}
//               <div className="detailsBodyHolder">
//                 {/* <HeaderBar /> */}
//                 <div className="landing-page-body">
//                   <Suspense fallback={this.loading()}>
//                     <Switch>
//                       {routes.map((route, idx) => {
//                         return route.component ? (
//                           <Route
//                             key={idx}
//                             path={route.path}
//                             exact={route.exact}
//                             name={route.name}
//                             render={props => <route.component {...props} />}
//                           />
//                         ) : null;
//                       })}
//                     </Switch>
//                   </Suspense>
//                 </div>
//               </div>
//             </div>
//           </Router>
//         </header>
//       </div>
//     );
//   }
// }

// App.propTypes = {
//   contracts: PropTypes.array.isRequired
// };

// const mapStateToProps = state => {
//   // console.log("State: ", state);

//   return {
//     contracts: state.contracts.contracts
//   };
// };

// export default connect(mapStateToProps)(App);
