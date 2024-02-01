
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import emptyProfileImage from '../../../assets/img/blank-profile-picture.jpeg';

const ProfileImageStyles = makeStyles({
  profileImageRadius: {
    borderRadius: '50%'
  },

});

const ProfileImage = (props) => {
  const classes = ProfileImageStyles();
  // eslint-disable-next-line no-unused-vars
  const { url, width } = props;
  
  const styleClasses = `${classes.profileImageRadius}`;

  return (
    <img className={styleClasses} src={url !== 'null'?url:emptyProfileImage} alt="Avatar" style={{width:width?width:"50px"}} />
  );
};

ProfileImage.propTypes = {
  /**
   * Image Url.
   */
  url: PropTypes.string,
  /**
   * Size.
   */
  width: PropTypes.string,
};

export default ProfileImage;