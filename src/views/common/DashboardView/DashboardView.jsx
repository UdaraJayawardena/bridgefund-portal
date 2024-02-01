import React from 'react';
import { connect } from 'react-redux';
// @material-ui/core
import withStyles from '@material-ui/core/styles/withStyles';

// import PhoneIcon from '@material-ui/icons/Phone';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import PersonPinIcon from '@material-ui/icons/PersonPin';
// import HelpIcon from '@material-ui/icons/Help';
// import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
// import ThumbDown from '@material-ui/icons/ThumbDown';
// import ThumbUp from '@material-ui/icons/ThumbUp';

import Notifier from 'components/initiation/Notification/Notifier';
import dashboardStyle from 'assets/jss/material-dashboard-react/views/dashboardStyle.jsx';
import GenericDashboard from 'components/common/GenericDashboard/GenericDashboard';


class DashboardView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        dashboardItems : [{
            "id": 1,
            "name":"Tab 1",
            // "icon":PhoneIcon
        },
        {
            "id": 2,
            "name":"Tab 2",
            // "icon":"<FavoriteIcon />"
        },
        {
            "id": 3,
            "name":"Tab 3",
            // "icon":"<PersonPinIcon />"
        },
        {
            "id": 4,
            "name":"Tab 4",
            // "icon":"<HelpIcon />"
        },
        {
            "id": 5,
            "name":"Tab 5",
            // "icon":"<ShoppingBasket />"
        },
        {
            "id": 6,
            "name":"Tab 6",
            // "icon":"<ThumbDown />"
        },
        {
            "id": 7,
            "name":"Tab 7",
            // "icon":"<ThumbUp />"
        }]

    };
  }

  render() {
    const { dashboardItems } = this.state;
    return (
      <div>
        <Notifier />
        <GenericDashboard items={dashboardItems} />
      </div>
    );
  }
}

DashboardView.propTypes = {
};

const mapStateToProp = () => ({
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProp, mapDispatchToProps)(withStyles(dashboardStyle)(DashboardView));