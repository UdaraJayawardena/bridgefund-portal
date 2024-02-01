const buttonStyle = {
  borderRadius: '51.5px',
  height: '30px',
  fontFamily: 'Roboto',
  fontSize: '12px',
  lineHeight: '14px',
  margin: '10px'
};

const confirmIconButton = {
  width: '150px',
  color: "#FFFFFF",
  backgroundColor: '#2BC4EB',
  ...buttonStyle
};

const cancelIconButton = {
  width: '150px',
  color: "#B8BDC6",
  ...buttonStyle
};

const deleteIconButton = {
  color: "#B8BDC6",
  ...buttonStyle
};

const visibilityIconButton = {
  height: "30px",
  color: "#2BC4EB",
  paddingTop: '10px',
  cursor: 'pointer'
};

const defaultButton = {
  ...buttonStyle,
  color: "gray",
  backgroundColor: "Transparent",
};

const addIconButton = {
  color: "#FFFFFF",
  backgroundColor: '#2BC4EB',
  ...buttonStyle
};

const showErrorLogButton = {
  height: "30px",
  color: "#2BC4EB",
  paddingTop: '10px'
};

export {
  confirmIconButton,
  cancelIconButton,
  visibilityIconButton,
  deleteIconButton,
  addIconButton,
  showErrorLogButton,
  defaultButton,
};
