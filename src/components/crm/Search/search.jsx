import React, { useState } from 'react';
import SearchBar from 'material-ui-search-bar';
import PropTypes from 'prop-types';

// this is re-rendered whenever the relevant parts of the used data stores change
const Search = () => {

    const [value, setValue] = useState('');

    const handleClick = (value) => {
        console.log(value);
    };

return (
    <SearchBar
      value={value}
      onChange={(newValue) => setValue(newValue)}
      onRequestSearch={() => handleClick(value)}
    />
  );
};

Search.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onRequestSearch: PropTypes.func
  };

export default Search;
